import { v2 as cloudinary } from 'cloudinary'

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: 'dccx2gioc',
  api_key: '818818384845217',
  api_secret: 'tO0BWstFtQ3nO-VMeFdn5gZxf1g',
})

export default cloudinary

// Função para upload de imagem com otimizações
export const uploadImage = async (
  file: File, 
  options: {
    folder?: string
    transformation?: any[]
    publicId?: string
  } = {}
): Promise<{ url: string; publicId: string }> => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'ml_default') // Usar preset padrão

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dccx2gioc/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Cloudinary error response:', errorText)
      throw new Error(`Upload failed: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    return {
      url: data.secure_url,
      publicId: data.public_id
    }
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error)
    throw new Error('Falha no upload da imagem')
  }
}

// Função para deletar imagem
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Erro ao deletar imagem:', error)
    throw new Error('Falha ao deletar imagem')
  }
}

// Função para gerar URL otimizada
export const getOptimizedImageUrl = (
  publicId: string, 
  transformation: any[] = []
): string => {
  return cloudinary.url(publicId, {
    transformation,
    secure: true
  })
}

// Função para upload de avatar específico
export const uploadAvatar = async (file: File, usuarioId: string): Promise<{ url: string; publicId: string }> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'ml_default') // Usar preset padrão
  formData.append('folder', 'sementesplay/avatars')
  formData.append('transformation', 'w_200,h_200,c_fill,g_face,q_auto,f_auto')

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/dccx2gioc/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Cloudinary error response:', errorText)
    throw new Error(`Upload failed: ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  return {
    url: data.secure_url,
    publicId: data.public_id
  }
}
