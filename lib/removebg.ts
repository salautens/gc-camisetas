export async function removeBackground(imageBytes: Buffer): Promise<Buffer> {
  const formData = new FormData()
  formData.append('image_file', new Blob([imageBytes.buffer as ArrayBuffer]), 'image.jpg')
  formData.append('size', 'auto')

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.REMOVEBG_API_KEY!,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Remove.bg error ${response.status}: ${error}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
