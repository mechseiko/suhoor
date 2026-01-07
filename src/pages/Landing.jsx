import { useNavigate } from 'react-router-dom'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import CtaSection from '../components/CtaSection'
import Faq from '../components/Faq'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <>
      <Hero navigate={navigate} />
      <Features />
      <HowItWorks />
      <Faq />
      <CtaSection />
    </>
  )
}
