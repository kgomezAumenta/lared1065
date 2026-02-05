import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Facebook, Twitter, Link as LinkIcon, MessageSquare, Share2, Bookmark } from "lucide-react";
import AdvertisingBanner from "@/components/AdvertisingBanner"; // Assuming you have this or will use a placeholder

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
        return {
            post: json.data?.post || null,
            recentPosts: json.data?.latestPosts?.nodes || [],
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        return { post: null, recentPosts: [] };
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
    const { post, recentPosts } = await getData(slug);

    if (!post) {
        notFound();
    }

    // Filter out current post from recent posts for sidebar
    const otherPosts = recentPosts.filter((p: Post) => p.id !== post.id).slice(0, 5);
    const bottomGridPosts = recentPosts.filter((p: Post) => p.id !== post.id).slice(0, 4);

    return (
        <main className="container mx-auto px-4 py-8 pb-32">

            {/* Top Red Ad Banner */}
            <div className="w-full bg-[#FF0000] rounded-[15px] flex flex-col justify-center items-center gap-3 py-10 mb-12 text-center text-white p-6">
                <h3 className="text-2xl font-bold">Anuncio 1</h3>
                <p className="text-xl max-w-4xl">Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>
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
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-black">
                        {post.title}
                    </h1>

                    {/* Meta: Author & Date */}
                    <div className="flex justify-between items-center w-full mb-6">
                        <span className="text-black text-xl font-normal">
                            {post.author?.node?.name || "Redacción"}
                        </span>
                        <span className="text-[#9F9F9F] text-xl font-normal">
                            {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
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

                    {/* oEmbed Activation Logic */}
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                            (function() {
                                function activeEmbeds() {
                                    const iframes = document.querySelectorAll('iframe.wp-embedded-content');
                                    iframes.forEach(iframe => {
                                        if (iframe.getAttribute('data-src') && !iframe.src) {
                                            iframe.src = iframe.getAttribute('data-src');
                                        }
                                        iframe.style.visibility = 'visible';
                                        iframe.style.position = 'static';
                                        const secret = iframe.getAttribute('data-secret');
                                        if (secret) {
                                            const blockquote = document.querySelector('blockquote.wp-embedded-content[data-secret="' + secret + '"]');
                                            if (blockquote) { blockquote.style.display = 'none'; }
                                        }
                                    });
                                    });
                                    
                                    // Re-scan for Instagram/Twitter if new content injected or lazy loaded
                                    if (window.instgrm) window.instgrm.Embeds.process();
                                    if (window.twttr) window.twttr.widgets.load();
                                }
                                window.addEventListener('load', activeEmbeds);
                                setTimeout(activeEmbeds, 1000);
                                setTimeout(activeEmbeds, 3000);
                            })();
                            `,
                        }}
                    />

                </article>

                {/* Sidebar Column */}
                <aside className="w-full xl:w-[400px] shrink-0 flex flex-col gap-8">

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
                    <div className="w-full h-[600px] bg-[#F0F0F0] rounded-[15px] flex flex-col justify-center items-center text-[#717171] p-6 text-center text-xl">
                        <h3 className="font-bold mb-2 text-[#9F9F9F]">Anuncio 1</h3>
                        <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</p>
                    </div>

                </aside>

            </div>

            {/* Bottom Grid "Lo Que Necesitas Saber" - Optional Reuse from existing if needed, but sticking to design request for now this matches layout */}


            <Script src="https://platform.twitter.com/widgets.js" strategy="afterInteractive" />
            <Script src="//www.instagram.com/embed.js" strategy="lazyOnload" />
        </main>
    );
}
