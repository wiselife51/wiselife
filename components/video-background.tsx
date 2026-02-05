"use client"

interface VideoBackgroundProps {
  src?: string
  poster?: string
}

export function VideoBackground({
  src = "/assets/VideoFondo.mp4",
  poster,
}: VideoBackgroundProps) {
  return (
    <div className="video-background-container" aria-hidden="true">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={poster}
        className="video-background"
      >
        <source src={src} type="video/mp4" />
        Tu navegador no soporta el video.
      </video>
      <div className="video-overlay" />
    </div>
  )
}
