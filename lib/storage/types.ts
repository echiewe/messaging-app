export interface StorageProvider {
    upload(path: string, file: Buffer, mimeType: string): Promise<string> // returns public URL
    delete(path: string): Promise<void>
    getUrl(path: string): string
}