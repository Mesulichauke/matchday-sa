import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from 'convex/react';
import { RedirectToSignIn, useUser } from '@clerk/clerk-react';
import { ArrowLeft, Plus, Save, Trash2, ShieldCheck } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import { defaultPickupPoints, mergePickupPoints, type PickupPoint } from '@/data/pickupPoints';

type PackageCategory = 'home' | 'away' | 'neutral' | 'camping' | 'viewing' | 'season';

type PackageEntry = {
  id: string;
  title: string;
  category: PackageCategory;
  price: number;
  format: string;
  description: string;
  includes: string[];
  active: boolean;
};

type PickupEntry = PickupPoint;

type SiteSettings = {
  heroTitle: string;
  heroSubtitle: string;
  bookingText: string;
};

const defaultPackages: PackageEntry[] = [
  { id: 'home_saturday_only', title: 'Saturday Only (Home)', category: 'home', price: 299, format: 'saturday_only', description: 'Perfect for local fans wanting a full matchday experience', includes: ['Tour', 'Match', 'Lunch', 'Transport'], active: true },
  { id: 'home_saturday_sleep', title: 'Saturday + Sleep (Home)', category: 'home', price: 599, format: 'saturday_sleep', description: 'Full experience with overnight stay', includes: ['Tour', 'Match', '1 Night', 'All Meals', 'Transport'], active: true },
  { id: 'home_full_weekend', title: 'Full Weekend (Home)', category: 'home', price: 899, format: 'full_weekend', description: 'Complete weekend immersion', includes: ['Tour', 'Match', '2 Nights', 'All Meals', 'Braai', 'Transport'], active: true },
  { id: 'away_saturday_only', title: 'Saturday Only (Away)', category: 'away', price: 649, format: 'saturday_only', description: 'Travel to the away game for the day', includes: ['Transport', 'Tour', 'Match', 'Lunch'], active: true },
  { id: 'away_saturday_sleep', title: 'Saturday + Sleep (Away)', category: 'away', price: 949, format: 'saturday_sleep', description: 'Away game with overnight stay', includes: ['Transport', 'Tour', 'Match', '1 Night', 'All Meals'], active: true },
  { id: 'away_full_weekend', title: 'Full Weekend (Away)', category: 'away', price: 1299, format: 'full_weekend', description: 'Complete away weekend experience', includes: ['Transport', 'Tour', 'Match', '2 Nights', 'All Meals', 'Braai'], active: true },
  { id: 'neutral_saturday_only', title: 'Saturday Only (Neutral)', category: 'neutral', price: 449, format: 'saturday_only', description: 'For fans visiting from other provinces', includes: ['Tour', 'Match', 'Lunch', 'Transport'], active: true },
  { id: 'neutral_saturday_sleep', title: 'Saturday + Sleep (Neutral)', category: 'neutral', price: 749, format: 'saturday_sleep', description: 'Neutral fan overnight experience', includes: ['Tour', 'Match', '1 Night', 'All Meals', 'Transport'], active: true },
  { id: 'neutral_full_weekend', title: 'Full Weekend (Neutral)', category: 'neutral', price: 1099, format: 'full_weekend', description: 'Complete neutral fan weekend', includes: ['Tour', 'Match', '2 Nights', 'All Meals', 'Braai', 'Transport'], active: true },
  { id: 'camping_only', title: 'Camping Only', category: 'camping', price: 399, format: 'camping', description: 'Camp in the township for the weekend', includes: ['2 Nights Camping', 'Meals', 'Activities'], active: true },
  { id: 'camping_tour', title: 'Camping + Tour', category: 'camping', price: 799, format: 'camping', description: 'Camping with full township tour', includes: ['Camping', 'Tour', 'Meals', 'Activities'], active: true },
  { id: 'camping_match', title: 'Camping + Tour + Match', category: 'camping', price: 1099, format: 'camping', description: 'Complete camping matchday weekend', includes: ['Camping', 'Tour', 'Match', 'Meals', 'Activities'], active: true },
  { id: 'viewing_only', title: 'Viewing Only', category: 'viewing', price: 399, format: 'local_viewing', description: 'Watch the match with locals', includes: ['Viewing', 'Food', 'Drinks', 'Host'], active: true },
  { id: 'viewing_tour', title: 'Viewing + Tour', category: 'viewing', price: 699, format: 'local_viewing', description: 'Tour + Viewing with locals', includes: ['Tour', 'Viewing', 'Food', 'Drinks', 'Host'], active: true },
  { id: 'viewing_sleep', title: 'Viewing + Tour + Sleep', category: 'viewing', price: 899, format: 'local_viewing', description: 'Tour + Viewing + Overnight stay', includes: ['Tour', 'Viewing', '1 Night', 'Meals', 'Host'], active: true },
  { id: 'season_pass', title: 'Legend Season Pass', category: 'season', price: 5499, format: 'season_pass', description: '10 matches + 10 tours + jerseys + VIP access', includes: ['10 Matches', '10 Tours', 'Home & Away Jerseys', 'VIP'], active: true },
];

