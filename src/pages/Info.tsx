import { Link, useParams } from 'react-router-dom';

const content: Record<string, { title: string; body: string }> = {
  about: { title: 'About Matchday SA', body: 'We connect supporters to matchday experiences, pickup planning, community routes, and group travel.' },
  safety: { title: 'Safety', body: 'Pickup details are confirmed before travel. Customers can choose a listed point or request support where transport access is limited.' },
  terms: { title: 'Terms and booking policy', body: 'A reservation holds seats subject to availability and a successful payment. Pickup times and final boarding points are confirmed before travel. If a minimum group is not reached, Matchday SA will offer a suitable alternative, credit, or refund in line with the final booking terms supplied before payment.' },
  privacy: { title: 'Privacy notice', body: 'We use your name, contact details, booking preferences, and pickup selection only to manage your booking, payment instructions, customer support, and travel coordination. Card details are never collected or stored by this website. Contact us to request access to or deletion of your personal information.' },
  contact: { title: 'Contact us', body: 'Email info@matchday.sa or use the corporate enquiry form to plan a group experience.' },
};

export default function Info() {
  const { topic = 'about' } = useParams();
  const page = content[topic] ?? content.about;
  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">Matchday SA</p>
        <h1 className="mt-3 text-3xl font-bold">{page.title}</h1>
        <p className="mt-4 leading-7 text-gray-300">{page.body}</p>
        <Link to="/" className="mt-8 inline-flex rounded-xl bg-gold-500 px-5 py-3 font-semibold text-black">Back home</Link>
      </div>
    </main>
  );
}
