"use client"

import { Carousel } from "@/components/carousel"
import { services } from "@/lib/data"
import { cn } from "@/lib/utils"
import {
  PlusIcon,
  UsersIcon,
  GridIcon,
  MessageSquareIcon,
  PhoneIcon,
  HelpCircleIcon,
  CheckIcon,
  ArrowRightIcon,
} from "@/components/icons"

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  plus: PlusIcon,
  users: UsersIcon,
  grid: GridIcon,
  message: MessageSquareIcon,
  phone: PhoneIcon,
  help: HelpCircleIcon,
}

interface ServiceCardProps {
  service: (typeof services)[0]
  isActive: boolean
}

function ServiceCard({ service, isActive }: ServiceCardProps) {
  const Icon = iconMap[service.icon] || PlusIcon

  return (
    <div
      className={cn(
        "relative w-full glass-card p-4 flex flex-col gap-1.5",
        "transition-all duration-400",
        isActive && "scale-105 border-white/30 shadow-glass-hover",
        // Gradient line on top when active
        "before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px]",
        "before:bg-gradient-brand before:opacity-0 before:transition-opacity before:duration-400 before:rounded-t-[18px] before:z-10",
        isActive && "before:opacity-100"
      )}
    >
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

      {/* Content */}
      <div className="flex flex-col gap-1.5 flex-1 text-center items-center">
        <h3 className="text-[1.05rem] font-bold text-white m-0 leading-tight text-shadow-sm">
          {service.title}
        </h3>
        <p className="text-[0.8rem] leading-relaxed text-white/80 m-0 min-h-[40px]">
          {service.description}
        </p>

        {/* Features */}
        <ul className="list-none p-0 my-1.5 flex flex-col gap-1.5 text-left max-w-max">
          {service.features.map((feature, index) => (
            <li
              key={index}
              className="flex items-center justify-start gap-2 text-[0.75rem] text-white/85"
            >
              <CheckIcon className="w-3.5 h-3.5 flex-shrink-0 text-brand-primary" strokeWidth={3} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Button */}
        <button className="mt-auto w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-transparent border-2 border-white/30 rounded-lg text-white text-[0.75rem] font-semibold transition-all duration-300 hover:bg-white/10 hover:border-white/60 hover:-translate-y-0.5 group">
          <span>Agendar</span>
          <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

export function SpecialistsSection() {
  return (
    <section id="especialistas" className="section">
      <div className="section-container">
        {/* Header */}
        <div className="section-header">
          <h2 className="section-title">
            En que puedo <span className="gradient-text">ayudarte?</span>
          </h2>
          <p className="section-description">
            Ofrezco diversos servicios de psicologia clinica con enfoque en TCC,
            tanto presencial en Bogota como online.
          </p>
        </div>

        {/* Carousel */}
        <Carousel
          id="specialists"
          items={services}
          renderItem={(service, index, isActive) => (
            <ServiceCard key={index} service={service} isActive={isActive} />
          )}
        />
      </div>
    </section>
  )
}
