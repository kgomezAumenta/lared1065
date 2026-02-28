import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        // Permitir pasar un limite, máximo 50, por defecto 20
        let limit = parseInt(searchParams.get('limit') || '20', 10);
        if (isNaN(limit) || limit < 1) limit = 20;
        if (limit > 50) limit = 50;

        const wpUrl = process.env.NEXT_PUBLIC_WP_URL || "https://cms.lared1061.com";
        const query = `
        query GetApiPosts {
          posts(first: ${limit}) {
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
            // Cache de 5 minutos
            next: { revalidate: 300 },
        });

        const json = await res.json();

        if (json.errors) {
            throw new Error("GraphQL Error: " + JSON.stringify(json.errors));
        }

        const posts = json.data?.posts?.nodes || [];

        // Formatear los posts para que Make.com los pueda usar muy fácilmente
        const formattedPosts = posts.map((post: any) => {
            const postUrl = `https://www.lared1061.com/posts/${post.slug}`;
            const category = post.categories?.nodes[0]?.name || "Noticias";
            const imageUrl = post.featuredImage?.node?.sourceUrl || "";
            // Limpiar excerpt de etiquetas html
            const cleanExcerpt = post.excerpt ? post.excerpt.replace(/<[^>]*>?/gm, "").trim() : "";

            return {
                id: post.id,
                title: post.title,
                url: postUrl,
                slug: post.slug,
                date: new Date(post.date).toISOString(),
                category: category,
                excerpt: cleanExcerpt,
                imageUrl: imageUrl,
                author: post.author?.node?.name || "Redacción"
            };
        });

        return NextResponse.json(formattedPosts, {
            headers: {
                "Cache-Control": "s-maxage=300, stale-while-revalidate",
            },
        });
    } catch (error) {
        console.error("API Posts Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
