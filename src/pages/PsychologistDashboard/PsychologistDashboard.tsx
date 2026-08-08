import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import ClinicalRecordModal from '../../components/ClinicalRecordModal/ClinicalRecordModal';
import SessionNoteModal from '../../components/SessionNoteModal/SessionNoteModal';
import ClinicalHistoryView from '../../components/ClinicalHistoryView/ClinicalHistoryView';
import './PsychologistDashboard.css';
import { toDateStr } from '../../lib/date';
import AppointmentCalendar from '../../components/AppointmentCalendar/AppointmentCalendar';
import type { CalendarAppointment } from '../../components/AppointmentCalendar/status';

interface PsychologistProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  specialties: string[];
  bio?: string | null;
  modality?: string[];
  city?: string | null;
  years_experience?: number | null;
  languages?: string[];
  session_duration: number;
  session_price: number;
  onboarding_completed: boolean;
  // Opcional a proposito: si el codigo llega a produccion antes que la
  // migracion 20260807210000, la columna no existe y el campo viene undefined.
  verification_status?: 'pending' | 'submitted' | 'approved' | 'rejected';
  rejection_reason?: string | null;
}

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  payment_reference: string | null;
  payment_amount: number | null;
  notes: string | null;
  patient: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  } | null;
}

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface ScheduleBlock {
  id: string;
  block_date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
}

const DAYS_CONFIG = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mie' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sab' },
  { value: 0, label: 'Dom' },
];

const DAY_NAMES_FULL = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const HOUR_OPTIONS = Array.from({ length: 15 }, (_, i) => {
  const h = i + 7;
  return `${h.toString().padStart(2, '0')}:00`;
});


type ActiveTab = 'calendario' | 'agenda' | 'bloqueos' | 'perfil';

