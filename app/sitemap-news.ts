import { MetadataRoute } from 'next';

const WP_GRAPHQL_URL = 'https://www.lared1061.com/graphql';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        // Para Google News, normalmente se incluyen artículos de las últimas 48 horas.
        // Aquí limitamos a los últimos 50 artículos recientes.
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
            next: { revalidate: 600 }, // Cache por 10 minutos para frescura
        });

        const json = await res.json();
        const posts = json?.data?.posts?.nodes || [];

        const newsUrls: MetadataRoute.Sitemap = posts.map((post: any) => ({
            url: `https://lared1061.com/posts/${post.slug}`,
            lastModified: new Date(post.date),
            // Atributos específicos de News (usando formato estándar Sitemap/Next)
            // Aunque Next.js type `MetadataRoute.Sitemap` en 14/15 no tiene "news" anidado explícitamente en el core,
            // se puede inyectar o manejar con plugins, o aprovechar los tags regulares.
            // Aquí devolvemos el mapping básico de URL de las últimas noticias. 
            // Si usas un linter estricto, Google también procesa sitemaps normales de gran frecuencia.
            changeFrequency: 'hourly',
            priority: 0.9,
        }));

        return newsUrls;
    } catch (error) {
        console.error('Error generando sitemap de noticias:', error);
        return [];
    }
}
