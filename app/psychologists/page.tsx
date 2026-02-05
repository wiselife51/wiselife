import Link from "next/link"
import Image from "next/image"
import { Icons } from "@/components/icons"
import { specialists } from "@/lib/data"

export default function PsychologistsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <Icons.Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-white font-serif">
                Vida Sabia
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link 
                href="/auth/login" 
                className="px-4 py-2 text-white/80 hover:text-white transition-colors"
              >
                Iniciar Sesion
              </Link>
              <Link 
                href="/auth/register" 
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium rounded-xl hover:from-teal-400 hover:to-teal-500 transition-all"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Nuestros Psicologos
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto">
            Encuentra al especialista ideal para ti. Todos nuestros profesionales estan certificados 
            y tienen amplia experiencia en diferentes areas de la salud mental.
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-white/60 mb-2 block">Especialidad</label>
              <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50">
                <option value="">Todas las especialidades</option>
                <option value="ansiedad">Ansiedad y Estres</option>
                <option value="depresion">Depresion</option>
                <option value="parejas">Terapia de Parejas</option>
                <option value="familia">Terapia Familiar</option>
                <option value="infantil">Psicologia Infantil</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-white/60 mb-2 block">Modalidad</label>
              <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50">
                <option value="">Todas</option>
                <option value="online">Online</option>
                <option value="presencial">Presencial</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-white/60 mb-2 block">Precio</label>
              <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50">
                <option value="">Cualquier precio</option>
                <option value="low">Hasta $100.000</option>
                <option value="mid">$100.000 - $150.000</option>
                <option value="high">Mas de $150.000</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white font-medium rounded-xl transition-colors flex items-center gap-2">
                <Icons.Search className="w-5 h-5" />
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Specialists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialists.map((specialist) => (
            <div key={specialist.id} className="glass-card rounded-2xl overflow-hidden group hover:bg-white/10 transition-all">
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={specialist.image}
                  alt={specialist.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Badge */}
                {specialist.available && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Disponible
                  </div>
                )}

                {/* Quick Info */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">{specialist.name}</h3>
                  <p className="text-white/80 text-sm">{specialist.specialty}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Icons.Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="text-white font-semibold">{specialist.rating}</span>
                  </div>
                  <span className="text-white/50 text-sm">({specialist.reviews} resenas)</span>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Icons.Award className="w-4 h-4 text-teal-400" />
                    {specialist.experience} anos de experiencia
                  </div>
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Icons.DollarSign className="w-4 h-4 text-teal-400" />
                    ${specialist.price.toLocaleString()} COP / sesion
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {specialist.specialties.slice(0, 3).map((spec, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-1 bg-white/10 rounded-lg text-white/70 text-xs"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Action */}
                <Link
                  href={`/psychologists/${specialist.id}`}
                  className="block w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold rounded-xl text-center transition-all"
                >
                  Ver Perfil y Agendar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
