import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Booking from '@/lib/models/Booking'
import Parking from '@/lib/models/Parking'
import Wallet from '@/lib/models/Wallet'
import Transaction from '@/lib/models/Transaction'
import { getUserFromRequest } from '@/lib/getUser'

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const { searchParams } = new URL(req.url)
    const forOwner = searchParams.get('forOwner') === 'true'

    let bookings

    if (forOwner && user.role === 'owner') {
      const ownerSpots = await Parking.find({ ownerId: user.userId }).select('_id').lean()
      const spotIds    = ownerSpots.map(s => s._id)
      bookings = await Booking.find({ parkingId: { $in: spotIds } })
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .lean()
    } else {
      bookings = await Booking.find({ userId: user.userId })
        .sort({ createdAt: -1 })
        .lean()
    }

    return NextResponse.json({ bookings })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const { parkingId, startTime, endTime, carNumber, vehicleType, specialInstructions } = await req.json()

    if (!parkingId || !startTime || !endTime) {
      return NextResponse.json({ error: 'parkingId, startTime, and endTime are required' }, { status: 400 })
    }
    if (!carNumber || !vehicleType) {
      return NextResponse.json({ error: 'Car number and vehicle type are required' }, { status: 400 })
    }

    const start = new Date(startTime)
    const end   = new Date(endTime)

    if (end <= start) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
    }

    // Fetch spot + wallet in parallel
    const [spot, wallet] = await Promise.all([
      Parking.findById(parkingId).select('title address pricePerHour ownerId isLive').lean(),
      Wallet.findOne({ userId: user.userId }).select('balance').lean(),
    ])

    if (!spot)        return NextResponse.json({ error: 'Parking spot not found' }, { status: 404 })
    if (!spot.isLive) return NextResponse.json({ error: 'Parking spot is not available' }, { status: 400 })
    if (spot.ownerId.toString() === user.userId)
      return NextResponse.json({ error: 'You cannot book your own spot' }, { status: 400 })

    const hours       = Math.max(0.5, (end.getTime() - start.getTime()) / 3600000)
    const subtotal    = Math.round(hours * spot.pricePerHour)
    const platformFee = 10
    const totalPrice  = subtotal + platformFee

    if (!wallet || wallet.balance < totalPrice) {
      return NextResponse.json(
        { error: `Insufficient wallet balance. You need ₹${totalPrice} but have ₹${wallet?.balance ?? 0}. Please add money to your wallet first.` },
        { status: 400 }
      )
    }

    const booking = await Booking.create({
      userId:       user.userId,
      parkingId:    spot._id,
      spotTitle:    spot.title,
      spotAddress:  spot.address,
      startTime:    start,
      endTime:      end,
      hours:               Math.round(hours * 10) / 10,
      totalPrice,
      platformFee,
      carNumber:           carNumber.trim().toUpperCase(),
      vehicleType:         vehicleType.trim(),
      specialInstructions: specialInstructions?.trim() || '',
      status:              'confirmed',
      paymentStatus:       'paid',
    })

    // Deduct wallet + record transaction in parallel
    await Promise.all([
      Wallet.findOneAndUpdate({ userId: user.userId }, { $inc: { balance: -totalPrice } }),
      Transaction.create({
        userId:      user.userId,
        type:        'debit',
        amount:      totalPrice,
        description: `Booking: ${spot.title}`,
        bookingId:   booking._id,
        status:      'success',
      }),
    ])

    return NextResponse.json({ booking }, { status: 201 })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
