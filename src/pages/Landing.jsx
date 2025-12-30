import { useNavigate } from 'react-router-dom'
import PageLayout from '../layouts/PageLayout'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import WhyChoose from '../components/WhyChoose'

import CtaSection from '../components/CtaSection'
import Faq from '../components/Faq'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <PageLayout>
      <Hero navigate={navigate} />
      <Features />
      <HowItWorks />
      <WhyChoose />

      <Faq />
      <CtaSection navigate={navigate} />
    </PageLayout>
  )
}
