export type TownshipTour = {
  id: string;
  name: string;
  township: string;
  province: string;
  duration: 'Full Day';
  price: number;
  groupPrice: number;
  maxGroupSize: number;
  description: string;
  keyAttractions: string[];
  itinerary: { time: string; activity: string; location: string }[];
  inclusions: string[];
  exclusions: string[];
  guide: { name: string; experience: string; contact: string };
  status: 'available';
};

const inclusions = ['Taxi-rank transport', 'Local guide', 'Two shebeen stops', 'Street-food tasting', 'Shisanyama lunch', 'Cultural experience'];
const exclusions = ['Additional drinks', 'Personal expenses', 'Gratuities'];

const makeTour = (tour: Omit<TownshipTour, 'duration' | 'maxGroupSize' | 'itinerary' | 'inclusions' | 'exclusions' | 'status'>): TownshipTour => ({
  ...tour,
  duration: 'Full Day',
  maxGroupSize: 15,
  itinerary: [
    { time: '09:00', activity: 'Pickup and welcome', location: 'Local taxi rank' },
    { time: '09:30', activity: 'Guided walking tour', location: tour.township },
    { time: '10:45', activity: 'Local landmark and heritage stop', location: tour.keyAttractions[0] },
    { time: '12:00', activity: 'Street-food experience', location: 'Local vendor' },
    { time: '13:00', activity: 'Shisanyama lunch', location: tour.township },
    { time: '14:00', activity: 'Culture and community experience', location: tour.keyAttractions[1] },
    { time: '14:45', activity: 'Shebeen hop', location: tour.township },
    { time: '15:45', activity: 'Local markets and stories', location: tour.keyAttractions[2] },
    { time: '17:00', activity: 'Return transport', location: 'Various' },
  ],
  inclusions,
  exclusions,
  status: 'available',
});

const guide = (name: string, experience: string, contact: string) => ({ name, experience, contact });

