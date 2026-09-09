import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from 'convex/react';
import { RedirectToSignIn, useUser } from '@clerk/clerk-react';
import { ArrowLeft, Check, Edit3, Plus, Save, Trash2, ShieldCheck, X, Route } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
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

type ItineraryItem = {
  time: string;
  title: string;
  location: string;
  notes?: string;
};

type ItineraryDraft = {
  id?: Id<'itineraryTemplates'>;
  name: string;
  description: string;
  items: ItineraryItem[];
  active: boolean;
};

const emptyItineraryItem: ItineraryItem = { time: '09:00', title: '', location: '', notes: '' };
const emptyItinerary: ItineraryDraft = {
  name: '',
  description: '',
  items: [emptyItineraryItem],
  active: true,
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
  const updateBooking = useMutation(api.bookings.update);
  const assignItinerary = useMutation(api.bookings.assignItinerary);
  const itineraryTemplates = useQuery(api.bookings.listItineraryTemplates, {});
  const saveItineraryTemplate = useMutation(api.bookings.saveItineraryTemplate);
  const deleteItineraryTemplate = useMutation(api.bookings.deleteItineraryTemplate);
  const [packages, setPackages] = useState<PackageEntry[]>(() => readStoredValue('matchday-sa-packages', defaultPackages));
  const [pickups, setPickups] = useState<PickupEntry[]>(() => mergePickupPoints(readStoredValue('matchday-sa-pickups', defaultPickups)));
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => readStoredValue('matchday-sa-site-settings', defaultSiteSettings));
  const [packageDraft, setPackageDraft] = useState<PackageEntry>(emptyPackage);
  const [pickupDraft, setPickupDraft] = useState<PickupEntry>(emptyPickup);
  const [itineraryDraft, setItineraryDraft] = useState<ItineraryDraft>(emptyItinerary);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'approved' | 'paid' | 'declined'>('all');
  const [editingBookingId, setEditingBookingId] = useState<Id<'bookings'> | null>(null);
  const [bookingDraft, setBookingDraft] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    passengerCount: 1,
    matchDate: '',
    pickupName: '',
    pickupAddress: '',
    notes: '',
    totalPrice: 0,
  });
  const [operationError, setOperationError] = useState<string | null>(null);
  const [operationNotice, setOperationNotice] = useState<string | null>(null);

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

  const filteredBookings = useMemo(() => {
    const entries = bookings ?? [];
    return bookingFilter === 'all' ? entries : entries.filter((booking) => booking.status === bookingFilter);
  }, [bookingFilter, bookings]);

  const handleBookingStatus = async (id: Id<'bookings'>, status: 'confirmed' | 'approved' | 'paid' | 'cancelled' | 'declined') => {
    setOperationError(null);
    setOperationNotice(null);
    try {
      await updateBookingStatus({ id, status });
      setOperationNotice(`Booking ${status === 'approved' ? 'approved' : status}.`);
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'The booking status could not be updated.');
    }
  };

  const startBookingEdit = (booking: NonNullable<typeof bookings>[number]) => {
    setEditingBookingId(booking._id);
    setBookingDraft({
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      passengerCount: booking.passengerCount,
      matchDate: booking.matchDate,
      pickupName: booking.pickupName,
      pickupAddress: booking.pickupAddress,
      notes: booking.notes ?? '',
      totalPrice: booking.totalPrice,
    });
  };

  const saveBookingEdit = async () => {
    if (!editingBookingId) return;
    setOperationError(null);
    setOperationNotice(null);
    try {
      await updateBooking({ id: editingBookingId, ...bookingDraft, passengerCount: Math.max(1, bookingDraft.passengerCount), totalPrice: Math.max(0, bookingDraft.totalPrice) });
      setEditingBookingId(null);
      setOperationNotice('Booking details saved.');
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'The booking could not be saved.');
    }
  };

  const saveItinerary = async () => {
    if (!itineraryDraft.name.trim() || !itineraryDraft.items.some((item) => item.title.trim())) return;
    setOperationError(null);
    setOperationNotice(null);
    try {
      await saveItineraryTemplate({
        id: itineraryDraft.id,
        name: itineraryDraft.name.trim(),
        description: itineraryDraft.description.trim(),
        items: itineraryDraft.items.filter((item) => item.title.trim()).map((item) => ({ ...item, title: item.title.trim(), location: item.location.trim(), notes: item.notes?.trim() || undefined })),
        active: itineraryDraft.active,
      });
      setItineraryDraft(emptyItinerary);
      setOperationNotice('Itinerary template saved.');
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'The itinerary template could not be saved.');
    }
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

  if (user.publicMetadata?.role !== 'admin') {
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
          <nav className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4" aria-label="Admin sections">
            {[
              ['Booking queue', '#booking-queue'],
              ['Itineraries', '#itineraries'],
              ['Packages', '#packages'],
              ['Pickup points', '#pickups'],
              ['Site settings', '#site-settings'],
            ].map(([label, href]) => (
              <a key={href} href={href} className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:border-gold-500/50 hover:text-gold-400">
                {label}
              </a>
            ))}
          </nav>
        </div>

        {(operationError || operationNotice) && (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${operationError ? 'border-red-400/30 bg-red-500/10 text-red-200' : 'border-green-400/30 bg-green-500/10 text-green-200'}`} role={operationError ? 'alert' : 'status'}>
            {operationError ?? operationNotice}
          </div>
        )}

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

        <section id="site-settings" className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">Operations</p>
              <h2 className="mt-2 text-2xl font-bold">Booking approval queue</h2>
              <p className="mt-1 text-sm text-gray-400">Review customer details, approve or decline requests, and update trip arrangements.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'approved', 'paid', 'declined'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setBookingFilter(filter)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${bookingFilter === filter ? 'bg-gold-500 text-black' : 'border border-white/10 bg-black/20 text-gray-300'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                {editingBookingId === booking._id ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      ['customerName', 'Customer name'],
                      ['customerEmail', 'Email'],
                      ['customerPhone', 'Phone'],
                      ['matchDate', 'Match date'],
                      ['pickupName', 'Pickup point'],
                      ['pickupAddress', 'Pickup address'],
                    ].map(([key, label]) => (
                      <label key={key} className="text-xs text-gray-400">
                        {label}
                        <input
                          value={bookingDraft[key as keyof typeof bookingDraft] as string}
                          onChange={(event) => setBookingDraft((current) => ({ ...current, [key]: event.target.value }))}
                          className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-gold-500"
                        />
                      </label>
                    ))}
                    <label className="text-xs text-gray-400">
                      Travellers
                      <input type="number" min={1} value={bookingDraft.passengerCount} onChange={(event) => setBookingDraft((current) => ({ ...current, passengerCount: Number(event.target.value) }))} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-gold-500" />
                    </label>
                    <label className="text-xs text-gray-400">
                      Total price
                      <input type="number" min={0} value={bookingDraft.totalPrice} onChange={(event) => setBookingDraft((current) => ({ ...current, totalPrice: Number(event.target.value) }))} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-gold-500" />
                    </label>
                    <label className="text-xs text-gray-400 md:col-span-2">
                      Internal/customer notes
                      <textarea value={bookingDraft.notes} onChange={(event) => setBookingDraft((current) => ({ ...current, notes: event.target.value }))} rows={2} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-gold-500" />
                    </label>
                    <div className="flex gap-2 md:col-span-2">
                      <button type="button" onClick={saveBookingEdit} className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-black"><Save className="h-4 w-4" /> Save booking</button>
                      <button type="button" onClick={() => setEditingBookingId(null)} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold">{booking.customerName}</p>
                          <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-gold-500">{booking.status}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-400">{booking.customerEmail} · {booking.customerPhone}</p>
                        <p className="mt-2 text-sm text-white">{booking.matchTitle} · {booking.packageTitle}</p>
                        <p className="text-xs text-gray-500">{booking.matchDate} · {booking.pickupName} · {booking.passengerCount} travellers · R{booking.totalPrice.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => startBookingEdit(booking)} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-gold-400"><Edit3 className="h-3.5 w-3.5" /> Edit</button>
                        {booking.status === 'pending' && <button type="button" onClick={() => handleBookingStatus(booking._id, 'approved')} className="inline-flex items-center gap-1 rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-black"><Check className="h-3.5 w-3.5" /> Approve</button>}
                        {booking.status !== 'declined' && booking.status !== 'cancelled' && <button type="button" onClick={() => handleBookingStatus(booking._id, 'declined')} className="inline-flex items-center gap-1 rounded-lg border border-red-400/30 px-3 py-2 text-xs text-red-300"><X className="h-3.5 w-3.5" /> Decline</button>}
                        {booking.status === 'approved' && <button type="button" onClick={() => handleBookingStatus(booking._id, 'paid')} className="rounded-lg border border-green-400/30 px-3 py-2 text-xs text-green-300">Mark paid</button>}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-3 sm:flex-row sm:items-center">
                      <Route className="h-4 w-4 text-gold-500" />
                      <select
                        value={booking.itineraryTemplateId ?? ''}
                        onChange={async (event) => {
                          const template = itineraryTemplates?.find((item) => item._id === event.target.value);
                          if (!template) return;
                          setOperationError(null);
                          setOperationNotice(null);
                          try {
                            await assignItinerary({ bookingId: booking._id, templateId: template._id, itinerary: template.items });
                            setOperationNotice('Itinerary assigned to booking.');
                          } catch (error) {
                            setOperationError(error instanceof Error ? error.message : 'The itinerary could not be assigned.');
                          }
                        }}
                        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none focus:border-gold-500 sm:max-w-sm"
                      >
                        <option value="">Assign itinerary template…</option>
                        {(itineraryTemplates ?? []).filter((template) => template.active).map((template) => <option key={template._id} value={template._id}>{template.name}</option>)}
                      </select>
                      <span className="text-xs text-gray-500">{booking.itinerary?.length ?? 0} itinerary stops assigned</span>
                    </div>
                  </>
                )}
              </div>
            ))}
            {filteredBookings.length === 0 && <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-400">No bookings in this queue.</p>}
          </div>
        </section>

        <section id="booking-queue" className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">Consultant tools</p>
              <h2 className="mt-2 text-2xl font-bold">Itinerary templates</h2>
              <p className="mt-1 text-sm text-gray-400">Create repeatable routes, then assign them to approved bookings.</p>
            </div>
            <button type="button" onClick={() => setItineraryDraft(emptyItinerary)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gold-400"><Plus className="h-4 w-4" /> New template</button>
          </div>
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              {(itineraryTemplates ?? []).map((template) => (
                <div key={template._id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-semibold">{template.name}</p><p className="mt-1 text-xs text-gray-400">{template.description || 'No description'} · {template.items.length} stops</p></div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setItineraryDraft({ id: template._id, name: template.name, description: template.description, items: template.items, active: template.active })} className="text-xs text-gold-400">Edit</button>
                      <button
                        type="button"
                        onClick={async () => {
                          setOperationError(null);
                          setOperationNotice(null);
                          try {
                            await deleteItineraryTemplate({ id: template._id });
                            setOperationNotice('Itinerary template deleted.');
                          } catch (error) {
                            setOperationError(error instanceof Error ? error.message : 'The itinerary template could not be deleted.');
                          }
                        }}
                        className="text-xs text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!itineraryTemplates?.length && <p className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-gray-400">No itinerary templates yet.</p>}
            </div>
            <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <input value={itineraryDraft.name} onChange={(event) => setItineraryDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Template name" className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-gold-500" />
              <textarea value={itineraryDraft.description} onChange={(event) => setItineraryDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Consultant notes and route description" rows={2} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-gold-500" />
              {itineraryDraft.items.map((item, index) => (
                <div key={`${index}-${item.time}`} className="grid gap-2 rounded-xl border border-white/10 p-3 md:grid-cols-[90px_1fr_1fr_auto]">
                  <input value={item.time} onChange={(event) => setItineraryDraft((current) => ({ ...current, items: current.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, time: event.target.value } : entry) }))} placeholder="09:00" className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-sm text-white" />
                  <input value={item.title} onChange={(event) => setItineraryDraft((current) => ({ ...current, items: current.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, title: event.target.value } : entry) }))} placeholder="Activity" className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-sm text-white" />
                  <input value={item.location} onChange={(event) => setItineraryDraft((current) => ({ ...current, items: current.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, location: event.target.value } : entry) }))} placeholder="Location" className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-sm text-white" />
                  <button type="button" onClick={() => setItineraryDraft((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-lg border border-red-400/20 px-2 text-red-300"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setItineraryDraft((current) => ({ ...current, items: [...current.items, { ...emptyItineraryItem, time: `${String(9 + current.items.length).padStart(2, '0')}:00` }] }))} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300"><Plus className="mr-1 inline h-3.5 w-3.5" /> Add stop</button>
                <button type="button" onClick={saveItinerary} className="rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-black"><Save className="mr-1 inline h-3.5 w-3.5" /> Save template</button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <section id="itineraries" className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500/10 text-gold-500">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">Site branding & copy</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="admin-hero-title" className="mb-2 block text-sm text-gray-300">Hero title</label>
                  <input
                    id="admin-hero-title"
                    name="heroTitle"
                    value={siteSettings.heroTitle}
                    onChange={(event) => setSiteSettings((current) => ({ ...current, heroTitle: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label htmlFor="admin-hero-subtitle" className="mb-2 block text-sm text-gray-300">Hero subtitle</label>
                  <input
                    id="admin-hero-subtitle"
                    name="heroSubtitle"
                    value={siteSettings.heroSubtitle}
                    onChange={(event) => setSiteSettings((current) => ({ ...current, heroSubtitle: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="admin-booking-note" className="mb-2 block text-sm text-gray-300">Booking note</label>
                <textarea
                  id="admin-booking-note"
                  name="bookingText"
                  value={siteSettings.bookingText}
                  onChange={(event) => setSiteSettings((current) => ({ ...current, bookingText: event.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                />
              </div>
            </section>

            <section id="packages" className="rounded-3xl border border-white/10 bg-white/5 p-6">
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
                  <label htmlFor="package-title" className="mb-2 block text-sm text-gray-300">Title</label>
                  <input
                    id="package-title"
                    name="title"
                    value={packageDraft.title}
                    onChange={(event) => setPackageDraft((current) => ({ ...current, title: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                    placeholder="Saturday Only (Home)"
                  />
                </div>
                <div>
                  <label htmlFor="package-category" className="mb-2 block text-sm text-gray-300">Category</label>
                  <select
                    id="package-category"
                    name="category"
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
                  <label htmlFor="package-price" className="mb-2 block text-sm text-gray-300">Price</label>
                  <input
                    id="package-price"
                    name="price"
                    type="number"
                    value={packageDraft.price}
                    onChange={(event) => setPackageDraft((current) => ({ ...current, price: Number(event.target.value) || 0 }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label htmlFor="package-format" className="mb-2 block text-sm text-gray-300">Format</label>
                  <input
                    id="package-format"
                    name="format"
                    value={packageDraft.format}
                    onChange={(event) => setPackageDraft((current) => ({ ...current, format: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                    placeholder="saturday_only"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="package-description" className="mb-2 block text-sm text-gray-300">Description</label>
                <textarea
                  id="package-description"
                  name="description"
                  value={packageDraft.description}
                  onChange={(event) => setPackageDraft((current) => ({ ...current, description: event.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="package-includes" className="mb-2 block text-sm text-gray-300">Includes (comma-separated)</label>
                <input
                  id="package-includes"
                  name="includes"
                  value={packageDraft.includes.join(', ')}
                  onChange={(event) => setPackageDraft((current) => ({ ...current, includes: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) }))}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <input
                  id="package-active"
                  name="active"
                  type="checkbox"
                  checked={packageDraft.active}
                  onChange={(event) => setPackageDraft((current) => ({ ...current, active: event.target.checked }))}
                  className="h-4 w-4 rounded border-white/20 bg-black text-gold-500"
                />
                <label htmlFor="package-active" className="text-sm text-gray-300">Active package</label>
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
            <section id="pickups" className="rounded-3xl border border-white/10 bg-white/5 p-6">
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
                  <label htmlFor="pickup-name" className="mb-2 block text-sm text-gray-300">Name</label>
                  <input
                    id="pickup-name"
                    name="name"
                    value={pickupDraft.name}
                    onChange={(event) => setPickupDraft((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="pickup-city" className="mb-2 block text-sm text-gray-300">City</label>
                    <input
                      id="pickup-city"
                      name="city"
                      value={pickupDraft.city}
                      onChange={(event) => setPickupDraft((current) => ({ ...current, city: event.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="pickup-province" className="mb-2 block text-sm text-gray-300">Province</label>
                    <select
                      id="pickup-province"
                      name="province"
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
                  <label htmlFor="pickup-zone" className="mb-2 block text-sm text-gray-300">Zone</label>
                  <select
                    id="pickup-zone"
                    name="zone"
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
                  <label htmlFor="pickup-address" className="mb-2 block text-sm text-gray-300">Address</label>
                  <input
                    id="pickup-address"
                    name="address"
                    value={pickupDraft.address}
                    onChange={(event) => setPickupDraft((current) => ({ ...current, address: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-gold-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="pickup-active"
                    name="active"
                    type="checkbox"
                    checked={pickupDraft.active}
                    onChange={(event) => setPickupDraft((current) => ({ ...current, active: event.target.checked }))}
                    className="h-4 w-4 rounded border-white/20 bg-black text-gold-500"
                  />
                  <label htmlFor="pickup-active" className="text-sm text-gray-300">Active pickup point</label>
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
