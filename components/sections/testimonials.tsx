"use client"

import Image from "next/image"
import { Carousel } from "@/components/carousel"
import { testimonials } from "@/lib/data"
import { cn } from "@/lib/utils"
import { StarIcon, QuoteIcon } from "@/components/icons"

interface TestimonialCardProps {
  testimonial: (typeof testimonials)[0]
  isActive: boolean
}

function TestimonialCard({ testimonial, isActive }: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "relative w-full glass-card p-4 flex flex-col gap-3",
        "transition-all duration-400",
        isActive && "scale-105 border-white/30 shadow-glass-hover",
        // Gradient line on top when active
        "before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px]",
        "before:bg-gradient-brand before:opacity-0 before:transition-opacity before:duration-400 before:rounded-t-[18px] before:z-10",
        isActive && "before:opacity-100"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden border-2 border-brand-primary/30 transition-all duration-300">
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            fill
            className={cn(
              "object-cover transition-all duration-300",
              isActive && "scale-105 border-brand-primary/60"
            )}
            sizes="50px"
          />
        </div>
        <div className="flex-1">
          <h4 className="text-[0.95rem] font-bold text-white m-0 leading-tight">
            {testimonial.name}
          </h4>
          <p className="text-[0.7rem] text-white/70 mt-0.5 m-0">
            {testimonial.role}
          </p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex gap-0.5 text-amber-400">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <StarIcon key={i} className="w-3.5 h-3.5" />
        ))}
      </div>

      {/* Text */}
      <p className="text-[0.8rem] leading-relaxed text-white/90 m-0 flex-1 italic min-h-[80px]">
        "{testimonial.text}"
      </p>

      {/* Quote Icon */}
      <div className="absolute bottom-3 right-3 text-brand-primary pointer-events-none">
        <QuoteIcon className="w-9 h-9" />
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section id="testimonios" className="section">
      <div className="section-container">
        {/* Header */}
        <div className="section-header">
          <h2 className="section-title">
            Lo que dicen <span className="gradient-text">mis pacientes</span>
          </h2>
          <p className="section-description">
            Testimonios reales de personas que han transformado su vida a traves de la terapia.
          </p>
        </div>

        {/* Carousel */}
        <Carousel
          id="testimonials"
          items={testimonials}
          renderItem={(testimonial, index, isActive) => (
            <TestimonialCard key={index} testimonial={testimonial} isActive={isActive} />
          )}
        />
      </div>
    </section>
  )
}
