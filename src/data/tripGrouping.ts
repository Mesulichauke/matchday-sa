export const vehicleCapacity = 18;
export const minimumTripPassengers = 6;

// Ordered by practical neighbouring provinces. The selected province always leads.
const nearestProvinceOrder: Record<string, string[]> = {
  Gauteng: ['Gauteng', 'North West', 'Mpumalanga', 'Free State', 'Limpopo'],
  'KwaZulu-Natal': ['KwaZulu-Natal', 'Free State', 'Eastern Cape', 'Mpumalanga'],
  Limpopo: ['Limpopo', 'Gauteng', 'Mpumalanga', 'North West'],
  Mpumalanga: ['Mpumalanga', 'Gauteng', 'Limpopo', 'KwaZulu-Natal', 'Free State'],
  'Western Cape': ['Western Cape', 'Northern Cape', 'Eastern Cape'],
  'Eastern Cape': ['Eastern Cape', 'Western Cape', 'Free State', 'KwaZulu-Natal', 'Northern Cape'],
  'North West': ['North West', 'Gauteng', 'Free State', 'Limpopo', 'Northern Cape'],
  'Free State': ['Free State', 'Gauteng', 'North West', 'KwaZulu-Natal', 'Eastern Cape', 'Northern Cape'],
  'Northern Cape': ['Northern Cape', 'Western Cape', 'Free State', 'North West', 'Eastern Cape'],
};

export const getNearestRegions = (province: string) => nearestProvinceOrder[province] ?? [province];

type TripBooking = { pickupProvince: string; passengerCount: number };

export const buildTripPlan = (province: string, bookings: TripBooking[], incomingPassengers: number) => {
  const orderedRegions = getNearestRegions(province);
  const passengersByProvince = new Map<string, number>();
  bookings.forEach((booking) => {
    passengersByProvince.set(
      booking.pickupProvince,
      (passengersByProvince.get(booking.pickupProvince) ?? 0) + booking.passengerCount,
    );
  });

  const groupedRegions: string[] = [];
  let bookedPassengers = 0;
  for (const region of orderedRegions) {
    groupedRegions.push(region);
    bookedPassengers += passengersByProvince.get(region) ?? 0;
    if (bookedPassengers + incomingPassengers >= minimumTripPassengers) break;
  }

  const totalWithCurrentBooking = bookedPassengers + incomingPassengers;
  return {
    groupedRegions,
    bookedPassengers,
    totalWithCurrentBooking,
    spacesToActivate: Math.max(0, minimumTripPassengers - totalWithCurrentBooking),
    availableSeats: Math.max(0, vehicleCapacity - bookedPassengers),
    isActive: totalWithCurrentBooking >= minimumTripPassengers,
  };
};
