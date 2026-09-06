import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, Clock, MapPin, Users, X } from 'lucide-react';
import type { TownshipTour } from '@/data/townshipTours';

type Props = { tour: TownshipTour };

export default function TownshipTourCard({ tour }: Props) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-gold-500/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2"><span className="rounded-full bg-gold-500/15 px-3 py-1 text-xs font-medium text-gold-500">{tour.province}</span><span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-400">{tour.duration} · 8 hours</span></div>
          <h2 className="mt-3 text-xl font-semibold">{tour.name}</h2>
        </div>
        <span className="whitespace-nowrap text-xl font-bold text-gold-500">R{tour.price}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-gray-400">{tour.description}</p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400"><span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-gold-500" />{tour.township}</span><span className="flex items-center gap-1"><Clock className="h-4 w-4 text-gold-500" />Full day</span><span className="flex items-center gap-1"><Users className="h-4 w-4 text-gold-500" />Max {tour.maxGroupSize}</span></div>
      <div className="mt-4 flex flex-wrap gap-2">{tour.keyAttractions.slice(0, 3).map((attraction) => <span key={attraction} className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">{attraction}</span>)}<span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">+{tour.keyAttractions.length - 3} more</span></div>
      <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-gold-500 hover:text-gold-400">{expanded ? 'Hide itinerary' : 'Show full itinerary'} <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} /></button>
      {expanded && <div className="mt-4 border-t border-white/10 pt-4"><h3 className="font-medium">Your day</h3><ol className="mt-3 space-y-2">{tour.itinerary.map((item) => <li key={`${item.time}-${item.activity}`} className="grid grid-cols-[3.5rem_1fr] gap-3 text-sm"><span className="font-medium text-gold-500">{item.time}</span><span className="text-gray-300">{item.activity}<span className="block text-xs text-gray-500">{item.location}</span></span></li>)}</ol><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><h4 className="text-sm font-medium">Included</h4>{tour.inclusions.map((item) => <p key={item} className="mt-1 flex gap-1 text-xs text-gray-400"><Check className="h-3.5 w-3.5 text-green-400" />{item}</p>)}</div><div><h4 className="text-sm font-medium">Not included</h4>{tour.exclusions.map((item) => <p key={item} className="mt-1 flex gap-1 text-xs text-gray-400"><X className="h-3.5 w-3.5 text-red-400" />{item}</p>)}</div></div></div>}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4"><p className="text-xs text-gray-400">Guide: {tour.guide.name} · {tour.guide.experience}</p><Link to={`/tour/${tour.id}`} className="rounded-md bg-gold-500 px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-gold-600">View tour</Link></div>
      <p className="mt-2 text-xs text-gray-500">Group rate: R{tour.groupPrice} per person for 10+ guests.</p>
    </article>
  );
}
