import sharp from 'sharp'

type CompressOptions = {
    maxWidth?: number
    maxHeight?: number
    quality?: number        // 1-100
    format?: 'webp' | 'jpeg' | 'png'
}

export async function compressImage(
    buffer: Buffer,
    options: CompressOptions = {}
): Promise<{ buffer: Buffer, mimeType: string }> {
    const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 80,
        format = 'webp'   // webp is best default — smallest size, wide support
    } = options

    const compressed = await sharp(buffer)
        .resize(maxWidth, maxHeight, {
        fit: 'inside',        // maintain aspect ratio, never upscale
        withoutEnlargement: true
        })
        [format]({ quality })
        .toBuffer()

    return {
        buffer: compressed,
        mimeType: `image/${format}`
    }
}

// preset configs per use case
export const compressionPresets = {
    profileImage: { maxWidth: 400, maxHeight: 400, quality: 85, format: 'webp' as const },
    chatImage:    { maxWidth: 1200, maxHeight: 1200, quality: 80, format: 'webp' as const },
}