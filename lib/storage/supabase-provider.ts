import { supabaseAdmin } from '@/lib/supabase/admin'
import type { StorageProvider } from './types'

export class SupabaseStorageProvider implements StorageProvider {
    private bucket: string

    constructor(bucket: string) {
        this.bucket = bucket
    }

    async upload(path: string, file: Buffer, mimeType: string): Promise<string> {
        const { error } = await supabaseAdmin.storage
        .from(this.bucket)
        .upload(path, file, { contentType: mimeType, upsert: true })

        if (error) throw new Error(error.message)
        return this.getUrl(path)
    }

    async delete(path: string): Promise<void> {
        await supabaseAdmin.storage.from(this.bucket).remove([path])
    }

    getUrl(path: string): string {
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${this.bucket}/${path}`
    }
}