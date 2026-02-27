import { MetadataRoute } from 'next';

const WP_GRAPHQL_URL = `${process.env.NEXT_PUBLIC_WP_URL || 'https://cms.lared1061.com'}/graphql`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // URLs estáticas principales
    const staticUrls: MetadataRoute.Sitemap = [
        {
            url: 'https://lared1061.com',
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 1,
        },
        {
            url: 'https://lared1061.com/en-vivo',
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 0.9,
        },
        {
            url: 'https://lared1061.com/programacion',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: 'https://lared1061.com/category/nacionales',
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.8,
        },
        {
            url: 'https://lared1061.com/category/internacionales',
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.8,
        },
        {
            url: 'https://lared1061.com/category/economia',
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.8,
        },
        {
            url: 'https://lared1061.com/category/futbol-nacional',
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.8,
        },
        {
            url: 'https://lared1061.com/category/futbol-internacional',
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.8,
        },
        {
            url: 'https://lared1061.com/category/deporte-nacional',
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.8,
        },
        {
            url: 'https://lared1061.com/category/deporte-internacional',
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.8,
        },
    ];

    try {
        // Obtener los últimos 100 posts para el sitemap general
        const query = `
      query GetPostsForSitemap {
        posts(first: 100) {
          nodes {
            slug
            modified
          }
        }
      }
    `;

        const res = await fetch(WP_GRAPHQL_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
            next: { revalidate: 3600 }, // Cache por 1 hora
        });

        const json = await res.json();
        const posts = json?.data?.posts?.nodes || [];

        const dynamicUrls: MetadataRoute.Sitemap = posts.map((post: any) => ({
            url: `https://lared1061.com/posts/${post.slug}`,
            lastModified: new Date(post.modified),
            changeFrequency: 'daily',
            priority: 0.7,
        }));

        return [...staticUrls, ...dynamicUrls];
    } catch (error) {
        console.error('Error generando sitemap:', error);
        return staticUrls;
    }
}
