import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Football', href: '/football' },
    { label: 'Rugby', href: '/rugby' },
    { label: 'Tours', href: '/tours' },
    { label: 'Corporate', href: '/corporate' },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
            MD
          </div>
          <span className="text-lg font-bold text-white">Matchday SA</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-sm text-gray-300 transition-colors hover:text-gold-500"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/auth" className="hidden text-sm text-gray-300 transition-colors hover:text-gold-500 sm:inline-flex">
            Sign In
          </Link>
          <Link
            to="/event"
            className="rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gold-600"
          >
            Book Now
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            className="inline-flex rounded-md p-2 text-white transition-colors hover:bg-white/10 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="border-t border-white/10 bg-black px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-3 text-sm text-gray-200 transition-colors hover:bg-white/10 hover:text-gold-500"
              >
                {item.label}
              </Link>
            ))}
            <Link to="/auth" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-3 text-sm text-gray-200 transition-colors hover:bg-white/10 hover:text-gold-500">
              Sign In
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
