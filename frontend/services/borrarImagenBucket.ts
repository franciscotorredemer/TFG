import { bucket } from './bucket'

export const borrarImagenPerfil = async (nombreArchivo: string) => {
  const { error } = await bucket.storage
    .from("fotosperfil")
    .remove([`perfil/${nombreArchivo}`])

  if (error) {
    console.error(" Error al borrar imagen:", error)
  } else {
    console.log(" Imagen borrada del bucket:", nombreArchivo)
  }
}
