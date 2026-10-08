export const PLATFORM_COMMISSION_RATE = 0.05;
export const PLATFORM_NEQUI_PHONE = '573184726151';
export const PLATFORM_NAME = 'Vida Sabia';

export function splitPayment(total: number) {
  const platformFee = Math.round(total * PLATFORM_COMMISSION_RATE);
  return { platformFee, psychologistAmount: total - platformFee };
}

export function formatNequiPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const local = digits.length === 12 && digits.startsWith('57') ? digits.slice(2) : digits;
  if (local.length !== 10) return phone;
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}

export function toLocalNequiNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('57') ? digits.slice(2) : digits;
}
