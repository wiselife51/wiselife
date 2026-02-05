import {
  FacebookIcon,
  TwitterXIcon,
  InstagramIcon,
  LinkedInIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/components/icons"
import { cn } from "@/lib/utils"

const socialLinks = [
  {
    href: "https://facebook.com",
    icon: FacebookIcon,
    label: "Facebook",
    bgColor: "bg-[#1877f2]",
    glowColor: "shadow-[0_0_8px_rgba(24,119,242,0.6)] hover:shadow-[0_0_12px_rgba(24,119,242,0.9),0_0_22px_rgba(24,119,242,0.5)]",
  },
  {
    href: "https://twitter.com",
    icon: TwitterXIcon,
    label: "Twitter",
    bgColor: "bg-black",
    glowColor: "shadow-[0_0_8px_rgba(255,255,255,0.3)] hover:shadow-[0_0_12px_rgba(255,255,255,0.5),0_0_22px_rgba(255,255,255,0.3)]",
  },
  {
    href: "https://instagram.com",
    icon: InstagramIcon,
    label: "Instagram",
    bgColor: "bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888]",
    glowColor: "shadow-[0_0_8px_rgba(220,39,67,0.6)] hover:shadow-[0_0_12px_rgba(220,39,67,0.9),0_0_22px_rgba(220,39,67,0.5)]",
  },
  {
    href: "https://linkedin.com",
    icon: LinkedInIcon,
    label: "LinkedIn",
    bgColor: "bg-[#0077b5]",
    glowColor: "shadow-[0_0_8px_rgba(0,119,181,0.6)] hover:shadow-[0_0_12px_rgba(0,119,181,0.9),0_0_22px_rgba(0,119,181,0.5)]",
  },
  {
    href: "https://tiktok.com",
    icon: TikTokIcon,
    label: "TikTok",
    bgColor: "bg-black",
    glowColor: "shadow-[0_0_8px_rgba(0,242,234,0.7),0_0_10px_rgba(255,0,80,0.5)] hover:shadow-[0_0_12px_rgba(0,242,234,1),0_0_22px_rgba(255,0,80,0.7)]",
  },
  {
    href: "https://wa.me/573001234567",
    icon: WhatsAppIcon,
    label: "WhatsApp",
    bgColor: "bg-[#25d366]",
    glowColor: "shadow-[0_0_8px_rgba(37,211,102,0.6)] hover:shadow-[0_0_12px_rgba(37,211,102,0.9),0_0_22px_rgba(37,211,102,0.5)]",
  },
]

export function SocialBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center py-6 px-8 bg-gray-900/0 backdrop-blur-[1px] border-t border-white/[0.08]">
      <div className="flex gap-5 items-center">
        {socialLinks.map((social) => {
          const Icon = social.icon
          return (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-full text-white text-xl border-none",
                "transition-all duration-300 hover:-translate-y-1",
                social.bgColor,
                social.glowColor
              )}
            >
              <Icon className="w-5 h-5" />
            </a>
          )
        })}
      </div>
    </div>
  )
}
