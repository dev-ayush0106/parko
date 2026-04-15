import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Parking from '@/lib/models/Parking'
import { getUserFromRequest } from '@/lib/getUser'

type Ctx = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await connectDB()
    const spot = await Parking.findById(params.id)
    if (!spot) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ spot })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const spot = await Parking.findById(params.id)
    if (!spot) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (spot.ownerId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const ALLOWED = ['title', 'pricePerHour', 'isLive', 'availableFrom', 'availableTo', 'days', 'description', 'amenities', 'spotType']
    const updates: Record<string, unknown> = {}
    for (const key of ALLOWED) {
      if (key in body) updates[key] = body[key]
    }

    const updated = await Parking.findByIdAndUpdate(params.id, updates, { new: true })
    return NextResponse.json({ spot: updated })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const spot = await Parking.findById(params.id)
    if (!spot) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (spot.ownerId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await Parking.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
