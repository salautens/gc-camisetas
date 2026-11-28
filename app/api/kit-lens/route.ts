import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { removeBackground } from '@/lib/removebg'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const shirtId = body?.shirtId
  const side = body?.side ?? 'front'
  if (typeof shirtId !== 'string' || !['front', 'back'].includes(side)) {
    return NextResponse.json({ error: 'Camiseta ou lado inválido.' }, { status: 400 })
  }

  const { data: shirt, error: shirtError } = await supabase.from('shirts')
    .select('id, original_url, back_original_url, user_id')
    .eq('id', shirtId).eq('user_id', user.id).single()
  if (shirtError || !shirt) return NextResponse.json({ error: 'Camiseta não encontrada.' }, { status: 404 })
  const originalUrl = side === 'front' ? shirt.original_url : shirt.back_original_url
  if (!originalUrl) return NextResponse.json({ error: 'Foto original não encontrada.' }, { status: 400 })

  try {
    const imageResponse = await fetch(originalUrl)
    if (!imageResponse.ok) throw new Error('Download failed')
    const processedBuffer = await removeBackground(Buffer.from(await imageResponse.arrayBuffer()))
    const serviceClient = createServiceClient()
    const processedPath = user.id + '/' + shirtId + '/document-' + side + '-' + crypto.randomUUID() + '.png'
    const { error: uploadError } = await serviceClient.storage.from('shirt-processed')
      .upload(processedPath, processedBuffer, { contentType: 'image/png', upsert: false })
    if (uploadError) throw new Error('Upload failed')
    const { data: { publicUrl } } = serviceClient.storage.from('shirt-processed').getPublicUrl(processedPath)
    // Reject stale processing results if this side was replaced in the meantime.
    const update = side === 'front'
      ? { processed_url: publicUrl, processing_status: 'done' }
      : { back_processed_url: publicUrl }
    const { data: saved, error: saveError } = await supabase.from('shirts').update(update)
      .eq('id', shirtId).eq('user_id', user.id)
      .eq(side === 'front' ? 'original_url' : 'back_original_url', originalUrl)
      .select('id').single()
    if (saveError || !saved) throw new Error('Photo changed or save failed')
    return NextResponse.json({ processed_url: publicUrl })
  } catch {
    return NextResponse.json(
      { error: 'A foto original está salva, mas não foi possível remover o fundo. Tente novamente.' },
      { status: 500 }
    )
  }
}
