import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { getUserFromRequest } from '@/lib/getUser'

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { amount } = await req.json()

    if (!amount || isNaN(amount) || amount < 10) {
      return NextResponse.json({ error: 'Minimum add amount is ₹10' }, { status: 400 })
    }
    if (amount > 50000) {
      return NextResponse.json({ error: 'Maximum add amount is ₹50,000' }, { status: 400 })
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 })
    }

    const razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const order = await razorpay.orders.create({
      amount:   Math.round(amount) * 100, // paise
      currency: 'INR',
      receipt:  `w_${Date.now()}`,
    })

    return NextResponse.json({
      orderId:  order.id,
      amount:   Math.round(amount),
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    })
  } catch (err: unknown) {
    console.error('[wallet/add]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
