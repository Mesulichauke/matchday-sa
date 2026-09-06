import { useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import Layout from '@/components/Layout';
import TownshipTourCard from '@/components/TownshipTourCard';
import { townshipTours } from '@/data/townshipTours';

const provinces = ['All Provinces', 'Gauteng', 'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'KZN'];

export default function Tours() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const filteredTours = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return townshipTours.filter((tour) => (!query || [tour.name, tour.township, tour.province, tour.description, ...tour.keyAttractions].some((value) => value.toLowerCase().includes(query))) && (selectedProvince === 'All Provinces' || tour.province === selectedProvince));
  }, [searchQuery, selectedProvince]);
  const enquiryLink = 'mailto:info@matchday.sa?subject=Township%20tour%20enquiry';

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">Township tours</p><h1 className="mt-3 text-4xl font-bold sm:text-5xl">Full-day experiences, led locally.</h1><p className="mt-4 text-lg text-gray-400">Choose from 22 eight-hour township tours across six provinces—walking routes, food, culture, shebeens and shisanyama lunch included.</p></section>
        <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5"><div className="flex flex-col gap-4 md:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search townships, attractions or experiences..." className="w-full rounded-lg border border-white/20 bg-black/20 py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:border-gold-500 focus:outline-none" /></label><label className="relative md:w-52"><Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><select value={selectedProvince} onChange={(event) => setSelectedProvince(event.target.value)} className="w-full appearance-none rounded-lg border border-white/20 bg-black/20 py-3 pl-10 pr-4 text-white focus:border-gold-500 focus:outline-none">{provinces.map((province) => <option key={province} value={province} className="bg-black">{province}</option>)}</select></label></div><p className="mt-4 text-sm text-gray-400">{filteredTours.length} full-day tours found</p></section>
        {filteredTours.length ? <section className="mt-8 grid gap-6 lg:grid-cols-2">{filteredTours.map((tour) => <TownshipTourCard key={tour.id} tour={tour} />)}</section> : <section className="py-16 text-center"><h2 className="text-xl font-semibold">No tours found</h2><p className="mt-2 text-gray-400">Try another province or search term.</p></section>}
        <section className="mt-12 rounded-2xl bg-gradient-to-r from-green-900/50 to-black p-8 text-center"><h2 className="text-2xl font-bold">Not sure where to start?</h2><p className="mx-auto mt-3 max-w-2xl text-gray-300">Tell us your preferred province, date and group size and we’ll help plan your full-day experience.</p><a href={enquiryLink} className="mt-6 inline-flex rounded-md bg-gold-500 px-6 py-3 font-semibold text-black hover:bg-gold-600">Plan a township tour</a></section>
      </div>
    </Layout>
  );
}
