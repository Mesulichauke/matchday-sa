import { useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import Layout from '@/components/Layout';
import TownshipTourCard from '@/components/TownshipTourCard';
import { townshipTours } from '@/data/townshipTours';

const provinces = ['All Provinces', 'Gauteng', 'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'KZN'];
const townshipHeroBackground =
  `linear-gradient(90deg, rgba(7,10,12,0.92) 0%, rgba(7,10,12,0.72) 44%, rgba(16,74,42,0.42) 100%), radial-gradient(circle at top right, rgba(255,215,0,0.18), transparent 34%), url('${import.meta.env.BASE_URL}images/township-experience-hero.jpg')`;

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
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0c1014] text-white shadow-2xl">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: townshipHeroBackground }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
          <div className="relative mx-auto max-w-4xl px-6 py-16 text-center sm:px-10 sm:py-20">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FFD700]">Township tours</p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Full-day experiences, led locally.</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">
              Choose from 22 eight-hour township tours across six provinces—walking routes, food, culture, shebeens and shisanyama lunch included.
            </p>
          </div>
        </section>
        <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5"><div className="flex flex-col gap-4 md:flex-row"><label htmlFor="tour-search" className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input id="tour-search" name="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search townships, attractions or experiences..." className="w-full rounded-lg border border-white/20 bg-black/20 py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:border-gold-500 focus:outline-none" /></label><label htmlFor="tour-province" className="relative md:w-52"><Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><select id="tour-province" name="province" value={selectedProvince} onChange={(event) => setSelectedProvince(event.target.value)} className="w-full appearance-none rounded-lg border border-white/20 bg-black/20 py-3 pl-10 pr-4 text-white focus:border-gold-500 focus:outline-none">{provinces.map((province) => <option key={province} value={province} className="bg-black">{province}</option>)}</select></label></div><p className="mt-4 text-sm text-gray-400">{filteredTours.length} full-day tours found</p></section>
        {filteredTours.length ? <section className="mt-8 grid gap-6 lg:grid-cols-2">{filteredTours.map((tour) => <TownshipTourCard key={tour.id} tour={tour} />)}</section> : <section className="py-16 text-center"><h2 className="text-xl font-semibold">No tours found</h2><p className="mt-2 text-gray-400">Try another province or search term.</p></section>}
        <section className="mt-12 overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0d0f] text-center text-white">
          <div className="bg-cover bg-center p-8 sm:p-10" style={{ backgroundImage: townshipHeroBackground }}>
            <div className="rounded-[24px] border border-white/10 bg-black/45 p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold tracking-[-0.03em]">Not sure where to start?</h2>
              <p className="mx-auto mt-3 max-w-2xl text-white/80">Tell us your preferred province, date and group size and we’ll help plan your full-day experience.</p>
              <a href={enquiryLink} className="mt-6 inline-flex rounded-md bg-[#FFD700] px-6 py-3 font-semibold text-black hover:bg-[#f8cf2f]">Plan a township tour</a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
