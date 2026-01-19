import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Link as LinkIcon, MessageSquare, Share2, Bookmark } from "lucide-react";

interface Post {
    id: string;
    title: string;
    content: string;
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
    author: {
        node: {
            name: string;
        };
    };
}

async function getData(slug: string) {
    const query = `
    query GetPostData($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        id
        title
        content
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
        author {
          node {
            name
          }
        }
      }
      latestPosts: posts(first: 15) {
        nodes {
          id
          title
          slug
          categories {
            nodes {
                name
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
        description: `Lea más sobre ${post.title} en La Red 106.1`,
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

    const otherPosts = recentPosts.filter((p: Post) => p.id !== post.id);
    const sidebarPosts = otherPosts.slice(0, 5);
    const bottomGridPosts = otherPosts.slice(0, 8);

    return (
        <main className="container mx-auto px-4 py-8 pb-32">
            {/* Top Ad Banner */}
            <div className="w-full h-24 md:h-32 bg-gray-50 flex items-center justify-center mb-8 rounded-sm border border-gray-100 max-w-5xl mx-auto">
                <span className="text-gray-300 text-xs font-bold uppercase tracking-widest">Espacio Publicitario (TOP)</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
                {/* Main Content Column */}
                <article className="lg:col-span-8">

                    {/* Breadcrumb / Category */}
                    <div className="flex gap-2 mb-4">
                        {post.categories?.nodes.map((cat: { name: string; slug: string }, idx: number) => (
                            <Link key={idx} href={`/category/${cat.slug}`} className="text-red-600 text-xs font-black uppercase tracking-wider hover:underline">
                                {cat.name}
                            </Link>
                        ))}
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-black mb-6 leading-[1.1] uppercase text-gray-900">
                        {post.title}
                    </h1>

                    {/* Metadata & Social Share Top */}
                    <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-b border-gray-100 mb-8">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="font-bold uppercase text-gray-900">Por {post.author?.node?.name || "Redacción"}</span>
                            <span className="text-gray-300">|</span>
                            <span>{new Date(post.date).toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 bg-[#1877F2] text-white rounded-full hover:opacity-90 transition-opacity">
                                <Facebook size={18} fill="currentColor" />
                            </button>
                            <button className="p-2 bg-[#1DA1F2] text-white rounded-full hover:opacity-90 transition-opacity">
                                <Twitter size={18} fill="currentColor" />
                            </button>
                            <button className="p-2 bg-red-600 text-white rounded-full hover:opacity-90 transition-opacity">
                                <LinkIcon size={18} />
                            </button>
                            <button className="p-2 bg-[#25D366] text-white rounded-full hover:opacity-90 transition-opacity">
                                <MessageSquare size={18} fill="currentColor" />
                            </button>
                        </div>
                    </div>

                    {/* Featured Image */}
                    {post.featuredImage?.node?.sourceUrl && (
                        <div className="relative w-full aspect-video md:aspect-[21/9] mb-10 overflow-hidden rounded-sm">
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
                        className="prose prose-lg prose-red max-w-none text-gray-800 leading-relaxed
                        prose-p:mb-6 prose-p:leading-relaxed prose-strong:font-black
                        prose-img:rounded-sm prose-img:shadow-sm
                        prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline
                        [&_.wp-embedded-content]:mx-auto [&_.wp-embedded-content]:max-w-full [&_.wp-embedded-content]:rounded-lg [&_.wp-embedded-content]:shadow-md [&_.wp-embedded-content]:overflow-hidden
                        "
                        dangerouslySetInnerHTML={{ __html: post.content }}
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
                                        // Hide the fallback blockquote
                                        const secret = iframe.getAttribute('data-secret');
                                        if (secret) {
                                            const blockquote = document.querySelector('blockquote.wp-embedded-content[data-secret="' + secret + '"]');
                                            if (blockquote) {
                                                blockquote.style.display = 'none';
                                            }
                                        }
                                    });
                                }
                                // Run on load and periodically in case of lazy loading
                                window.addEventListener('load', activeEmbeds);
                                setTimeout(activeEmbeds, 1000);
                                setTimeout(activeEmbeds, 3000);
                                // Also listen for messages from the embed script
                                window.addEventListener('message', function(e) {
                                    if (e.data && e.data.secret) {
                                        activeEmbeds();
                                    }
                                });
                            })();
                            `,
                        }}
                    />

                    {/* Social Share Bottom */}
                    <div className="my-12 py-6 border-t border-b border-gray-100 flex flex-col md:flex-row md:items-center gap-6">
                        <span className="font-black text-xs uppercase tracking-widest text-gray-400">Comparte esta noticia:</span>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded text-sm font-bold hover:brightness-95">
                                <Facebook size={16} fill="currentColor" /> Facebook
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded text-sm font-bold hover:brightness-95">
                                <Twitter size={16} fill="currentColor" /> Twitter
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded text-sm font-bold hover:brightness-95">
                                <Share2 size={16} /> WhatsApp
                            </button>
                        </div>
                    </div>

                    {/* Ad Banner Mid */}
                    <div className="w-full h-32 bg-gray-50 flex items-center justify-center my-12 rounded-sm border border-gray-100">
                        <span className="text-gray-300 text-xs font-bold uppercase tracking-widest">Espacio Publicitario (MID)</span>
                    </div>
                </article>

                {/* Sidebar Column */}
                <aside className="lg:col-span-4 space-y-10">
                    <div>
                        <div className="bg-black text-white px-4 py-2 mb-6">
                            <h3 className="font-black uppercase text-sm italic tracking-tighter">Noticias Más Recientes</h3>
                        </div>
                        <div className="space-y-6">
                            {sidebarPosts.map((sPost: Post) => (
                                <Link key={sPost.id} href={`/posts/${sPost.slug}`} className="group flex flex-col gap-1 border-b border-gray-100 pb-5 last:border-0 text-decoration-none">
                                    <span className="text-red-500 text-[10px] font-black uppercase tracking-widest leading-none">
                                        {sPost.categories?.nodes[0]?.name || "Noticias"}
                                    </span>
                                    <h4 className="font-bold text-base leading-tight group-hover:text-red-600 transition-colors text-gray-900">
                                        {sPost.title}
                                    </h4>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Ad Vertical */}
                    <div className="hidden lg:block w-full h-[600px] bg-gray-50 flex items-center justify-center rounded-sm border border-gray-100 sticky top-8">
                        <div className="relative h-full w-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-gray-50 to-white">
                            <span className="text-gray-300 font-black text-4xl block absolute inset-0 flex items-center justify-center -rotate-90 pointer-events-none opacity-20">PUBLI-LOCAL</span>
                            <div className="bg-red-600/5 p-8 rounded-full mb-4">
                                <Bookmark size={48} className="text-red-600/20" />
                            </div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Publicidad Vertical</p>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Bottom Grid "Lo Que Necesitas Saber" */}
            <section className="mt-20 max-w-7xl mx-auto border-t border-gray-100 pt-16">
                <div className="flex flex-col items-center mb-12">
                    <div className="bg-red-600 text-white font-black text-xl px-6 py-2 skew-x-[-12deg] mb-2">
                        <span className="skew-x-[12deg] inline-block uppercase italic tracking-tighter">Lo que necesitas saber</span>
                    </div>
                    <div className="h-1 w-24 bg-gray-900" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {bottomGridPosts.map((rPost: Post) => (
                        <Link key={rPost.id} href={`/posts/${rPost.slug}`} className="group flex flex-col gap-3">
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-gray-100">
                                {rPost.featuredImage?.node?.sourceUrl ? (
                                    <Image
                                        src={rPost.featuredImage.node.sourceUrl}
                                        alt={rPost.featuredImage.node.altText || rPost.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold uppercase text-[10px]">Sin imagen</div>
                                )}
                            </div>
                            <div>
                                <span className="text-red-600 text-[10px] font-black uppercase tracking-widest block mb-1">
                                    {rPost.categories?.nodes[0]?.name || "Noticias"}
                                </span>
                                <h3 className="font-bold text-sm leading-snug group-hover:text-red-600 transition-colors line-clamp-3">
                                    {rPost.title}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}
