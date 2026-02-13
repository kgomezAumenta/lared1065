import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AdvertisingBanner from "@/components/AdvertisingBanner";
import PostScripts from "@/components/PostScripts";
import ArticleFeed from "@/components/ArticleFeed";

// ... (keep stripHtml helper if needed for metadata)
const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "");
};

async function getData(slug: string) {
    const query = `
    query GetPostData($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        id
        title
        content
        slug
        date
        excerpt
        categories {
            nodes {
                name
                slug
            }
        }
        tags {
            nodes {
                slug
                name
            }
        }
        featuredImage {
            node {
                sourceUrl
                altText
            }
        }
        author {
            node {
                name
            }
        }
      }
      latestPosts: posts(first: 6) {
        nodes {
          id
          title
          slug
          date
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
           categories {
            nodes {
                name
                slug
            }
        }
        }
      }
    }
  `;

    try {
        const res = await fetch("https://www.lared1061.com/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, variables: { slug } }),
            next: { revalidate: 60 },
        });
        const json = await res.json();
        const post = json.data?.post || null;
        let relatedPosts = [];

        if (post && post.tags?.nodes?.length > 0) {
            // Use only the FIRST tag for more focused relation
            const firstTagSlug = post.tags.nodes[0].slug;
            const tagSlugs = [firstTagSlug];

            // Fetch related posts (lite version for queue)
            const relatedQuery = `
            query GetRelatedPosts($tagSlugs: [String], $notIn: [ID]) {
              posts(first: 6, where: { tagSlugIn: $tagSlugs, notIn: $notIn }) {
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

            const relatedRes = await fetch("https://www.lared1061.com/graphql", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: relatedQuery,
                    variables: { tagSlugs, notIn: [post.id] }
                }),
                next: { revalidate: 60 },
            });
            const relatedJson = await relatedRes.json();
            relatedPosts = relatedJson.data?.posts?.nodes || [];
        }

        // Fallback to Category if no related posts found
        if (relatedPosts.length === 0 && post && post.categories?.nodes?.length > 0) {
            const categorySlug = post.categories.nodes[0].slug;
            console.log("DEBUG: Fallback to Category:", categorySlug);

            const categoryQuery = `
             query GetCategoryPosts($categorySlug: String, $notIn: [ID]) {
               posts(first: 6, where: { categoryName: $categorySlug, notIn: $notIn }) {
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

            const catRes = await fetch("https://www.lared1061.com/graphql", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: categoryQuery,
                    variables: { categorySlug, notIn: [post.id] }
                }),
                next: { revalidate: 60 },
            });
            const catJson = await catRes.json();
            relatedPosts = catJson.data?.posts?.nodes || [];
        }

        return {
            post,
            recentPosts: json.data?.latestPosts?.nodes || [],
            relatedPosts
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        return { post: null, recentPosts: [], relatedPosts: [] };
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const { post } = await getData(slug);

    if (!post) {
        return {
            title: "Not Found",
        };
    }

    return {
        title: `${post.title} - La Red 106.1`,
        description: stripHtml(post.excerpt) || `Lea más sobre ${post.title} en La Red 106.1`,
    };
}

export default async function PostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const { post, recentPosts, relatedPosts } = await getData(slug);

    if (!post) {
        notFound();
    }

    // Filter out current post from recent posts for sidebar
    const otherPosts = recentPosts.filter((p: any) => p.id !== post.id).slice(0, 5);

    // Initial Related Filtering
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const filteredRelatedPosts = relatedPosts
        .filter((p: any) => p.id !== post.id)
        .filter((p: any) => new Date(p.date) > twoWeeksAgo)
        .slice(0, 5);

    return (
        <main className="container mx-auto px-4 py-8 pb-32">

            {/* Top Red Ad Banner */}
            <div className="mb-12">
                <AdvertisingBanner slotId="2850891862" placeholderText="Anuncio Top" />
            </div>

            <div className="flex flex-col xl:flex-row gap-12 justify-center items-start">

                {/* Main Content Column - Now Infinite Scroll Feed */}
                <div className="flex-1 w-full max-w-[900px]">
                    <ArticleFeed initialPost={post} initialRelatedPosts={filteredRelatedPosts} />
                </div>

                {/* Sidebar Column */}
                <aside className="w-full xl:w-[400px] shrink-0 flex flex-col gap-8 sticky top-4">

                    {/* RELATED NEWS SECTION - Initial context */}
                    {filteredRelatedPosts.length > 0 && (
                        <div className="flex flex-col">
                            <div className="bg-[#FF0000] rounded-[15px] py-3 px-4 mb-4 flex justify-center items-center">
                                <h3 className="text-xl font-bold text-white text-center uppercase">NOTICIAS RELACIONADAS</h3>
                            </div>

                            <div className="flex flex-col border border-[#DCDCDC] rounded-[15px] overflow-hidden">
                                {filteredRelatedPosts.map((rPost: any, idx: number) => (
                                    <Link key={rPost.id} href={`/posts/${rPost.slug}`} className="p-5 border-b border-[#DCDCDC] last:border-0 flex gap-6 items-center hover:bg-gray-50 transition-colors group">
                                        <div className="relative w-[100px] h-[75px] shrink-0 rounded-[8px] overflow-hidden bg-gray-200">
                                            {rPost.featuredImage?.node?.sourceUrl && (
                                                <Image
                                                    src={rPost.featuredImage.node.sourceUrl}
                                                    alt={rPost.featuredImage.node.altText || rPost.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[#E40000] text-xs font-bold uppercase">
                                                {rPost.categories?.nodes[0]?.name || "NOTICIAS"}
                                            </span>
                                            <h4 className="text-base font-bold text-black leading-tight group-hover:text-[#E40000] transition-colors line-clamp-3">{rPost.title}</h4>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* LO MÁS RECIENTE DE LA RED */}
                    <div className="flex flex-col">
                        <div className="bg-[#FF0000] rounded-[15px] py-3 px-4 mb-4 flex justify-center items-center">
                            <h3 className="text-xl font-bold text-white text-center uppercase">LO MÁS RECIENTE DE LA RED</h3>
                        </div>

                        <div className="flex flex-col border border-[#DCDCDC] rounded-[15px] overflow-hidden">
                            {otherPosts.map((sPost: any, idx: number) => (
                                <Link key={sPost.id} href={`/posts/${sPost.slug}`} className="p-5 border-b border-[#DCDCDC] last:border-0 flex gap-6 items-center hover:bg-gray-50 transition-colors group">
                                    <span className="text-[#9F9F9F] text-2xl font-bold">
                                        {String(idx + 1).padStart(2, '0')}
                                    </span>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[#E40000] text-sm font-bold uppercase">
                                            {sPost.categories?.nodes[0]?.name || "NOTICIAS"}
                                        </span>
                                        <h4 className="text-lg font-bold text-black leading-tight group-hover:text-[#E40000] transition-colors">{sPost.title}</h4>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Ad Vertical - Grey */}
                    <AdvertisingBanner
                        slotId="4243864586"
                        placeholderText="Anuncio Sidebar"
                        className="w-full min-h-[600px] bg-[#F0F0F0] rounded-[15px]"
                    />

                </aside>

            </div>

        </main>
    );
}
