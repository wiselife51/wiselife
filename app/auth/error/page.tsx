import Link from "next/link"
import { Icons } from "@/components/icons"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/assets/VideoFondo.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-card rounded-3xl p-8 md:p-10 text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
            <Icons.alertCircle className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-3">
            Error de autenticacion
          </h1>
          
          <p className="text-white/70 mb-6">
            Ha ocurrido un error durante el proceso de autenticacion. 
            Por favor, intenta de nuevo o contacta con soporte si el problema persiste.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="block w-full py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold rounded-xl transition-all duration-300"
            >
              Intentar de nuevo
            </Link>
            
            <Link
              href="/"
              className="block w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-xl transition-all"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
