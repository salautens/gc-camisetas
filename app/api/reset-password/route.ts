import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Find user by email
  const listRes = await fetch(
    `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
    {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    }
  )

  const listData = await listRes.json()
  const user = listData?.users?.[0]

  if (!user) {
    return NextResponse.json({ error: 'Email não encontrado' }, { status: 404 })
  }

  // Update password directly
  const updateRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ password }),
  })

  if (!updateRes.ok) {
    const body = await updateRes.json().catch(() => ({}))
    return NextResponse.json({ error: body.message || 'Erro ao atualizar senha' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
