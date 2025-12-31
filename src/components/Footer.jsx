import { Link } from 'react-router-dom'
import { Moon, Heart } from 'lucide-react'
import { navBar } from '../layouts/PageLayout'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Moon className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-gray-900">Suhoor</span>
            </Link>
            <p className="text-gray-500 leading-relaxed max-w-sm">
              Reviving the Sunnah of the pre-dawn meal. Connect with loved ones, ensure everyone wakes up on time, and start your fast with blessings.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {navBar.map((item, idx) => (
                <li key={idx}>
                  {item.to.startsWith('http') ? (
                    <a
                      href={item.to}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-600 hover:text-primary transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.to}
                      className="text-gray-600 hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Community</h3>
            <ul className="space-y-3">
              <li>
                <a href="https://devseiko.vercel.app/contact?from=suhoor" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-primary transition-colors">
                  Feedback
                </a>
              </li>
              <li>
                <Link to="/signup" className="text-gray-600 hover:text-primary transition-colors">
                  Join Now
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Suhoor by Dev.Seiko. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <span>Built with</span>
            <Heart className="h-4 w-4 text-red-400 fill-red-400" />
            <span>for the Ummah</span>
          </div>
        </div>
      </div>
    </footer>
  );
}