const defaultPickups: PickupEntry[] = defaultPickupPoints;

const defaultSiteSettings: SiteSettings = {
  heroTitle: 'Matchday SA',
  heroSubtitle: 'Local matchday experiences, township routes, and premium away travel built around the match venue.',
  bookingText: 'Book your local experience, travel package, and community-led matchday route in one place.',
};

const emptyPackage: PackageEntry = {
  id: '',
  title: '',
  category: 'home',
  price: 0,
  format: 'saturday_only',
  description: '',
  includes: ['Tour'],
  active: true,
};

const allProvinces = [
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Western Cape',
  'Eastern Cape',
  'North West',
  'Free State',
  'Northern Cape',
];

const emptyPickup: PickupEntry = {
  id: '',
  name: '',
  city: '',
  province: 'Gauteng',
  zone: 'North',
  address: '',
  active: true,
};

const readStoredValue = <T,>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export default function Admin() {
  const { isLoaded, isSignedIn, user } = useUser();
  const bookings = useQuery(api.bookings.list, {});
  const updateBookingStatus = useMutation(api.bookings.updateStatus);
  const [packages, setPackages] = useState<PackageEntry[]>(() => readStoredValue('matchday-sa-packages', defaultPackages));
  const [pickups, setPickups] = useState<PickupEntry[]>(() => mergePickupPoints(readStoredValue('matchday-sa-pickups', defaultPickups)));
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => readStoredValue('matchday-sa-site-settings', defaultSiteSettings));
  const [packageDraft, setPackageDraft] = useState<PackageEntry>(emptyPackage);
  const [pickupDraft, setPickupDraft] = useState<PickupEntry>(emptyPickup);

  useEffect(() => {
    localStorage.setItem('matchday-sa-packages', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem('matchday-sa-pickups', JSON.stringify(pickups));
  }, [pickups]);

  useEffect(() => {
    localStorage.setItem('matchday-sa-site-settings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  const packageSummary = useMemo(() => {
    return {
      total: packages.length,
      active: packages.filter((pkg) => pkg.active).length,
      revenue: packages.reduce((sum, pkg) => sum + pkg.price, 0),
    };
  }, [packages]);

  const bookingSummary = useMemo(() => {
    const entries = bookings ?? [];
    return {
      pending: entries.filter((booking) => booking.status === 'pending').length,
      travellers: entries.filter((booking) => booking.status !== 'cancelled').reduce((sum, booking) => sum + booking.passengerCount, 0),
      revenue: entries.filter((booking) => booking.status === 'paid').reduce((sum, booking) => sum + booking.totalPrice, 0),
    };
  }, [bookings]);

  const handleBookingStatus = async (id: typeof bookings extends (infer T)[] | undefined ? T extends { _id: infer I } ? I : never : never, status: 'confirmed' | 'paid' | 'cancelled') => {
    await updateBookingStatus({ id, status });
  };

  const resetToDefaults = () => {
    setPackages(defaultPackages);
    setPickups(defaultPickups);
    setSiteSettings(defaultSiteSettings);
    setPackageDraft(emptyPackage);
    setPickupDraft(emptyPickup);
  };

  const handlePackageSave = () => {
    if (!packageDraft.title.trim()) return;

    const normalized = {
      ...packageDraft,
      title: packageDraft.title.trim(),
      description: packageDraft.description.trim() || 'Updated package description.',
      includes: packageDraft.includes.length ? packageDraft.includes : ['Tour'],
    };

    setPackages((current) => {
      if (normalized.id) {
        return current.map((pkg) => (pkg.id === normalized.id ? normalized : pkg));
      }

      return [{ ...normalized, id: `custom-${Date.now()}` }, ...current];
    });

    setPackageDraft(emptyPackage);
  };

  const handlePackageEdit = (pkg: PackageEntry) => {
    setPackageDraft(pkg);
  };

  const handlePackageDelete = (id: string) => {
    setPackages((current) => current.filter((pkg) => pkg.id !== id));
    if (packageDraft.id === id) {
      setPackageDraft(emptyPackage);
    }
  };

  const handlePickupSave = () => {
    if (!pickupDraft.name.trim() || !pickupDraft.city.trim()) return;

    const normalized = {
      ...pickupDraft,
      name: pickupDraft.name.trim(),
      city: pickupDraft.city.trim(),
      address: pickupDraft.address.trim() || 'To be confirmed',
    };

    setPickups((current) => {
      if (normalized.id) {
        return current.map((pickup) => (pickup.id === normalized.id ? normalized : pickup));
      }

      return [{ ...normalized, id: `pickup-${Date.now()}` }, ...current];
    });

    setPickupDraft(emptyPickup);
  };

  const handlePickupEdit = (pickup: PickupEntry) => {
    setPickupDraft(pickup);
  };

  const handlePickupDelete = (id: string) => {
    setPickups((current) => current.filter((pickup) => pickup.id !== id));
    if (pickupDraft.id === id) {
      setPickupDraft(emptyPickup);
    }
  };

  if (!isLoaded) {
    return <main className="flex min-h-screen items-center justify-center bg-black text-white">Loading secure admin area…</main>;
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  if (user.publicMetadata.role !== 'admin') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="max-w-md rounded-3xl border border-amber-500/30 bg-white/5 p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Admin access required</p>
          <h1 className="mt-3 text-2xl font-bold">Your account is signed in but not authorised.</h1>
          <p className="mt-3 text-sm leading-6 text-gray-300">An owner must set your Clerk public metadata to <code className="rounded bg-black px-1.5 py-0.5 text-amber-200">{`{"role":"admin"}`}</code>.</p>
          <Link to="/" className="mt-6 inline-flex rounded-xl bg-gold-500 px-4 py-2 font-semibold text-black">Back home</Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">MD</div>
            <span className="text-lg font-bold">Matchday SA</span>
          </Link>

          <Link to="/dashboard" className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gold-500/20 bg-gradient-to-r from-gold-500/10 via-white/5 to-green-500/10 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gold-500">Admin panel</p>
              <h1 className="mt-2 text-3xl font-bold">Website control centre</h1>
            </div>
            <button
              onClick={resetToDefaults}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-gold-500/50 hover:text-gold-500"
            >
              Reset to defaults
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-gray-400">Total packages</p>
            <p className="mt-2 text-3xl font-bold text-gold-500">{packageSummary.total}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-gray-400">Pending payment</p>
            <p className="mt-2 text-3xl font-bold text-amber-300">{bookingSummary.pending}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-gray-400">Confirmed travellers</p>
            <p className="mt-2 text-3xl font-bold text-green-400">{bookingSummary.travellers}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-gray-400">Paid booking value</p>
            <p className="mt-2 text-3xl font-bold text-green-400">R{bookingSummary.revenue.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-gray-400">Active packages</p>
            <p className="mt-2 text-3xl font-bold text-gold-500">{packageSummary.active}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-gray-400">Package catalog value</p>
            <p className="mt-2 text-3xl font-bold text-gold-500">R{packageSummary.revenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500/10 text-gold-500">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">Site branding & copy</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">Hero title</label>
                  <input
                    value={siteSettings.heroTitle}
                    onChange={(event) => setSiteSettings((current) => ({ ...current, heroTitle: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-300">Hero subtitle</label>
                  <input
                    value={siteSettings.heroSubtitle}
                    onChange={(event) => setSiteSettings((current) => ({ ...current, heroSubtitle: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm text-gray-300">Booking note</label>
                <textarea
                  value={siteSettings.bookingText}
                  onChange={(event) => setSiteSettings((current) => ({ ...current, bookingText: event.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                />
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500/10 text-gold-500">
                    <Plus className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold">Packages manager</h2>
                </div>
                <button
                  onClick={() => setPackageDraft(emptyPackage)}
                  className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-300 hover:border-gold-500/50 hover:text-gold-500"
                >
                  New package
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">Title</label>
                  <input
                    value={packageDraft.title}
                    onChange={(event) => setPackageDraft((current) => ({ ...current, title: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                    placeholder="Saturday Only (Home)"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-300">Category</label>
                  <select
                    value={packageDraft.category}
                    onChange={(event) => setPackageDraft((current) => ({ ...current, category: event.target.value as PackageCategory }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                  >
                    <option value="home">Home</option>
                    <option value="away">Away</option>
                    <option value="neutral">Neutral</option>
                    <option value="camping">Camping</option>
                    <option value="viewing">Viewing</option>
                    <option value="season">Season</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-300">Price</label>
                  <input
                    type="number"
                    value={packageDraft.price}
                    onChange={(event) => setPackageDraft((current) => ({ ...current, price: Number(event.target.value) || 0 }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-300">Format</label>
                  <input
                    value={packageDraft.format}
                    onChange={(event) => setPackageDraft((current) => ({ ...current, format: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                    placeholder="saturday_only"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm text-gray-300">Description</label>
                <textarea
                  value={packageDraft.description}
                  onChange={(event) => setPackageDraft((current) => ({ ...current, description: event.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm text-gray-300">Includes (comma-separated)</label>
                <input
                  value={packageDraft.includes.join(', ')}
                  onChange={(event) => setPackageDraft((current) => ({ ...current, includes: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) }))}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={packageDraft.active}
                  onChange={(event) => setPackageDraft((current) => ({ ...current, active: event.target.checked }))}
                  className="h-4 w-4 rounded border-white/20 bg-black text-gold-500"
                />
                <label className="text-sm text-gray-300">Active package</label>
              </div>

              <button
                onClick={handlePackageSave}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 font-semibold text-black transition-colors hover:bg-gold-600"
              >
                <Save className="h-4 w-4" /> Save package
              </button>
            </section>
          </div>

          <div className="space-y-8">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                    <Plus className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold">Pickup manager</h2>
                </div>
                <button
                  onClick={() => setPickupDraft(emptyPickup)}
                  className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-300 hover:border-gold-500/50 hover:text-gold-500"
                >
                  New pickup
                </button>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">Name</label>
                  <input
                    value={pickupDraft.name}
                    onChange={(event) => setPickupDraft((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-gray-300">City</label>
                    <input
                      value={pickupDraft.city}
                      onChange={(event) => setPickupDraft((current) => ({ ...current, city: event.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-gray-300">Province</label>
                    <select
                      value={pickupDraft.province}
                      onChange={(event) => setPickupDraft((current) => ({ ...current, province: event.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                    >
                      {allProvinces.map((province) => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">Zone</label>
                  <select
                    value={pickupDraft.zone}
                    onChange={(event) => setPickupDraft((current) => ({ ...current, zone: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                  >
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="Central">Central</option>
                    <option value="Local">Local</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-300">Address</label>
                  <input
                    value={pickupDraft.address}
                    onChange={(event) => setPickupDraft((current) => ({ ...current, address: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={pickupDraft.active}
                    onChange={(event) => setPickupDraft((current) => ({ ...current, active: event.target.checked }))}
                    className="h-4 w-4 rounded border-white/20 bg-black text-gold-500"
                  />
                  <label className="text-sm text-gray-300">Active pickup point</label>
                </div>

                <button
                  onClick={handlePickupSave}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-semibold text-black transition-colors hover:bg-green-400"
                >
                  <Save className="h-4 w-4" /> Save pickup point
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-bold">Current package list</h2>
              <div className="space-y-3">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-white">{pkg.title}</p>
                        <p className="text-sm text-gray-400">{pkg.category} • R{pkg.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePackageEdit(pkg)}
                          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-gold-500 hover:border-gold-500/50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handlePackageDelete(pkg.id)}
                          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-red-400 hover:border-red-500/50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-bold">Recent bookings</h2>
              <div className="space-y-3">
                {(bookings ?? []).slice(0, 6).map((booking) => (
                  <div key={booking._id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-white">{booking.matchTitle}</p>
                        <p className="text-sm text-gray-400">{booking.customerName} • {booking.packageTitle} • {booking.pickupProvince}</p>
                        <p className="text-xs text-gray-500">{booking.status} • {booking.passengerCount} travelers • R{booking.totalPrice.toLocaleString()}</p>
                      </div>
                      <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-gold-500">
                        {booking.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {booking.status === 'pending' && <button onClick={() => handleBookingStatus(booking._id, 'confirmed')} className="rounded-lg border border-blue-400/30 px-2 py-1 text-xs text-blue-200">Confirm reservation</button>}
                      {booking.status !== 'paid' && booking.status !== 'cancelled' && <button onClick={() => handleBookingStatus(booking._id, 'paid')} className="rounded-lg border border-green-400/30 px-2 py-1 text-xs text-green-300">Mark paid</button>}
                      {booking.status !== 'cancelled' && <button onClick={() => handleBookingStatus(booking._id, 'cancelled')} className="rounded-lg border border-red-400/30 px-2 py-1 text-xs text-red-300">Cancel & release seats</button>}
                    </div>
                  </div>
                ))}
                {(!bookings || bookings.length === 0) && (
                  <p className="text-sm text-gray-400">No bookings have been created yet.</p>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-bold">Current pickup list</h2>
              <div className="space-y-3">
                {pickups.map((pickup) => (
                  <div key={pickup.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-white">{pickup.name}</p>
                        <p className="text-sm text-gray-400">{pickup.city} • {pickup.province} • {pickup.zone}</p>
                        <p className="text-xs text-gray-500">{pickup.address}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePickupEdit(pickup)}
                          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-gold-500 hover:border-gold-500/50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handlePickupDelete(pickup.id)}
                          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-red-400 hover:border-red-500/50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
