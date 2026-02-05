"use client"

import { Carousel } from "@/components/carousel"
import { plans } from "@/lib/data"
import { cn } from "@/lib/utils"
import {
  ShieldIcon,
  UserIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  CheckIcon,
  ArrowRightIcon,
} from "@/components/icons"

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  shield: ShieldIcon,
  user: UserIcon,
  users: UsersIcon,
  calendar: CalendarIcon,
  clock: ClockIcon,
  file: FileTextIcon,
}

interface PricingCardProps {
  plan: (typeof plans)[0]
  isActive: boolean
}

function PricingCard({ plan, isActive }: PricingCardProps) {
  const Icon = iconMap[plan.icon] || ShieldIcon

  return (
    <div
      className={cn(
        "relative w-full glass-card p-4 flex flex-col gap-1.5",
        "transition-all duration-400",
        isActive && "scale-105 border-white/30 shadow-glass-hover",
        // Gradient line on top when active
        "before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px]",
        "before:bg-gradient-brand before:opacity-0 before:transition-opacity before:duration-400 before:rounded-t-[18px]",
        isActive && "before:opacity-100"
      )}
    >
      {/* Highlight Badge */}
      {plan.highlight && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-400 to-brand-accent text-white text-[0.65rem] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-purple-400/50 z-10">
          {plan.highlight}
        </div>
      )}

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
      <div className="flex flex-col gap-1 flex-1 text-center items-center">
        <h3 className="text-[1.05rem] font-bold text-white m-0 leading-tight text-shadow-sm">
          {plan.name}
        </h3>
        <div className="text-[1.75rem] font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent my-1 leading-none">
          {plan.price}
        </div>
        <p className="text-[0.75rem] text-white/70 m-0 mb-2">{plan.period}</p>

        {/* Features */}
        <ul className="list-none p-0 my-1.5 flex flex-col gap-1.5 text-left max-w-max">
          {plan.features.map((feature, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-[0.75rem] text-white/90 leading-snug"
            >
              <CheckIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand-primary" strokeWidth={2.5} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Button */}
        <button className="mt-auto w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-transparent border-2 border-white/30 rounded-lg text-white text-[0.75rem] font-semibold transition-all duration-300 hover:bg-white/10 hover:border-white/60 hover:-translate-y-0.5 group">
          <span>Seleccionar</span>
          <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

export function PricingSection() {
  return (
    <section id="precios" className="section">
      <div className="section-container">
        {/* Header */}
        <div className="section-header">
          <h2 className="section-title">
            Invierte en tu <span className="gradient-text">Bienestar</span>
          </h2>
          <p className="section-description">
            Planes flexibles que se adaptan a tu camino de crecimiento personal
            con opciones presenciales en Bogota y online.
          </p>
        </div>

        {/* Carousel */}
        <Carousel
          id="pricing"
          items={plans}
          renderItem={(plan, index, isActive) => (
            <PricingCard key={index} plan={plan} isActive={isActive} />
          )}
        />
      </div>
    </section>
  )
}
