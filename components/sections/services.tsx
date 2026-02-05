"use client"

import { services } from "@/lib/data"
import { Icons, type IconName } from "@/components/icons"
import { cn } from "@/lib/utils"

export function Services() {
  return (
    <section id="servicios" className="relative py-20 lg:py-28">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/80 to-gray-900/50" />
      
      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-6">
            <Icons.sparkles className="w-4 h-4 text-brand-primary" />
            <span className="text-sm font-medium text-brand-primary">Nuestros Servicios</span>
          </div>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4">
            Atencion Especializada para tu{" "}
            <span className="bg-gradient-brand bg-clip-text text-transparent">Bienestar Mental</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Ofrecemos una amplia gama de servicios psicologicos adaptados a tus necesidades individuales
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const IconComponent = Icons[service.icon as IconName] || Icons.brain
            return (
              <article
                key={service.id}
                className={cn(
                  "group relative p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm",
                  "transition-all duration-500 hover:bg-white/[0.05] hover:border-brand-primary/30",
                  "hover:shadow-xl hover:shadow-brand-primary/10 hover:-translate-y-1",
                  "flex flex-col h-full min-h-[280px]"
                )}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-brand/10 border border-brand-primary/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-gradient-brand/20 transition-all duration-300">
                  <IconComponent className="w-7 h-7 text-brand-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-brand-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed flex-1">
                  {service.description}
                </p>

                {/* Features */}
                {service.features && service.features.length > 0 && (
                  <ul className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-white/50">
                        <Icons.check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Hover Gradient */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </article>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button 
            onClick={() => document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-gradient-brand text-white shadow-brand transition-all duration-300 hover:translate-y-[-2px] hover:shadow-brand-lg"
          >
            <Icons.calendar className="w-5 h-5" />
            Agenda tu Primera Consulta
            <Icons.arrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
