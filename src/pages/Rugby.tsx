import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin, Search } from 'lucide-react';
import Layout from '../components/Layout';
import { rugbyFixtures } from '../data/rugbyFixtures';

export default function Rugby() {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredFixtures = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return rugbyFixtures;
    return rugbyFixtures.filter((fixture) =>
      [fixture.title, fixture.team, fixture.opponent, fixture.venue, fixture.city, fixture.province]
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [searchQuery]);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section
          className="relative mb-10 overflow-hidden rounded-[32px] border border-white/10 bg-[#0c1014] text-white shadow-2xl"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(7,10,12,0.88) 0%, rgba(7,10,12,0.54) 44%, rgba(16,74,42,0.22) 100%), url('${import.meta.env.BASE_URL}images/rugby-ball-hero.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="max-w-3xl px-6 py-14 sm:px-10 sm:py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FFD700]">Rugby matchdays</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">Feel the roar with the crowd.</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/85">
              Full township transport, local culture, and stadium-ready support for every big rugby weekend.
            </p>
          </div>
        </section>
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gold-500">Rugby</p>
            <h2 className="mt-2 text-2xl font-bold">Browse upcoming fixtures</h2>
            <p className="mt-2 text-gray-400">Feel the roar with full township transport and local culture.</p>
          </div>
          <div className="flex w-full max-w-md items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-3">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              id="rugby-search"
              name="search"
              type="text"
              placeholder="Search teams, venues, or events..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredFixtures.map((fixture) => (
            <div key={fixture.id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="-mx-6 -mt-6 mb-5 h-32 overflow-hidden rounded-t-2xl">
                <img
                  src={`${import.meta.env.BASE_URL}images/rugby-ball-hero.jpg`}
                  alt="Rugby ball on the pitch"
                  className="h-full w-full object-cover"
                />
                <div className="-mt-32 h-32 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-gold-500/15 px-3 py-1 text-xs font-medium text-gold-500">Rugby</span>
                <span className="text-xs text-gray-400">{fixture.totalSpots} spots left</span>
              </div>

              <h2 className="text-xl font-semibold text-white">{fixture.title}</h2>
              <div className="mt-4 space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gold-500" />
                  {fixture.displayDate}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold-500" />
                  {fixture.venue}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-2xl font-bold text-gold-500">R{fixture.price}</span>
                <Link to={`/event/${fixture.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-gold-500 hover:text-gold-400">
                  View Details <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
        {filteredFixtures.length === 0 && (
          <div className="py-12 text-center text-gray-400">No rugby matchdays match that search.</div>
        )}
      </div>
    </Layout>
  );
}
