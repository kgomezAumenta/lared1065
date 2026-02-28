import { fetchAndRewriteGNFeed } from '@/lib/gn-proxy';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ category: string }> }
) {
    const { category } = await params;

    // Fetches the category-specific Google News feed from the CMS and rewrites its URLs
    return await fetchAndRewriteGNFeed(category);
}
