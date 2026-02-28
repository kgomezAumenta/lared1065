import { fetchAndRewriteGNFeed } from '@/lib/gn-proxy';

export async function GET() {
    // Fetches the main Google News feed from the CMS and rewrites its URLs
    return await fetchAndRewriteGNFeed();
}
