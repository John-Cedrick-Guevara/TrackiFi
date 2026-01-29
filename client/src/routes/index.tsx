import { createFileRoute } from '@tanstack/react-router'
import Hero from '@/components/LandingPage/Hero'
import Highlights from '@/components/LandingPage/Highlights'
import Navbar from '@/components/LandingPage/Navbar'
import Pricing from '@/components/LandingPage/Pricing'
import Features from '@/components/LandingPage/Features'
import Footer from '@/components/LandingPage/Footer'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
     <div className="min-h-screen font-sans bg-bg-main text-text-primary overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <Highlights />
      <Pricing />
      <Footer />
    </div>
  )
}
