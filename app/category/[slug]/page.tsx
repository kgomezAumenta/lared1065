import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AdvertisingBanner from "@/components/AdvertisingBanner";
import { generateSeoMetadata, SeoFragment } from "@/lib/seo";
import BreakingNewsRealtime from "@/components/BreakingNewsRealtime";

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
    adId: number;
    title?: string;
    content?: string;
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
        ${SeoFragment}
      }
      latestPosts: posts(first: 5) {
        nodes {
          id
          title
          slug
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

        const wpUrl = process.env.NEXT_PUBLIC_WP_URL || "https://cms.lared1061.com";
        const res = await fetch(`${wpUrl}/graphql`, {
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
            latestPosts: json.data?.latestPosts?.nodes || [],
            categories: json.data?.categories?.nodes || [],
        };
    } catch (error) {
        console.error("Error fetching category data:", error);
        return {
            posts: [],
            pageInfo: null,
            categoryInfo: null,
            latestPosts: [],
            categories: []
        };
    }
}

// Helper to inject ads at specific positions
function insertAds(posts: Post[]): GridItem[] {
    const items: GridItem[] = [];
    const adsConfiguration: (AdItem & { index: number })[] = [
        { index: 1, id: 'ad-1', type: 'ad', adId: 37431 },
        { index: 8, id: 'ad-2', type: 'ad', adId: 37432 }
    ];

    let currentPost = 0;
    const maxItems = posts.length + adsConfiguration.length;

    for (let i = 0; i < maxItems; i++) {
        const ad = adsConfiguration.find(a => a.index === i);
        if (ad) {
            items.push(ad);
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

    return generateSeoMetadata(categoryInfo?.seo, `${title} - La Red 106.1`);
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

    const { posts, pageInfo, categoryInfo, latestPosts, categories } = await getCategoryData(slug, after, before);

    const title = categoryInfo?.name || slug.replace("-", " ").toUpperCase();

    // Filter main categories for sidebar
    const mainCategories = categories.filter((cat: CategoryCount) =>
        ['nacionales', 'internacionales', 'economia', 'futbol-nacional', 'futbol-internacional', 'deporte-nacional', 'deporte-internacional'].includes(cat.slug)
    );

    const gridItems = insertAds(posts);

    return (
        <main className="container mx-auto px-4 py-8 pb-32">


            {/* Advertising Banner (From Figma) */}
            <div className="flex justify-center w-full mb-12">
                <AdvertisingBanner adId={37430} placeholderText="Headless Cat Top" className="w-full flex justify-center" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Main Content - 3 columns */}
                <div className="lg:col-span-3">
                    {/* Header with Underline - Moved here per user request */}
                    <div className="mb-8 relative">
                        <h1 className="text-3xl font-black uppercase text-gray-900 leading-tight tracking-tight">
                            {title}
                        </h1>
                        <div className="w-full h-[3px] bg-black mt-3 max-w-full"></div>
                    </div>

                    {/* Posts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-8">
                        {gridItems.length > 0 ? (
                            gridItems.map((item: GridItem) => {
                                if (item.type === 'ad') {
                                    return (
                                        <div key={item.id} className="h-full flex items-center justify-center">
                                            <AdvertisingBanner adId={item.adId} className="w-full flex justify-center" placeholderText="Anuncio Interno" />
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
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                                        <h2 className="font-bold text-base leading-tight text-black group-hover:text-[#E40000] transition-colors line-clamp-3">
                                            {post.title}
                                        </h2>

                                        {/* Excerpt */}
                                        <div
                                            className="text-[#717171] text-[13px] font-normal leading-snug line-clamp-4"
                                            dangerouslySetInnerHTML={{ __html: post.excerpt }}
                                        />

                                        {/* Meta: Author and Date */}
                                        <div className="flex justify-between items-center text-[11px] text-black mt-1">
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
                    {/* AHORA Section - Realtime Firebase */}
                    <div className="hidden md:block">
                        <BreakingNewsRealtime />
                    </div>

                    {/* Lo Más Reciente de La Red */}
                    <div className="hidden md:flex flex-col">
                        <div className="bg-[#FF0000] rounded-[15px] py-3 px-4 mb-4 flex justify-center items-center">
                            <h3 className="text-lg font-bold text-white text-center">LO MÁS RECIENTE DE LA RED</h3>
                        </div>

                        <div className="flex flex-col gap-0 border border-[#DCDCDC] rounded-[15px] overflow-hidden bg-white">
                            {latestPosts.map((post: Post, i: number) => (
                                <div key={post.id} className="p-4 border-b border-[#DCDCDC] last:border-0 flex gap-4 items-center hover:bg-gray-50 transition-colors">
                                    <span className="text-[#9F9F9F] text-lg font-bold">0{i + 1}</span>
                                    <div className="flex flex-col gap-1 w-full">
                                        <span className="text-[#E40000] text-[10px] font-bold uppercase">
                                            {post.categories?.nodes[0]?.name || "NOTICIAS"}
                                        </span>
                                        <Link href={`/posts/${post.slug}`}>
                                            <h4 className="text-sm font-bold text-black leading-tight hover:text-[#E40000] transition-colors">{post.title}</h4>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ad Box - LARGE RED BOX below sidebar list */}
                    <div className="flex justify-center w-full">
                        <AdvertisingBanner adId={37433} placeholderText="Headles Cat Vertical Side" className="w-full flex justify-center" />
                    </div>

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
