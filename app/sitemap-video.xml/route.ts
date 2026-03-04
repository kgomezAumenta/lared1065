import { NextResponse } from 'next/server';

const WP_GRAPHQL_URL = `${process.env.NEXT_PUBLIC_WP_URL || 'https://cms.lared1061.com'}/graphql`;

export async function GET() {
    try {
        const query = `
      query GetVideosForSitemap {
        posts(first: 100) {
          nodes {
            title
            slug
            date
            excerpt
            featuredImage {
              node {
                sourceUrl
              }
            }
          }
        }
      }
    `;

        const res = await fetch(WP_GRAPHQL_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        const json = await res.json();
        const posts = json?.data?.posts?.nodes || [];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  ${posts.map((post: any) => {
            // Basic Google Video Sitemap implementation
            // Ideally this would only include posts that actually contain videos
            // and would link to the actual video file or player URL.
            // For now, attaching the featured image and generic metadata.

            // Only include posts that have a featured image as it's required for video thumbnails
            if (!post.featuredImage?.node?.sourceUrl) return '';

            return `
  <url>
    <loc>https://lared1061.com/posts/${post.slug}</loc>
    <video:video>
      <video:thumbnail_loc>${post.featuredImage.node.sourceUrl.replace(/&/g, '&amp;')}</video:thumbnail_loc>
      <video:title><![CDATA[${post.title}]]></video:title>
      <video:description><![CDATA[${(post.excerpt || post.title).replace(/(<([^>]+)>)/gi, "").substring(0, 200)}]]></video:description>
      <video:publication_date>${new Date(post.date).toISOString()}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>
  </url>`;
        }).join('')}
</urlset>`;

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'text/xml',
            },
        });

    } catch (error) {
        console.error('Error generando sitemap de video:', error);
        return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
            status: 500,
            headers: { 'Content-Type': 'text/xml' },
        });
    }
}
