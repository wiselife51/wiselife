import { Header } from "@/components/header"
import { VideoBackground } from "@/components/video-background"
import { HeroSection } from "@/components/sections/hero"
import { ServicesSection } from "@/components/sections/services"
import { SpecialistsSection } from "@/components/sections/specialists"
import { HowItWorksSection } from "@/components/sections/how-it-works"
import { PricingSection } from "@/components/sections/pricing"
import { TestimonialsSection } from "@/components/sections/testimonials"
import { ProcessSection } from "@/components/sections/process"
import { Footer } from "@/components/footer"
import { SocialBar } from "@/components/social-bar"

export default function Home() {
  return (
    <>
      <VideoBackground />
      <div className="main-wrapper">
        <Header />
        <main className="flex-1 flex flex-col pt-20">
          <HeroSection />
          <ServicesSection />
          <SpecialistsSection />
          <HowItWorksSection />
          <PricingSection />
          <TestimonialsSection />
          <ProcessSection />
          <Footer />
        </main>
        <SocialBar />
      </div>
    </>
  )
}
