import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

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

interface CategoryCount {
    name: string;
    slug: string;
    count: number;
}

interface PageInfo {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    endCursor: string | null;
    startCursor: string | null;
}

async function getCategoryData(slug: string, after?: string, before?: string) {
    const query = `
    query GetCategoryPosts($categoryName: String!, $categoryId: ID!, $first: Int, $last: Int, $after: String, $before: String) {
      posts(first: $first, last: $last, after: $after, before: $before, where: { categoryName: $categoryName }) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
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
      category(id: $categoryId, idType: SLUG) {
        name
        description
        count
      }
      sidebarPosts: posts(first: 5, where: { categoryName: "internacionales" }) {
        nodes {
          id
          title
          slug
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
      categories(first: 20) {
        nodes {
          name
          slug
          count
        }
      }
    }
  `;

    console.log('[CATEGORY PAGE] Fetching data for slug:', slug, 'after:', after, 'before:', before);

    try {
        const variables: any = {
            categoryName: slug,
            categoryId: slug,
        };

        if (before) {
            variables.last = 15;
            variables.before = before;
        } else {
            variables.first = 15;
            variables.after = after || null;
        }

        const res = await fetch("https://www.lared1061.com/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query,
                variables
            }),
            next: { revalidate: 60 },
        });

        const json = await res.json();

        if (json.errors) {
            console.error('[CATEGORY PAGE] GraphQL Errors:', json.errors);
        }

        return {
            posts: json.data?.posts?.nodes || [],
            pageInfo: json.data?.posts?.pageInfo || null,
            categoryInfo: json.data?.category || null,
            sidebarPosts: json.data?.sidebarPosts?.nodes || [],
            categories: json.data?.categories?.nodes || [],
        };
    } catch (error) {
        console.error("Error fetching category data:", error);
        return {
            posts: [],
            pageInfo: null,
            categoryInfo: null,
            sidebarPosts: [],
            categories: []
        };
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const { categoryInfo } = await getCategoryData(slug);

    const title = categoryInfo?.name || slug.charAt(0).toUpperCase() + slug.slice(1);

    return {
        title: `${title} - La Red 106.1`,
        description: `Noticias y artículos sobre ${title}`,
    };
}

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const after = typeof resolvedSearchParams.after === 'string' ? resolvedSearchParams.after : undefined;
    const before = typeof resolvedSearchParams.before === 'string' ? resolvedSearchParams.before : undefined;
    const page = Number(resolvedSearchParams.page) || 1;

    const { posts, pageInfo, categoryInfo, sidebarPosts, categories } = await getCategoryData(slug, after, before);

    const title = categoryInfo?.name || slug.replace("-", " ").toUpperCase();

    // Filter main categories for sidebar (matching WordPress categories)
    const mainCategories = categories.filter((cat: CategoryCount) =>
        ['nacionales', 'internacionales', 'economia', 'futbol-nacional', 'futbol-internacional', 'deporte-nacional', 'deporte-internacional'].includes(cat.slug)
    );

    return (
        <main className="container mx-auto px-4 py-8 pb-32">
            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-extrabold uppercase text-gray-900">
                    {title}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content - 3 columns */}
                <div className="lg:col-span-3">
                    {/* Posts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {posts.length > 0 ? (
                            posts.map((post: Post) => (
                                <Link key={post.id} href={`/posts/${post.slug}`} className="group flex flex-col gap-3">
                                    <div className="relative h-48 w-full overflow-hidden rounded-lg bg-gray-200">
                                        {post.featuredImage?.node?.sourceUrl ? (
                                            <Image
                                                src={post.featuredImage.node.sourceUrl}
                                                alt={post.featuredImage.node.altText || post.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 text-xs uppercase font-bold">Sin imagen</div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-red-600 text-xs font-bold uppercase mb-1">
                                            {post.categories?.nodes[0]?.name || title}
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
                            <div className="col-span-full py-20 text-center text-gray-500">
                                <p className="text-xl">No hay noticias en esta categoría aún.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {(pageInfo?.hasNextPage || pageInfo?.hasPreviousPage) && (
                        <div className="flex justify-center mt-8">
                            <div className="flex gap-4">
                                {pageInfo.hasPreviousPage && (
                                    <Link
                                        href={`/category/${slug}?before=${pageInfo.startCursor}&page=${Math.max(1, page - 1)}`}
                                        className="px-6 py-2 border border-red-600 text-red-600 rounded font-bold hover:bg-red-600 hover:text-white transition-colors"
                                    >
                                        ← Anterior
                                    </Link>
                                )}

                                <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded font-bold flex items-center">
                                    Página {page}
                                </span>

                                {pageInfo.hasNextPage && (
                                    <Link
                                        href={`/category/${slug}?after=${pageInfo.endCursor}&page=${page + 1}`}
                                        className="px-6 py-2 border border-red-600 text-red-600 rounded font-bold hover:bg-red-600 hover:text-white transition-colors"
                                    >
                                        Siguiente →
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-1">
                    {/* Internacionales Section */}
                    <div className="mb-8">
                        <div className="bg-red-600 text-white font-bold text-sm px-4 py-2 mb-4 uppercase">
                            Internacionales
                        </div>
                        <div className="space-y-4">
                            {sidebarPosts.slice(0, 5).map((post: Post) => (
                                <Link key={post.id} href={`/posts/${post.slug}`} className="group flex gap-3">
                                    <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded bg-gray-200">
                                        {post.featuredImage?.node?.sourceUrl && (
                                            <Image
                                                src={post.featuredImage.node.sourceUrl}
                                                alt={post.featuredImage.node.altText || post.title}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-red-600 text-xs font-bold uppercase block mb-1">
                                            Internacionales
                                        </span>
                                        <h3 className="text-sm font-bold leading-tight group-hover:text-red-600 transition-colors line-clamp-3">
                                            {post.title}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Otras Secciones */}
                    <div className="bg-red-600 text-white rounded-lg overflow-hidden">
                        <div className="font-bold text-sm px-4 py-3 uppercase">
                            Otras secciones
                        </div>
                        <div className="bg-red-700">
                            {mainCategories.map((cat: CategoryCount) => (
                                <Link
                                    key={cat.slug}
                                    href={`/category/${cat.slug}`}
                                    className="flex justify-between items-center px-4 py-3 border-b border-red-600 hover:bg-red-600 transition-colors text-sm"
                                >
                                    <span className="uppercase font-semibold">{cat.name}</span>
                                    <span className="font-bold">{cat.count || 0}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
