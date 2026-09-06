import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, ChevronRight, MapPin, Plane, Search, Star, Users } from 'lucide-react';
import { chiefsFixtures } from '@/data/chiefsFixtures';
import { cupFixtures } from '@/data/cupFixtures';
import { piratesFixtures } from '@/data/piratesFixtures';
import { sundownsFixtures } from '@/data/sundownsFixtures';

type Fixture = {
  id: string;
  team: string;
  opponent: string;
  venue: string;
  date: string;
  time: string;
  type: 'home' | 'away' | 'cup' | 'derby';
  category: string;
  price: number;
  totalSpots: number;
  featured: boolean;
  province: string;
  city: string;
  tourFocus: string;
  isDerby: boolean;
  title?: string;
  derbyName?: string;
  awayTravel?: boolean;
  cupName?: string;
};

const allFixtures: Fixture[] = [...piratesFixtures, ...chiefsFixtures, ...sundownsFixtures, ...cupFixtures] as Fixture[];
const teams = ['All', 'Orlando Pirates', 'Kaizer Chiefs', 'Mamelodi Sundowns'];
const types = ['All', 'home', 'away', 'derby', 'cup'];

const getFixtureType = (fixture: Fixture) => {
  if (fixture.type === 'cup') return 'cup';
  if (fixture.isDerby || fixture.category === 'Derby') return 'derby';
  return fixture.type;
};

