import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/mongodb'
import Wallet from '@/lib/models/Wallet'
import Transaction from '@/lib/models/Transaction'
import { getUserFromRequest } from '@/lib/getUser'

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount } = await req.json()

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !amount) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    await connectDB()

    // Credit wallet (upsert)
    const wallet = await Wallet.findOneAndUpdate(
      { userId: user.userId },
      { $inc: { balance: amount } },
      { upsert: true, new: true }
    )

    // Record transaction
    await Transaction.create({
      userId:            user.userId,
      type:              'credit',
      amount,
      description:       'Added to wallet via Razorpay',
      razorpayOrderId,
      razorpayPaymentId,
      status:            'success',
    })

    return NextResponse.json({ balance: wallet.balance })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
