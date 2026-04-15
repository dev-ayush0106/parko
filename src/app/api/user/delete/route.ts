import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'
import Booking from '@/lib/models/Booking'
import Parking from '@/lib/models/Parking'
import { getUserFromRequest } from '@/lib/getUser'

export async function DELETE(req: NextRequest) {
  try {
    const caller = getUserFromRequest(req)
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const { password } = await req.json()
    if (!password) return NextResponse.json({ error: 'Password is required' }, { status: 400 })

    const user = await User.findById(caller.userId)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return NextResponse.json({ error: 'Password is incorrect' }, { status: 400 })

    // Delete associated data
    await Booking.deleteMany({ userId: caller.userId })
    if (user.role === 'owner') {
      await Parking.deleteMany({ ownerId: caller.userId })
    }
    await User.findByIdAndDelete(caller.userId)

    return NextResponse.json({ message: 'Account deleted successfully' })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
