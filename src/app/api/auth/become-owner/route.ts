import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'
import { getUserFromRequest } from '@/lib/getUser'

const JWT_SECRET = process.env.JWT_SECRET!

export async function PATCH(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await req.json().catch(() => ({}))
    const { businessName } = body

    const user = await User.findByIdAndUpdate(
      authUser.userId,
      {
        role: 'owner',
        ...(businessName ? { businessName } : {}),
      },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Issue new JWT with updated role so frontend stays in sync
    const newToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      token: newToken,
      user: {
        id:           user._id,
        name:         user.name,
        email:        user.email,
        phone:        user.phone,
        role:         user.role,
        businessName: user.businessName,
      },
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
