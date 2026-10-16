import { NextRequest, NextResponse } from 'next/server'

// kerb.autos/go/CODE: the short address printed on Kerb's letters to dealers
// (16 Oct 2026). It forwards to the founding sign-up with the dealer's own
// invite code, the same flow the scan code on the letter opens. Letter codes
// are 6 characters in capitals, so a code typed in lower case is raised;
// longer codes (founding-...) pass through unchanged.
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params
  const code = /^[A-Za-z0-9]{6}$/.test(raw) ? raw.toUpperCase() : raw
  if (!/^[A-Za-z0-9-]{6,64}$/.test(code)) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  const dest = new URL('/dealers/register', req.url)
  dest.searchParams.set('invite', code)
  return NextResponse.redirect(dest)
}
