import { NextResponse } from 'next/server'
import ImageKit from 'imagekit'

const imagekit = new ImageKit({
  publicKey:   process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey:  process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
})

export async function GET() {
  try {
    const token  = crypto.randomUUID()
    const expire = Math.floor(Date.now() / 1000) + 1800
    const authParams = imagekit.getAuthenticationParameters(token, expire)
    return NextResponse.json(authParams)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'ImageKit auth failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
