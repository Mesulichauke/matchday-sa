import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  MapPin,
  Users,
} from 'lucide-react';
import { chiefsFixtures } from '@/data/chiefsFixtures';
import { cupFixtures } from '@/data/cupFixtures';
import { piratesFixtures } from '@/data/piratesFixtures';
import { sundownsFixtures } from '@/data/sundownsFixtures';
import { rugbyFixtures } from '@/data/rugbyFixtures';
import { defaultPickupPoints, mergePickupPoints, type PickupPoint } from '@/data/pickupPoints';
import { buildTripPlan, minimumTripPassengers } from '@/data/tripGrouping';
import { api } from '../../convex/_generated/api';

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

const allFixtures: Fixture[] = [...piratesFixtures, ...chiefsFixtures, ...sundownsFixtures, ...cupFixtures, ...rugbyFixtures] as Fixture[];

const famousTownships = [
  'Soweto',
  'Alexandra',
  'Katlehong',
  'Tembisa',
  'KwaMashu',
  'Khayelitsha',
  'Mdantsane',
  'Langa',
  'Diepsloot',
  'Mamelodi',
  'Soshanguve',
  'Bela-Bela',
];

type PackageOption = {
  id: string;
  title: string;
  description: string;
  price: number;
  badge: string;
  features: string[];
};

type AdminPackage = {
  id: string;
  title: string;
  category: 'home' | 'away' | 'neutral' | 'camping' | 'viewing' | 'season';
  price: number;
  format: string;
  description: string;
  includes: string[];
  active: boolean;
};

type AdminPickup = PickupPoint;

const readStoredValue = <T,>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const homePackages: PackageOption[] = [
  {
    id: 'home-basics',
    title: 'Matchday Essentials',
    description: 'Ticket, local transport, and stadium arrival support for a smooth home matchday.',
    price: 180,
    badge: 'Popular',
    features: ['Match ticket', 'Transport to stadium', 'Stadium arrival coordination'],
  },
  {
    id: 'home-premier',
    title: 'Premier Home Experience',
    description: 'Premium matchday flow with guided township experience and VIP-style service.',
    price: 320,
    badge: 'Best value',
    features: ['Everything in Essentials', 'Guided township stop', 'Priority check-in support'],
  },
  {
    id: 'home-family',
    title: 'Family Matchday',
    description: 'A relaxed family-friendly package with simple planning and group extras.',
    price: 420,
    badge: 'Family',
    features: ['Family-ready transfers', 'Group seating support', 'Post-match local guide'],
  },
];

const awayPackages: PackageOption[] = [
  {
    id: 'away-essentials',
    title: 'Away Essentials',
    description: 'Away trip support for travel, hotel transfer, and matchday logistics.',
    price: 260,
    badge: 'Popular',
    features: ['Transport to city', 'Hotel pickup coordination', 'Matchday support'],
  },
  {
    id: 'away-journey',
    title: 'Away Journey Plus',
    description: 'A complete away-day package with city arrival support and local host assistance.',
    price: 440,
    badge: 'Most booked',
    features: ['Everything in Essentials', 'City arrival coordination', 'Local host guidance'],
  },
  {
    id: 'away-vip',
    title: 'Away VIP Weekend',
    description: 'Premium away experience for clients who want a full travel-and-matchday package.',
    price: 680,
    badge: 'VIP',
    features: ['Luxury transfer support', 'Priority hospitality', 'Full trip coordination'],
  },
];

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

const provinceCoverage: Record<string, string[]> = {
  Gauteng: ['Johannesburg', 'Pretoria', 'Soweto', 'East Rand'],
  'KwaZulu-Natal': ['Durban', 'North Coast', 'South Coast', 'Midlands'],
  Limpopo: ['Polokwane', 'Mankweng', 'North Loop', 'Lowveld'],
  Mpumalanga: ['Mbombela', 'Witbank', 'Lowveld', 'Highlands'],
  'Western Cape': ['Cape Town', 'Cape Flats', 'Winelands', 'Garden Route'],
  'Eastern Cape': ['Gqeberha', 'King Williamstown', 'East London', 'Wild Coast'],
  'North West': ['Rustenburg', 'Mahikeng', 'Potchefstroom', 'Platinum Belt'],
  'Free State': ['Bloemfontein', 'Welkom', 'QwaQwa', 'Golden Triangle'],
  'Northern Cape': ['Kimberley', 'Upington', 'Springbok', 'Namaqualand'],
};

