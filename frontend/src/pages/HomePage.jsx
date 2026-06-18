import Hero from '../components/home/Hero'
import Features from '../components/home/Features'
import Categories from '../components/home/Categories'
import PopularCourses from '../components/home/PopularCourses'
import Testimonials from '../components/home/Testimonials'
import CTABanner from '../components/home/CTABanner'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <Features />
      <PopularCourses />
      <Testimonials />
      <CTABanner />
    </>
  )
}
