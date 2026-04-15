import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectDB } from '@/lib/mongodb'
import Parking from '@/lib/models/Parking'
import { getUserFromRequest } from '@/lib/getUser'

const JWT_SECRET = process.env.JWT_SECRET!

// Helper also used internally
function getUser(req: NextRequest) {
  const auth  = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '').trim()
  if (!token) return null
  try { return jwt.verify(token, JWT_SECRET) as { userId: string; role: string } }
  catch { return null }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const body = await req.json()
    const { title, pricePerHour, spotType, description, address, lat, lng, availableFrom, availableTo, days, photos, amenities } = body

    if (!title || !pricePerHour || !address) {
      return NextResponse.json({ error: 'Title, price, and address are required' }, { status: 400 })
    }

    const parking = await Parking.create({
      title,
      pricePerHour:  Number(pricePerHour),
      spotType:      spotType      || 'Covered',
      description:   description   || '',
      address,
      lat:           Number(lat)   || 0,
      lng:           Number(lng)   || 0,
      availableFrom: availableFrom || '06:00',
      availableTo:   availableTo   || '22:00',
      days:          days          || [],
      photos:        photos        || [],
      amenities:     amenities     || [],
      ownerId:       user.userId,
      isLive:        true,
    })

    return NextResponse.json({ parking }, { status: 201 })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const ownerId  = searchParams.get('ownerId')
    const search   = searchParams.get('search')   || ''
    const maxPrice = searchParams.get('maxPrice')
    const spotType = searchParams.get('spotType')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {}

    if (ownerId) {
      // Owner fetching their own spots (include offline)
      filter.ownerId = ownerId
    } else {
      // Public search — only live spots
      filter.isLive = true
    }

    if (search) {
      filter.$or = [
        { title:   { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ]
    }

    if (maxPrice) filter.pricePerHour = { $lte: Number(maxPrice) }
    if (spotType && spotType !== 'All') filter.spotType = spotType

    const spots = await Parking.find(filter).sort({ createdAt: -1 })
    return NextResponse.json({ spots })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