const pickupCatalog: Record<string, Array<{ name: string; zone: string; address: string; type: string }>> = Object.fromEntries(
  Object.entries(provinceCoverage).map(([province, sectors]) => {
    const primaryZones = ['North', 'East', 'South', 'West'];
    const secondaryZones = ['1', '2', '3', '4'];
    const microZones = ['A', 'B', 'C', 'D'];

    const points = sectors.flatMap((sector, sectorIndex) =>
      primaryZones.flatMap((primary, primaryIndex) =>
        secondaryZones.flatMap((secondary, secondaryIndex) =>
          microZones.map((micro, microIndex) => {
            const zone = `${primary}-${secondary}${micro}`;
            const pointNumber = (sectorIndex + 1) * 12 + (primaryIndex + 1) * 5 + (secondaryIndex + 1) * 2 + (microIndex + 1);
            return {
              name: `Matchday SA ${province} ${sector} ${zone} ${pointNumber}`,
              zone,
              address: `${sector}, ${zone}, ${province}, South Africa`,
              type: pointNumber % 5 === 0 ? 'Local office' : 'Main office',
            };
          }),
        ),
      ),
    );

    return [province, points];
  }),
);

const teamProvinceMap: Record<string, string> = {
  'Orlando Pirates': 'Gauteng',
  'Kaizer Chiefs': 'Gauteng',
  'Mamelodi Sundowns': 'Gauteng',
  'AmaZulu': 'KwaZulu-Natal',
  'Golden Arrows': 'KwaZulu-Natal',
  'Richards Bay FC': 'KwaZulu-Natal',
  'Durban City': 'KwaZulu-Natal',
  'Royal AM': 'KwaZulu-Natal',
  'Polokwane City': 'Limpopo',
  'Sekhukhune United': 'Limpopo',
  'Marumo Gallants': 'Limpopo',
  'TS Galaxy': 'Mpumalanga',
  'Kruger United': 'Mpumalanga',
  'Cape Town City': 'Western Cape',
  'Stellenbosch FC': 'Western Cape',
  'Chippa United': 'Eastern Cape',
  'Siwelele': 'Free State',
  'Siwelele FC': 'Free State',
  'Milford FC': 'Gauteng',
  'Maritzburg United': 'KwaZulu-Natal',
  'Pirates': 'Gauteng',
  'Chiefs': 'Gauteng',
};

const provinceCoordinates: Record<string, { lat: number; lng: number }> = {
  Gauteng: { lat: -26.2041, lng: 28.0473 },
  'KwaZulu-Natal': { lat: -29.8587, lng: 31.0218 },
  Limpopo: { lat: -23.8977, lng: 29.4486 },
  Mpumalanga: { lat: -25.4745, lng: 30.9694 },
  'Western Cape': { lat: -33.9249, lng: 18.4241 },
  'Eastern Cape': { lat: -33.9608, lng: 25.6022 },
  'North West': { lat: -25.7449, lng: 27.0779 },
  'Free State': { lat: -29.0852, lng: 26.1596 },
  'Northern Cape': { lat: -28.7463, lng: 24.7709 },
};

const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getMatchTeamProvince = (match: Fixture | null) => {
  if (!match) return null;
  if (teamProvinceMap[match.team]) return teamProvinceMap[match.team];
  if (teamProvinceMap[match.opponent]) return teamProvinceMap[match.opponent];
  return match.province || null;
};

const resolvePickupRegion = (match: Fixture | null, clientType: 'home' | 'away', userProvince?: string | null) => {
  if (!match) return 'Gauteng';
  if (clientType === 'home') return 'Gauteng';
  if (userProvince) return userProvince;
  return getMatchTeamProvince(match) || match.province || 'Gauteng';
};

type PickupOption = {
  name: string;
  zone: string;
  address: string;
  type: string;
  province?: string;
  isDoorToDoor?: boolean;
};

const getPickupOptionsForMatch = (
  match: Fixture | null,
  clientType: 'home' | 'away',
  storedPickups: AdminPickup[] = [],
  userProvince?: string | null,
) => {
  const region = resolvePickupRegion(match, clientType, userProvince);

  if (storedPickups.length) {
    return storedPickups
      // Keep nationwide points available here; the province selector below is
      // responsible for narrowing the list after a customer chooses a province.
      .filter((pickup) => pickup.active)
      .map((pickup) => ({
        name: pickup.name,
        zone: pickup.zone,
        address: pickup.address,
        province: pickup.province,
        type: pickup.city === 'Johannesburg' || pickup.city === 'Pretoria' || pickup.city === 'Soweto' ? 'Main office' : 'Local office',
      }));
  }

  const fallback = pickupCatalog[region] || [
    { name: `Matchday SA ${region} Office`, zone: 'Main', address: `${region} City Centre, South Africa`, province: region, type: 'Main office' }
  ];

  return fallback;
};

