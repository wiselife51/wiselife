"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import {
  EffectCoverflow,
  Pagination,
  Autoplay,
  Navigation,
} from "swiper/modules"
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"

interface CarouselProps<T> {
  items: T[]
  renderItem: (item: T, index: number, isActive: boolean) => React.ReactNode
  id: string
  slideWidth?: number
  autoplayDelay?: number
}

export function Carousel<T>({
  items,
  renderItem,
  id,
  slideWidth = 340,
  autoplayDelay = 3500,
}: CarouselProps<T>) {
  const prevButtonClass = `swiper-button-prev-${id}`
  const nextButtonClass = `swiper-button-next-${id}`

  return (
    <div className="relative animate-fade-in-up [animation-delay:0.3s] py-4">
      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        loop={true}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 200,
          modifier: 1.5,
          slideShadows: true,
        }}
        autoplay={{
          delay: autoplayDelay,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={{
          nextEl: `.${nextButtonClass}`,
          prevEl: `.${prevButtonClass}`,
        }}
        modules={[EffectCoverflow, Pagination, Autoplay, Navigation]}
        className="w-full py-4 pb-8 overflow-visible"
        breakpoints={{
          320: {
            slidesPerView: 1,
            coverflowEffect: {
              depth: 150,
              modifier: 1,
            },
          },
          768: {
            slidesPerView: "auto",
            coverflowEffect: {
              depth: 200,
              modifier: 1.5,
            },
          },
        }}
      >
        {items.map((item, index) => (
          <SwiperSlide
            key={index}
            style={{ width: slideWidth }}
            className="h-auto flex justify-center items-center"
          >
            {({ isActive }) => renderItem(item, index, isActive)}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <button
        className={cn(
          prevButtonClass,
          "absolute top-1/2 -translate-y-1/2 left-[-25px] z-10",
          "w-[50px] h-[50px] rounded-full",
          "bg-gray-900/80 backdrop-blur-[15px] border border-white/20",
          "text-white cursor-pointer flex items-center justify-center",
          "transition-all duration-300 shadow-lg shadow-black/30",
          "hover:bg-brand-primary/30 hover:border-brand-primary/50 hover:scale-110",
          "hidden md:flex"
        )}
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="w-6 h-6" strokeWidth={3} />
      </button>
      <button
        className={cn(
          nextButtonClass,
          "absolute top-1/2 -translate-y-1/2 right-[-25px] z-10",
          "w-[50px] h-[50px] rounded-full",
          "bg-gray-900/80 backdrop-blur-[15px] border border-white/20",
          "text-white cursor-pointer flex items-center justify-center",
          "transition-all duration-300 shadow-lg shadow-black/30",
          "hover:bg-brand-primary/30 hover:border-brand-primary/50 hover:scale-110",
          "hidden md:flex"
        )}
        aria-label="Next slide"
      >
        <ChevronRightIcon className="w-6 h-6" strokeWidth={3} />
      </button>
    </div>
  )
}
