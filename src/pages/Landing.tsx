import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Menu,
  MessageCircle,
  Music,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';

const categories = [
  {
    title: 'Football Matchdays',
    subtitle: 'From R299',
    description: 'Home and away fixtures with city transfers, local hosts, and stadium-ready support.',
    href: '/football',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80',
    accent: 'bg-[#f8d57f] text-[#0c1014]',
  },
  {
    title: 'Rugby Matchdays',
    subtitle: 'From R299',
    description: 'Big test matches and derby weekends with premium routes and fan-first logistics.',
    href: '/rugby',
    image: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=900&q=80',
    accent: 'bg-[#dfeae4] text-[#0c1014]',
  },
  {
    title: 'Township Tours',
    subtitle: 'From R999',
    description: 'Cultural tours that blend local stories, food, music, and authentic township experiences.',
    href: '/tours',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
    accent: 'bg-[#d4f2df] text-[#0c1014]',
  },
  {
    title: 'Corporate Team Building',
    subtitle: 'From R1,599',
    description: 'Custom packages for staff outings, leadership teams, and company social experiences.',
    href: '/corporate',
    image: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&w=900&q=80',
    accent: 'bg-[#fef2d1] text-[#0c1014]',
  },
];

const heroSlides = [
  {
    id: 1,
    bookingHref: '/event/p5',
    title: 'Soweto Derby Weekend',
    label: 'Matchday Special',
    price: 'R449',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80',
    description: 'Experience the heartbeat of the derby with local guides, food stops, and stadium transport.',
  },
  {
    id: 2,
    bookingHref: '/event',
    title: 'Springboks vs All Blacks',
    label: 'Rugby Weekend',
    price: 'R549',
    image: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1600&q=80',
    description: 'Catch the action with a ready-to-roll route, local host support, and entry support.',
  },
  {
    id: 3,
    bookingHref: '/event/p16',
    title: 'Township Raw Experience',
    label: 'Tour Experience',
    price: 'R999',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80',
    description: 'A culture-rich township route with food, stories, and local insight from the community.',
  },
  {
    id: 4,
    bookingHref: '/event',
    title: 'Corporate Team Day',
    label: 'Team Building',
    price: 'R1,599',
    image: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&w=1600&q=80',
    description: 'Structured team experiences built for departments, brands, and leadership groups.',
  },
];

const featuredMatches = [
  {
    id: 1,
    bookingHref: '/event/p5',
    type: 'Home Matchday',
    title: 'Kaizer Chiefs vs Orlando Pirates',
    subtitle: 'Soweto Derby Weekend',
    date: '31 Oct 2026',
    venue: 'FNB Stadium',
    spots: 49,
    price: 'R449',
    badge: 'Featured',
  },
  {
    id: 2,
    bookingHref: '/event',
    type: 'Home Matchday',
    title: 'Springboks vs New Zealand',
    subtitle: 'Springboks vs All Blacks',
    date: '22 Aug 2026',
    venue: 'Ellis Park',
    spots: 40,
    price: 'R449',
    badge: 'Featured',
  },
  {
    id: 3,
    bookingHref: '/event/p16',
    type: 'Away Trip',
    title: 'Polokwane City vs Orlando Pirates',
    subtitle: 'Polokwane Away Weekend',
    date: '09 Aug 2026',
    venue: 'Peter Mokaba',
    spots: 30,
    price: 'R549',
    badge: null,
  },
  {
    id: 4,
    bookingHref: '/event',
    type: 'Season Pass',
    title: 'Legend Season Pass',
    subtitle: 'All 2026/27 season matches',
    date: 'Various dates',
    venue: 'Across Gauteng',
    spots: 20,
    price: 'R5,499',
    badge: 'Featured',
  },
];

const features = [
  { title: 'Real Township Routes', desc: 'From local pickups to the matchday route itself, every stop is mapped with community context.', icon: MapPin },
  { title: 'Live Culture & Sound', desc: 'Drum circles, street energy, and local music keep the vibe alive before kickoff.', icon: Music },
  { title: 'Community-Powered', desc: 'Every booking supports local guides, vendors and township businesses along the way.', icon: Users },
  { title: 'Match Day Scheduling', desc: 'Clear coordination, secure transport, and handpicked pickup options built for convenience.', icon: Calendar },
  { title: 'Fan Chat & Comments', desc: 'Stay connected with fellow supporters, route updates and event buzz from the community.', icon: MessageCircle },
  { title: 'Clear Pricing', desc: 'Transparent pricing and BNPL options with no surprise fees or hidden extras.', icon: ShieldCheck },
];

