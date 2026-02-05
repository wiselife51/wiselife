"use client"

import { MapPinIcon, MonitorIcon, CheckCircleIcon, ArrowRightIcon } from "@/components/icons"

const features = [
  { icon: MapPinIcon, text: "Presencial en Bogota" },
  { icon: MonitorIcon, text: "Sesiones online" },
  { icon: CheckCircleIcon, text: "Enfoque basado en evidencia" },
]

export function HeroSection() {
  return (
    <section className="section pt-10">
      <div className="section-container">
        <div className="flex flex-col items-center text-center gap-3 animate-fade-in-up">
          {/* Title */}
          <h1 className="section-title max-w-[900px] leading-tight">
            Comienza el camino hacia tu{" "}
            <span className="gradient-text">bienestar emocional</span>
          </h1>

          {/* Description */}
          <p className="section-description animate-fade-in-up [animation-delay:0.2s]">
            Te ofrezco un espacio seguro, confidencial y profesional para trabajar en tu
            salud mental y crecimiento personal.
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-6 justify-center items-center my-3 animate-fade-in-up [animation-delay:0.3s]">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 text-white/90 text-sm font-medium transition-all duration-300 hover:text-brand-primary hover:-translate-y-0.5 group"
                >
                  <Icon className="w-[22px] h-[22px] text-brand-primary flex-shrink-0 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-5" />
                  <span>{feature.text}</span>
                </div>
              )
            })}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 flex-wrap justify-center items-center mt-3 animate-fade-in-up [animation-delay:0.4s]">
            <button className="btn-primary group">
              <span>Agenda tu Cita</span>
              <ArrowRightIcon className="w-[18px] h-[18px] transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className="btn-secondary group">
              <span>Conocer mas</span>
              <ArrowRightIcon className="w-[18px] h-[18px] transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
