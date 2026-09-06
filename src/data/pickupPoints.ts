export type PickupPoint = {
  id: string;
  name: string;
  city: string;
  province: string;
  zone: string;
  address: string;
  active: boolean;
};

type ProvinceCoverage = {
  province: string;
  regions: string[];
};

const provinceCoverage: ProvinceCoverage[] = [
  { province: 'Gauteng', regions: ['Johannesburg', 'Pretoria', 'Soweto', 'Ekurhuleni'] },
  { province: 'KwaZulu-Natal', regions: ['Durban', 'Pietermaritzburg', 'Richards Bay', 'Newcastle'] },
  { province: 'Limpopo', regions: ['Polokwane', 'Thohoyandou', 'Tzaneen', 'Mokopane'] },
  { province: 'Mpumalanga', regions: ['Mbombela', 'Emalahleni', 'Secunda', 'Bushbuckridge'] },
  { province: 'Western Cape', regions: ['Cape Town', 'Stellenbosch', 'George', 'Paarl'] },
  { province: 'Eastern Cape', regions: ['Gqeberha', 'East London', 'Mthatha', 'Komani'] },
  { province: 'North West', regions: ['Mahikeng', 'Rustenburg', 'Klerksdorp', 'Potchefstroom'] },
  { province: 'Free State', regions: ['Bloemfontein', 'Welkom', 'Bethlehem', 'Sasolburg'] },
  { province: 'Northern Cape', regions: ['Kimberley', 'Upington', 'Springbok', 'Kuruman'] },
];

const pickupZones = ['North', 'East', 'South', 'West'] as const;

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** 9 provinces × 4 regional hubs × 4 pickup zones = 144 bookable pickup points. */
export const defaultPickupPoints: PickupPoint[] = provinceCoverage.flatMap(({ province, regions }) =>
  regions.flatMap((city) =>
    pickupZones.map((zone) => ({
      id: `pickup-${slugify(province)}-${slugify(city)}-${zone.toLowerCase()}`,
      name: `${city} ${zone} Matchday Pickup`,
      city,
      province,
      zone,
      address: `${city} ${zone} collection point — final boarding location is confirmed with your booking.`,
      active: true,
    })),
  ),
);

/** Keeps admin-added points while ensuring every standard coverage point is available. */
export const mergePickupPoints = (storedPoints: PickupPoint[]) => {
  const storedById = new Map(storedPoints.map((point) => [point.id, point]));
  const seeded = defaultPickupPoints.map((point) => storedById.get(point.id) ?? point);
  const custom = storedPoints.filter((point) => !defaultPickupPoints.some((seed) => seed.id === point.id));
  return [...seeded, ...custom];
};
