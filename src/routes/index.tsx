import { createFileRoute } from '@tanstack/react-router'
import { useRef } from 'react'

import { Hero } from '../components/home/Hero'
import { ServicesSection } from '../components/home/ServicesSection'
import { NewsSection } from '../components/home/NewsSection'
import { ConsulateLocations } from '../components/home/ConsulateLocations'
import { CitizenCTA } from '../components/home/CitizenCTA'
import { Footer } from '../components/Footer'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const servicesRef = useRef<HTMLDivElement>(null)
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero />

      {/* Spacer for Quick Access Cards overlap */}
      <div className="h-32 md:h-24" />

      {/* Services Section */}
      <div ref={servicesRef}>
        <ServicesSection />
      </div>

      {/* News Section */}
      <NewsSection />

      {/* Consulate Locations */}
      <ConsulateLocations />

      {/* Citizen Account CTA */}
      <CitizenCTA />

      {/* Footer */}
      <Footer />
    </div>
  )
}