const getNearestProvince = (lat: number, lng: number) => {
  let nearestProvince = 'Gauteng';
  let shortestDistance = Number.POSITIVE_INFINITY;

  Object.entries(provinceCoordinates).forEach(([province, coord]) => {
    const distance = getDistanceKm(lat, lng, coord.lat, coord.lng);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestProvince = province;
    }
  });

  return nearestProvince;
};

const inferProvinceFromText = (value: string) => {
  const cleaned = value.toLowerCase();

  const keywords: Record<string, string[]> = {
    Gauteng: ['johannesburg', 'pretoria', 'sandton', 'rosebank', 'soweto', 'alexandra', 'diepsloot', 'mamelodi', 'soshanguve', 'tembisa', 'katlehong'],
    'KwaZulu-Natal': ['durban', 'kwamashu', 'umlazi', 'pietermaritzburg', 'richards bay', 'kzn'],
    Limpopo: ['polokwane', 'mankweng', 'levubu', 'seshego', 'phaalaborwa', 'thohoyandou'],
    Mpumalanga: ['nelspruit', 'mbombela', 'ka nyamazane', 'witbank', 'emalahleni', 'lydenburg'],
    'Western Cape': ['cape town', 'khayelitsha', 'gugulethu', 'stellenbosch', 'paarl', 'mitchells plain'],
    'Eastern Cape': ['gqeberha', 'port elizabeth', 'east london', 'mdantsane', 'king williamstown', 'mthatha'],
    'North West': ['rustenburg', 'mafikeng', 'potchefstroom', 'klerksdorp'],
    'Free State': ['bloemfontein', 'boshof', 'welkom', 'sasolburg'],
    'Northern Cape': ['kimberley', 'upington', 'springbok', 'namaqualand', 'de aar'],
  };

  for (const [province, terms] of Object.entries(keywords)) {
    if (terms.some((term) => cleaned.includes(term))) {
      return province;
    }
  }

  return null;
};

