import { navBar, currentNavItem } from "../pages/Landing";
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="container mx-auto px-6 py-8 text-center text-gray-600">
      <p>&copy; 2025 Suhoor. Built with love for the Ummah.</p>
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
    </footer>
  );
}