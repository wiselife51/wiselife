import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Icons } from "@/components/icons"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const firstName = user.user_metadata?.first_name || "Usuario"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <Icons.Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-white font-serif">
                Vida Sabia
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <button className="p-2 text-white/70 hover:text-white transition-colors">
                <Icons.Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-medium">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Hola, {firstName}
          </h1>
          <p className="text-white/60">
            Bienvenido a tu espacio de bienestar. Aqui puedes gestionar tus citas y seguimiento.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                <Icons.Calendar className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Proxima Cita</p>
                <p className="text-white font-semibold">Sin programar</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Icons.Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Sesiones Totales</p>
                <p className="text-white font-semibold">0 sesiones</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Icons.Star className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Mi Progreso</p>
                <p className="text-white font-semibold">Comenzando</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Icons.Heart className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Bienestar</p>
                <p className="text-white font-semibold">En camino</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Action Card */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-2">
              Agenda tu primera cita
            </h2>
            <p className="text-white/60 mb-6">
              Encuentra al psicologo ideal para ti y comienza tu camino hacia el bienestar emocional.
            </p>
            
            <Link
              href="/psychologists"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-teal-500/25"
            >
              <Icons.Search className="w-5 h-5" />
              Buscar Psicologos
            </Link>
          </div>

          {/* Side Actions */}
          <div className="space-y-4">
            <Link href="/dashboard/appointments" className="block glass-card rounded-2xl p-6 hover:bg-white/10 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
                  <Icons.Calendar className="w-5 h-5 text-white/70 group-hover:text-teal-400 transition-colors" />
                </div>
                <div>
                  <p className="text-white font-medium">Mis Citas</p>
                  <p className="text-white/50 text-sm">Ver historial y proximas</p>
                </div>
                <Icons.ChevronRight className="w-5 h-5 text-white/30 ml-auto" />
              </div>
            </Link>

            <Link href="/dashboard/profile" className="block glass-card rounded-2xl p-6 hover:bg-white/10 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
                  <Icons.User className="w-5 h-5 text-white/70 group-hover:text-teal-400 transition-colors" />
                </div>
                <div>
                  <p className="text-white font-medium">Mi Perfil</p>
                  <p className="text-white/50 text-sm">Editar informacion</p>
                </div>
                <Icons.ChevronRight className="w-5 h-5 text-white/30 ml-auto" />
              </div>
            </Link>

            <form action="/api/auth/signout" method="post">
              <button type="submit" className="w-full glass-card rounded-2xl p-6 hover:bg-red-500/10 transition-all group text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                    <Icons.LogOut className="w-5 h-5 text-white/70 group-hover:text-red-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-white font-medium group-hover:text-red-300 transition-colors">Cerrar Sesion</p>
                    <p className="text-white/50 text-sm">Salir de tu cuenta</p>
                  </div>
                </div>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
