import Link from "next/link"
import { Icons } from "@/components/icons"

export default function VerifyEmailPage() {
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
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
            <Icons.mail className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-3">
            Verifica tu correo electronico
          </h1>
          
          <p className="text-white/70 mb-6">
            Hemos enviado un enlace de verificacion a tu correo electronico. 
            Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
          </p>

          {/* Tips */}
          <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
            <p className="text-white/80 text-sm mb-2 font-medium">No encuentras el correo?</p>
            <ul className="text-white/60 text-sm space-y-1">
              <li className="flex items-center gap-2">
                <Icons.check className="w-4 h-4 text-teal-400" />
                Revisa tu carpeta de spam
              </li>
              <li className="flex items-center gap-2">
                <Icons.check className="w-4 h-4 text-teal-400" />
                Verifica que el correo sea correcto
              </li>
              <li className="flex items-center gap-2">
                <Icons.check className="w-4 h-4 text-teal-400" />
                Espera unos minutos e intenta de nuevo
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="block w-full py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold rounded-xl transition-all duration-300"
            >
              Ir a Iniciar Sesion
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
