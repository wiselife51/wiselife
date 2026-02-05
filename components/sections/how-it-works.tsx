"use client"

import Image from "next/image"
import { Carousel } from "@/components/carousel"
import { howItWorksSteps } from "@/lib/data"
import { cn } from "@/lib/utils"
import {
  UserIcon,
  FileTextIcon,
  MessageSquareIcon,
  HeartPulseIcon,
  ArrowRightIcon,
} from "@/components/icons"

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  user: UserIcon,
  file: FileTextIcon,
  message: MessageSquareIcon,
  heartpulse: HeartPulseIcon,
}

interface StepCardProps {
  step: (typeof howItWorksSteps)[0]
  isActive: boolean
}

function StepCard({ step, isActive }: StepCardProps) {
  const Icon = iconMap[step.icon] || UserIcon

  return (
    <div
      className={cn(
        "relative w-full glass-card p-0 flex flex-col gap-0 overflow-hidden",
        "transition-all duration-400",
        isActive && "scale-105 border-white/30 shadow-glass-hover",
        // Gradient line on top when active
        "before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px]",
        "before:bg-gradient-brand before:opacity-0 before:transition-opacity before:duration-400 before:rounded-t-[18px] before:z-10",
        isActive && "before:opacity-100"
      )}
    >
      {/* Step Number */}
      <div className="absolute top-2.5 right-2.5 w-[45px] h-[45px] flex items-center justify-center bg-gradient-brand-short text-white text-[1.1rem] font-bold rounded-full shadow-brand z-[3]">
        {step.number}
      </div>

      {/* Image Container */}
      <div className="relative w-full h-[140px] overflow-hidden rounded-t-[18px]">
        <Image
          src={step.image}
          alt={step.title}
          fill
          className={cn(
            "object-cover transition-transform duration-400",
            isActive && "scale-110"
          )}
          sizes="340px"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/30 to-gray-900/70 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 flex-1 text-center p-4">
        {/* Icon */}
        <div
          className={cn(
            "w-[50px] h-[50px] mx-auto flex items-center justify-center",
            "bg-gradient-to-br from-brand-primary/15 to-brand-dark/15",
            "border border-brand-primary/30 rounded-xl text-brand-primary",
            "transition-all duration-400",
            isActive && "scale-110 rotate-5 shadow-brand"
          )}
        >
          <Icon className="w-9 h-9" strokeWidth={1.5} />
        </div>

        <h3 className="text-[1.05rem] font-bold text-white m-0 leading-tight text-shadow-sm">
          {step.title}
        </h3>
        <p className="text-[0.8rem] leading-relaxed text-white/80 m-0 min-h-[40px]">
          {step.description}
        </p>

        {/* Button */}
        <button className="mt-auto w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-transparent border-2 border-white/30 rounded-lg text-white text-[0.75rem] font-semibold transition-all duration-300 hover:bg-white/10 hover:border-white/60 hover:-translate-y-0.5 group">
          <span>Comenzar</span>
          <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

export function HowItWorksSection() {
  return (
    <section id="servicios" className="section">
      <div className="section-container">
        {/* Header */}
        <div className="section-header">
          <h2 className="section-title">
            Un camino claro hacia tu <span className="gradient-text">Bienestar</span>
          </h2>
          <p className="section-description">
            Proceso terapeutico estructurado en 4 pasos fundamentales para
            garantizar tu progreso y bienestar emocional.
          </p>
        </div>

        {/* Carousel */}
        <Carousel
          id="howitworks"
          items={howItWorksSteps}
          renderItem={(step, index, isActive) => (
            <StepCard key={index} step={step} isActive={isActive} />
          )}
        />
      </div>
    </section>
  )
}
