import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Button } from '../button/button'
import { carouselStyles } from './carousel.css'
import type { CarouselVariants } from './carousel.css'

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement>, CarouselVariants {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }
  return context
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ orientation, size, opts, setApi, plugins, className, children, ...props }, ref) => {
    const styles = carouselStyles({ orientation, size })
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === 'horizontal' ? 'x' : 'y',
      },
      plugins
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) return
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === 'ArrowRight') {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    React.useEffect(() => {
      if (!api || !setApi) return
      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
      if (!api) return
      onSelect(api)
      api.on('reInit', onSelect)
      api.on('select', onSelect)
      return () => {
        api?.off('select', onSelect)
      }
    }, [api, onSelect])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api,
          opts,
          orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          size,
        }}
      >
        <section
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={styles.root({ className })}
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </section>
      </CarouselContext.Provider>
    )
  }
)

const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel()
    const styles = carouselStyles({ orientation })
    return (
      <div ref={carouselRef} className={styles.content()}>
        <div ref={ref} className={styles.inner({ className })} {...props} />
      </div>
    )
  }
)

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { orientation } = useCarousel()
    const styles = carouselStyles({ orientation })
    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={styles.item({ className })}
        {...props}
      />
    )
  }
)

const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = 'outline', size: btnSize = 'icon', ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev, size } = useCarousel()
    const styles = carouselStyles({ orientation, size })
    return (
      <Button
        ref={ref}
        variant={variant}
        size={btnSize}
        className={styles.previous({ className })}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        {...props}
      >
        <Lucide.ArrowLeft className={styles.icon()} />
        <span className="sr-only">Previous slide</span>
      </Button>
    )
  }
)

const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = 'outline', size: btnSize = 'icon', ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext, size } = useCarousel()
    const styles = carouselStyles({ orientation, size })
    return (
      <Button
        ref={ref}
        variant={variant}
        size={btnSize}
        className={styles.next({ className })}
        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}
      >
        <Lucide.ArrowRight className={styles.icon()} />
        <span className="sr-only">Next slide</span>
      </Button>
    )
  }
)

Carousel.displayName = 'Carousel'
CarouselContent.displayName = 'CarouselContent'
CarouselItem.displayName = 'CarouselItem'
CarouselPrevious.displayName = 'CarouselPrevious'
CarouselNext.displayName = 'CarouselNext'

export { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext }
