import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const wpUrl = process.env.NEXT_PUBLIC_WP_URL || "https://cms.lared1061.com";
        const query = `
        query GetRssPosts {
          posts(first: 20) {
            nodes {
              id
              title
              slug
              date
              excerpt
              author {
                node {
                  name
                }
              }
              categories {
                nodes {
                  name
                }
              }
              featuredImage {
                node {
                  sourceUrl
                }
              }
            }
          }
        }
        `;

        const res = await fetch(`${wpUrl}/graphql`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
            // Allow cached feeds but refresh every 5 mins
            next: { revalidate: 300 },
        });

        const json = await res.json();
        const posts = json.data?.posts?.nodes || [];

        // Build the RSS XML string
        const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>La Red 106.1 - Noticias</title>
    <link>https://www.lared1061.com</link>
    <description>Últimas noticias de Deportes, Nacionales e Internacionales de La Red 106.1 Guatemala.</description>
    <language>es-GT</language>
    <atom:link href="https://www.lared1061.com/feed" rel="self" type="application/rss+xml"/>
    ${posts.map((post: any) => {
            const postUrl = `https://www.lared1061.com/posts/${post.slug}`;
            const category = post.categories?.nodes[0]?.name || "Noticias";
            const imageUrl = post.featuredImage?.node?.sourceUrl || "";
            // Clean excerpt from html tags for description
            const cleanExcerpt = post.excerpt ? post.excerpt.replace(/<[^>]*>?/gm, "").trim() : "";

            return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category><![CDATA[${category}]]></category>
      <description><![CDATA[${cleanExcerpt}]]></description>
      ${imageUrl ? `<media:content url="${imageUrl}" type="image/jpeg" medium="image"/>` : ""}
    </item>`;
        }).join('')}
  </channel>
</rss>`;

        return new NextResponse(rssFeed, {
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "s-maxage=300, stale-while-revalidate",
            },
        });
    } catch (error) {
        console.error("RSS Feed Error:", error);
        return new NextResponse("Internal Server Error generating feed", { status: 500 });
    }
}
