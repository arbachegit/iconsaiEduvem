import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    buildId: process.env.NEXT_PUBLIC_BUILD_ID || 'dev',
    sha: process.env.NEXT_PUBLIC_BUILD_SHA || 'nogit',
    deployedAt: new Date().toISOString(),
  })
}