const sortPickupOptionsByRegion = (options: PickupOption[], region?: string | null) => {
  if (!region || options.length < 2) return options;

  const regionCenter = provinceCoordinates[region] || provinceCoordinates.Gauteng;

  return [...options].sort((a, b) => {
    const provinceA = a.province || region;
    const provinceB = b.province || region;
    const provincePriorityA = provinceA === region ? 0 : 1;
    const provincePriorityB = provinceB === region ? 0 : 1;

    if (provincePriorityA !== provincePriorityB) {
      return provincePriorityA - provincePriorityB;
    }

    const distanceA = getDistanceKm(
      regionCenter.lat,
      regionCenter.lng,
      provinceCoordinates[provinceA]?.lat ?? regionCenter.lat,
      provinceCoordinates[provinceA]?.lng ?? regionCenter.lng,
    );
    const distanceB = getDistanceKm(
      regionCenter.lat,
      regionCenter.lng,
      provinceCoordinates[provinceB]?.lat ?? regionCenter.lat,
      provinceCoordinates[provinceB]?.lng ?? regionCenter.lng,
    );

    if (Math.abs(distanceA - distanceB) > 0.0001) {
      return distanceA - distanceB;
    }

    return a.zone.localeCompare(b.zone);
  });
};

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<'match' | 'city' | 'pickup' | 'booking'>('match');
  const [selectedMatch, setSelectedMatch] = useState<Fixture | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedPickup, setSelectedPickup] = useState<{ name: string; zone: string; address: string; type: string; province?: string; isDoorToDoor?: boolean } | null>(null);
  const [clientType, setClientType] = useState<'home' | 'away'>('home');
  const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(null);
  const [pickupProvinceFilter, setPickupProvinceFilter] = useState<string>('all');
  const [userProvince, setUserProvince] = useState<string | null>(() => readStoredValue('matchday-sa-location-province', null));
  const [userLocationLabel, setUserLocationLabel] = useState<string>(() => readStoredValue('matchday-sa-location-label', ''));
  const [manualLocation, setManualLocation] = useState<string>('');
  const [locationError, setLocationError] = useState<string>('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'granted' | 'denied' | 'unsupported'>('idle');
  const [includeTicket, setIncludeTicket] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'full' | 'bnpl'>('full');
  const [storedPackages, setStoredPackages] = useState<AdminPackage[]>(() => readStoredValue('matchday-sa-packages', []));
  const [storedPickups, setStoredPickups] = useState<AdminPickup[]>(() => mergePickupPoints(readStoredValue('matchday-sa-pickups', defaultPickupPoints)));
  const tripBookings = useQuery(
    api.bookings.forTrip,
    selectedMatch && selectedPackage
      ? { matchId: String(selectedMatch.id), packageId: selectedPackage.id }
      : 'skip',
  );

  const routeFixture = useMemo(() => {
    if (!id) return null;
    return allFixtures.find((fixture) => fixture.id === id) ?? null;
  }, [id]);

  useEffect(() => {
    const syncAdminData = () => {
      setStoredPackages(readStoredValue('matchday-sa-packages', []));
      setStoredPickups(mergePickupPoints(readStoredValue('matchday-sa-pickups', defaultPickupPoints)));
    };

    syncAdminData();
    window.addEventListener('storage', syncAdminData);
    return () => window.removeEventListener('storage', syncAdminData);
  }, []);

  const packageOptions = useMemo(() => {
    const adminPackages = storedPackages.filter((pkg) => pkg.active && pkg.category === clientType).map((pkg) => ({
      id: pkg.id,
      title: pkg.title,
      description: pkg.description,
      price: pkg.price,
      badge: pkg.format.replace('_', ' '),
      features: pkg.includes,
    }));

    return adminPackages.length ? adminPackages : clientType === 'away' ? awayPackages : homePackages;
  }, [clientType, storedPackages]);

  const pickupOptions = useMemo(() => {
    const options = getPickupOptionsForMatch(selectedMatch, clientType, storedPickups, userProvince);
    return sortPickupOptionsByRegion(options, userProvince || resolvePickupRegion(selectedMatch, clientType, userProvince));
  }, [selectedMatch, clientType, storedPickups, userProvince]);

  const pickupProvinceOptions = useMemo(() => {
    const options = new Set<string>(['all', ...allProvinces]);
    pickupOptions.forEach((pickup) => {
      if (pickup.province) options.add(pickup.province);
    });
    if (userProvince) options.add(userProvince);
    if (selectedMatch) options.add(resolvePickupRegion(selectedMatch, clientType, userProvince));
    return Array.from(options).sort((a, b) => {
      if (a === 'all') return -1;
      if (b === 'all') return 1;
      return a.localeCompare(b);
    });
  }, [pickupOptions, selectedMatch, clientType, userProvince]);

  useEffect(() => {
    if (!pickupProvinceFilter || pickupProvinceFilter === 'all') {
      const preferredProvince = userProvince || resolvePickupRegion(selectedMatch, clientType, userProvince);
      if (preferredProvince && pickupProvinceOptions.includes(preferredProvince)) {
        setPickupProvinceFilter(preferredProvince);
      }
    }
  }, [pickupProvinceFilter, pickupProvinceOptions, selectedMatch, clientType, userProvince]);

  const filteredPickupOptions = useMemo(() => {
    if (pickupProvinceFilter === 'all') return pickupOptions;
    return pickupOptions.filter((pickup) => (pickup.province || resolvePickupRegion(selectedMatch, clientType, userProvince)) === pickupProvinceFilter);
  }, [pickupOptions, pickupProvinceFilter, selectedMatch, clientType, userProvince]);

  const tripPlan = useMemo(() => {
    const province = selectedPickup?.province || userProvince || pickupProvinceFilter || 'Gauteng';
    return buildTripPlan(province, tripBookings ?? [], passengers);
  }, [passengers, pickupProvinceFilter, selectedPickup?.province, tripBookings, userProvince]);

  useEffect(() => {
    if (!selectedMatch) return;
    const nextPackage = selectedMatch.type === 'away' || clientType === 'away' ? awayPackages[0] : homePackages[0];
    setSelectedPackage((current) => current && packageOptions.some((option) => option.id === current.id) ? current : nextPackage);
  }, [clientType, selectedMatch, packageOptions]);

  useEffect(() => {
    if (routeFixture) {
      setSelectedMatch(routeFixture);
      setSelectedCity(routeFixture.city);
      setClientType(routeFixture.type === 'away' ? 'away' : 'home');
      setSelectedPackage(null);
      setSelectedPickup(null);
      setStep('booking');
    }
  }, [routeFixture]);

  useEffect(() => {
    if (!selectedMatch) return;
    setSelectedPickup((current) => {
      if (current?.isDoorToDoor) {
        return current;
      }
      if (current && pickupOptions.some((pickup) => pickup.name === current.name)) {
        return current;
      }
      return pickupOptions[0] ?? null;
    });
  }, [selectedMatch, clientType, pickupOptions]);

  const handleSelectMatch = (match: Fixture) => {
    setSelectedMatch(match);
    setSelectedCity(match.city);
    setClientType(match.type === 'away' ? 'away' : 'home');
    setSelectedPackage(null);
    setSelectedPickup(null);
    setStep('booking');
  };

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setStep('booking');
  };

  useEffect(() => {
    if (!selectedPackage) {
      setSelectedPickup(null);
      return;
    }

    setSelectedPickup((current) => {
      if (current?.isDoorToDoor) {
        return current;
      }
      if (current && pickupOptions.some((pickup) => pickup.name === current.name)) {
        return current;
      }
      const defaultPickup = pickupOptions[0] ?? null;
      return defaultPickup;
    });
  }, [selectedPackage, pickupOptions]);

  useEffect(() => {
    if (!pickupProvinceFilter || pickupProvinceFilter === 'all') return;
    if (!pickupProvinceOptions.includes(pickupProvinceFilter)) {
      setPickupProvinceFilter('all');
    }
  }, [pickupProvinceFilter, pickupProvinceOptions]);

  useEffect(() => {
    if (!selectedPickup || selectedPickup.isDoorToDoor) return;
    if (filteredPickupOptions.length === 0) {
      setSelectedPickup(null);
      return;
    }
    if (!filteredPickupOptions.some((pickup) => pickup.name === selectedPickup.name)) {
      setSelectedPickup(filteredPickupOptions[0]);
    }
  }, [filteredPickupOptions, selectedPickup]);

  const applyLocationSelection = (province: string, label: string) => {
    setUserProvince(province);
    setUserLocationLabel(label);
    localStorage.setItem('matchday-sa-location-province', JSON.stringify(province));
    localStorage.setItem('matchday-sa-location-label', JSON.stringify(label));
    setLocationStatus('granted');
    setPickupProvinceFilter(province);
    setSelectedPickup(null);
  };

  const handleUseCurrentLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationStatus('unsupported');
      setLocationError('Location access is not available in this browser. Please use your suburb or address instead.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detectedProvince = getNearestProvince(position.coords.latitude, position.coords.longitude);
        const locationLabel = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
        applyLocationSelection(detectedProvince, locationLabel);
        setLocationError('');
      },
      (error) => {
        setLocationStatus('denied');
        setLocationError(
          error.code === 1
            ? 'Location permission was denied. Please enter your suburb or address to continue.'
            : 'Your browser could not share a location. Choose your province below to see the closest pickup routes immediately.',
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 },
    );
  };

  const handleManualLocationSubmit = () => {
    const trimmed = manualLocation.trim();
    if (!trimmed) {
      setLocationError('Please enter a suburb or address to continue.');
      return;
    }

    const inferredProvince = inferProvinceFromText(trimmed) ?? selectedMatch?.province ?? 'Gauteng';
    applyLocationSelection(inferredProvince, trimmed);
    setManualLocation(trimmed);
    setLocationError('');
  };

  const handleSelectPickup = (pickup: { name: string; zone: string; address: string; type: string; province?: string; isDoorToDoor?: boolean }) => {
    setSelectedPickup(pickup);
    setStep('booking');
  };

  const handleBack = () => {
    setStep('match');
  };

  const ticketPrice = selectedMatch?.price || 0;
  const packagePrice = selectedPackage?.price || 0;
  const ticketTotal = includeTicket ? ticketPrice * passengers : 0;
  const packageTotal = packagePrice * passengers;
  const totalPrice = packageTotal + ticketTotal;
  const spacesLeft = tripPlan.spacesToActivate;
  const tripActivated = tripPlan.isActive;
  const tripThresholdRemaining = tripPlan.spacesToActivate;

  const handleConfirmBooking = () => {
    navigate('/checkout', {
      state: {
        booking: {
          match: selectedMatch,
          package: selectedPackage,
          pickup: selectedPickup,
          passengers,
          includeTicket,
          paymentMethod,
          ticketTotal,
          packageTotal,
          totalPrice,
          clientType,
          userProvince,
          tripGroupId: `${String(selectedMatch?.id ?? 'match')}-${selectedPackage?.id ?? 'package'}-${tripPlan.groupedRegions.join('-')}`,
          tripRegions: tripPlan.groupedRegions,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">MD</div>
            <span className="text-lg font-bold">MatchDay SA</span>
          </Link>
          <Link to="/dashboard" className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-center gap-4">
          {['Match', 'City', 'Pickup', 'Book'].map((label, index) => {
            const stepIndex = ['match', 'city', 'pickup', 'booking'].indexOf(step);
            const isActive = index <= stepIndex;
            return (
              <div key={index} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${isActive ? 'bg-gold-500 text-black' : 'bg-white/10 text-gray-500'}`}>
                  {index + 1}
                </div>
                <span className={`text-sm ${isActive ? 'text-white' : 'text-gray-500'}`}>{label}</span>
                {index < 3 && <ChevronRight className="h-4 w-4 text-gray-500" />}
              </div>
            );
          })}
        </div>

        {step === 'match' && (
          <div>
            <h1 className="mb-6 text-2xl font-bold">Choose Your Match</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allFixtures.map((match) => (
                <button
                  key={match.id}
                  onClick={() => handleSelectMatch(match)}
                  className="rounded-xl border border-white/10 bg-white/5 p-6 text-left transition-all hover:border-gold-500/50"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded-full bg-gold-500/20 px-3 py-1 text-xs font-medium text-gold-500">
                      {match.category.split('·')[0].trim() || match.category}
                    </span>
                    <span className="text-xs text-gray-500">{match.totalSpots} spots left</span>
                  </div>
                  <h3 className="text-lg font-semibold transition-colors hover:text-gold-500">{match.title || `${match.team} vs ${match.opponent}`}</h3>
                  <p className="mb-2 text-sm text-gray-400">{match.team} vs {match.opponent}</p>
                  <div className="space-y-1 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(match.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {match.venue}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-xl font-bold text-gold-500">R{match.price}</span>
                    <span className="flex items-center gap-1 text-sm text-gold-500">Select <ChevronRight className="h-4 w-4" /></span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'booking' && selectedMatch && selectedPackage && (
          <div>
            <button onClick={handleBack} className="mb-4 flex items-center gap-1 text-sm text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back to pickup points
            </button>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 via-white/5 to-transparent shadow-2xl shadow-black/20">
                  <div className="border-b border-white/10 bg-gradient-to-r from-[#1A8A3F]/25 via-[#0a0a0a] to-[#1A8A3F]/10 p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-gold-500/40 bg-gold-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-500">
                        {selectedMatch.category || 'Football'}
                      </span>
                      {selectedMatch.featured && (
                        <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300">
                          Featured
                        </span>
                      )}
                    </div>

                    <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
                      {selectedMatch.title || `${selectedMatch.team} vs ${selectedMatch.opponent}`}
                    </h1>
                    <p className="mt-2 text-base text-gray-300">
                      {selectedMatch.team} vs {selectedMatch.opponent}
                    </p>
                  </div>

                  <div className="grid gap-4 p-6 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-400">
                        <Calendar className="h-4 w-4 text-gold-500" /> Date
                      </div>
                      <p className="text-sm font-medium text-white">
                        {new Date(selectedMatch.date).toLocaleDateString('en-ZA', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-400">
                        <MapPin className="h-4 w-4 text-gold-500" /> Venue
                      </div>
                      <p className="text-sm font-medium text-white">{selectedMatch.venue}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-400">
                        <Users className="h-4 w-4 text-gold-500" /> Spots
                      </div>
                      <p className="text-sm font-medium text-white">{selectedMatch.totalSpots} available</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h2 className="mb-4 text-xl font-bold">Booking Summary</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 py-2">
                      <span className="text-gray-400">Match</span>
                      <span className="font-semibold">{selectedMatch.title || `${selectedMatch.team} vs ${selectedMatch.opponent}`}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 py-2">
                      <span className="text-gray-400">Teams</span>
                      <span>{selectedMatch.team} vs {selectedMatch.opponent}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 py-2">
                      <span className="text-gray-400">Date & Time</span>
                      <span>{new Date(selectedMatch.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })} at {selectedMatch.time}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 py-2">
                      <span className="text-gray-400">Venue</span>
                      <span>{selectedMatch.venue}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 py-2">
                      <span className="text-gray-400">Pickup Point</span>
                      <span className="font-semibold">{selectedPickup?.name ?? 'Choose a pickup point'}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 py-2">
                      <span className="text-gray-400">Pickup Address</span>
                      <span className="text-right text-sm">{selectedPickup?.address ?? 'Not selected yet'}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Client type</p>
                      <h2 className="mt-1 text-xl font-bold">Choose your package</h2>
                    </div>
                    <div className="flex rounded-full border border-white/10 bg-black/30 p-1">
                      {(['home', 'away'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setClientType(type);
                            setSelectedPackage(null);
                            setSelectedPickup(null);
                          }}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all ${
                            clientType === type ? 'bg-gold-500 text-black' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {type === 'home' ? 'Home client' : 'Away client'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {packageOptions.map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setSelectedPickup(null);
                        }}
                        className={`rounded-2xl border p-4 text-left transition-all ${
                          selectedPackage?.id === pkg.id
                            ? 'border-gold-500 bg-gold-500/10 shadow-lg shadow-gold-500/10'
                            : 'border-white/10 bg-black/20 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="inline-flex rounded-full border border-gold-500/30 bg-gold-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-gold-500">
                              {pkg.badge}
                            </span>
                            <h3 className="mt-3 text-lg font-semibold text-white">{pkg.title}</h3>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gold-500">R{pkg.price}</div>
                            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400">per person</div>
                          </div>
                        </div>

                        <p className="mt-3 text-sm text-gray-300">{pkg.description}</p>

                        <ul className="mt-4 space-y-2 text-sm text-gray-400">
                          {pkg.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedPackage && (
                  <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Pickup points</p>
                        <h2 className="mt-1 text-xl font-bold">
                          {userProvince ? `${userProvince} pickup points near you` : 'Find pickup points near you'}
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-gold-500 transition-colors hover:bg-gold-500/20"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Add my location
                      </button>
                    </div>

                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-400">
                      <p>
                        {userProvince
                          ? `Showing the closest available pickup zones in ${userProvince}. Choose the one that suits you.`
                          : 'Add your location and we will show pickup points in your nearest province first.'}
                      </p>
                      {locationStatus === 'granted' && userProvince && (
                        <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-green-400">
                          Region detected: {userProvince}
                        </span>
                      )}
                    </div>

                    {
                      <div className="mb-5 rounded-2xl border border-gold-500/30 bg-gold-500/10 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gold-500">Your location</p>
                            <h3 className="mt-1 text-lg font-semibold text-white">Find pickup points near you</h3>
                          </div>
                          <span className="rounded-full border border-gold-500/40 bg-gold-500/15 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-gold-500">
                            {userProvince ? 'Location set' : 'Start here'}
                          </span>
                        </div>
                        <p className="mb-3 text-sm text-gray-300">
                          {userLocationLabel
                            ? `Using your location in ${userProvince} to show the nearest pickup zones.`
                            : 'Use your current location or enter a suburb/address to see pickup zones nearest to you.'}
                        </p>

                        {locationError && (
                          <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                            {locationError}
                          </div>
                        )}

                        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
                          <input
                            type="text"
                            value={manualLocation}
                            onChange={(event) => setManualLocation(event.target.value)}
                            placeholder="Enter suburb or address"
                            className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-gold-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleManualLocationSubmit}
                            className="rounded-xl border border-gold-500/40 bg-gold-500/10 px-3 py-2 text-sm font-medium text-gold-500 transition-colors hover:bg-gold-500/20"
                          >
                            Use address
                          </button>
                        </div>

                        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
                          <select
                            value={userProvince ?? ''}
                            onChange={(event) => {
                              const province = event.target.value;
                              if (province) applyLocationSelection(province, `${province} selected manually`);
                            }}
                            className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-gold-500 focus:outline-none"
                          >
                            <option value="" className="bg-black text-white">Or choose your province</option>
                            {pickupProvinceOptions.filter((province) => province !== 'all').map((province) => (
                              <option key={province} value={province} className="bg-black text-white">{province}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          className="rounded-xl border border-gold-500/40 bg-black/20 px-3 py-2 text-sm font-medium text-gold-500 transition-colors hover:bg-gold-500/10"
                        >
                          {userLocationLabel ? 'Update my location' : 'Use my location'}
                        </button>
                      </div>
                    }

                    <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Filter by province</p>
                          <p className="mt-1 text-sm text-gray-300">Choose a region to narrow the pickup list.</p>
                        </div>
                        <select
                          value={pickupProvinceFilter}
                          onChange={(event) => setPickupProvinceFilter(event.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-gold-500 sm:max-w-[220px]"
                        >
                          {pickupProvinceOptions.map((province) => (
                            <option key={province} value={province} className="bg-black text-white">
                              {province === 'all' ? 'All provinces' : province}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {filteredPickupOptions.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-gray-400 md:col-span-2">
                          No pickup points available for this province filter. Try a different province or switch to a custom route.
                        </div>
                      ) : (
                        filteredPickupOptions.map((pickup) => (
                          <button
                            key={pickup.name}
                            type="button"
                            onClick={() => setSelectedPickup(pickup)}
                            className={`rounded-2xl border p-3 text-left transition-all ${
                              selectedPickup?.name === pickup.name
                                ? 'border-gold-500 bg-gold-500/10'
                                : 'border-white/10 bg-black/20 hover:border-white/30'
                            }`}
                          >
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <span className="inline-flex items-center rounded-full bg-green-500/15 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-green-400">
                                {pickup.type}
                              </span>
                              {pickup.province && (
                                <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400">{pickup.province}</span>
                              )}
                            </div>
                            <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-gold-500">
                              <span className="inline-flex rounded-full border border-gold-500/30 bg-gold-500/10 px-2 py-1">
                                {pickup.province === (userProvince || resolvePickupRegion(selectedMatch, clientType, userProvince)) ? 'Closest to your route' : 'Popular pickup'}
                              </span>
                            </div>
                            <h3 className="text-base font-semibold text-white">{pickup.name}</h3>
                            <p className="mt-2 text-xs text-gray-400">{pickup.address}</p>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <span className="inline-block rounded-full bg-gold-500/20 px-2 py-1 text-[10px] text-gold-500">Zone {pickup.zone}</span>
                              {pickup.isDoorToDoor && (
                                <span className="inline-block rounded-full border border-gold-500/30 bg-gold-500/10 px-2 py-1 text-[10px] text-gold-500">Door-to-door</span>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">From</p>
                      <div className="mt-2 text-3xl font-bold text-gold-500">R{selectedPackage?.price || 0}</div>
                    </div>
                    <div className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-green-400">
                      Secure
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Passengers</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setPassengers(Math.max(1, passengers - 1))}
                        className="h-8 w-8 rounded-lg bg-white/10 text-lg hover:bg-white/20"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-lg font-semibold">{passengers}</span>
                      <button
                        onClick={() => setPassengers(Math.min(10, passengers + 1))}
                        className="h-8 w-8 rounded-lg bg-white/10 text-lg hover:bg-white/20"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                      <input
                        type="checkbox"
                        checked={includeTicket}
                        onChange={() => setIncludeTicket((current) => !current)}
                        className="h-4 w-4 rounded border-white/20 bg-black text-gold-500 focus:ring-gold-500"
                      />
                      Add match ticket at extra cost
                    </label>
                    <p className="text-xs text-gray-500">Ticket sales are optional and are not included in the package price.</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPaymentMethod('full')}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${paymentMethod === 'full' ? 'bg-gold-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        Pay in Full
                      </button>
                      <button
                        onClick={() => setPaymentMethod('bnpl')}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${paymentMethod === 'bnpl' ? 'bg-gold-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        BNPL
                      </button>
                    </div>
                    {paymentMethod === 'bnpl' && <p className="mt-2 text-xs text-gray-500">4 interest-free payments over 6 weeks</p>}
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-gray-400">{selectedPackage?.title || 'Package'}</span>
                      <span>R{packageTotal}</span>
                    </div>
                    {includeTicket && (
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-gray-400">Match ticket</span>
                        <span>R{ticketTotal}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-gold-500">R{totalPrice}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.2em] text-gray-400">Trip status</span>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${tripActivated ? 'border border-green-500/30 bg-green-500/10 text-green-400' : 'border border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                        {tripActivated ? 'Trip active' : 'Waiting for 6'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">
                      {tripActivated
                        ? `Your package group is ready to travel. ${tripPlan.availableSeats} seats remain.`
                        : `${spacesLeft} more passenger${spacesLeft === 1 ? '' : 's'} are needed. Nearby regions are being grouped automatically.`}
                    </p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${tripActivated ? 'bg-green-500' : 'bg-amber-400'}`}
                        style={{ width: `${Math.min(100, (tripPlan.totalWithCurrentBooking / minimumTripPassengers) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {tripPlan.totalWithCurrentBooking} / {minimumTripPassengers} passengers for activation · {tripPlan.groupedRegions.join(' + ')} group
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmBooking}
                    className="w-full rounded-xl bg-gold-500 py-3 font-semibold text-black transition-colors hover:bg-gold-600"
                  >
                    Confirm Booking
                  </button>
                  <p className="text-center text-xs text-gray-500">No hidden fees.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
