import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Check, LogOut, ShieldCheck, X } from 'lucide-react';
import { apiRequest, useAuth } from '@/lib/auth';
import { apiUrl } from '@/lib/api';

type Consultant = {
  id: number; name: string; email: string; phone: string; region: string; bio: string;
  approvalState: 'pending' | 'approved' | 'rejected' | 'revoked'; createdAt: string;
};
type Booking = { id: string; customerName: string; customerEmail: string; status: string; matchTitle?: string; totalPrice?: number; createdAt: string };

export default function Admin() {
  const { user, loading, signOut } = useAuth();
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packageCount, setPackageCount] = useState(0);
  const [pickupCount, setPickupCount] = useState(0);
  const [siteTitle, setSiteTitle] = useState('Matchday SA');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    try {
      const [consultantData, bookingData] = await Promise.all([
        apiRequest<{ consultants: Consultant[] }>(apiUrl('/api/admin/consultants')),
        apiRequest<{ bookings: Booking[] }>(apiUrl('/api/bookings')),
      ]);
      setConsultants(consultantData.consultants);
      setBookings(bookingData.bookings);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load admin data.');
    }
  };
  useEffect(() => { if (user?.role === 'admin') void load(); }, [user]);
  useEffect(() => {
    try {
      const packages = JSON.parse(localStorage.getItem('matchday-sa-packages') || '[]') as unknown[];
      const pickups = JSON.parse(localStorage.getItem('matchday-sa-pickups') || '[]') as unknown[];
      const settings = JSON.parse(localStorage.getItem('matchday-sa-site-settings') || '{}') as { heroTitle?: string };
      setPackageCount(packages.length);
      setPickupCount(pickups.length);
      setSiteTitle(settings.heroTitle || 'Matchday SA');
    } catch { /* local admin settings are optional */ }
  }, []);

  const review = async (id: number, action: 'approve' | 'reject' | 'revoke') => {
    setError('');
    setNotice('');
    try {
      await apiRequest(apiUrl(`/api/admin/consultants/${id}/${action}`), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
      });
      setNotice(`Consultant ${action === 'reject' ? 'rejected' : `${action}d`}.`);
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update consultant.');
    }
  };
  const updateBookingStatus = async (id: string, status: 'approved' | 'declined' | 'paid') => {
    try {
      await apiRequest(apiUrl(`/api/bookings/${id}/status`), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      setNotice(`Booking ${status}.`);
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update booking.');
    }
  };

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-black text-white">Loading secure admin area…</main>;
  if (!user) return <Navigate to="/auth?mode=admin" replace />;
  if (user.role !== 'admin') return <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white"><div className="rounded-2xl border border-red-400/30 bg-white/5 p-8 text-center"><h1 className="text-2xl font-bold">Admin access required</h1><p className="mt-2 text-gray-400">Your account is not authorised for this area.</p><Link to="/" className="mt-5 inline-block text-gold-500">Back home</Link></div></main>;

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div><p className="text-xs uppercase tracking-[0.2em] text-gold-500">Admin panel</p><h1 className="mt-2 text-3xl font-bold">Matchday control centre</h1><p className="text-sm text-gray-400">{user.email}</p></div>
          <div className="flex gap-3"><Link to="/" className="rounded-lg border border-white/10 px-4 py-2 text-sm">Home</Link><button onClick={() => void signOut()} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm"><LogOut className="h-4 w-4" /> Sign out</button></div>
        </header>
        {(error || notice) && <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${error ? 'border-red-400/30 bg-red-500/10 text-red-200' : 'border-green-400/30 bg-green-500/10 text-green-200'}`}>{error || notice}</div>}
        <section className="mb-8 rounded-2xl border border-gold-500/20 bg-white/5 p-6">
          <div className="flex items-center gap-3"><ShieldCheck className="text-gold-500" /><div><h2 className="text-2xl font-bold">Consultant applications</h2><p className="text-sm text-gray-400">Approve trusted local consultants before they can access consultant features.</p></div></div>
          <div className="mt-5 space-y-4">
            {consultants.length === 0 && <p className="text-sm text-gray-500">No consultant applications yet.</p>}
            {consultants.map((consultant) => <article key={consultant.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{consultant.name}</h3><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wider text-gold-400">{consultant.approvalState}</span></div><p className="text-sm text-gray-400">{consultant.email} · {consultant.phone || 'No phone'} · {consultant.region || 'No region'}</p><p className="mt-3 max-w-3xl text-sm text-gray-300">{consultant.bio}</p></div><div className="flex shrink-0 gap-2">{consultant.approvalState === 'pending' && <><button onClick={() => void review(consultant.id, 'approve')} className="inline-flex items-center gap-1 rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-black"><Check className="h-3 w-3" /> Approve</button><button onClick={() => void review(consultant.id, 'reject')} className="inline-flex items-center gap-1 rounded-lg border border-red-400/30 px-3 py-2 text-xs text-red-300"><X className="h-3 w-3" /> Reject</button></>}{consultant.approvalState === 'approved' && <button onClick={() => void review(consultant.id, 'revoke')} className="rounded-lg border border-red-400/30 px-3 py-2 text-xs text-red-300">Revoke</button>}</div></div>
            </article>)}
          </div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold">Booking queue</h2><p className="mt-1 text-sm text-gray-400">Existing booking requests remain visible while booking operations move to the local API.</p>
          <div className="mt-5 space-y-3">{bookings.length === 0 && <p className="text-sm text-gray-500">No booking requests yet.</p>}{bookings.map((booking) => <div key={booking.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold">{booking.customerName}</p><p className="text-sm text-gray-400">{booking.customerEmail} · {booking.matchTitle || 'Matchday booking'}</p></div><div className="flex items-center gap-2"><span className="rounded-full border border-gold-500/30 px-3 py-1 text-xs uppercase text-gold-400">{booking.status}</span>{booking.status === 'pending' && <><button onClick={() => void updateBookingStatus(booking.id, 'approved')} className="rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-black">Approve</button><button onClick={() => void updateBookingStatus(booking.id, 'declined')} className="rounded-lg border border-red-400/30 px-3 py-2 text-xs text-red-300">Decline</button></>}{booking.status === 'approved' && <button onClick={() => void updateBookingStatus(booking.id, 'paid')} className="rounded-lg border border-green-400/30 px-3 py-2 text-xs text-green-300">Mark paid</button>}</div></div>)}</div>
        </section>
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-sm text-gray-400">Package catalog</p><p className="mt-2 text-3xl font-bold text-gold-500">{packageCount}</p><p className="mt-1 text-xs text-gray-500">Existing local catalog entries</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-sm text-gray-400">Pickup points</p><p className="mt-2 text-3xl font-bold text-gold-500">{pickupCount}</p><p className="mt-1 text-xs text-gray-500">Existing local route entries</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-sm text-gray-400">Site settings</p><p className="mt-2 text-xl font-bold">{siteTitle}</p><p className="mt-1 text-xs text-gray-500">Stored locally for the existing admin experience</p></div>
        </section>
      </div>
    </main>
  );
}
