import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Users, 
  Calendar, 
  Star, 
  MapPin, 
  Music, 
  MessageCircle, 
  ShieldCheck,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function Landing() {
  // Featured matches data - matching your dashboard
  const featuredMatches = [
    {
      id: 1,
      bookingHref: '/event/p5',
      type: 'Home Matchday',
      category: 'Premier Soccer League · Gauteng',
      title: 'Kaizer Chiefs vs Orlando Pirates',
      subtitle: 'Soweto Derby Weekend',
      date: '2026-10-31 at 15:30',
      venue: 'FNB Stadium',
      spots: 49,
      price: 'R449',
      featured: true,
      badge: 'Featured'
    },
    {
      id: 2,
      bookingHref: '/event',
      type: 'Home Matchday',
      category: 'Rugby · Gauteng',
      title: 'Springboks vs New Zealand',
      subtitle: 'Springboks vs All Blacks',
      date: '2026-08-22 at 17:00',
      venue: 'Ellis Park',
      spots: 40,
      price: 'R449',
      featured: true,
      badge: 'Featured'
    },
    {
      id: 3,
      bookingHref: '/event/p16',
      type: 'Away Trip',
      category: 'Premier Soccer League · Limpopo',
      title: 'Polokwane City vs Orlando Pirates',
      subtitle: 'Polokwane Away Weekend',
      date: '2026-08-09 at 15:00',
      venue: 'Peter Mokaba Stadium',
      spots: 30,
      price: 'R549',
      featured: false,
      badge: null
    },
    {
      id: 4,
      bookingHref: '/event',
      type: 'Season Pass',
      category: 'Season Pass · Gauteng',
      title: 'All 2026/27 Season Matches',
      subtitle: 'Legend Season Pass',
      date: '2026-09-01 at Various',
      venue: 'Various',
      spots: 20,
      price: 'R6,999',
      featured: true,
      badge: 'Featured'
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-bold text-white text-sm">MD</div>
            <span className="font-bold text-lg">MatchDay SA</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-sm hover:text-gold-500 transition-colors">Admin</Link>
            <Link to="/auth" className="text-sm hover:text-gold-500 transition-colors">Sign In</Link>
            <Link to="/event" className="bg-gold-500 hover:bg-gold-600 text-black font-semibold px-4 py-2 rounded-md text-sm transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(26,138,63,0.12),transparent_60%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="bg-gold-500/20 text-gold-500 text-sm font-medium px-4 py-2 rounded-full border border-gold-500/30 inline-block mb-6">
              Next matchday — 23 August 2026
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
              Feel the Beat<br />
              <span className="text-gold-500">of Match Day</span>
            </h1>
            <p className="text-xl text-gray-300 mt-6 max-w-2xl">
              Turn big matchdays into immersive, community-powered township experiences. 
              Connect with the real soul of South African sport — the guides, the streets, the roar.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <Link to="/football" className="bg-gold-500 hover:bg-gold-600 text-black font-semibold px-8 py-4 rounded-md text-lg transition-colors inline-flex items-center gap-2">
                Book Your Next Matchday
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#how-it-works" className="border border-white/20 hover:border-gold-500 text-white font-semibold px-8 py-4 rounded-md text-lg transition-colors inline-flex items-center gap-2">
                See How It Works
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-gray-400">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-gold-500" /> No hidden fees</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-gold-500" /> Local guides</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold-500" /> Pay later available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-t border-white/5 bg-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gold-500">12,000+</div>
              <div className="text-sm text-gray-400 mt-1">Fans Connected</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gold-500">350+</div>
              <div className="text-sm text-gray-400 mt-1">Matchdays Hosted</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gold-500">85</div>
              <div className="text-sm text-gray-400 mt-1">Local Guides</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gold-500">R2.4M</div>
              <div className="text-sm text-gray-400 mt-1">Paid to Communities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Experiences */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">More Than a Game.</h2>
              <p className="text-gray-400">A Full Township Experience.</p>
            </div>
            <Link to="/football" className="text-gold-500 hover:text-gold-400 text-sm font-medium flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredMatches.map((match) => (
              <Link to={match.bookingHref} key={match.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-gold-500/50 transition-all group">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      match.type === 'Season Pass' ? 'bg-purple-500/20 text-purple-400' : 
                      match.type === 'Away Trip' ? 'bg-blue-500/20 text-blue-400' : 
                      'bg-gold-500/20 text-gold-500'
                    }`}>
                      {match.type}
                    </span>
                    {match.badge && (
                      <span className="text-xs text-gold-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {match.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold group-hover:text-gold-500 transition-colors">{match.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">{match.subtitle}</p>
                  <div className="space-y-1 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {match.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {match.venue}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {match.spots} spots left
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                    <span className="text-xl font-bold text-gold-500">{match.price}</span>
                    <span className="text-sm text-gold-500 flex items-center gap-1">View details <ChevronRight className="w-4 h-4" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 bg-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">What We Offer</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-black/40 rounded-xl p-6 border border-white/10 hover:border-gold-500/30 transition-all">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real Township Routes</h3>
              <p className="text-gray-400 text-sm">Guided by locals who know every corner — from the buzzing street stalls to the best vuvuzela sellers.</p>
            </div>
            <div className="bg-black/40 rounded-xl p-6 border border-white/10 hover:border-gold-500/30 transition-all">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Music className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Live Culture & Sound</h3>
              <p className="text-gray-400 text-sm">Drum circles, amapiano DJs, and street performances that turn your journey into the first half of the experience.</p>
            </div>
            <div className="bg-black/40 rounded-xl p-6 border border-white/10 hover:border-gold-500/30 transition-all">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Community-Powered</h3>
              <p className="text-gray-400 text-sm">Every booking supports local guides, vendors, and township entrepreneurs. The money stays where it matters.</p>
            </div>
            <div className="bg-black/40 rounded-xl p-6 border border-white/10 hover:border-gold-500/30 transition-all">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Match Day Scheduling</h3>
              <p className="text-gray-400 text-sm">Pick your match, choose your pickup point, and let us handle the rest — transport, timing, and the pre-match vibe.</p>
            </div>
            <div className="bg-black/40 rounded-xl p-6 border border-white/10 hover:border-gold-500/30 transition-all">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fan Chat & Comments</h3>
              <p className="text-gray-400 text-sm">Connect with fellow fans, share moments, and keep the energy rolling long after the final whistle.</p>
            </div>
            <div className="bg-black/40 rounded-xl p-6 border border-white/10 hover:border-gold-500/30 transition-all">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Clear Pricing, No Surprises</h3>
              <p className="text-gray-400 text-sm">Upfront costs with buy-now-pay-later options. No hidden fees — just honest, transparent pricing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gold-500">Simple Booking</h2>
            <p className="text-gray-400">Four Steps to Matchday</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-500 text-black text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">01</div>
              <h3 className="font-semibold mb-2">Pick Your Match</h3>
              <p className="text-sm text-gray-400">Browse upcoming fixtures and choose the game that gets your blood pumping.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-500 text-black text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">02</div>
              <h3 className="font-semibold mb-2">Choose a Pickup Point</h3>
              <p className="text-sm text-gray-400">Select a convenient township pickup spot near you. We'll send you the exact details.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-500 text-black text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">03</div>
              <h3 className="font-semibold mb-2">Book & Pay</h3>
              <p className="text-sm text-gray-400">Secure your spot with a simple checkout. Pay in full or split it — your call.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-500 text-black text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">04</div>
              <h3 className="font-semibold mb-2">Show Up & Feel It</h3>
              <p className="text-sm text-gray-400">Meet your guide, join the crew, and let the matchday energy carry you all the way to the stadium.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">From the Fans</h2>
            <p className="text-gray-400">Real People. Real Stories.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-black/40 rounded-xl p-6 border border-white/10">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />
                ))}
              </div>
              <p className="text-gray-300 text-sm mb-4">"I've been to dozens of matches, but this was the first time the journey felt like part of the game. Our guide, Bongani, had stories that gave me chills."</p>
              <div className="font-semibold">Thabo M.</div>
              <div className="text-xs text-gray-500">Soweto</div>
            </div>
            <div className="bg-black/40 rounded-xl p-6 border border-white/10">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />
                ))}
              </div>
              <p className="text-gray-300 text-sm mb-4">"My kids loved the drum circle at the pickup point. They're still talking about it. This is what sport should feel like — everyone together."</p>
              <div className="font-semibold">Zanele K.</div>
              <div className="text-xs text-gray-500">Cape Town</div>
            </div>
            <div className="bg-black/40 rounded-xl p-6 border border-white/10">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />
                ))}
              </div>
              <p className="text-gray-300 text-sm mb-4">"The whole experience felt real. No corporate nonsense, just people who care about the game and the community. I'm booking again for the next derby."</p>
              <div className="font-semibold">Sipho D.</div>
              <div className="text-xs text-gray-500">Durban</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-900/30 to-black border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Ride to the Match?</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Join thousands of fans who are discovering what matchday really feels like. 
            Book your next experience and be part of something bigger.
          </p>
          <Link to="/event" className="bg-gold-500 hover:bg-gold-600 text-black font-semibold px-8 py-4 rounded-md text-lg transition-colors inline-flex items-center gap-2">
            Book a Matchday
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-gray-500 mt-4">No account needed to browse. Sign up in seconds when you're ready to book.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center font-bold text-white text-xs">MD</div>
            <span className="font-semibold">MatchDay SA</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link to="/info/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/info/safety" className="hover:text-white transition-colors">Safety</Link>
            <Link to="/info/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/info/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="text-sm text-gray-500">© 2026 MatchDay SA. Connecting fans to the heartbeat of South African sport.</div>
        </div>
      </footer>
    </div>
  );
}
