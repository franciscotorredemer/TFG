import * as FileSystem from 'expo-file-system'
import mime from 'mime'
import { bucket } from './bucket'

export const subirImagenPerfil = async (uri: string, userId: string): Promise<string | null> => {
  try {
    const nombreArchivo = `${userId}-${Date.now()}`
    const extension = mime.getExtension(mime.getType(uri) || '') || 'jpg'
    const ruta = `perfil/${nombreArchivo}.${extension}`

    const formData = new FormData()
    formData.append('file', {
      uri,
      name: `${nombreArchivo}.${extension}`,
      type: mime.getType(uri) || 'image/jpeg',
    } as any)

    const response = await fetch(`https://lnfqesarnftkrcbcgtzl.supabase.co/storage/v1/object/fotosperfil/${ruta}`, {
      method: 'POST',
      headers: {
        apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZnFlc2FybmZ0a3JjYmNndHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2Njc0NTEsImV4cCI6MjA1MzI0MzQ1MX0.t90ec-DDSDTR_pCo3kYM9uGEdGdlQ6GuU9nDajl9wjw',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZnFlc2FybmZ0a3JjYmNndHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2Njc0NTEsImV4cCI6MjA1MzI0MzQ1MX0.t90ec-DDSDTR_pCo3kYM9uGEdGdlQ6GuU9nDajl9wjw',
      },
      body: formData,
    })

    if (!response.ok) {
      console.error('❌ Error al subir imagen al bucket (HTTP):', await response.text())
      return null
    }

    const { data } = bucket.storage.from('fotosperfil').getPublicUrl(ruta)
    return data?.publicUrl || null
  } catch (err) {
    console.error('❌ Error procesando la imagen:', err)
    return null
  }
}
