"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  HeartPulseIcon,
  LayersIcon,
  ClockIcon,
  DollarSignIcon,
  MessageSquareIcon,
  UsersIcon,
  ChevronRightIcon,
} from "@/components/icons"

const navLinks = [
  { href: "#servicios", label: "Servicios", icon: LayersIcon },
  { href: "#proceso", label: "Proceso", icon: ClockIcon },
  { href: "#precios", label: "Precios", icon: DollarSignIcon },
  { href: "#testimonios", label: "Testimonios", icon: MessageSquareIcon },
  { href: "#especialistas", label: "Especialistas", icon: UsersIcon },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
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

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5",
        "bg-gray-900/30 backdrop-blur-xl border-b border-white/10 transition-all duration-300",
        isScrolled && "bg-gray-900/60 shadow-lg shadow-black/30"
      )}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 text-2xl font-bold no-underline transition-all duration-300 hover:scale-105 z-[1002]"
      >
        <HeartPulseIcon
          className="w-8 h-8 text-brand-primary drop-shadow-[0_0_8px_rgba(77,208,225,0.4)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-5"
          style={{
            filter: "drop-shadow(0 0 8px rgba(77, 208, 225, 0.4))",
          }}
        />
        <span className="bg-gradient-brand bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(77,208,225,0.3)]">
          Vida Sabia
        </span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex flex-1 justify-center">
        <ul className="flex gap-10 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.href} className="flex items-center">
              <Link
                href={link.href}
                className="relative text-white/90 text-[0.9375rem] font-medium no-underline py-1 transition-all duration-300 hover:text-brand-primary group"
              >
                {link.label}
                <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Desktop Actions */}
      <div className="hidden lg:flex items-center gap-4">
        <button className="px-6 py-2.5 rounded-[10px] text-sm font-semibold bg-transparent border-2 border-white/30 text-white transition-all duration-300 hover:bg-white/10 hover:border-white/60">
          Iniciar Sesion
        </button>
        <button className="px-6 py-2.5 rounded-[10px] text-sm font-semibold bg-gradient-brand text-white shadow-brand transition-all duration-300 hover:translate-y-[-2px] hover:shadow-brand-lg hover:brightness-110">
          Agendar Cita
        </button>
      </div>

      {/* Hamburger Button */}
      <button
        className={cn(
          "lg:hidden flex flex-col justify-between w-7 h-[22px] bg-transparent border-none cursor-pointer p-0 z-[1002] transition-all duration-300"
        )}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-expanded={isMenuOpen}
        aria-label="Toggle menu"
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
        <div className="absolute inset-0 bg-[rgba(10,15,25,0.65)] -z-10" />

        {/* Mobile Nav */}
        <nav className="relative z-10 pt-16 px-8 pb-3 flex-grow-0 flex-shrink overflow-y-auto flex flex-col justify-start max-h-[40vh]">
          <ul className="list-none m-0 p-0 flex flex-col gap-2.5 mt-6">
            {navLinks.map((link, index) => {
              const Icon = link.icon
              return (
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
                  <Link
                    href={link.href}
                    className="flex items-center justify-between p-3.5 no-underline text-white text-base font-medium rounded-xl transition-all duration-300 bg-white/[0.03] border border-white/[0.05] hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary/30 hover:translate-x-1.5 group"
                    onClick={handleLinkClick}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon className="w-[22px] h-[22px] flex-shrink-0 text-brand-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-5" />
                      <span>{link.label}</span>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 opacity-70 transition-all duration-300 group-hover:translate-x-1.5 group-hover:opacity-100" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Mobile Actions */}
        <div className="relative z-10 flex flex-col gap-3.5 p-8 pt-6 mt-4 border-t border-white/10 bg-gray-900/50 backdrop-blur-[10px]">
          <button
            className="w-full py-3.5 px-6 rounded-xl text-[0.95rem] font-semibold bg-transparent border-2 border-white/30 text-white transition-all duration-300 hover:bg-white/10 hover:border-white/60"
            onClick={handleLinkClick}
          >
            Iniciar Sesion
          </button>
          <button
            className="w-full py-3.5 px-6 rounded-xl text-[0.95rem] font-semibold bg-gradient-brand text-white shadow-brand transition-all duration-300 hover:translate-y-[-2px] hover:shadow-brand-lg hover:brightness-110"
            onClick={handleLinkClick}
          >
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
