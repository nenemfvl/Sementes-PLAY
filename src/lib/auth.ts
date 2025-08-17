import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET)

export interface JWTPayload {
  id: string
  email: string
  tipo: string
  nome: string
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey)
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload as JWTPayload
  } catch (error) {
    throw new Error('Token inválido')
  }
}

export async function getTokenFromRequest(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('token')?.value
  return token || null
}

export async function getCurrentUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = await getTokenFromRequest(request)
    if (!token) return null
    
    const payload = await verifyToken(token)
    return payload
  } catch (error) {
    return null
  }
}

export async function setTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 dias
  })
}

export async function removeTokenCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('token')
}
