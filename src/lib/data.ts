// ── Types ──────────────────────────────────────────────────
export type Role = 'user' | 'owner'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export type PaymentStatus = 'pending' | 'paid' | 'failed'

export interface ParkingSpot {
  id: number
  ownerId: number
  title: string
  location: string
  latitude: number
  longitude: number
  pricePerHour: number
  imageEmoji: string
  isAvailable: boolean
  rating: number
  reviewCount: number
  tags: string[]
  description: string
  amenities: string[]
}

export interface Booking {
  id: number
  userId: number
  parkingId: number
  spotTitle: string
  spotLocation: string
  spotEmoji: string
  startTime: string
  endTime: string
  totalPrice: number
  status: BookingStatus
}

// ── Dummy Data ─────────────────────────────────────────────
export const PARKING_SPOTS: ParkingSpot[] = [
  {
    id: 1,
    ownerId: 10,
    title: 'Central Park Garage',
    location: 'Connaught Place, Delhi',
    latitude: 28.6315,
    longitude: 77.2167,
    pricePerHour: 80,
    imageEmoji: '🏢',
    isAvailable: true,
    rating: 4.8,
    reviewCount: 124,
    tags: ['Covered', 'CCTV', '24/7'],
    description:
      'Premium covered parking in the heart of CP. Multi-level complex with 24/7 CCTV, EV charging on level 2, and a security guard on every floor.',
    amenities: ['CCTV', 'EV Charging', '24/7 Access', 'Security guard', 'Washroom'],
  },
  {
    id: 2,
    ownerId: 11,
    title: 'Saket District Centre',
    location: 'Saket, South Delhi',
    latitude: 28.5244,
    longitude: 77.2066,
    pricePerHour: 50,
    imageEmoji: '🏬',
    isAvailable: true,
    rating: 4.5,
    reviewCount: 89,
    tags: ['Open Air', 'Security', 'Weekdays'],
    description:
      'Spacious open parking near Select Citywalk. Ideal for shopping and dining visits. Weekday morning discounts available.',
    amenities: ['Security guard', 'CCTV'],
  },
  {
    id: 3,
    ownerId: 12,
    title: 'Cyber Hub Parking',
    location: 'DLF Cyber City, Gurgaon',
    latitude: 28.4951,
    longitude: 77.0889,
    pricePerHour: 120,
    imageEmoji: '🏗️',
    isAvailable: false,
    rating: 4.9,
    reviewCount: 203,
    tags: ['Covered', 'Valet', 'Corporate'],
    description:
      'Premium valet parking at Cyber Hub. Perfect for business meetings and dining. Covered multi-storey with touchless entry.',
    amenities: ['Valet', 'CCTV', 'EV Charging', 'Wheelchair accessible'],
  },
  {
    id: 4,
    ownerId: 13,
    title: 'Khan Market Lot',
    location: 'Khan Market, Delhi',
    latitude: 28.6006,
    longitude: 77.2273,
    pricePerHour: 40,
    imageEmoji: '🏛️',
    isAvailable: true,
    rating: 4.2,
    reviewCount: 56,
    tags: ['Open', 'Hourly', 'Walking distance'],
    description:
      'Affordable open parking near Khan Market. Walking distance to all shops, cafes and eateries.',
    amenities: ['CCTV'],
  },
  {
    id: 5,
    ownerId: 14,
    title: 'Lajpat Nagar Basement',
    location: 'Lajpat Nagar, Delhi',
    latitude: 28.5677,
    longitude: 77.2432,
    pricePerHour: 30,
    imageEmoji: '🏪',
    isAvailable: true,
    rating: 4.0,
    reviewCount: 41,
    tags: ['Covered', 'Budget', 'Shopping'],
    description:
      'Budget-friendly covered basement parking. Ideal for the Central Market shopping area.',
    amenities: ['CCTV', 'Security guard'],
  },
  {
    id: 6,
    ownerId: 15,
    title: 'Vasant Kunj Residential',
    location: 'Vasant Kunj, Delhi',
    latitude: 28.5230,
    longitude: 77.1568,
    pricePerHour: 60,
    imageEmoji: '🏠',
    isAvailable: true,
    rating: 4.6,
    reviewCount: 77,
    tags: ['Gated', 'Overnight', 'Residential'],
    description:
      'Secure gated residential parking. Perfect for overnight stays and long-term use in a quiet colony.',
    amenities: ['Gated', 'CCTV', '24/7 Access'],
  },
]

export const BOOKINGS: Booking[] = [
  {
    id: 1,
    userId: 1,
    parkingId: 1,
    spotTitle: 'Central Park Garage',
    spotLocation: 'Connaught Place',
    spotEmoji: '🏢',
    startTime: '2024-03-18T10:00',
    endTime: '2024-03-18T14:00',
    totalPrice: 320,
    status: 'confirmed',
  },
  {
    id: 2,
    userId: 1,
    parkingId: 2,
    spotTitle: 'Saket District Centre',
    spotLocation: 'Saket, South Delhi',
    spotEmoji: '🏬',
    startTime: '2024-03-15T14:00',
    endTime: '2024-03-15T18:00',
    totalPrice: 200,
    status: 'completed',
  },
  {
    id: 3,
    userId: 1,
    parkingId: 3,
    spotTitle: 'Cyber Hub Parking',
    spotLocation: 'DLF Cyber City',
    spotEmoji: '🏗️',
    startTime: '2024-03-10T09:00',
    endTime: '2024-03-10T11:00',
    totalPrice: 240,
    status: 'cancelled',
  },
  {
    id: 4,
    userId: 1,
    parkingId: 4,
    spotTitle: 'Khan Market Lot',
    spotLocation: 'Khan Market',
    spotEmoji: '🏛️',
    startTime: '2024-03-05T12:00',
    endTime: '2024-03-05T15:00',
    totalPrice: 120,
    status: 'completed',
  },
]

export const OWNER_STATS = {
  totalEarnings: 18240,
  activeSpots: 3,
  totalSpots: 4,
  totalBookings: 124,
  weeklyBookings: 8,
  avgRating: 4.7,
  totalReviews: 89,
  earningsGrowth: 12,
}
