import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export interface JWTPayload {
  userId: string
  email:  string
  role:   string
}

export function getUserFromRequest(req: NextRequest): JWTPayload | null {
  const auth  = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '').trim()
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}