function formatTime(t: string): string {
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ap = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ap}`;
}

const PsychologistDashboard: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PsychologistProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Tabs and calendar
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendario');
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());

  // Appointment detail modal
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [upcomingIndex, setUpcomingIndex] = useState(0);

  // Block form
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockDate, setBlockDate] = useState('');
  const [blockStart, setBlockStart] = useState('08:00');
  const [blockEnd, setBlockEnd] = useState('09:00');
  const [blockReason, setBlockReason] = useState('');
  const [savingBlock, setSavingBlock] = useState(false);

  // Quick block from calendar
  const [showQuickBlock, setShowQuickBlock] = useState(false);
  const [quickBlockDate, setQuickBlockDate] = useState<Date | null>(null);

  // Add availability
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlotDay, setNewSlotDay] = useState(1);
  const [newSlotStart, setNewSlotStart] = useState('08:00');
  const [newSlotEnd, setNewSlotEnd] = useState('09:00');
  const [savingSlot, setSavingSlot] = useState(false);

  // Mobile menu
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Clinical History modals
  const [showClinicalRecordModal, setShowClinicalRecordModal] = useState(false);
  const [showSessionNoteModal, setShowSessionNoteModal] = useState(false);
  const [pendingAppointmentToComplete, setPendingAppointmentToComplete] = useState<Appointment | null>(null);
  const [sessionNoteData, setSessionNoteData] = useState<{
    appointmentId: string;
    clinicalRecordId: string;
    sessionNumber: number;
  } | null>(null);

  // Warnings for appointments without clinical record
  const [warnings, setWarnings] = useState<Array<{
    type: string;
    appointmentId: string;
    patientName: string;
    message: string;
  }>>([]);

  // Clinical History View
  const [showClinicalHistoryView, setShowClinicalHistoryView] = useState(false);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Quick add from calendar - adds directly without modal
  // Quick block from calendar
  const handleQuickBlock = async () => {
    if (!profile || !blockDate) return;
    setSavingBlock(true);
    await supabase.from('schedule_blocks').insert({
      psychologist_id: profile.id,
      block_date: blockDate,
      start_time: blockStart,
      end_time: blockEnd,
      reason: blockReason || null,
    });
    setShowQuickBlock(false);
    setBlockDate('');
    setBlockReason('');
    setSavingBlock(false);
    fetchData();
  };

  const today = useMemo(() => new Date(), []);

  const handleProfileAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;
    if (!file.type.startsWith('image/')) {
      setProfileMessage('Selecciona una imagen válida.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage('La imagen debe pesar menos de 5 MB.');
      return;
    }
    setProfileMessage('Subiendo foto...');
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${profile.id}/profile/avatar-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('psychologist-documents').upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: true,
    });
    if (uploadError) {
      setProfileMessage('No fue posible subir la foto.');
      return;
    }
    const { data: publicData } = supabase.storage.from('psychologist-documents').getPublicUrl(path);
    const { data, error } = await supabase.from('psychologists').update({ avatar_url: publicData.publicUrl }).eq('id', profile.id).select('*').single();
    if (error) {
      setProfileMessage('La foto subió, pero no se pudo actualizar el perfil.');
      return;
    }
    setProfile(data as PsychologistProfile);
    setProfileMessage('Foto de perfil actualizada.');
  };

  const handleProfileSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    setProfileMessage('');
    const form = new FormData(event.currentTarget);
    const payload = {
      full_name: String(form.get('full_name') || '').trim(),
      phone: String(form.get('phone') || '').trim() || null,
      bio: String(form.get('bio') || '').trim() || null,
      specialties: String(form.get('specialties') || '').split(',').map((item) => item.trim()).filter(Boolean),
      modality: String(form.get('modality') || '').split(',').map((item) => item.trim()).filter(Boolean),
      city: String(form.get('city') || '').trim() || null,
      years_experience: Number(form.get('years_experience') || 0),
      languages: String(form.get('languages') || '').split(',').map((item) => item.trim()).filter(Boolean),
      session_duration: Number(form.get('session_duration') || 50),
      session_price: Number(form.get('session_price') || 0),
    };
    const { data, error } = await supabase.from('psychologists').update(payload).eq('id', profile.id).select('*').single();
    if (error) {
      setProfileMessage('No fue posible guardar los cambios. Verifica los datos e inténtalo de nuevo.');
    } else {
      setProfile(data as PsychologistProfile);
      setProfileMessage('Perfil actualizado correctamente.');
    }
    setSavingProfile(false);
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);

    const { data: psyData } = await supabase
      .from('psychologists')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!psyData || !psyData.onboarding_completed) {
      navigate('/psicologo/onboarding');
      return;
    }

    setProfile(psyData as PsychologistProfile);

    // Verificar si tiene disponibilidad configurada
    let { data: existingAvail } = await supabase
      .from('psychologist_availability')
      .select('*')
      .eq('psychologist_id', psyData.id);

    // Si no tiene disponibilidad, crear la por defecto automáticamente HORA POR HORA
    if (!existingAvail || existingAvail.length === 0) {
      console.log('🔄 Creando disponibilidad por defecto automáticamente (hora por hora)...');
      const defaultSlots = [];
      
      // Lunes a Viernes (1-5) - NO sábado
      for (let day = 1; day <= 5; day++) {
        // 7AM - 12PM (hora por hora)
        for (let hour = 7; hour < 12; hour++) {
          defaultSlots.push({
            psychologist_id: psyData.id,
            day_of_week: day,
            start_time: `${hour.toString().padStart(2, '0')}:00`,
            end_time: `${(hour + 1).toString().padStart(2, '0')}:00`,
            is_available: true,
          });
        }
        
        // 1PM - 8PM (hora por hora) - Saltar 12-1 PM
        for (let hour = 13; hour <= 20; hour++) {
          defaultSlots.push({
            psychologist_id: psyData.id,
            day_of_week: day,
            start_time: `${hour.toString().padStart(2, '0')}:00`,
            end_time: `${(hour + 1).toString().padStart(2, '0')}:00`,
            is_available: true,
          });
        }
      }
      
      const { data: insertedData, error } = await supabase
        .from('psychologist_availability')
        .insert(defaultSlots)
        .select();
      
      if (error) {
        console.error('❌ Error creando disponibilidad por defecto:', error);
      } else {
        console.log('✅ Disponibilidad por defecto creada exitosamente:', insertedData?.length, 'slots por semana');
        existingAvail = insertedData;
      }
    }

    // Bloquear todos los domingos y sábados del año (solo la primera vez)
    const today = new Date();
    const nextYear = new Date(today.getFullYear() + 1, 11, 31);

    // Verificar si ya hay bloqueos configurados
    const { data: existingBlocks, count: blocksCount } = await supabase
      .from('schedule_blocks')
      .select('block_date', { count: 'exact' })
      .eq('psychologist_id', psyData.id)
      .gte('block_date', toDateStr(today));

    const existingBlockDates = new Set(existingBlocks?.map(b => b.block_date) || []);

    // Solo crear bloqueos automáticos si NO hay ningún bloqueo configurado (primera vez)
    const shouldCreateAutoBlocks = (blocksCount ?? 0) === 0;

    // Crear bloqueos para domingos y sábados
    const weekendBlocks = [];
    let currentDate = new Date(today);
    
    if (shouldCreateAutoBlocks) {
      while (currentDate <= nextYear) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Domingo o Sábado
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

          if (!existingBlockDates.has(dateStr)) {
            weekendBlocks.push({
              psychologist_id: psyData.id,
              block_date: dateStr,
              start_time: '00:00',
              end_time: '23:59',
              reason: dayOfWeek === 0 ? 'Domingo - Dia no laboral' : 'Sabado - Dia no laboral',
            });
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    // Bloquear todos los meses excepto el actual y el siguiente (solo la primera vez)
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const blocksForOtherMonths = [];

    if (shouldCreateAutoBlocks) {
      // Bloquear desde hoy hasta fin del año actual (excepto mes actual y siguiente)
      for (let month = 0; month < 12; month++) {
        // Saltar mes actual y siguiente
        if (month === currentMonth || month === (currentMonth + 1) % 12) continue;

        const monthStart = new Date(currentYear, month, 1);
        const monthEnd = new Date(currentYear, month + 1, 0);

        // Solo bloquear si es futuro
        if (monthEnd < today) continue;

        let blockDate = new Date(monthStart);
        while (blockDate <= monthEnd) {
          const dateStr = `${blockDate.getFullYear()}-${String(blockDate.getMonth() + 1).padStart(2, '0')}-${String(blockDate.getDate()).padStart(2, '0')}`;

          if (!existingBlockDates.has(dateStr) && blockDate >= today) {
            blocksForOtherMonths.push({
              psychologist_id: psyData.id,
              block_date: dateStr,
              start_time: '00:00',
              end_time: '23:59',
              reason: 'Mes bloqueado - Configura tu agenda',
            });
          }
          blockDate.setDate(blockDate.getDate() + 1);
        }
      }

      // Bloquear meses del siguiente año (excepto el primer mes si el mes actual es diciembre)
      const nextYearStart = currentMonth === 11 ? 1 : 0; // Si estamos en diciembre, el siguiente mes (enero) está disponible
      for (let month = nextYearStart; month < 12; month++) {
        const monthStart = new Date(currentYear + 1, month, 1);
        const monthEnd = new Date(currentYear + 1, month + 1, 0);

        let blockDate = new Date(monthStart);
        while (blockDate <= monthEnd) {
          const dateStr = `${blockDate.getFullYear()}-${String(blockDate.getMonth() + 1).padStart(2, '0')}-${String(blockDate.getDate()).padStart(2, '0')}`;

          if (!existingBlockDates.has(dateStr)) {
            blocksForOtherMonths.push({
              psychologist_id: psyData.id,
              block_date: dateStr,
              start_time: '00:00',
              end_time: '23:59',
              reason: 'Mes bloqueado - Configura tu agenda',
            });
          }
          blockDate.setDate(blockDate.getDate() + 1);
        }
      }
    }
    
    const allBlocks = [...weekendBlocks, ...blocksForOtherMonths];
    
    if (allBlocks.length > 0) {
      const { error: blockError } = await supabase
        .from('schedule_blocks')
        .insert(allBlocks);
      
      if (!blockError) {
        console.log('✅ Bloques creados automáticamente:', allBlocks.length);
      }
    }

    // Fetch appointments
    const { data: apptData } = await supabase
      .from('appointments')
      .select('*')
      .eq('psychologist_id', psyData.id)
      .order('appointment_date')
      .order('start_time');

    // Enrich with patient profile data
    const enriched: Appointment[] = [];
    if (apptData) {
      for (const a of apptData) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, phone')
          .eq('id', a.patient_id)
          .single();

        enriched.push({
          ...a,
          patient: prof ? {
            id: a.patient_id,
            full_name: prof.full_name,
            avatar_url: prof.avatar_url,
            phone: prof.phone,
          } : { id: a.patient_id, full_name: null, avatar_url: null, phone: null },
        });
      }
    }
    setAppointments(enriched);

    // Establecer la disponibilidad (ya sea la existente o la recién creada)
    setAvailability((existingAvail || []) as AvailabilitySlot[]);
    console.log('📅 Disponibilidad cargada:', existingAvail?.length || 0, 'slots');

    const { data: blocksData } = await supabase
      .from('schedule_blocks')
      .select('*')
      .eq('psychologist_id', psyData.id)
      .order('block_date')
      .order('start_time');
    setBlocks((blocksData || []) as ScheduleBlock[]);

    setLoadingData(false);
  }, [user, navigate]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/psicologo/login');
      return;
    }
    if (user) fetchData();
  }, [user, authLoading, navigate, fetchData]);

  // Check for appointments without clinical records
  useEffect(() => {
    if (appointments.length > 0 && profile) {
      checkPendingClinicalRecords();
    }
  }, [appointments, profile]);

  const checkPendingClinicalRecords = async () => {
    if (!profile) return;

    const upcomingAppts = appointments.filter(a =>
      a.status === 'confirmada' &&
      a.appointment_date >= toDateStr(today)
    );

    const newWarnings = [];

    for (const appt of upcomingAppts) {
      if (!appt.patient?.id) continue;

      const { data: record } = await supabase
        .from('clinical_records')
        .select('id')
        .eq('patient_id', appt.patient.id)
        .eq('psychologist_id', profile.id)
        .maybeSingle();

      if (!record) {
        newWarnings.push({
          type: 'missing_clinical_record',
          appointmentId: appt.id,
          patientName: appt.patient?.full_name || 'Paciente',
          message: `Cita con ${appt.patient?.full_name || 'paciente'} el ${appt.appointment_date.split('-').reverse().join('/')} - Falta abrir historia clínica`,
        });
      }
    }

    setWarnings(newWarnings);
  };

  // Availability actions
  const handleAddSlot = async () => {
    if (!profile) return;
    setSavingSlot(true);
    await supabase.from('psychologist_availability').insert({
      psychologist_id: profile.id,
      day_of_week: newSlotDay,
      start_time: newSlotStart,
      end_time: newSlotEnd,
      is_available: true,
    });
    setShowAddSlot(false);
    setSavingSlot(false);
    fetchData();
  };

  const handleDeleteSlot = async (slotId: string) => {
    await supabase.from('psychologist_availability').delete().eq('id', slotId);
    fetchData();
  };

  const handleToggleSlot = async (slotId: string, currentState: boolean) => {
    await supabase.from('psychologist_availability').update({ is_available: !currentState }).eq('id', slotId);
    fetchData();
  };

  // Block actions
  const handleAddBlock = async () => {
    if (!profile || !blockDate) return;
    setSavingBlock(true);
    await supabase.from('schedule_blocks').insert({
      psychologist_id: profile.id,
      block_date: blockDate,
      start_time: blockStart,
      end_time: blockEnd,
      reason: blockReason || null,
    });
    setShowBlockForm(false);
    setBlockDate('');
    setBlockReason('');
    setSavingBlock(false);
    fetchData();
  };

  const handleDeleteBlock = async (blockId: string) => {
    await supabase.from('schedule_blocks').delete().eq('id', blockId);
    fetchData();
  };

  // Appointment actions
  const handleConfirmPayment = async (apptId: string) => {
    await supabase.from('appointments').update({
      status: 'confirmada',
      payment_status: 'pagado',
      updated_at: new Date().toISOString(),
    }).eq('id', apptId);
    setSelectedAppt(null);
    fetchData();
  };

  const handleCompleteAppt = async (apptId: string) => {
    const appt = appointments.find(a => a.id === apptId);
    if (!appt || !profile) return;

    try {
      // 1. Verificar si existe clinical_record
      const { data: clinicalRecord, error: crError } = await supabase
        .from('clinical_records')
        .select('id')
        .eq('patient_id', appt.patient?.id)
        .eq('psychologist_id', profile.id)
        .maybeSingle();

      if (crError) {
        console.error('Error checking clinical record:', crError);
        return;
      }

      // 2. Si NO existe HC, abrir modal de apertura
      if (!clinicalRecord) {
        setPendingAppointmentToComplete(appt);
        setShowClinicalRecordModal(true);
        return;
      }

      // 3. Verificar si ya hay nota de esta sesión
      const { data: existingNote, error: noteError } = await supabase
        .from('session_notes')
        .select('id, is_draft')
        .eq('appointment_id', apptId)
        .maybeSingle();

      if (noteError && noteError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking session note:', noteError);
        return;
      }

      // 4. Si ya existe nota y NO es borrador, marcar directamente como completada
      if (existingNote && !existingNote.is_draft) {
        await supabase
          .from('appointments')
          .update({ status: 'completada', updated_at: new Date().toISOString() })
          .eq('id', apptId);
        setSelectedAppt(null);
        fetchData();
        return;
      }

      // 5. Si no existe nota o es borrador, abrir modal de registro de sesión
      // Contar sesiones completadas (no borradores) para determinar el número de sesión
      const { count } = await supabase
        .from('session_notes')
        .select('id', { count: 'exact', head: true })
        .eq('clinical_record_id', clinicalRecord.id)
        .eq('is_draft', false);

      setSessionNoteData({
        appointmentId: apptId,
        clinicalRecordId: clinicalRecord.id,
        sessionNumber: (count || 0) + 1,
      });
      setShowSessionNoteModal(true);
    } catch (err) {
      console.error('Error in handleCompleteAppt:', err);
    }
  };

  const handleOpenWhatsApp = (phone: string | null | undefined, patientName: string) => {
    if (!phone) {
      alert('Este paciente no tiene numero registrado.');
      return;
    }
    const clean = phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Hola ${patientName}, soy tu psicologo de Vida Sabia. `);
    window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // La navegacion, las vistas y el agrupado por fecha los resuelve ahora
  // AppointmentCalendar; aqui solo queda lo propio del panel.
  const daySlots = availability.filter((s) => s.day_of_week === selectedDay);

  const upcomingAppts = appointments.filter(
  (a) => a.appointment_date >= toDateStr(today) && (a.status === 'confirmada' || a.status === 'pendiente_pago')
  );

  useEffect(() => {
    if (upcomingAppts.length <= 1) {
      setUpcomingIndex(0);
      return;
    }
    setUpcomingIndex((current) => Math.min(current, upcomingAppts.length - 1));
    const timer = window.setInterval(() => {
      setUpcomingIndex((current) => (current + 1) % upcomingAppts.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [upcomingAppts.length]);


  // Adaptacion al contrato del calendario compartido. En el panel del
  // psicologo la contraparte visible es el paciente.
  const calendarAppointments: CalendarAppointment[] = appointments.map((a) => ({
    id: a.id,
    appointment_date: a.appointment_date,
    start_time: a.start_time,
    end_time: a.end_time,
    status: a.status,
    title: a.patient?.full_name || 'Paciente',
    subtitle: a.payment_status === 'pagado' ? 'Pagada' : null,
    avatarUrl: a.patient?.avatar_url ?? null,
  }));

  const blockedDates = blocks.map((b) => b.block_date);

  const handleCalendarReschedule = async (appt: CalendarAppointment, newDate: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ appointment_date: newDate, updated_at: new Date().toISOString() })
      .eq('id', appt.id);

    if (!error) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === appt.id ? { ...a, appointment_date: newDate } : a))
      );
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="psy-dash-loading">
        <div className="psy-dash-spinner" />
        <p>Cargando tu panel...</p>
      </div>
    );
  }

  // Mientras la verificacion profesional no este aprobada no se muestra el
  // panel. La defensa real es la RLS; esto evita una pantalla que no funciona.
  //
  // Se comprueba que el campo exista antes de bloquear: si la migracion aun no
  // esta aplicada llega undefined, y encerrar a todos los psicologos seria peor
  // que no mostrar el aviso (sin la migracion tampoco hay nada que proteger).
  if (profile?.verification_status && profile.verification_status !== 'approved') {
    const rejected = profile.verification_status === 'rejected';
    return (
      <div className="profile-verify-gate">
        <div className="profile-verify-card">
          <div className={`profile-verify-icon ${rejected ? 'profile-verify-icon--rejected' : ''}`}>
            {rejected ? (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            ) : (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            )}
          </div>

          <h1>{rejected ? 'Verificacion rechazada' : 'Verificacion en curso'}</h1>

          {rejected ? (
            <>
              <p>Revisamos tus documentos y no pudimos habilitar tu perfil.</p>
              {profile.rejection_reason && (
                <p className="profile-verify-reason">
                  <strong>Motivo:</strong> {profile.rejection_reason}
                </p>
              )}
              <p>Corrige lo indicado y vuelve a enviar tus documentos.</p>
              <button type="button" className="profile-verify-btn" onClick={() => navigate('/psicologo/onboarding')}>
                Actualizar documentos
              </button>
            </>
          ) : profile.verification_status === 'pending' ? (
            <>
              <p>Te falta cargar los documentos que acreditan tu tarjeta profesional.</p>
              <button type="button" className="profile-verify-btn" onClick={() => navigate('/psicologo/onboarding')}>
                Cargar documentos
              </button>
            </>
          ) : (
            <p>
              Estamos revisando tu tarjeta profesional y tus documentos. Te avisaremos por correo
              en cuanto tu perfil quede habilitado. Hasta entonces no apareceras en el buscador ni
              podras abrir historias clinicas.
            </p>
          )}

          <button type="button" className="psy-verify-link" onClick={signOut}>
            Cerrar sesion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="psy-dash">
      <video className="psy-dash-video" autoPlay loop muted playsInline aria-hidden="true">
        <source src="/assets/VideoFondo.mp4" type="video/mp4" />
      </video>
      <div className="psy-dash-video-overlay" aria-hidden="true" />
      {/* Sidebar */}
      <aside
        className={`psy-dash-sidebar ${showMobileMenu ? 'psy-dash-sidebar--open' : ''}`}
        style={showMobileMenu ? { position: 'fixed', inset: '0 auto 0 0', zIndex: 1000, transform: 'translate3d(0, 0, 0)' } : undefined}
      >
        <div className="psy-dash-sidebar-header">
          <button type="button" className="psy-mobile-menu-close" onClick={() => setShowMobileMenu(false)} aria-label="Cerrar menú" />
          <div className="psy-dash-brand">
            <div className="psy-dash-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <defs>
                  <linearGradient id="dash-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4dd0e1" />
                    <stop offset="50%" stopColor="#42a5f5" />
                    <stop offset="100%" stopColor="#7e57c2" />
                  </linearGradient>
                </defs>
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="url(#dash-logo-grad)" />
              </svg>
              <span>Vida Sabia</span>
            </div>
            <div className="psy-dash-badge">Psicólogo profesional</div>
          </div>
        </div>

        <div className="psy-dash-profile">
          <div className="psy-dash-avatar psy-dash-avatar--editable">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} crossOrigin="anonymous" />
            ) : (
              <span>{profile?.full_name?.charAt(0) || 'P'}</span>
            )}
            <label className="psy-dash-avatar-upload" title="Cambiar foto de perfil">
              <input type="file" accept="image/*" onChange={handleProfileAvatarChange} />
              <span aria-hidden="true">+</span>
              <span className="sr-only">Cambiar foto de perfil</span>
            </label>
          </div>
          <h3 className="psy-dash-name">{profile?.full_name}</h3>
          <p className="psy-dash-email">{profile?.email}</p>
        </div>

        <nav className="psy-dash-nav">
          <button type="button" className={`psy-dash-nav-item ${activeTab === 'calendario' ? 'psy-dash-nav-item--active' : ''}`} onClick={() => { setActiveTab('calendario'); setShowMobileMenu(false); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            <span>Calendario</span>
          </button>
          <button type="button" className={`psy-dash-nav-item ${activeTab === 'agenda' ? 'psy-dash-nav-item--active' : ''}`} onClick={() => { setActiveTab('agenda'); setShowMobileMenu(false); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span>Mi Agenda</span>
          </button>
          <button type="button" className={`psy-dash-nav-item ${activeTab === 'bloqueos' ? 'psy-dash-nav-item--active' : ''}`} onClick={() => { setActiveTab('bloqueos'); setShowMobileMenu(false); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
            <span>Bloqueos</span>
          </button>
          <button type="button" className={`psy-dash-nav-item ${activeTab === 'perfil' ? 'psy-dash-nav-item--active' : ''}`} onClick={() => { setActiveTab('perfil'); setProfileMessage(''); setShowMobileMenu(false); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="3" /><path d="M5 20c.8-3.2 3.1-5 7-5s6.2 1.8 7 5" /></svg>
            <span>Perfil</span>
          </button>
        {upcomingAppts.length > 0 && (
          <div className="psy-dash-upcoming-mini">
            <h4>Próximas citas</h4>
            <div className="psy-dash-upcoming-carousel" aria-live="polite">
              {(upcomingAppts.length > 0 ? [upcomingAppts[upcomingIndex]] : []).map((a) => (
                <button key={a.id} className="psy-dash-upcoming-item" onClick={() => { setSelectedAppt(a); setShowMobileMenu(false); }} type="button">
                  <div className="psy-dash-upcoming-avatar-sm">
                    {a.patient?.avatar_url ? (
                      <img src={a.patient.avatar_url} alt="" crossOrigin="anonymous" />
                    ) : (
                      <span>{(a.patient?.full_name || 'P').charAt(0)}</span>
                    )}
                  </div>
                  <div className="psy-dash-upcoming-text">
                    <strong>{a.patient?.full_name?.split(' ')[0] || 'Paciente'}</strong>
                    <span>{a.appointment_date.split('-').reverse().join('/')} {formatTime(a.start_time)}</span>
                  </div>
                  <span className={`psy-dash-mini-status psy-dash-mini-status--${a.status}`}>
                    {a.status === 'confirmada' ? 'OK' : '$'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        {warnings.length > 0 && (
          <div className="psy-dash-sidebar-pending">
            <h4>Pendientes importantes</h4>
            {warnings.map((warning) => (
              <button
                key={warning.appointmentId}
                className="psy-dash-sidebar-pending-card"
                onClick={() => {
                  const appt = appointments.find((a) => a.id === warning.appointmentId);
                  if (appt) {
                    setPendingAppointmentToComplete(appt);
                    setShowClinicalRecordModal(true);
                  }
                }}
                type="button"
              >
                <span className="psy-dash-pending-avatar" aria-hidden="true">!</span>
                <span className="psy-dash-pending-text">
                  <strong>{warning.message.split(' - ')[0]}</strong>
                  <small>{warning.message.split(' - ').slice(1).join(' - ')}</small>
                </span>
                <span className="psy-dash-pending-status">HC</span>
              </button>
            ))}
          </div>
        )}
        </nav>

        <button type="button" className="psy-dash-signout" onClick={handleSignOut}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          <span>Cerrar sesion</span>
        </button>
      </aside>

      {showMobileMenu && (
        <button
          type="button"
          className="psy-mobile-menu-backdrop"
          aria-label="Cerrar menú"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Mobile menu toggle */}
      <button           className="psy-mobile-menu-toggle"
          style={{ zIndex: 1300, left: '0.75rem', right: 'auto' }}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          type="button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {showMobileMenu ? (
            <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
          ) : (
            <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>
          )}
        </svg>
      </button>

      {/* Main content */}
      <main className="psy-dash-main">
        {/* CALENDARIO TAB */}
        {activeTab === 'calendario' && (
          <AppointmentCalendar
            appointments={calendarAppointments}
            blockedDates={blockedDates}
            onReschedule={handleCalendarReschedule}
            onSelect={(a) => {
              const original = appointments.find((x) => x.id === a.id);
              if (original) {
                setSelectedAppt(original);
                setShowMobileMenu(false);
              }
            }}
            renderDayActions={(dateKey) => (
              <button
                type="button"
                className="cal-action"
                onClick={() => {
                  const [y, m, d] = dateKey.split('-').map(Number);
                  setQuickBlockDate(new Date(y, m - 1, d));
                  setBlockDate(dateKey);
                  setShowQuickBlock(true);
                }}
              >
                Bloquear horario
              </button>
            )}
            renderActions={(a) => {
              const original = appointments.find((x) => x.id === a.id);
              if (!original) return null;
              return (
                <>
                  <button
                    type="button"
                    className="cal-action"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedAppt(original);
                      setShowMobileMenu(false);
                    }}
                  >
                    Ver detalle
                  </button>
                  {original.patient?.phone && (
                    <button
                      type="button"
                      className="cal-action"
                      onClick={() => handleOpenWhatsApp(original.patient?.phone, original.patient?.full_name || 'Paciente')}
                    >
                      WhatsApp
                    </button>
                  )}
                  {original.status === 'confirmada' && (
                    <button
                      type="button"
                      className="cal-action cal-action--primary"
                      onClick={() => handleCompleteAppt(original.id)}
                    >
                      Marcar completada
                    </button>
                  )}
                  {original.status === 'pendiente_pago' && (
                    <button
                      type="button"
                      className="cal-action cal-action--primary"
                      onClick={() => handleConfirmPayment(original.id)}
                    >
                      Confirmar pago
                    </button>
                  )}
                </>
              );
            }}
          />
        )}

        {/* AGENDA TAB - availability config */}
        {activeTab === 'agenda' && (
          <>
            <div className="psy-dash-header">
              <h1>Mi Agenda</h1>
              <button type="button" className="psy-dash-btn-primary" onClick={() => setShowAddSlot(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Agregar horario
              </button>
            </div>

            <div className="psy-dash-info-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
              <p>Tu agenda esta configurada por defecto de Lunes a Viernes, hora por hora desde las 7:00 AM hasta las 12:00 PM (bloqueado 12-1 PM para almuerzo) y desde la 1:00 PM hasta las 8:00 PM. Los sabados y domingos estan bloqueados. Solo el mes actual y el siguiente estan habilitados, el resto de meses estan bloqueados por defecto.</p>
            </div>

            <div className="psy-dash-availability-section">
              <div className="psy-dash-days">
                {DAYS_CONFIG.map((d) => {
                  const count = availability.filter((s) => s.day_of_week === d.value).length;
                  return (
                    <button key={d.value} type="button" className={`psy-dash-day ${selectedDay === d.value ? 'psy-dash-day--active' : ''}`} onClick={() => setSelectedDay(d.value)}>
                      <span className="psy-dash-day-label">{d.label}</span>
                      {count > 0 && <span className="psy-dash-day-count">{count}</span>}
                    </button>
                  );
                })}
              </div>

              <div className="psy-dash-slots">
                <h3>{DAY_NAMES_FULL[selectedDay]}</h3>
                {daySlots.length === 0 ? (
                  <div className="psy-dash-empty">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    <p>No hay horarios configurados para este dia.</p>
                    <button type="button" className="psy-dash-btn-outline" onClick={() => { setNewSlotDay(selectedDay); setShowAddSlot(true); }}>
                      Agregar horario
                    </button>
                  </div>
                ) : (
                  <div className="psy-dash-slot-list">
                    {daySlots.map((slot) => (
                      <div key={slot.id} className={`psy-dash-slot ${!slot.is_available ? 'psy-dash-slot--disabled' : ''}`}>
                        <div className="psy-dash-slot-time">
                          <span className="psy-dash-slot-badge">{slot.start_time.slice(0, 5)}</span>
                          <span className="psy-dash-slot-sep">-</span>
                          <span className="psy-dash-slot-badge">{slot.end_time.slice(0, 5)}</span>
                        </div>
                        <div className="psy-dash-slot-status">
                          {slot.is_available ? (
                            <span className="psy-dash-status psy-dash-status--available">Disponible</span>
                          ) : (
                            <span className="psy-dash-status psy-dash-status--unavailable">No disponible</span>
                          )}
                        </div>
                        <div className="psy-dash-slot-actions">
                          <button type="button" className="psy-dash-slot-toggle" onClick={() => handleToggleSlot(slot.id, slot.is_available)} title={slot.is_available ? 'Desactivar' : 'Activar'}>
                            {slot.is_available ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
                            )}
                          </button>
                          <button type="button" className="psy-dash-slot-delete" onClick={() => handleDeleteSlot(slot.id)} title="Eliminar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {showAddSlot && (
              <div className="psy-dash-modal-backdrop" onClick={() => setShowAddSlot(false)}>
                <div className="psy-dash-modal" onClick={(e) => e.stopPropagation()}>
                  <h3>Agregar horario disponible</h3>
                  <div className="psy-dash-modal-fields">
                    <div className="psy-dash-modal-field">
                      <label>Dia</label>
                      <select value={newSlotDay} onChange={(e) => setNewSlotDay(parseInt(e.target.value))}>
                        {DAYS_CONFIG.map((d) => <option key={d.value} value={d.value}>{DAY_NAMES_FULL[d.value]}</option>)}
                      </select>
                    </div>
                    <div className="psy-dash-modal-row">
                      <div className="psy-dash-modal-field">
                        <label>Inicio</label>
                        <select value={newSlotStart} onChange={(e) => setNewSlotStart(e.target.value)}>
                          {HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div className="psy-dash-modal-field">
                        <label>Fin</label>
                        <select value={newSlotEnd} onChange={(e) => setNewSlotEnd(e.target.value)}>
                          {HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="psy-dash-modal-actions">
                    <button type="button" className="psy-dash-btn-ghost" onClick={() => setShowAddSlot(false)}>Cancelar</button>
                    <button type="button" className="psy-dash-btn-primary" onClick={handleAddSlot} disabled={savingSlot}>
                      {savingSlot ? 'Guardando...' : 'Agregar'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* BLOQUEOS TAB */}
        {activeTab === 'bloqueos' && (
          <>
            <div className="psy-dash-header">
              <h1>Bloqueos de horario</h1>
              <button type="button" className="psy-dash-btn-primary" onClick={() => setShowBlockForm(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Bloquear fecha
              </button>
            </div>

            <p className="psy-dash-block-desc">Bloquea fechas y horas especificas cuando no puedas atender. Los sabados y domingos estan bloqueados automáticamente, asi como todos los meses excepto el actual y el siguiente. Tambien puedes bloquear desde el calendario haciendo clic derecho en cualquier celda.</p>

            {blocks.filter((b) => b.block_date >= toDateStr(today)).length === 0 ? (
              <div className="psy-dash-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                <p>No tienes bloqueos configurados.</p>
              </div>
            ) : (
              <div className="psy-dash-block-list">
                {blocks.filter((b) => b.block_date >= toDateStr(today)).map((block) => (
                  <div key={block.id} className="psy-dash-block-item">
                    <div className="psy-dash-block-info">
                      <span className="psy-dash-block-date">{new Date(block.block_date + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                      <span className="psy-dash-block-time">{block.start_time.slice(0, 5)} - {block.end_time.slice(0, 5)}</span>
                      {block.reason && <span className="psy-dash-block-reason">{block.reason}</span>}
                    </div>
                    <button type="button" className="psy-dash-slot-delete" onClick={() => handleDeleteBlock(block.id)} title="Eliminar bloqueo">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showBlockForm && (
              <div className="psy-dash-modal-backdrop" onClick={() => setShowBlockForm(false)}>
                <div className="psy-dash-modal" onClick={(e) => e.stopPropagation()}>
                  <h3>Bloquear horario</h3>
                  <div className="psy-dash-modal-fields">
                    <div className="psy-dash-modal-field">
                      <label>Fecha</label>
                      <input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} min={toDateStr(today)} />
                    </div>
                    <div className="psy-dash-modal-row">
                      <div className="psy-dash-modal-field">
                        <label>Desde</label>
                        <select value={blockStart} onChange={(e) => setBlockStart(e.target.value)}>
                          {HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div className="psy-dash-modal-field">
                        <label>Hasta</label>
                        <select value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)}>
                          {HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="psy-dash-modal-field">
                      <label>Razon (opcional)</label>
                      <input type="text" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Vacaciones, cita personal..." />
                    </div>
                  </div>
                  <div className="psy-dash-modal-actions">
                    <button type="button" className="psy-dash-btn-ghost" onClick={() => setShowBlockForm(false)}>Cancelar</button>
                    <button type="button" className="psy-dash-btn-primary" onClick={handleAddBlock} disabled={savingBlock || !blockDate}>
                      {savingBlock ? 'Guardando...' : 'Bloquear'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'perfil' && profile && (
          <section className="psy-profile-page">
            <div className="psy-dash-header">
              <div>
                <span className="psy-profile-kicker">CUENTA PROFESIONAL</span>
                <h1>Mi perfil</h1>
                <p>Actualiza la información que verán tus pacientes.</p>
              </div>
            </div>
            <form className="psy-profile-card" onSubmit={handleProfileSave}>
              <div className="psy-profile-card-head">
                <div className="psy-dash-avatar psy-profile-avatar">
                  {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.full_name} crossOrigin="anonymous" /> : <span>{profile.full_name.charAt(0)}</span>}
                </div>
                <div><h2>Información del profesional</h2><p>{profile.email}</p></div>
              </div>
              <div className="psy-profile-grid">
                <label>Nombre completo<input name="full_name" defaultValue={profile.full_name} required /></label>
                <label>Teléfono<input name="phone" defaultValue={profile.phone || ''} placeholder="Tu número de contacto" /></label>
                <label>Ciudad<input name="city" defaultValue={profile.city || ''} placeholder="Bogotá" /></label>
                <label>Años de experiencia<input name="years_experience" type="number" min="0" defaultValue={profile.years_experience || 0} /></label>
                <label>Especialidades<input name="specialties" defaultValue={(profile.specialties || []).join(', ')} placeholder="Ansiedad, pareja, duelo" /></label>
                <label>Modalidad<input name="modality" defaultValue={(profile.modality || []).join(', ')} placeholder="Virtual, presencial" /></label>
                <label>Idiomas<input name="languages" defaultValue={(profile.languages || []).join(', ')} placeholder="Español, inglés" /></label>
                <label>Duración de sesión (minutos)<input name="session_duration" type="number" min="15" step="5" defaultValue={profile.session_duration || 50} /></label>
                <label>Tarifa por sesión<input name="session_price" type="number" min="0" defaultValue={profile.session_price || 0} /></label>
                <label className="psy-profile-field-wide">Biografía<textarea name="bio" defaultValue={profile.bio || ''} rows={5} placeholder="Cuéntales a tus pacientes sobre tu enfoque profesional..." /></label>
              </div>
              <div className="psy-profile-actions">
                {profileMessage && <span className="psy-profile-message" role="status">{profileMessage}</span>}
                <button type="submit" className="psy-dash-btn-primary" disabled={savingProfile}>{savingProfile ? 'Guardando...' : 'Guardar cambios'}</button>
              </div>
            </form>
          </section>
        )}
      </main>

      {/* Quick Block Modal */}
      {showQuickBlock && (
        <div className="psy-dash-modal-backdrop" onClick={() => setShowQuickBlock(false)}>
          <div className="psy-dash-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Bloquear horario</h3>
            <p className="psy-modal-subtitle">
              {quickBlockDate && `${DAY_NAMES_FULL[quickBlockDate.getDay()]} ${quickBlockDate.getDate()} de ${MONTH_NAMES[quickBlockDate.getMonth()]}`}
            </p>
            <div className="psy-dash-modal-fields">
              <div className="psy-dash-modal-row">
                <div className="psy-dash-modal-field">
                  <label>Desde</label>
                  <select value={blockStart} onChange={(e) => setBlockStart(e.target.value)}>
                    {HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div className="psy-dash-modal-field">
                  <label>Hasta</label>
                  <select value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)}>
                    {HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              <div className="psy-dash-modal-field">
                <label>Razon (opcional)</label>
                <input type="text" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Vacaciones, cita personal..." />
              </div>
            </div>
            <div className="psy-dash-modal-actions">
              <button type="button" className="psy-dash-btn-ghost" onClick={() => setShowQuickBlock(false)}>Cancelar</button>
              <button type="button" className="psy-dash-btn-primary" onClick={handleQuickBlock} disabled={savingBlock}>
                {savingBlock ? 'Guardando...' : 'Bloquear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppt && (
        <div className="psy-dash-modal-backdrop" onClick={() => setSelectedAppt(null)}>
          <div className="psy-dash-modal psy-dash-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="psy-appt-modal-header">
              <h3>Detalle de cita</h3>
              <button className="psy-appt-modal-close" onClick={() => setSelectedAppt(null)} type="button" aria-label="Cerrar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="psy-appt-modal-body">
              {/* Patient section */}
              <div className="psy-appt-patient">
                <div className="psy-appt-patient-avatar">
                  {selectedAppt.patient?.avatar_url ? (
                    <img src={selectedAppt.patient.avatar_url} alt="" crossOrigin="anonymous" />
                  ) : (
                    <span>{(selectedAppt.patient?.full_name || 'P').charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h4>{selectedAppt.patient?.full_name || 'Paciente'}</h4>
                  {selectedAppt.patient?.phone && <p className="psy-appt-phone">Tel: {selectedAppt.patient.phone}</p>}
                </div>
              </div>

              <div className="psy-appt-details">
                <div className="psy-appt-detail-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  <span>{selectedAppt.appointment_date.split('-').reverse().join('/')}</span>
                </div>
                <div className="psy-appt-detail-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <span>{formatTime(selectedAppt.start_time)} - {formatTime(selectedAppt.end_time)}</span>
                </div>
                <div className="psy-appt-detail-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                  <span>${selectedAppt.payment_amount?.toLocaleString()} COP</span>
                  <span className={`psy-appt-pay-badge psy-appt-pay-badge--${selectedAppt.payment_status}`}>
                    {selectedAppt.payment_status === 'pagado' ? 'Pagado' : selectedAppt.payment_status === 'procesando' ? 'Procesando' : 'Pendiente'}
                  </span>
                </div>
                {selectedAppt.payment_reference && (
                  <div className="psy-appt-detail-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    <span>Ref: {selectedAppt.payment_reference} ({selectedAppt.payment_method})</span>
                  </div>
                )}
                <div className="psy-appt-detail-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  <span>Estado: </span>
                  <span className={`psy-appt-status-badge psy-appt-status-badge--${selectedAppt.status}`}>
                    {selectedAppt.status === 'confirmada' ? 'Confirmada' : selectedAppt.status === 'pendiente_pago' ? 'Pendiente de pago' : selectedAppt.status === 'completada' ? 'Completada' : selectedAppt.status}
                  </span>
                </div>
              </div>

              <div className="psy-appt-actions">
                {selectedAppt.patient?.phone && (
                  <button className="psy-wa-btn" onClick={() => handleOpenWhatsApp(selectedAppt.patient?.phone, selectedAppt.patient?.full_name || 'Paciente')} type="button">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Chatear por WhatsApp
                  </button>
                )}
                {selectedAppt.status === 'pendiente_pago' && selectedAppt.payment_status === 'procesando' && (
                  <button className="psy-confirm-pay-btn" onClick={() => handleConfirmPayment(selectedAppt.id)} type="button">
                    Confirmar pago recibido
                  </button>
                )}
                {selectedAppt.status === 'confirmada' && (
                  <button className="psy-complete-btn" onClick={() => handleCompleteAppt(selectedAppt.id)} type="button">
                    Marcar como completada
                  </button>
                )}
                {selectedAppt.patient && (
                  <button
                    className="psy-history-btn"
                    onClick={() => {
                      setSelectedPatientForHistory({
                        id: selectedAppt.patient!.id,
                        name: selectedAppt.patient!.full_name || 'Paciente',
                      });
                      setShowClinicalHistoryView(true);
                    }}
                    type="button"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Ver Historia Clínica
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clinical Record Modal - Apertura de Historia Clínica */}
      {showClinicalRecordModal && pendingAppointmentToComplete && pendingAppointmentToComplete.patient && (
        <ClinicalRecordModal
          isOpen={showClinicalRecordModal}
          onClose={() => {
            setShowClinicalRecordModal(false);
            setPendingAppointmentToComplete(null);
          }}
          patientId={pendingAppointmentToComplete.patient.id}
          psychologistId={profile!.id}
          onSuccess={(_clinicalRecordId) => {
            setShowClinicalRecordModal(false);
            // Después de crear HC, abrir automáticamente el modal de nota de sesión
            if (pendingAppointmentToComplete) {
              handleCompleteAppt(pendingAppointmentToComplete.id);
            }
            setPendingAppointmentToComplete(null);
          }}
        />
      )}

      {/* Session Note Modal - Nota de Sesión */}
      {showSessionNoteModal && sessionNoteData && profile && (
        <SessionNoteModal
          isOpen={showSessionNoteModal}
          onClose={() => {
            setShowSessionNoteModal(false);
            setSessionNoteData(null);
          }}
          appointmentId={sessionNoteData.appointmentId}
          clinicalRecordId={sessionNoteData.clinicalRecordId}
          sessionNumber={sessionNoteData.sessionNumber}
          patientId={appointments.find(a => a.id === sessionNoteData.appointmentId)?.patient?.id || ''}
          psychologistId={profile.id}
          onSuccess={() => {
            setShowSessionNoteModal(false);
            setSessionNoteData(null);
            setSelectedAppt(null);
            fetchData();
          }}
        />
      )}

      {/* Clinical History View - Vista de Historia Clínica */}
      {showClinicalHistoryView && selectedPatientForHistory && profile && (
        <ClinicalHistoryView
          isOpen={showClinicalHistoryView}
          onClose={() => {
            setShowClinicalHistoryView(false);
            setSelectedPatientForHistory(null);
          }}
          patientId={selectedPatientForHistory.id}
          psychologistId={profile.id}
          patientName={selectedPatientForHistory.name}
        />
      )}
    </div>
  );
};

export default PsychologistDashboard;
