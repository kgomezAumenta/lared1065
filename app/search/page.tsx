import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Search as SearchIcon } from "lucide-react";

interface Post {
    id: string;
    title: string;
    slug: string;
    date: string;
    categories: {
        nodes: {
            name: string;
            slug: string;
        }[];
    };
    featuredImage: {
        node: {
            sourceUrl: string;
            altText: string;
        };
    };
}

async function getSearchData(query: string, categoryName?: string) {
    const gqlQuery = `
    query SearchPosts($search: String!, $categoryName: String) {
      posts(first: 20, where: { search: $search, categoryName: $categoryName }) {
        nodes {
          id
          title
          slug
          date
          categories {
            nodes {
              name
              slug
            }
          }
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  `;

    try {
        const wpUrl = process.env.NEXT_PUBLIC_WP_URL || "https://cms.lared1061.com";
        const res = await fetch(`${wpUrl}/graphql`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: gqlQuery,
                variables: { search: query, categoryName: categoryName || null }
            }),
            next: { revalidate: 60 },
        });

        const json = await res.json();
        return json.data?.posts?.nodes || [];
    } catch (error) {
        console.error("Error fetching search data:", error);
        return [];
    }
}

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";

    return {
        title: `Resultados para "${q}" - La Red 106.1`,
        description: `Resultados de búsqueda para ${q} en La Red 106.1`,
    };
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedSearchParams = await searchParams;
    const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
    const category = typeof resolvedSearchParams.category === "string" ? resolvedSearchParams.category : undefined;

    const posts = q ? await getSearchData(q, category) : [];

    return (
        <main className="container mx-auto px-4 py-8 pb-32">
            {/* Conditional Futbol Nacional Header Bar */}
            {category === 'futbol-nacional' && (
                <div className="mb-8 relative border-b-4 border-[#072517] pb-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                        <div>
                            <h1 className="text-4xl font-black uppercase text-[#072517] leading-tight tracking-tight">
                                FÚTBOL NACIONAL
                            </h1>
                            <p className="text-gray-500 font-medium mt-1">LIGA MAYOR DE GUATEMALA</p>
                        </div>
                        <Image
                            src="/teams/LogoLiga.png"
                            alt="Liga Nacional Guatemala"
                            width={60}
                            height={60}
                            className="object-contain"
                        />
                    </div>

                    <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
                        <div className="flex gap-4 min-w-max items-center">
                            {[
                                { name: 'Municipal', slug: 'municipal', img: '/teams/Municipal.png' },
                                { name: 'Comunicaciones', slug: 'comunicaciones', img: '/teams/comunicaciones.png' },
                                { name: 'Antigua GFC', slug: 'antigua', img: '/teams/Antigua.png' },
                                { name: 'Xelajú MC', slug: 'xelaju-mc', img: '/teams/Xelaju.png' },
                                { name: 'Guastatoya', slug: 'guastatoya', img: '/teams/Guastatoya.png' },
                                { name: 'Cobán Imperial', slug: 'coban-imperial', img: '/teams/CobanImperial.png' },
                                { name: 'Malacateco', slug: 'malacateco', img: '/teams/Malacateco.png' },
                                { name: 'Achuapa', slug: 'achuapa', img: '/teams/Achuapa.png' },
                                { name: 'Mixco', slug: 'mixco', img: '/teams/Mixco.png' },
                                { name: 'Marquense', slug: 'marquense', img: '/teams/Marquense.png' },
                                { name: 'Aurora', slug: 'aurora', img: '/teams/Aurora.png' },
                                { name: 'Mictlán', slug: 'mictlan', img: '/teams/Mictlan.png' },
                            ].map(team => (
                                <Link key={team.name} href={`/search?q=${team.slug}&category=futbol-nacional`} title={team.name} className={`flex-shrink-0 group flex flex-col items-center gap-2 ${q === team.slug ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                                    <div className={`w-12 h-12 rounded-full bg-gray-50 border shadow-sm flex items-center justify-center p-1.5 transition-all ${q === team.slug ? 'scale-110 border-[#E40000] shadow-md' : 'border-gray-200 group-hover:scale-110 group-hover:border-[#E40000] group-hover:shadow-md'}`}>
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={team.img}
                                                alt={team.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase tracking-tight text-center max-w-[60px] leading-tight line-clamp-2 ${q === team.slug ? 'text-[#E40000]' : 'text-gray-700 group-hover:text-[#E40000]'}`}>
                                        {team.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-extrabold uppercase text-gray-900 flex items-center gap-3">
                    <SearchIcon className="text-red-600" size={32} />
                    Búsqueda: {q} {category && <span className="text-gray-400 text-lg">en {category.replace('-', ' ')}</span>}
                </h1>
                <p className="text-gray-500 mt-2">
                    {posts.length} {posts.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                </p>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {posts.length > 0 ? (
                    posts.map((post: Post) => (
                        <Link key={post.id} href={`/posts/${post.slug}`} className="group flex flex-col gap-3">
                            <div className="relative h-48 w-full overflow-hidden rounded-lg bg-gray-200">
                                {post.featuredImage?.node?.sourceUrl ? (
                                    <Image
                                        src={post.featuredImage.node.sourceUrl}
                                        alt={post.featuredImage.node.altText || post.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-xs uppercase font-bold">Sin imagen</div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-red-600 text-xs font-bold uppercase mb-1">
                                    {post.categories?.nodes[0]?.name || "Noticia"}
                                </span>
                                <h2 className="font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors line-clamp-3">
                                    {post.title}
                                </h2>
                                <span className="text-gray-400 text-xs mt-2">
                                    {new Date(post.date).toLocaleDateString('es-GT', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-xl font-bold mb-2">No se encontraron resultados</p>
                        <p>Intenta con otras palabras clave o desliza por nuestras categorías.</p>
                        <Link href="/" className="inline-block mt-6 bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors">
                            Volver al Inicio
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
