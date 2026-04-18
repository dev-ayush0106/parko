import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Wallet from '@/lib/models/Wallet'
import Transaction from '@/lib/models/Transaction'
import { getUserFromRequest } from '@/lib/getUser'

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const [wallet, transactions] = await Promise.all([
      Wallet.findOne({ userId: user.userId }).select('balance').lean(),
      Transaction.find({ userId: user.userId }).sort({ createdAt: -1 }).limit(30).lean(),
    ])

    return NextResponse.json({
      balance:      wallet?.balance ?? 0,
      transactions,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
