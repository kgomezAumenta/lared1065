import { NextResponse } from 'next/server';

const WP_GRAPHQL_URL = `${process.env.NEXT_PUBLIC_WP_URL || 'https://cms.lared1061.com'}/graphql`;

export async function GET() {
  try {
    const query = `
      query GetNewsForSitemap {
        posts(first: 50) {
          nodes {
            title
            slug
            date
          }
        }
      }
    `;

    const res = await fetch(WP_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      next: { revalidate: 600 }, // Cache for 10 minutes
    });

    const json = await res.json();
    const posts = json?.data?.posts?.nodes || [];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${posts.map((post: any) => `
  <url>
    <loc>https://lared1061.com/posts/${post.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>La Red 106.1</news:name>
        <news:language>es</news:language>
      </news:publication>
      <news:publication_date>${new Date(post.date).toISOString()}</news:publication_date>
      <news:title><![CDATA[${post.title}]]></news:title>
    </news:news>
  </url>`).join('')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });

  } catch (error) {
    console.error('Error generando sitemap de noticias:', error);
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      status: 500,
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
