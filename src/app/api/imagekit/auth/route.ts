import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET() {
  try {
    const token     = crypto.randomUUID()
    const expire    = Math.floor(Date.now() / 1000) + 1800  // 30 min from now, in seconds
    const signature = crypto
      .createHmac('sha1', process.env.IMAGEKIT_PRIVATE_KEY!)
      .update(token + expire)
      .digest('hex')

    return NextResponse.json(
      { token, expire, signature },
      {
        headers: {
          'Cache-Control':          'no-store, no-cache, must-revalidate, max-age=0',
          'Surrogate-Control':      'no-store',
          'Netlify-CDN-Cache-Control': 'no-store',
          'Pragma':                 'no-cache',
          'Vary':                   '*',
        },
      }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'ImageKit auth failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
