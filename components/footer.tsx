"use client"

import Link from "next/link"
import { Icons } from "@/components/icons"

const quickLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#servicios", label: "Servicios" },
  { href: "#especialistas", label: "Especialistas" },
  { href: "#planes", label: "Planes" },
  { href: "#testimonios", label: "Testimonios" },
  { href: "#proceso", label: "Proceso" },
]

const serviceLinks = [
  { label: "Terapia Individual" },
  { label: "Terapia de Pareja" },
  { label: "Terapia Familiar" },
  { label: "Evaluacion Psicologica" },
  { label: "Terapia Cognitivo-Conductual" },
  { label: "Orientacion Vocacional" },
]

const socialLinks = [
  { icon: "facebook" as const, href: "https://facebook.com", label: "Facebook" },
  { icon: "instagram" as const, href: "https://instagram.com", label: "Instagram" },
  { icon: "linkedin" as const, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: "twitter" as const, href: "https://twitter.com", label: "Twitter" },
  { icon: "youtube" as const, href: "https://youtube.com", label: "YouTube" },
]

const contactInfo = [
  { icon: "mapPin" as const, text: "Calle 100 #19-61, Bogota, Colombia" },
  { icon: "mail" as const, text: "contacto@vidasabia.com", href: "mailto:contacto@vidasabia.com" },
  { icon: "phone" as const, text: "+57 300 123 4567", href: "tel:+573001234567" },
  { icon: "clock" as const, text: "Lun - Vie: 8:00 AM - 6:00 PM" },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  const handleNavClick = (href: string) => {
    const element = document.getElementById(href.replace("#", ""))
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer id="contacto" className="relative">
      {/* Main Footer */}
      <div className="relative py-16 lg:py-20 bg-gray-900/80 backdrop-blur-xl border-t border-white/10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-6 group">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-brand-primary/25">
                    <Icons.brain className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-gray-900 flex items-center justify-center">
                    <Icons.heartPulse className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-brand bg-clip-text text-transparent">
                    Vida Sabia
                  </span>
                  <span className="text-xs text-white/50 uppercase tracking-wider">
                    Psicologia Clinica
                  </span>
                </div>
              </Link>
              <p className="text-sm text-white/60 leading-relaxed mb-6 max-w-xs">
                Brindamos atencion psicologica profesional y personalizada para ayudarte a alcanzar tu bienestar emocional y mental.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => {
                  const IconComponent = Icons[social.icon]
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 transition-all duration-300 hover:bg-brand-primary/20 hover:border-brand-primary/30 hover:text-brand-primary hover:scale-110"
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="flex items-center gap-2 text-base font-semibold text-white mb-5">
                <Icons.link className="w-5 h-5 text-brand-primary" />
                Enlaces Rapidos
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="text-sm text-white/60 transition-all duration-300 hover:text-brand-primary hover:translate-x-1 inline-flex items-center gap-2 group"
                    >
                      <Icons.chevronRight className="w-4 h-4 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="flex items-center gap-2 text-base font-semibold text-white mb-5">
                <Icons.sparkles className="w-5 h-5 text-brand-primary" />
                Servicios
              </h4>
              <ul className="space-y-3">
                {serviceLinks.map((service) => (
                  <li key={service.label}>
                    <button
                      onClick={() => handleNavClick("#servicios")}
                      className="text-sm text-white/60 transition-all duration-300 hover:text-brand-primary hover:translate-x-1 inline-flex items-center gap-2 group"
                    >
                      <Icons.chevronRight className="w-4 h-4 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      {service.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="flex items-center gap-2 text-base font-semibold text-white mb-5">
                <Icons.mapPin className="w-5 h-5 text-brand-primary" />
                Contacto
              </h4>
              <ul className="space-y-4">
                {contactInfo.map((item, index) => {
                  const IconComponent = Icons[item.icon]
                  const content = (
                    <span className="flex items-start gap-3 text-sm text-white/60 transition-colors duration-300 hover:text-white/80">
                      <IconComponent className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                      <span>{item.text}</span>
                    </span>
                  )
                  return (
                    <li key={index}>
                      {item.href ? (
                        <a href={item.href} className="block">
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </li>
                  )
                })}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleNavClick("#planes")}
                className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-brand text-white shadow-brand transition-all duration-300 hover:shadow-brand-lg hover:translate-y-[-2px]"
              >
                <Icons.calendar className="w-4 h-4" />
                Agendar Cita
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative py-5 bg-gray-950/80 border-t border-white/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/50 text-center md:text-left">
              &copy; {currentYear} Vida Sabia. Todos los derechos reservados.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <Link
                href="/privacidad"
                className="text-sm text-white/50 transition-colors duration-300 hover:text-brand-primary"
              >
                Politica de Privacidad
              </Link>
              <span className="text-white/20 hidden md:inline">|</span>
              <Link
                href="/terminos"
                className="text-sm text-white/50 transition-colors duration-300 hover:text-brand-primary"
              >
                Terminos y Condiciones
              </Link>
              <span className="text-white/20 hidden md:inline">|</span>
              <Link
                href="/cookies"
                className="text-sm text-white/50 transition-colors duration-300 hover:text-brand-primary"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
