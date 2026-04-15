import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Parking from '@/lib/models/Parking'
import Booking from '@/lib/models/Booking'
import { getUserFromRequest } from '@/lib/getUser'

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await connectDB()

    const spots   = await Parking.find({ ownerId: user.userId })
    const spotIds = spots.map(s => s._id)

    const allBookings       = await Booking.find({ parkingId: { $in: spotIds } })
    const confirmedBookings = allBookings.filter(b => ['confirmed', 'completed'].includes(b.status))
    const totalEarnings     = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0)

    const weekAgo        = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const weeklyBookings = allBookings.filter(b => new Date(b.createdAt) >= weekAgo).length

    return NextResponse.json({
      stats: {
        totalEarnings,
        activeSpots:   spots.filter(s => s.isLive).length,
        totalSpots:    spots.length,
        totalBookings: allBookings.length,
        weeklyBookings,
        avgRating:     4.7,   // placeholder — no rating system yet
        totalReviews:  confirmedBookings.length,
        earningsGrowth: 0,
      },
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