export const townshipTours: TownshipTour[] = [
  makeTour({ id: 'soweto_full', name: 'Soweto Full-Day Tour', township: 'Soweto', province: 'Gauteng', price: 999, groupPrice: 699, description: 'Vilakazi Street, local stories, landmark stops and the energy of Soweto with a trusted local guide.', keyAttractions: ['Vilakazi Street', 'Mandela House Museum', 'Orlando Towers'], guide: guide('Bongani M.', '10 years guiding in Soweto', '082 123 4567') }),
  makeTour({ id: 'mamelodi_full', name: 'Mamelodi Full-Day Tour', township: 'Mamelodi', province: 'Gauteng', price: 999, groupPrice: 699, description: 'Explore Sundowns heritage, vibrant markets and the community spirit of Mamelodi.', keyAttractions: ['HM Pitje Stadium', 'Sundowns heritage walk', 'Mamelodi Market'], guide: guide('Lindiwe N.', '8 years guiding in Mamelodi', '082 234 5678') }),
  makeTour({ id: 'tembisa_full', name: 'Tembisa Full-Day Tour', township: 'Tembisa', province: 'Gauteng', price: 999, groupPrice: 699, description: 'A full-day immersion in Gauteng’s largest township, its markets, food and community life.', keyAttractions: ['Tembisa walking route', 'Tembisa Market', 'Community Centre'], guide: guide('Mpho K.', '6 years guiding in Tembisa', '082 345 6789') }),
  makeTour({ id: 'alexandra_full', name: 'Alexandra Full-Day Tour', township: 'Alexandra', province: 'Gauteng', price: 999, groupPrice: 699, description: 'Discover Joburg’s oldest township through its history, streets and local hosts.', keyAttractions: ['Alexandra walking route', 'Mandela Yard', 'Alex Market'], guide: guide('Zanele K.', '7 years guiding in Alexandra', '082 456 7890') }),
  makeTour({ id: 'atteridgeville_full', name: 'Atteridgeville Full-Day Tour', township: 'Atteridgeville', province: 'Gauteng', price: 999, groupPrice: 699, description: 'Explore Pretoria’s township heartbeat through sport, culture, food and local stories.', keyAttractions: ['Lucas Moripe Stadium', 'Atteridgeville Market', 'Community Centre'], guide: guide('Sello K.', '5 years guiding in Atteridgeville', '082 567 8901') }),
  makeTour({ id: 'kwathema_full', name: 'KwaThema Full-Day Tour', township: 'KwaThema', province: 'Gauteng', price: 999, groupPrice: 699, description: 'A community-led route through KwaThema’s local culture, creative spaces and cuisine.', keyAttractions: ['KwaThema walking route', 'Local arts space', 'KwaThema Market'], guide: guide('Naledi P.', '6 years guiding in KwaThema', '082 111 2233') }),
  makeTour({ id: 'hammanskraal_full', name: 'Hammanskraal Full-Day Tour', township: 'Hammanskraal', province: 'Gauteng', price: 999, groupPrice: 699, description: 'Experience Hammanskraal’s warm community welcome, food traditions and local landmarks.', keyAttractions: ['Hammanskraal walking route', 'Community heritage stop', 'Local market'], guide: guide('Tshepo R.', '5 years guiding in Hammanskraal', '082 111 3344') }),
  makeTour({ id: 'mankweng_full', name: 'Mankweng Full-Day Tour', township: 'Mankweng', province: 'Limpopo', price: 1099, groupPrice: 799, description: 'A university-town cultural route with local markets and authentic Limpopo hospitality.', keyAttractions: ['University of Limpopo', 'Mankweng Market', 'Community Centre'], guide: guide('Kabelo S.', '6 years guiding in Mankweng', '082 678 9012') }),
  makeTour({ id: 'seshego_full', name: 'Seshego Full-Day Tour', township: 'Seshego', province: 'Limpopo', price: 1099, groupPrice: 799, description: 'Meet local hosts and explore Seshego’s traditional life, food and community culture.', keyAttractions: ['Seshego walking route', 'Traditional-life experience', 'Seshego Market'], guide: guide('Thabo M.', '5 years guiding in Seshego', '082 789 0123') }),
  makeTour({ id: 'lebowakgomo_full', name: 'Lebowakgomo Full-Day Tour', township: 'Lebowakgomo', province: 'Limpopo', price: 1099, groupPrice: 799, description: 'A heritage-rich Limpopo experience built around local food, people and stories.', keyAttractions: ['Lebowakgomo heritage route', 'Community arts stop', 'Local market'], guide: guide('Masego T.', '6 years guiding in Lebowakgomo', '082 111 4455') }),
  makeTour({ id: 'kwamhlanga_full', name: 'KwaMhlanga Full-Day Tour', township: 'KwaMhlanga', province: 'Mpumalanga', price: 1099, groupPrice: 799, description: 'Discover Ndebele culture through traditional arts, beadwork and township hospitality.', keyAttractions: ['Ndebele Cultural Village', 'Beadwork demonstration', 'KwaMhlanga Market'], guide: guide('Thandi N.', '8 years guiding in KwaMhlanga', '082 890 1234') }),
  makeTour({ id: 'embalenhle_full', name: 'eMbalenhle Full-Day Tour', township: 'eMbalenhle', province: 'Mpumalanga', price: 1099, groupPrice: 799, description: 'Explore eMbalenhle’s community culture, local food and highveld stories.', keyAttractions: ['eMbalenhle walking route', 'Community project', 'Local market'], guide: guide('Sibusiso D.', '5 years guiding in eMbalenhle', '082 111 5566') }),
  makeTour({ id: 'matsulu_full', name: 'Matsulu Full-Day Tour', township: 'Matsulu', province: 'Mpumalanga', price: 1099, groupPrice: 799, description: 'A warm, locally hosted day of culture, food and community life near Mbombela.', keyAttractions: ['Matsulu walking route', 'Cultural centre', 'Matsulu Market'], guide: guide('Nokuthula B.', '7 years guiding in Matsulu', '082 111 6677') }),
  makeTour({ id: 'rustenburg_full', name: 'Rustenburg Full-Day Tour', township: 'Rustenburg', province: 'North West', price: 999, groupPrice: 699, description: 'Explore mining heritage, local culture and the lively township heart of Rustenburg.', keyAttractions: ['Rustenburg walking route', 'Mining heritage stop', 'Local market'], guide: guide('Sipho D.', '6 years guiding in Rustenburg', '082 901 2345') }),
  makeTour({ id: 'mahikeng_full', name: 'Mahikeng Full-Day Tour', township: 'Mahikeng', province: 'North West', price: 999, groupPrice: 699, description: 'A heritage and food journey through Mahikeng with local guides and community hosts.', keyAttractions: ['Mahikeng heritage route', 'Cultural centre', 'Local market'], guide: guide('Refilwe K.', '6 years guiding in Mahikeng', '082 111 7788') }),
  makeTour({ id: 'klerksdorp_full', name: 'Klerksdorp Full-Day Tour', township: 'Klerksdorp', province: 'North West', price: 999, groupPrice: 699, description: 'Experience Klerksdorp’s local history, food culture and township hospitality.', keyAttractions: ['Klerksdorp walking route', 'Heritage stop', 'Local market'], guide: guide('Mandla V.', '5 years guiding in Klerksdorp', '082 111 8899') }),
  makeTour({ id: 'botshabelo_full', name: 'Botshabelo Full-Day Tour', township: 'Botshabelo', province: 'Free State', price: 1099, groupPrice: 799, description: 'Explore the Free State’s largest township through community culture, markets and food.', keyAttractions: ['Botshabelo walking route', 'Community project', 'Botshabelo Market'], guide: guide('Mpho M.', '5 years guiding in Botshabelo', '082 012 3456') }),
  makeTour({ id: 'thaba_nchu_full', name: 'Thaba Nchu Full-Day Tour', township: 'Thaba Nchu', province: 'Free State', price: 1099, groupPrice: 799, description: 'A culture-forward day of local food, heritage and Basotho community stories.', keyAttractions: ['Thaba Nchu heritage route', 'Cultural village', 'Local market'], guide: guide('Kagiso L.', '7 years guiding in Thaba Nchu', '082 111 9900') }),
  makeTour({ id: 'mangaung_full', name: 'Mangaung Full-Day Tour', township: 'Mangaung', province: 'Free State', price: 1099, groupPrice: 799, description: 'Experience Mangaung through its community history, food traditions and local art.', keyAttractions: ['Mangaung walking route', 'Community arts stop', 'Local market'], guide: guide('Lerato S.', '6 years guiding in Mangaung', '082 112 0011') }),
  makeTour({ id: 'umlazi_full', name: 'Umlazi Full-Day Tour', township: 'Umlazi', province: 'KZN', price: 1199, groupPrice: 899, description: 'Discover KZN’s largest township through its energy, food, culture and local markets.', keyAttractions: ['Umlazi walking route', 'Cultural village', 'Umlazi Market'], guide: guide('Nomsa N.', '7 years guiding in Umlazi', '082 123 4567') }),
  makeTour({ id: 'kwamashu_full', name: 'KwaMashu Full-Day Tour', township: 'KwaMashu', province: 'KZN', price: 1199, groupPrice: 899, description: 'A locally hosted route through KwaMashu’s music, culture, cuisine and community life.', keyAttractions: ['KwaMashu walking route', 'Music heritage stop', 'KwaMashu Market'], guide: guide('Ayanda Z.', '8 years guiding in KwaMashu', '082 112 1122') }),
  makeTour({ id: 'inanda_full', name: 'Inanda Full-Day Tour', township: 'Inanda', province: 'KZN', price: 1199, groupPrice: 899, description: 'Explore Inanda’s rich history, local food and cultural landmarks with a resident guide.', keyAttractions: ['Inanda heritage route', 'Cultural centre', 'Local market'], guide: guide('Sanele H.', '6 years guiding in Inanda', '082 112 2233') }),
];
