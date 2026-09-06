import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-10 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                MD
              </div>
              <span className="text-lg font-bold">Matchday SA</span>
            </div>
            <p className="max-w-xs text-sm text-gray-400">
              Connecting fans to the heartbeat of South African sport.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-gold-500">
              Quick Links
            </h3>
            <div className="flex flex-wrap gap-3 text-sm text-gray-300">
              <Link to="/football" className="hover:text-gold-500">Football</Link>
              <Link to="/rugby" className="hover:text-gold-500">Rugby</Link>
              <Link to="/tours" className="hover:text-gold-500">Tours</Link>
              <Link to="/corporate" className="hover:text-gold-500">Corporate</Link>
              <Link to="/info/about" className="hover:text-gold-500">About</Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-gold-500">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="tel:+27821234567" className="hover:text-gold-500">📞 +27 82 123 4567</a></li>
              <li><a href="mailto:info@matchday.sa" className="hover:text-gold-500">✉️ info@matchday.sa</a></li>
              <li><a href="https://wa.me/27821234567" className="hover:text-gold-500">📱 WhatsApp</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-gray-500">
          © 2026 Matchday SA
        </div>
      </div>
    </footer>
  );
}
