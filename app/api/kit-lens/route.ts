import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { removeBackground } from '@/lib/removebg'

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { shirtId } = await request.json()

  if (!shirtId) {
    return NextResponse.json({ error: 'shirtId required' }, { status: 400 })
  }

  // Fetch shirt (must belong to user)
  const { data: shirt, error: shirtError } = await supabase
    .from('shirts')
    .select('id, original_url, user_id')
    .eq('id', shirtId)
    .eq('user_id', user.id)
    .single()

  if (shirtError || !shirt) {
    return NextResponse.json({ error: 'Shirt not found' }, { status: 404 })
  }

  if (!shirt.original_url) {
    return NextResponse.json({ error: 'No original image to process' }, { status: 400 })
  }

  try {
    // Download original image bytes
    const imageResponse = await fetch(shirt.original_url)
    if (!imageResponse.ok) {
      throw new Error('Failed to download original image')
    }
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

    // Remove background
    const processedBuffer = await removeBackground(imageBuffer)

    // Upload processed PNG using service role (bypasses RLS on storage)
    const serviceClient = createServiceClient()
    const processedPath = `${user.id}/${shirtId}/processed.png`
    const { error: uploadError } = await serviceClient.storage
      .from('shirt-processed')
      .upload(processedPath, processedBuffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`)
    }

    const { data: { publicUrl: processedUrl } } = serviceClient.storage
      .from('shirt-processed')
      .getPublicUrl(processedPath)

    // Update shirt record
    await supabase
      .from('shirts')
      .update({
        processed_url: processedUrl,
        processing_status: 'done',
      })
      .eq('id', shirtId)

    return NextResponse.json({ processed_url: processedUrl })
  } catch (err) {
    console.error('[kit-lens]', err)

    // Mark as failed
    await supabase
      .from('shirts')
      .update({ processing_status: 'failed' })
      .eq('id', shirtId)

    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Processing failed' },
      { status: 500 }
    )
  }
}
