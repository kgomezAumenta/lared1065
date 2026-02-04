import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AdvertisingBanner from "@/components/AdvertisingBanner";

interface Post {
    id: string;
    title: string;
    slug: string;
    date: string;
    excerpt: string;
    author: {
        node: {
            name: string;
        }
    };
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
    type?: 'post';
}

interface AdItem {
    id: string;
    type: 'ad';
    title: string;
    content: string;
}

type GridItem = Post | AdItem;

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
          excerpt
          author {
            node {
              name
            }
          }
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

// Helper to inject ads at specific positions
function insertAds(posts: Post[]): GridItem[] {
    const items: GridItem[] = [];
    const adsConfiguration = [
        { index: 1, id: 'ad-1', title: 'Anuncio 1', content: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.' },
        { index: 8, id: 'ad-2', title: 'Anuncio 1', content: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.' }
    ];

    let currentPost = 0;
    const maxItems = posts.length + adsConfiguration.length;

    for (let i = 0; i < maxItems; i++) {
        const ad = adsConfiguration.find(a => a.index === i);
        if (ad) {
            items.push({ type: 'ad', ...ad });
        } else {
            if (currentPost < posts.length) {
                items.push({ type: 'post', ...posts[currentPost] });
                currentPost++;
            } else {
                break;
            }
        }
    }

    return items;
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

    // Filter main categories for sidebar
    const mainCategories = categories.filter((cat: CategoryCount) =>
        ['nacionales', 'internacionales', 'economia', 'futbol-nacional', 'futbol-internacional', 'deporte-nacional', 'deporte-internacional'].includes(cat.slug)
    );

    const gridItems = insertAds(posts);

    return (
        <main className="container mx-auto px-4 py-8 pb-32">
            {/* Header with Underline */}
            <div className="mb-6 relative">
                <h1 className="text-2xl font-bold uppercase text-gray-900 leading-tight">
                    {title}
                </h1>
                <div className="w-full h-[2px] bg-black mt-2 max-w-full"></div>
            </div>

            {/* Advertising Banner (From Figma) */}
            <AdvertisingBanner className="rounded-[15px] mb-12 shadow-sm min-h-[150px]" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Main Content - 3 columns */}
                <div className="lg:col-span-3">
                    {/* Posts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-8">
                        {gridItems.length > 0 ? (
                            gridItems.map((item: GridItem) => {
                                if (item.type === 'ad') {
                                    return (
                                        <div key={item.id} className="h-full">
                                            <AdvertisingBanner className="h-full rounded-[15px] px-6 py-8" />
                                        </div>
                                    );
                                }

                                const post = item as Post;
                                return (
                                    <Link key={post.id} href={`/posts/${post.slug}`} className="group flex flex-col gap-3">
                                        {/* Image */}
                                        <div className="relative h-[169px] w-full overflow-hidden rounded-[10px] bg-gray-200">
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

                                        {/* Category Tag Pill */}
                                        <div className="flex">
                                            <span className="bg-[#E40000] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-[10px]">
                                                {post.categories?.nodes[0]?.name || title}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h2 className="font-bold text-[18px] leading-tight text-black group-hover:text-[#E40000] transition-colors line-clamp-3">
                                            {post.title}
                                        </h2>

                                        {/* Excerpt */}
                                        <div
                                            className="text-[#717171] text-[13px] font-normal leading-snug line-clamp-4"
                                            dangerouslySetInnerHTML={{ __html: post.excerpt }}
                                        />

                                        {/* Meta: Author and Date */}
                                        <div className="flex justify-between items-center text-[11px] text-black mt-1">
                                            <span className="font-normal">{post.author?.node?.name || 'Redacción'}</span>
                                            <span className="text-[#9F9F9F] font-normal">
                                                {new Date(post.date).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })
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
                                        className="px-6 py-2 border border-[#E40000] text-[#E40000] rounded font-bold hover:bg-[#E40000] hover:text-white transition-colors"
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
                                        className="px-6 py-2 border border-[#E40000] text-[#E40000] rounded font-bold hover:bg-[#E40000] hover:text-white transition-colors"
                                    >
                                        Siguiente →
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-1 space-y-8">
                    {/* Internacionales Section (Mini List) */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-[#E40000] text-center text-white font-bold text-[18px] py-2 rounded-[15px] uppercase">
                            Internacionales
                        </div>
                        <div className="space-y-4">
                            {sidebarPosts.slice(0, 4).map((post: Post) => (
                                <Link key={post.id} href={`/posts/${post.slug}`} className="group flex gap-3 border-b border-[#E3E3E3] pb-3 last:border-0 items-center">
                                    <div className="relative w-[80px] h-[80px] shrink-0 overflow-hidden rounded-[10px] bg-gray-200">
                                        {post.featuredImage?.node?.sourceUrl && (
                                            <Image
                                                src={post.featuredImage.node.sourceUrl}
                                                alt={post.featuredImage.node.altText || post.title}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center gap-1">
                                        <span className="text-[#E40000] text-[10px] font-bold uppercase block">
                                            Internacionales
                                        </span>
                                        <h3 className="text-[14px] text-black font-bold leading-tight group-hover:text-[#E40000] transition-colors line-clamp-3">
                                            {post.title}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Ad Box - LARGE RED BOX below sidebar list */}
                    <AdvertisingBanner className="rounded-[15px] px-6 py-8 min-h-[300px]" />

                    {/* Otras Secciones - Black Box with Red Top */}
                    <div className="bg-black rounded-t-[20px] overflow-hidden">
                        <div className="bg-[#FF0000] text-white font-bold text-[18px] px-6 py-4 rounded-t-[15px] uppercase text-center">
                            OTRAS SECCIONES
                        </div>
                        <div className="flex flex-col">
                            {mainCategories.map((cat: CategoryCount) => (
                                <Link
                                    key={cat.slug}
                                    href={`/category/${cat.slug}`}
                                    className="flex justify-between items-center px-6 py-4 border-b border-gray-800 hover:bg-white/10 transition-colors last:border-0"
                                >
                                    <span className="text-white text-[14px] font-medium uppercase">{cat.name}</span>
                                    <span className="text-white text-[14px] font-bold">{cat.count || 0}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