const testimonials = [
  { quote: 'The journey felt just as memorable as the match itself. Real people, real energy, no fluff.', author: 'Thabo M.', location: 'Soweto' },
  { quote: 'My kids loved the local drum circle before kickoff. It felt like a full day-out experience.', author: 'Zanele K.', location: 'Cape Town' },
  { quote: 'I booked for the derby and it was premium without being corporate. It felt authentic from start to finish.', author: 'Sipho D.', location: 'Durban' },
];

const readStoredValue = <T,>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);
    return parsed !== null && typeof parsed === 'object' ? parsed as T : fallback;
  } catch {
    return fallback;
  }
};

export default function Landing() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  const [packageTier, setPackageTier] = useState<'Essential' | 'Weekend' | 'Premium' | 'VIP'>('Weekend');
  const [fromLocation, setFromLocation] = useState('Johannesburg');
  const [toLocation, setToLocation] = useState('FNB Stadium');
  const [departDate, setDepartDate] = useState('2026-10-31');
  const [returnDate, setReturnDate] = useState('2026-11-01');
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState(() => readStoredValue('matchday-sa-site-settings', {
    heroTitle: 'Matchday SA',
    heroSubtitle: 'Local matchday experiences, township routes, and premium away travel built around the match venue.',
    bookingText: 'Book your local experience, travel package, and community-led matchday route in one place.',
  }));

  useEffect(() => {
    const syncSiteSettings = () => {
      setSiteSettings(readStoredValue('matchday-sa-site-settings', {
        heroTitle: 'Matchday SA',
        heroSubtitle: 'Local matchday experiences, township routes, and premium away travel built around the match venue.',
        bookingText: 'Book your local experience, travel package, and community-led matchday route in one place.',
      }));
    };

    window.addEventListener('storage', syncSiteSettings);
    return () => window.removeEventListener('storage', syncSiteSettings);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const activeSlide = heroSlides[activeIndex];

  const goToPrev = () => {
    setActiveIndex((current) => (current - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % heroSlides.length);
  };

  const handleSearchPackages = () => {
    navigate('/football', {
      state: {
        tripPlanner: {
          tripType,
          packageTier,
          fromLocation,
          toLocation,
          departDate,
          returnDate,
          adults,
          kids,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d0f]/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A8A3F] text-sm font-bold text-white">MD</div>
            <span className="text-lg font-bold text-white">Matchday SA</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {['Football', 'Rugby', 'Tours', 'Corporate'].map((item) => (
              <Link
                key={item}
                to={item === 'Football' ? '/football' : item === 'Rugby' ? '/rugby' : item === 'Tours' ? '/tours' : '/corporate'}
                className="text-sm font-medium text-white/80 transition-colors hover:text-[#FFD700]"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/admin" className="hidden text-sm font-medium text-white/80 hover:text-[#FFD700] sm:inline-flex">
              Admin
            </Link>
            <Link to="/auth" className="hidden text-sm font-medium text-white/80 hover:text-[#FFD700] sm:inline-flex">
              Sign In
            </Link>
            <Link
              to="/event"
              className="rounded-md bg-[#FFD700] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#f8cf2f]"
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
          <nav className="border-t border-white/10 bg-[#0b0d0f] px-4 py-4 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {[
                ['Football', '/football'],
                ['Rugby', '/rugby'],
                ['Tours', '/tours'],
                ['Corporate', '/corporate'],
                ['Sign In', '/auth'],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-3 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-[#FFD700]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="pb-16">
        <section className="relative overflow-hidden bg-[#0f1416]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(10,13,15,0.8), rgba(10,13,15,0.45)), url('https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1800&q=80')",
            }}
          />

          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-[760px]">
                <div className="mb-5 inline-flex rounded-full border border-[#FFD700]/40 bg-[#FFD700]/10 px-4 py-2 text-sm font-medium text-[#FFD700]">
                  Next matchday — 23 August 2026
                </div>

                <h1 className="max-w-[720px] text-[3.2rem] font-black leading-[0.85] tracking-[-0.08em] text-white sm:text-[4.2rem] lg:text-[7rem]">
                  {siteSettings.heroTitle.split(' ').slice(0, 2).join(' ')}
                  <span className="mt-2 block text-[#FFD700]">{siteSettings.heroTitle.split(' ').slice(2).join(' ') || 'Match Day'}</span>
                </h1>

                <p className="mt-6 max-w-2xl text-lg text-slate-200 md:text-xl">
                  {siteSettings.heroSubtitle}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/event"
                    className="inline-flex items-center gap-2 rounded-md bg-[#FFD700] px-6 py-4 text-base font-semibold text-black transition hover:bg-[#f8cf2f]"
                  >
                    Book Your Next Matchday <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/tours"
                    className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-6 py-4 text-base font-semibold text-white transition hover:border-[#FFD700] hover:text-[#FFD700]"
                  >
                    Explore Tours <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-200">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"><ShieldCheck className="h-4 w-4 text-[#FFD700]" /> No hidden fees</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"><Users className="h-4 w-4 text-[#FFD700]" /> Local guides</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"><Clock className="h-4 w-4 text-[#FFD700]" /> Pay later available</span>
                </div>
              </div>

              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#191b1d]/60 p-5 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#FFD700]">Popular</p>
                    <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">Soweto Derby</h2>
                  </div>
                  <div className="rounded-full bg-[#1A8A3F]/70 p-2 text-[#FFD700] shadow-lg shadow-[#1A8A3F]/30">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-5 space-y-3 text-sm text-slate-200">
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#FFD700]" /> 31 Oct 2026 · 15:30</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#FFD700]" /> FNB Stadium</div>
                  <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#FFD700]" /> 49 spots left</div>
                </div>
                <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">From</p>
                    <div className="text-4xl font-black text-[#FFD700]">R449</div>
                  </div>
                  <Link to="/event/p5" className="inline-flex items-center gap-2 rounded-md bg-[#FFD700] px-4 py-3 font-semibold text-black shadow-lg shadow-[#FFD700]/20">View details <ArrowRight className="h-4 w-4" /></Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#1A8A3F]">Popular categories</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-900">Choose the kind of matchday you want</h2>
            </div>
            <Link to="/tours" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-[#1A8A3F]">
              Explore all experiences <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.title}
                to={category.href}
                className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className="relative h-56 overflow-hidden"
                  style={{ backgroundImage: `url(${category.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${category.accent}`}>
                      {category.subtitle}
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-2xl font-black tracking-[-0.04em] text-slate-900">{category.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                    <span className="text-sm font-semibold text-slate-500">Book now</span>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0b0d0f] text-white transition group-hover:bg-[#FFD700] group-hover:text-black">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-8 xl:grid-cols-[1.7fr_0.9fr]">
            <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-slate-100 shadow-xl">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${activeSlide.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/5" />

              <div className="relative flex min-h-[520px] flex-col justify-between p-6 sm:p-8 lg:p-10">
                <div className="flex items-center justify-between">
                  <div className="inline-flex rounded-full bg-[#FFD700] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black">
                    {activeSlide.label}
                  </div>
                  <div className="rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/80">
                    Featured
                  </div>
                </div>

                <div>
                  <h2
                    className="max-w-2xl text-5xl font-black leading-none tracking-[-0.06em] text-white sm:text-6xl lg:text-[6rem]"
                    style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
                  >
                    {activeSlide.title}
                  </h2>
                  <p className="mt-5 max-w-2xl text-lg text-slate-200">
                    {activeSlide.description}
                  </p>
                </div>

                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="rounded-xl bg-[#FFD700] px-5 py-4 text-black shadow-lg">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-black/70">From</div>
                    <div className="text-4xl font-black leading-none">{activeSlide.price}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={goToPrev}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={goToNext}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <aside className="rounded-[30px] bg-gradient-to-br from-[#0f7c8a] via-[#0f6d7d] to-[#0a5360] p-6 text-white shadow-xl ring-1 ring-white/10">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f8d57f]">Tailored trip</p>
                  <h3 className="mt-2 text-2xl font-bold">Plan Your Matchday</h3>
                </div>
                <div className="rounded-full bg-white/10 p-2"><BriefcaseBusiness className="h-5 w-5 text-[#FFD700]" /></div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Trip type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTripType('roundtrip')}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold ${tripType === 'roundtrip' ? 'bg-[#FFD700] text-black' : 'bg-white/10 text-white'}`}
                    >
                      Roundtrip
                    </button>
                    <button
                      type="button"
                      onClick={() => setTripType('oneway')}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold ${tripType === 'oneway' ? 'bg-[#FFD700] text-black' : 'bg-white/10 text-white'}`}
                    >
                      One way
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Package tier</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Essential', 'Weekend', 'Premium', 'VIP'].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setPackageTier(tier as 'Essential' | 'Weekend' | 'Premium' | 'VIP')}
                        className={`rounded-xl px-2 py-2 text-xs font-semibold ${packageTier === tier ? 'bg-[#FFD700] text-black' : 'bg-white/10 text-white'}`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-white/70">From</label>
                  <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 text-slate-700">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <input
                      value={fromLocation}
                      onChange={(event) => setFromLocation(event.target.value)}
                      className="w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder="City or airport"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-white/70">To</label>
                  <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 text-slate-700">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <input
                      value={toLocation}
                      onChange={(event) => setToLocation(event.target.value)}
                      className="w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder="Match destination"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Depart</label>
                    <input
                      type="date"
                      value={departDate}
                      onChange={(event) => setDepartDate(event.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
                    />
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Return</label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(event) => setReturnDate(event.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
                      disabled={tripType === 'oneway'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Adults</label>
                    <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 text-slate-700">
                      <button type="button" onClick={() => setAdults((current) => Math.max(1, current - 1))} className="text-xl font-bold">-</button>
                      <span>{adults}</span>
                      <button type="button" onClick={() => setAdults((current) => current + 1)} className="text-xl font-bold">+</button>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Kids</label>
                    <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 text-slate-700">
                      <button type="button" onClick={() => setKids((current) => Math.max(0, current - 1))} className="text-xl font-bold">-</button>
                      <span>{kids}</span>
                      <button type="button" onClick={() => setKids((current) => current + 1)} className="text-xl font-bold">+</button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAdvanced((current) => !current)}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-white/80"
                >
                  Advanced options <ChevronRight className="h-4 w-4" />
                </button>

                {showAdvanced && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                    <div className="mb-2 flex items-center justify-between">
                      <span>Preferred travel style</span>
                      <span className="rounded-full bg-white/10 px-2 py-1 text-xs uppercase tracking-[0.12em] text-[#FFD700]">Premium</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {['Family friendly', 'VIP lounge', 'Local host', 'Flexible timings'].map((option) => (
                        <span key={option} className="rounded-full border border-white/10 bg-black/10 px-2 py-1">{option}</span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSearchPackages}
                  className="w-full rounded-xl bg-[#FFD700] px-4 py-3 text-lg font-bold text-black transition hover:bg-[#f8cf2f]"
                >
                  Search packages
                </button>
              </div>
            </aside>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1A8A3F]">Featured packages</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-900">Matchday experiences built for fans</h2>
            </div>
            <Link to="/football" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-[#1A8A3F]">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredMatches.map((match) => (
              <Link key={match.id} to={match.bookingHref} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-[#1A8A3F]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#1A8A3F]">
                      {match.type}
                    </span>
                    {match.badge && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#FFD700]">
                        <Sparkles className="h-3 w-3" /> {match.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#1A8A3F]">{match.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{match.subtitle}</p>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#1A8A3F]" /> {match.date}</div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#1A8A3F]" /> {match.venue}</div>
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#1A8A3F]" /> {match.spots} spots left</div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                    <span className="text-2xl font-black text-[#FFD700]">{match.price}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1A8A3F]">
                      View details <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-[#f0f3f0] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1A8A3F]">What we offer</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-900">Everything you need for a memorable matchday</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {features.map(({ title, desc, icon: Icon }) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A8A3F]/10 text-[#1A8A3F]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1A8A3F]">How it works</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-900">Simple booking steps</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            {[
              ['01', 'Pick Your Match', 'Choose the experience that fits your vibe and schedule.'],
              ['02', 'Choose a Pickup Point', 'Select a convenient city or office collection point.'],
              ['03', 'Book & Pay', 'Secure your seat with flexible payment options and zero surprises.'],
              ['04', 'Show Up & Feel It', 'Meet your guide, enter the experience and enjoy the journey.'],
            ].map(([step, title, desc]) => (
              <div key={step} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD700] text-2xl font-black text-black">{step}</div>
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#0b0d0f] py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FFD700]">Testimonials</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">Fans keep coming back</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {testimonials.map((item) => (
                <div key={item.author} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-4 flex gap-1 text-[#FFD700]">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-base leading-7 text-slate-200">“{item.quote}”</p>
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <div className="font-bold text-white">{item.author}</div>
                    <div className="text-sm text-slate-400">{item.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-gradient-to-r from-[#0f3f2d] via-[#1A8A3F] to-[#0a5a34] p-8 text-center text-white sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FFD700]">Ready to ride</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-5xl">Ready to Ride to the Match?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-green-50/90 sm:text-lg">
              Book your next matchday experience and turn every big game into a social, cultural and community-rich adventure.
            </p>
            <div className="mt-8 flex justify-center">
              <Link to="/event" className="inline-flex items-center gap-2 rounded-md bg-[#FFD700] px-8 py-4 text-lg font-bold text-black transition hover:bg-[#f8cf2f]">
                Book a Matchday <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0b0d0f] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A8A3F] text-xs font-bold text-white">MD</div>
                <span className="text-lg font-bold">Matchday SA</span>
              </div>
              <p className="max-w-md text-sm text-slate-400">Connecting fans to the heartbeat of South African sport.</p>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#FFD700]">Quick Links</h3>
              <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                <Link to="/football">Football</Link>
                <Link to="/rugby">Rugby</Link>
                <Link to="/tours">Tours</Link>
                <Link to="/corporate">Corporate</Link>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#FFD700]">Contact</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>📞 +27 82 123 4567</li>
                <li>✉️ info@matchday.sa</li>
                <li>📱 WhatsApp</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-slate-500">
            © 2026 Matchday SA. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
