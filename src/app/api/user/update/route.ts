import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'
import { getUserFromRequest } from '@/lib/getUser'

export async function PATCH(req: NextRequest) {
  try {
    const caller = getUserFromRequest(req)
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const body = await req.json()
    const { name, phone, currentPassword, newPassword } = body

    const user = await User.findById(caller.userId)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // ── Password change ──────────────────────────────────────
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Both current and new password are required' }, { status: 400 })
      }
      if (newPassword.length < 16) {
        return NextResponse.json({ error: 'New password must be at least 16 characters' }, { status: 400 })
      }
      if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
        return NextResponse.json({ error: 'New password must contain uppercase, lowercase, and a special character' }, { status: 400 })
      }
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

      user.password = await bcrypt.hash(newPassword, 12)
    }

    // ── Profile update ───────────────────────────────────────
    if (name  !== undefined) user.name  = name.trim()
    if (phone !== undefined) user.phone = phone.trim()

    await user.save()

    return NextResponse.json({
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
