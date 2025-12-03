import { Moon, Users, Bell, Calendar } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Container from '../components/Container'
import Footer from '../components/Footer'

export const navBar = [
  { label: 'Home', to: '/' },
  { label: 'Books', to: '/books' },
  { label: 'Api', to: 'https://islamicapi.com' },
  { label: 'Contribute', to: 'https://devseiko.vercel.app/contact?from=suhoor' },
]

const location = useLocation();
export const currentNavItem = `/${location.pathname.split('/')[1]}`;


export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Container>
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Moon className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Suhoor</span>
            </div>
            <div className="space-x-3">
              {navBar.map((navItem, index) => {
                return (
                  <Link
                    title={navItem.label}
                    target={`${!navItem.to.startsWith('/') ? '_blank' : '_parent'}`}
                    key={index}
                    className={`text-md py-0.5 px-2 rounded-sm text-light ${currentNavItem === navItem.to ? 'bg-primary bg-blue-500 text-white' : 'hover:bg-blue-300'}`}
                    to={navItem.to}
                  >
                    {navItem.label}
                  </Link>
                );
              })}
            </div>
            <div className="space-x-3">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                Sign Up
              </button>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Wake Up for Suhoor Together
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Stay connected with your friends and family during Ramadan. Suhoor
              helps everyone in your group wake up on time for the pre-dawn meal.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 font-medium transition shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          </div>

          {/* <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"> */}
          <div>
            <FeatureCard
              icon={<Users className="h-12 w-12 text-blue-600" />}
              title="Create Groups"
              description="Start a group or join existing ones with friends and family using a shared group key."
            />
            <FeatureCard
              icon={<Bell className="h-12 w-12 text-blue-600" />}
              title="Wake Up Alerts"
              description="Get notified when it's time for Suhoor and see who's awake in your group."
            />
            <FeatureCard
              icon={<Calendar className="h-12 w-12 text-blue-600" />}
              title="Fasting Times"
              description="View accurate Suhoor and Iftar times with Hijri dates and white days information."
            />
            <FeatureCard
              icon={<Moon className="h-12 w-12 text-blue-600" />}
              title="Track Together"
              description="Keep everyone accountable and motivated throughout the blessed month."
            />
          </div>
        </main>
      </Container>
      <Footer />
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    // <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition">
    <div>
      {/* <div className="mb-4">{icon}</div> */}
      {/* <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3> */}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