export default function Football() {
  const location = useLocation();
  const tripPlanner = (location.state as { tripPlanner?: { fromLocation?: string; toLocation?: string; tripType?: string; packageTier?: string; departDate?: string; returnDate?: string; adults?: number; kids?: number } } | null)?.tripPlanner ?? null;
  const [searchQuery, setSearchQuery] = useState(tripPlanner?.toLocation ?? '');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedTeam, setSelectedTeam] = useState('All');

  const filteredFixtures = useMemo(() => {
    let filtered = [...allFixtures];

    const tripToQuery = (tripPlanner?.toLocation ?? '').trim();
    const tripFromQuery = (tripPlanner?.fromLocation ?? '').trim();
    const departDate = tripPlanner?.departDate ? new Date(tripPlanner.departDate) : null;
    const tier = tripPlanner?.packageTier ?? 'Weekend';

    if (tripToQuery || searchQuery) {
      const normalizedSearch = (tripToQuery || searchQuery).toLowerCase();
      filtered = filtered.filter((fixture) => {
        const title = fixture.title || `${fixture.team} vs ${fixture.opponent}`;
        const venueText = `${fixture.venue} ${fixture.city} ${fixture.province}`.toLowerCase();
        const routeText = `${title} ${fixture.team} ${fixture.opponent}`.toLowerCase();
        return routeText.includes(normalizedSearch) || venueText.includes(normalizedSearch) || fixture.city.toLowerCase().includes(normalizedSearch);
      });
    }

    if (tripFromQuery) {
      filtered = filtered.filter((fixture) => {
        const routeHint = `${fixture.city} ${fixture.province} ${fixture.venue}`.toLowerCase();
        return routeHint.includes(tripFromQuery.toLowerCase()) || fixture.type === 'away' || fixture.type === 'home';
      });
    }

    if (departDate) {
      filtered = filtered.filter((fixture) => new Date(fixture.date).getTime() >= departDate.getTime());
    }

    if (tier === 'Essential') {
      filtered = filtered.filter((fixture) => fixture.price <= 449 || fixture.featured);
    }
    if (tier === 'Weekend') {
      filtered = filtered.filter((fixture) => fixture.price <= 649 || fixture.featured);
    }
    if (tier === 'Premium') {
      filtered = filtered.filter((fixture) => fixture.price >= 549 || fixture.featured);
    }
    if (tier === 'VIP') {
      filtered = filtered.filter((fixture) => fixture.price >= 899 || fixture.featured);
    }

    if (selectedType !== 'All') {
      filtered = filtered.filter((fixture) => getFixtureType(fixture) === selectedType);
    }

    if (selectedTeam !== 'All') {
      filtered = filtered.filter((fixture) => fixture.team === selectedTeam);
    }

    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return filtered;
  }, [searchQuery, selectedType, selectedTeam, tripPlanner]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {tripPlanner && (
          <div className="mb-6 rounded-2xl border border-gold-500/30 bg-gold-500/10 p-4 text-sm text-gold-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold uppercase tracking-[0.2em] text-gold-500">Tailored trip</span>
              <span>{tripPlanner.tripType === 'roundtrip' ? 'Roundtrip' : 'One way'} • {tripPlanner.packageTier || 'Weekend'}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-gray-200">
              <span>From: {tripPlanner.fromLocation || 'Not set'}</span>
              <span>To: {tripPlanner.toLocation || 'Not set'}</span>
              <span>{tripPlanner.departDate ? `Depart: ${tripPlanner.departDate}` : ''}</span>
            </div>
          </div>
        )}

        <div className="py-12 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">⚽ Football Matchdays</h1>
          <p className="mt-2 text-xl text-gray-400">From R299</p>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Experience the biggest football matches in South Africa — with a full township tour,
            local guides, and an unforgettable matchday experience.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[200px] flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search teams, venues..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:border-gold-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="min-w-[150px]">
              <select
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:border-gold-500 focus:outline-none"
              >
                {types.map((type) => (
                  <option key={type} value={type} className="bg-black">
                    {type === 'All' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[150px]">
              <select
                value={selectedTeam}
                onChange={(event) => setSelectedTeam(event.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:border-gold-500 focus:outline-none"
              >
                {teams.map((team) => (
                  <option key={team} value={team} className="bg-black">
                    {team}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-400">{filteredFixtures.length} fixtures found</div>
        </div>

        {filteredFixtures.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-4xl">⚽</div>
            <h3 className="mb-2 text-xl font-semibold">No fixtures found</h3>
            <p className="text-gray-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFixtures.map((fixture) => {
              const fixtureType = getFixtureType(fixture);
              const displayTitle = fixture.title || `${fixture.team} vs ${fixture.opponent}`;
              const fixtureBadge =
                fixtureType === 'home'
                  ? '🏠 Home'
                  : fixtureType === 'away'
                    ? '✈️ Away'
                    : fixtureType === 'derby'
                      ? '🏆 Derby'
                      : '🏆 Cup';

              return (
                <Link
                  to={`/event/${fixture.id}`}
                  key={fixture.id}
                  className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all hover:border-gold-500/50"
                >
                  <div className="p-5">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          fixtureType === 'home'
                            ? 'bg-green-500/20 text-green-400'
                            : fixtureType === 'away'
                              ? 'bg-blue-500/20 text-blue-400'
                              : fixtureType === 'derby'
                                ? 'bg-gold-500/20 text-gold-500'
                                : 'bg-purple-500/20 text-purple-400'
                        }`}
                      >
                        {fixtureBadge}
                      </span>

                      {fixture.isDerby && (
                        <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
                          🔥 {fixture.derbyName}
                        </span>
                      )}

                      {fixture.featured && (
                        <span className="flex items-center gap-1 rounded-full bg-gold-500/20 px-3 py-1 text-xs font-medium text-gold-500">
                          <Star className="h-3 w-3" /> Featured
                        </span>
                      )}

                      {fixture.awayTravel && (
                        <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400">
                          <Plane className="h-3 w-3" /> Away Trip
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold transition-colors group-hover:text-gold-500">
                      {displayTitle}
                    </h3>
                    <p className="text-sm text-gray-400">{fixture.venue}</p>

                    <div className="mt-3 space-y-1 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(fixture.date).toLocaleDateString('en-ZA', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        at {fixture.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {fixture.city}, {fixture.province}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {fixture.totalSpots} spots available
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-xl font-bold text-gold-500">R{fixture.price}</span>
                      <span className="flex items-center gap-1 text-sm text-gold-500">
                        View details <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
