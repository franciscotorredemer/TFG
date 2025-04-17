import { bucket } from "./bucket"

export const borrarImagenPerfil = async (nombreArchivo: string) => {
  try {
    const { error } = await bucket.storage
      .from("fotosperfil")
      .remove([`perfil/${nombreArchivo}`])

    if (error) throw error
    console.log("✅ Imagen borrada del bucket:", nombreArchivo)
  } catch (error) {
    console.error("❌ Error al borrar imagen del bucket:", error)
  }
}
