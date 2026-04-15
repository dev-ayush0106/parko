import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Booking from '@/lib/models/Booking'
import { getUserFromRequest } from '@/lib/getUser'

type Ctx = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const booking = await Booking.findById(params.id)
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    if (booking.userId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return NextResponse.json({ error: 'Cannot modify a cancelled or completed booking' }, { status: 400 })
    }

    const { status } = await req.json()
    booking.status = status
    await booking.save()

    return NextResponse.json({ booking })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
