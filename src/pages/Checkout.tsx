import { useMemo, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { ArrowLeft, CheckCircle2, CreditCard, MapPin, ShieldCheck, Users } from 'lucide-react';
import { api } from '../../convex/_generated/api';

const readStoredValue = <T,>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = (location.state as { booking?: any } | null)?.booking ?? null;
  const createBooking = useMutation(api.bookings.create);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'full' | 'bnpl'>(booking?.paymentMethod ?? 'full');
  const [saving, setSaving] = useState(false);
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const match = booking?.match;
  const selectedPackage = booking?.package;
  const pickup = booking?.pickup;
  const passengers = booking?.passengers ?? 1;
  const includeTicket = booking?.includeTicket ?? false;
  const packageTotal = booking?.packageTotal ?? 0;
  const ticketTotal = booking?.ticketTotal ?? 0;
  const totalPrice = booking?.totalPrice ?? 0;

  const isValid = useMemo(() => {
    return customerName.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(customerEmail.trim()) && /^[+\d][\d\s()-]{7,}$/.test(customerPhone.trim()) && acceptedTerms;
  }, [acceptedTerms, customerEmail, customerName, customerPhone]);

  const handleConfirm = async () => {
    if (!match || !selectedPackage || !pickup || !isValid) return;

    setSaving(true);
    setSubmitError(null);

    const payload = {
      matchId: String(match.id ?? 'match'),
      matchTitle: match.title || `${match.team} vs ${match.opponent}`,
      team: match.team,
      opponent: match.opponent,
      venue: match.venue,
      matchDate: match.date,
      packageId: selectedPackage.id,
      packageTitle: selectedPackage.title,
      packagePrice: selectedPackage.price,
      pickupName: pickup.name,
      pickupAddress: pickup.address,
      pickupProvince: pickup.province || 'Gauteng',
      pickupZone: pickup.zone || 'Custom route',
      tripGroupId: booking?.tripGroupId,
      tripRegions: booking?.tripRegions,
      passengerCount: passengers,
      includeTicket,
      ticketTotal,
      totalPrice,
      paymentMethod,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      notes: notes.trim() || undefined,
    };

    try {
      const orderId = await createBooking(payload);
      setSavedOrderId(String(orderId));

      const existing = readStoredValue<Array<Record<string, any>>>('matchday-sa-bookings', []);
      localStorage.setItem('matchday-sa-bookings', JSON.stringify([
        {
          ...payload,
          id: String(orderId),
          createdAt: new Date().toISOString(),
        },
        ...existing,
      ]));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'We could not reserve your seats. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (savedOrderId) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Booking request received</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Your seats are reserved</h1>
          <p className="mt-3 text-slate-600">Order reference: {savedOrderId}</p>
          <p className="mt-2 text-slate-600">We’ve saved your booking details and payment information to the Matchday SA database.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/" className="rounded-xl bg-[#FFD700] px-5 py-3 font-semibold text-black hover:bg-[#f8cf2f]">Back home</Link>
            <Link to="/admin" className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:border-slate-400">View admin</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            Secure checkout
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFD700] text-xl">✓</div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Confirmation</p>
                <h1 className="text-2xl font-bold">Your matchday booking</h1>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Trip</p>
                <h2 className="mt-2 text-xl font-bold">{match?.title || match?.team || 'Matchday trip'}</h2>
                <p className="mt-2 text-sm text-slate-600">{match?.opponent ? `${match.team} vs ${match.opponent}` : match?.city || 'Matchday away trip'}</p>
                <p className="mt-2 text-sm text-slate-600">{match?.date || 'Matchday date'} • {match?.venue || 'Venue to be confirmed'}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Package</p>
                <h3 className="mt-2 text-xl font-bold">{selectedPackage?.title || 'Package selection'}</h3>
                <p className="mt-2 text-sm text-slate-600">{selectedPackage?.description || 'Custom itinerary package'}</p>
                <p className="mt-2 text-sm font-semibold text-emerald-700">R {selectedPackage?.price?.toLocaleString() || '0'} per traveler</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#1A8A3F]" />
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">Pickup details</p>
              </div>
              <p className="text-lg font-bold">{pickup?.name || 'Door-to-door pickup'}</p>
              <p className="mt-1 text-sm text-slate-600">{pickup?.address || 'Pickup to be confirmed'}</p>
              <p className="mt-1 text-sm text-slate-600">{pickup?.province || 'Province to be confirmed'} • {pickup?.zone || 'Custom route'}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-[#1A8A3F]" />
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">Traveller details</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Full name
                  <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-[#1A8A3F]" placeholder="John Smith" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                  <input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-[#1A8A3F]" placeholder="you@example.com" />
                </label>
                <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                  Phone number
                  <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-[#1A8A3F]" placeholder="+27 82 123 4567" />
                </label>
                <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                  Notes
                  <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-[#1A8A3F]" placeholder="Any special requests, group notes, or contact preferences" />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#1A8A3F]" />
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">Secure payment preference</p>
              </div>
              <div className="mb-4 flex gap-3">
                {(['full', 'bnpl'] as Array<'full' | 'bnpl'>).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPaymentMethod(option)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold ${paymentMethod === option ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600'}`}
                  >
                    {option === 'full' ? 'Full payment' : 'BNPL'}
                  </button>
                ))}
              </div>
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                Your card details are never entered or stored here. After your seats are reserved, we will send a secure payment link for your selected option.
              </p>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1 h-4 w-4" />
              <span>I agree to the <Link to="/info/terms" className="font-semibold text-[#1A8A3F] underline">booking terms</Link> and acknowledge the <Link to="/info/privacy" className="font-semibold text-[#1A8A3F] underline">privacy notice</Link>.</span>
            </label>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-[#0b0d0f] p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Summary</p>
            <h2 className="mt-3 text-2xl font-bold">R {totalPrice.toLocaleString()}</h2>

            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>Package total</span>
                <span>R {packageTotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Match ticket</span>
                <span>{includeTicket ? `R ${ticketTotal.toLocaleString()}` : 'Included'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Trip activation</span>
                <span className="text-emerald-400">6 travelers min</span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-semibold">Trip status</span>
              </div>
              <p className="mt-2 text-emerald-100">
                {passengers >= 6 ? 'This trip is active and ready to depart.' : `${6 - passengers} more traveler(s) needed to activate this route.`}
              </p>
            </div>

            {submitError && <p role="alert" className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100">{submitError}</p>}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isValid || saving}
              className="mt-8 w-full rounded-xl bg-[#FFD700] px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-[#f8cf2f] disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              {saving ? 'Reserving seats...' : 'Reserve seats & request payment link'}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
