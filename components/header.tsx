"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

const navLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#servicios", label: "Servicios" },
  { href: "#especialistas", label: "Especialistas" },
  { href: "#planes", label: "Planes" },
  { href: "#testimonios", label: "Testimonios" },
  { href: "#proceso", label: "Proceso" },
  { href: "#contacto", label: "Contacto" },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("inicio")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      
      // Detect active section
      const sections = navLinks.map(n => n.href.replace("#", ""))
      for (const section of [...sections].reverse()) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150) {
            setActiveSection(section)
            break
          }
        }
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMenuOpen])

  const handleLinkClick = (href: string) => {
    setIsMenuOpen(false)
    const element = document.getElementById(href.replace("#", ""))
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-8 py-4",
        "bg-gray-900/30 backdrop-blur-xl border-b border-white/10 transition-all duration-300",
        isScrolled && "bg-gray-900/80 shadow-lg shadow-black/30"
      )}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 no-underline transition-all duration-300 hover:scale-105 z-[1002] group"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-brand-primary/25 group-hover:shadow-brand-primary/40 transition-all duration-300">
            <Icons.brain className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-gray-900 flex items-center justify-center">
            <Icons.heartPulse className="w-2.5 h-2.5 text-white" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold bg-gradient-brand bg-clip-text text-transparent leading-tight">
            Vida Sabia
          </span>
          <span className="text-[10px] text-white/60 leading-tight tracking-wide uppercase">
            Psicologia Clinica
          </span>
        </div>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex flex-1 justify-center">
        <ul className="flex gap-1 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.href}>
              <button
                onClick={() => handleLinkClick(link.href)}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                  activeSection === link.href.replace("#", "")
                    ? "text-brand-primary bg-brand-primary/10"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
                {activeSection === link.href.replace("#", "") && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-primary" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Desktop Actions */}
      <div className="hidden lg:flex items-center gap-3">
        <Link href="/login">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-transparent border border-white/20 text-white/90 transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:text-white">
            <Icons.user className="w-4 h-4" />
            Iniciar Sesion
          </button>
        </Link>
        <button 
          onClick={() => handleLinkClick("#contacto")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-brand text-white shadow-brand transition-all duration-300 hover:translate-y-[-2px] hover:shadow-brand-lg hover:brightness-110"
        >
          <Icons.calendar className="w-4 h-4" />
          Agendar Cita
        </button>
      </div>

      {/* Hamburger Button */}
      <button
        className="lg:hidden flex flex-col justify-between w-7 h-[22px] bg-transparent border-none cursor-pointer p-0 z-[1002]"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
      >
        <div
          className={cn(
            "w-full h-[3px] bg-gradient-brand rounded-sm transition-all duration-300",
            isMenuOpen && "translate-y-[9.5px] rotate-45"
          )}
        />
        <div
          className={cn(
            "w-full h-[3px] bg-gradient-brand rounded-sm transition-all duration-300",
            isMenuOpen && "opacity-0 -translate-x-5"
          )}
        />
        <div
          className={cn(
            "w-full h-[3px] bg-gradient-brand rounded-sm transition-all duration-300",
            isMenuOpen && "-translate-y-[9.5px] -rotate-45"
          )}
        />
      </button>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed top-0 -right-full w-[85%] max-w-[400px] h-screen bg-transparent transition-all duration-400 z-[1001] flex flex-col overflow-hidden",
          "lg:hidden",
          isMenuOpen && "right-0"
        )}
      >
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 -z-20"
        >
          <source src="/assets/VideoFondo.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-[rgba(10,15,25,0.85)] backdrop-blur-sm -z-10" />

        {/* Mobile Nav */}
        <nav className="relative z-10 pt-20 px-6 pb-4 flex-1 overflow-y-auto">
          <ul className="list-none m-0 p-0 flex flex-col gap-2">
            {navLinks.map((link, index) => (
              <li
                key={link.href}
                className={cn(
                  "opacity-0 translate-x-8",
                  isMenuOpen && "animate-slide-in-right"
                )}
                style={{
                  animationDelay: isMenuOpen ? `${0.1 + index * 0.05}s` : "0s",
                  animationFillMode: "forwards",
                }}
              >
                <button
                  onClick={() => handleLinkClick(link.href)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 text-left text-base font-medium rounded-xl transition-all duration-300 border",
                    activeSection === link.href.replace("#", "")
                      ? "bg-brand-primary/20 text-brand-primary border-brand-primary/30"
                      : "bg-white/[0.03] border-white/[0.05] text-white hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary/30"
                  )}
                >
                  <span>{link.label}</span>
                  <Icons.chevronRight className="w-5 h-5 opacity-60" />
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Actions */}
        <div className="relative z-10 flex flex-col gap-3 p-6 border-t border-white/10 bg-gray-900/60 backdrop-blur-xl">
          <Link href="/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
            <button className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-base font-semibold bg-transparent border border-white/20 text-white transition-all duration-300 hover:bg-white/10 hover:border-white/40">
              <Icons.user className="w-5 h-5" />
              Iniciar Sesion
            </button>
          </Link>
          <button
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-base font-semibold bg-gradient-brand text-white shadow-brand transition-all duration-300 hover:shadow-brand-lg"
            onClick={() => handleLinkClick("#contacto")}
          >
            <Icons.calendar className="w-5 h-5" />
            Agendar Cita
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-[5px] z-[1000] animate-fade-in"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  )
}
