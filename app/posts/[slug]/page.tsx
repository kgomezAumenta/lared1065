import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Link as LinkIcon, MessageSquare, Share2, Bookmark } from "lucide-react";
import AdvertisingBanner from "@/components/AdvertisingBanner";
import PostScripts from "@/components/PostScripts"; // Assuming you have this or will use a placeholder

interface Post {
    id: string;
    title: string;
    content: string;
    slug: string;
    date: string;
    excerpt: string;
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
    author: {
        node: {
            name: string;
        };
    };
}

// Strip HTML helper
const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "");
};

// Process content to fix lazy loaded images and clean scripts
const processContent = (content: string) => {
    if (!content) return "";
    // Remove the lazyload placeholder src
    let processed = content.replace(/src="data:image\/gif;base64,[^"]*"/g, '');
    // Replace data-src with src
    processed = processed.replace(/data-src=/g, 'src=');
    // Replace data-srcset with srcset
    processed = processed.replace(/data-srcset=/g, 'srcset=');
    // Remove inline scripts to clean up and prevent conflicts
    processed = processed.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gim, "");
    return processed;
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
            console.log("DEBUG: Related News using first tag:", firstTagSlug);

            const relatedQuery = `
            query GetRelatedPosts($tagSlugs: [String]) {
              posts(first: 6, where: { tagSlugIn: $tagSlugs }) {
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
                    variables: { tagSlugs }
                }),
                next: { revalidate: 60 },
            });
            const relatedJson = await relatedRes.json();
            relatedPosts = relatedJson.data?.posts?.nodes || [];
            console.log("DEBUG: Fetched Related Posts Count:", relatedPosts.length);
        } else {
            console.log("DEBUG: No tags found for post");
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
    const otherPosts = recentPosts.filter((p: Post) => p.id !== post.id).slice(0, 5);

    // Process Related Posts
    // 1. Exclude current post
    // 2. Filter by date (last 2 weeks)
    // 3. Limit to 5
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const filteredRelatedPosts = relatedPosts
        .filter((p: Post) => p.id !== post.id) // Exclude current
        .filter((p: Post) => new Date(p.date) > twoWeeksAgo) // Recent only
        .slice(0, 5);

    console.log("DEBUG: Filtered Related Posts:", filteredRelatedPosts.length);

    return (
        <main className="container mx-auto px-4 py-8 pb-32">

            {/* Top Red Ad Banner */}
            <div className="mb-12">
                <AdvertisingBanner slotId="2850891862" placeholderText="Anuncio Top" />
            </div>

            <div className="flex flex-col xl:flex-row gap-12 justify-center items-start">

                {/* Main Content Column */}
                <article className="flex-1 w-full max-w-[900px]">

                    {/* Category Pill */}
                    <div className="flex justify-start mb-4">
                        <span className="bg-[#E40000] text-white text-base font-bold uppercase px-6 py-2 rounded-[10px]">
                            {post.categories?.nodes[0]?.name || "NOTICIA"}
                        </span>
                    </div>

                    {/* Title */}
                    {/* Title - Reduced to 36px (4xl) per request */}
                    <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-black">
                        {post.title}
                    </h1>

                    {/* Meta: Author & Date */}
                    <div className="flex justify-between items-center w-full mb-6">
                        <span className="text-black text-xl font-normal">
                            {post.author?.node?.name || "Redacción"}
                        </span>
                        {new Date(post.date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>

                    {/* Featured Image */}
                    {post.featuredImage?.node?.sourceUrl && (
                        <div className="relative w-full aspect-video mb-8 overflow-hidden rounded-[20px]">
                            <Image
                                src={post.featuredImage.node.sourceUrl}
                                alt={post.featuredImage.node.altText || post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    {/* Tags List */}
                    {post.tags?.nodes?.length ? (
                        <div className="flex flex-wrap gap-2 mb-8">
                            {post.tags.nodes.map((tag: any) => (
                                <Link
                                    key={tag.slug}
                                    href={`/search?q=${encodeURIComponent(tag.name)}`}
                                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase hover:bg-[#E40000] hover:text-white transition-colors"
                                >
                                    {tag.name}
                                </Link>
                            ))}
                        </div>
                    ) : null}

                    {/* Content */}
                    <div
                        className="prose prose-lg prose-red max-w-none text-[#717171] text-xl font-normal leading-relaxed
                        prose-headings:font-bold prose-headings:text-black
                        prose-p:mb-6 prose-p:leading-relaxed
                        prose-a:text-[#E40000] prose-a:no-underline hover:prose-a:underline
                        prose-img:rounded-[20px] prose-img:shadow-sm prose-img:w-full prose-img:h-auto prose-img:my-6
                        prose-figure:my-8 prose-figure:mx-auto prose-figure:w-full
                        [&_figure]:w-full [&_figure]:max-w-full
                        [&_iframe]:w-full [&_iframe]:rounded-[15px] [&_iframe]:shadow-md [&_iframe]:mx-auto
                        [&_.wp-embedded-content]:max-w-full
                        "
                        dangerouslySetInnerHTML={{ __html: processContent(post.content) }}
                    />



                </article>

                {/* Sidebar Column */}
                <aside className="w-full xl:w-[400px] shrink-0 flex flex-col gap-8">

                    {/* RELATED NEWS SECTION - Only if we have posts */}
                    {filteredRelatedPosts.length > 0 && (
                        <div className="flex flex-col">
                            <div className="bg-[#FF0000] rounded-[15px] py-3 px-4 mb-4 flex justify-center items-center">
                                <h3 className="text-xl font-bold text-white text-center uppercase">NOTICIAS RELACIONADAS</h3>
                            </div>

                            <div className="flex flex-col border border-[#DCDCDC] rounded-[15px] overflow-hidden">
                                {filteredRelatedPosts.map((rPost: Post, idx: number) => (
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
                            {otherPosts.map((sPost: Post, idx: number) => (
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

            {/* Bottom Grid "Lo Que Necesitas Saber" - Optional Reuse from existing if needed, but sticking to design request for now this matches layout */}


            <PostScripts />
        </main>
    );
}
