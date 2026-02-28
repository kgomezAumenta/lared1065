import { NextResponse } from 'next/server';

export async function fetchAndRewriteGNFeed(category?: string) {
    try {
        const wpUrl = process.env.NEXT_PUBLIC_WP_URL || "https://cms.lared1061.com";

        // Construct the WordPress GN feed URL
        let feedUrl = `${wpUrl}/feed/gn`;
        if (category) {
            feedUrl = `${wpUrl}/${category}/feed/gn`;
        }

        const res = await fetch(feedUrl, {
            // Check cache every 5 minutes
            next: { revalidate: 300 },
        });

        if (!res.ok) {
            // Pass through the 404 or other errors to let the user know feed doesn't exist
            return new NextResponse(`Feed not found or error fetching from CMS: ${res.status}`, { status: res.status });
        }

        let xml = await res.text();

        // REWRITE RULES FOR HEADLESS NEXT.JS
        // GN Publisher XML often puts channels and items. 
        // We split by <item> so we only alter the channel header once, then alter each item safely.

        const splitParts = xml.split('<item>');

        if (splitParts.length > 1) {
            let channelHeader = splitParts[0];

            // Rewrite channel link
            channelHeader = channelHeader.replace(
                /<link>https?:\/\/(?:www\.)?cms\.lared1061\.com[^<]*<\/link>/i,
                `<link>https://www.lared1061.com${category ? `/${category}` : ''}</link>`
            );

            // Rewrite atom:link for self discovery
            const selfUrl = category
                ? `https://www.lared1061.com/${category}/feed/gn`
                : `https://www.lared1061.com/feed/gn`;

            channelHeader = channelHeader.replace(
                /<atom:link([^>]+)href="[^"]+"([^>]*)>/i,
                `<atom:link$1href="${selfUrl}"$2>`
            );

            splitParts[0] = channelHeader;
        }

        // Rejoin segments
        xml = splitParts.join('<item>');

        // Process <item> contents only to avoid breaking image URLs inside standard tags
        xml = xml.replace(/<item>([\s\S]*?)<\/item>/gi, (match, itemContent) => {
            // Replace <link>
            let newItem = itemContent.replace(
                /<link>https?:\/\/(?:www\.)?cms\.lared1061\.com\/([^<]+)<\/link>/g,
                "<link>https://www.lared1061.com/posts/$1</link>"
            );
            // Replace <guid>
            newItem = newItem.replace(
                /<guid([^>]*)>https?:\/\/(?:www\.)?cms\.lared1061\.com\/([^<]+)<\/guid>/g,
                "<guid$1>https://www.lared1061.com/posts/$2</guid>"
            );
            return `<item>${newItem}</item>`;
        });

        return new NextResponse(xml, {
            headers: {
                "Content-Type": "application/rss+xml; charset=utf-8",
                "Cache-Control": "s-maxage=300, stale-while-revalidate",
            },
        });
    } catch (error) {
        console.error("GN Feed Proxy Error:", error);
        return new NextResponse("Internal Server Error generating GN feed proxy", { status: 500 });
    }
}
