import Link from "next/link"
import {
  MapPinIcon,
  MailIcon,
  PhoneIcon,
  ListIcon,
  PlusIcon,
} from "@/components/icons"

const quickLinks = [
  { href: "#servicios", label: "Servicios" },
  { href: "#proceso", label: "Proceso" },
  { href: "#precios", label: "Precios" },
  { href: "#testimonios", label: "Testimonios" },
  { href: "#contacto", label: "Contacto" },
]

const serviceLinks = [
  { href: "#terapia-individual", label: "Terapia Individual" },
  { href: "#terapia-pareja", label: "Terapia de Pareja" },
  { href: "#evaluacion", label: "Evaluacion Psicologica" },
  { href: "#tcc", label: "TCC" },
  { href: "#orientacion", label: "Orientacion Vocacional" },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="section min-h-screen relative flex items-center justify-center">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_1fr] gap-12 lg:gap-12 w-full animate-fade-in-up">
          {/* Quick Links Column */}
          <div className="flex flex-col gap-3 items-start lg:order-1">
            <h4 className="flex items-center gap-2 text-base font-bold text-white mb-2">
              <ListIcon className="w-[18px] h-[18px] text-brand-primary" />
              <span>Enlaces Rapidos</span>
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-1.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.8125rem] text-white/80 no-underline py-1 transition-all duration-300 hover:text-brand-primary hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brand Section - Center */}
          <div className="flex flex-col items-center text-center gap-3 lg:order-2">
            <h3 className="text-2xl font-bold">
              <span className="text-white">Psicologa Clinica </span>
              <span className="gradient-text">Stephanie Rincon</span>
            </h3>
            <p className="text-[0.875rem] leading-relaxed text-white/80 max-w-[450px]">
              Terapia psicologica personalizada con enfoque en TCC. Tu bienestar emocional es mi prioridad.
            </p>

            {/* Contact Info */}
            <div className="inline-flex flex-col items-start gap-2.5 mt-3">
              <div className="flex items-center gap-2.5 text-[0.8125rem] text-white/85">
                <MapPinIcon className="w-[18px] h-[18px] text-brand-primary flex-shrink-0" />
                <span>Bogota, Colombia</span>
              </div>
              <div className="flex items-center gap-2.5 text-[0.8125rem] text-white/85">
                <MailIcon className="w-[18px] h-[18px] text-brand-primary flex-shrink-0" />
                <span>contacto@psicologo.com</span>
              </div>
              <div className="flex items-center gap-2.5 text-[0.8125rem] text-white/85">
                <PhoneIcon className="w-[18px] h-[18px] text-brand-primary flex-shrink-0" />
                <span>+57 300 123 4567</span>
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div className="flex flex-col gap-3 items-start lg:items-end lg:text-right lg:order-3">
            <h4 className="flex items-center gap-2 text-base font-bold text-white mb-2 lg:flex-row-reverse">
              <PlusIcon className="w-[18px] h-[18px] text-brand-primary" />
              <span>Servicios</span>
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-1.5 lg:items-end">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.8125rem] text-white/80 no-underline py-1 transition-all duration-300 hover:text-brand-primary lg:hover:-translate-x-1 hover:translate-x-1 lg:hover:translate-x-0 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="absolute bottom-0 left-0 w-full p-4 px-8 border-t border-white/15 animate-fade-in-up [animation-delay:0.3s]">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center flex-wrap gap-4">
          <p className="text-[0.8125rem] text-white/70 m-0">
            &copy; {currentYear} Vida Sabia. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="#privacidad"
              className="text-[0.8125rem] text-white/70 no-underline transition-colors duration-300 hover:text-brand-primary"
            >
              Politica de Privacidad
            </Link>
            <span className="text-white/50">|</span>
            <Link
              href="#terminos"
              className="text-[0.8125rem] text-white/70 no-underline transition-colors duration-300 hover:text-brand-primary"
            >
              Terminos y Condiciones
            </Link>
            <span className="text-white/50">|</span>
            <Link
              href="#cookies"
              className="text-[0.8125rem] text-white/70 no-underline transition-colors duration-300 hover:text-brand-primary"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
