import { SupabaseStorageProvider } from './supabase-provider'
import type { StorageProvider } from './types'

function getProvider(bucket: string): StorageProvider {
    return new SupabaseStorageProvider(bucket)
}

// one provider per bucket type
export const profileImageStorage = getProvider('profile-images')
export const chatImageStorage = getProvider('chat-images')
