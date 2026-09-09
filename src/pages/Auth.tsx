import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

type View = 'login' | 'signup' | 'admin' | 'pending' | 'rejected';

export default function Auth() {
  const [params] = useSearchParams();
  const location = useLocation();
  const [view, setView] = useState<View>(location.pathname.endsWith('/pending') ? 'pending' : location.pathname.endsWith('/rejected') ? 'rejected' : params.get('mode') === 'signup' ? 'signup' : params.get('mode') === 'admin' ? 'admin' : 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', region: '', bio: '' });
  const [message, setMessage] = useState<{ text: string; kind: 'error' | 'success' } | null>(null);
  const [saving, setSaving] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      if (view === 'signup') {
        const response = await fetch('/api/auth/consultant/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(form),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to submit application.');
        setView('pending');
      } else {
        const result = await signIn(form.email, form.password, view === 'admin');
        if (result.error) throw Object.assign(new Error(result.error), { code: result.code });
        navigate(view === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === 'PENDING_APPROVAL' || code === 'REJECTED') {
        setView(code === 'PENDING_APPROVAL' ? 'pending' : 'rejected');
        return;
      }
      setMessage({ kind: 'error', text: code === 'PENDING_APPROVAL' ? 'Your application is pending approval.' : code === 'REJECTED' ? 'Your application was rejected. Contact an administrator.' : error instanceof Error ? error.message : 'Unable to complete request.' });
    } finally {
      setSaving(false);
    }
  };

  const isSignup = view === 'signup';
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-10 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <Link to="/" className="text-sm text-gray-400 hover:text-white">← Back to Matchday SA</Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">Self-hosted access</p>
        {(view === 'pending' || view === 'rejected') ? (
          <>
            <h1 className="mt-2 text-3xl font-bold">{view === 'pending' ? 'Application pending approval' : 'Application rejected'}</h1>
            <p className="mt-3 text-gray-300">{view === 'pending' ? 'Thanks for applying. An administrator will review your consultant profile before access is enabled.' : 'Your consultant application was rejected. Please contact the Matchday SA administrator if you need more information.'}</p>
            <button onClick={() => setView('login')} className="mt-6 rounded-xl bg-gold-500 px-4 py-3 font-semibold text-black">Return to login</button>
          </>
        ) : <>
        <h1 className="mt-2 text-3xl font-bold">{view === 'admin' ? 'Administrator login' : isSignup ? 'Apply as a consultant' : 'Welcome back'}</h1>
        <p className="mt-2 text-sm text-gray-400">{isSignup ? 'Submit your profile for administrator approval.' : view === 'admin' ? 'Use the bootstrap administrator credentials.' : 'Sign in to manage your matchday experience.'}</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          {isSignup && <input required minLength={2} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="auth-input" />}
          <input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="auth-input" />
          <input required minLength={10} type="password" placeholder="Password (10+ characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="auth-input" />
          {isSignup && <>
            <input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="auth-input" />
            <input placeholder="Region / province" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="auth-input" />
            <textarea required minLength={20} placeholder="Tell us about your experience (20+ characters)" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="auth-input min-h-28" />
          </>}
          {message && <div className={`rounded-xl border px-4 py-3 text-sm ${message.kind === 'error' ? 'border-red-400/30 bg-red-500/10 text-red-200' : 'border-green-400/30 bg-green-500/10 text-green-200'}`}>{message.text}</div>}
          <button disabled={saving} className="w-full rounded-xl bg-gold-500 px-4 py-3 font-semibold text-black disabled:opacity-50">{saving ? 'Please wait…' : isSignup ? 'Submit application' : 'Sign in'}</button>
        </form>
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-400">
          {view !== 'login' && <button onClick={() => setView('login')} className="hover:text-white">Consultant / customer login</button>}
          {view === 'login' && <button onClick={() => setView('signup')} className="hover:text-white">Apply as consultant</button>}
          {view !== 'admin' && <button onClick={() => setView('admin')} className="hover:text-white">Admin login</button>}
        </div>
        </>}
      </div>
    </main>
  );
}
