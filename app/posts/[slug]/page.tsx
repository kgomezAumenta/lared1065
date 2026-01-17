import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
      posts(first: 10) {
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
            recentPosts: json.data?.posts?.nodes || [],
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

    // Filter out current post from sidebar/related if possible
    const otherPosts = recentPosts.filter((p: Post) => p.id !== post?.id);
    const sidebarPosts = otherPosts.slice(0, 5);
    const relatedPosts = otherPosts.slice(5, 9); // Bottom section

    if (!post) {
        notFound();
    }

    return (
        <main className="container mx-auto px-4 py-8 pb-32">
            {/* Top Ad Banner */}
            <div className="w-full h-32 bg-gray-100 flex items-center justify-center mb-8 rounded-lg border border-gray-200">
                <span className="text-gray-400 font-bold">ESPACIO PUBLICITARIO (TOP)</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <article className="lg:col-span-2">

                    {/* Title & Meta */}
                    <div className="mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight uppercase">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 pb-4">
                            <span>Publicado el {new Date(post.date).toLocaleDateString()}</span>
                            {post.categories?.nodes[0] && (
                                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-sm">
                                    {post.categories.nodes[0].name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Featured Image */}
                    {post.featuredImage?.node?.sourceUrl && (
                        <div className="relative w-full h-[300px] md:h-[450px] mb-8 rounded-lg overflow-hidden">
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
                        className="prose prose-lg prose-red max-w-none text-gray-800"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Social Share (Placeholder) */}
                    <div className="my-8 py-4 border-t border-b border-gray-200 flex gap-4">
                        <span className="font-bold text-sm text-gray-400 uppercase">Compartir:</span>
                        <div className="flex gap-2">
                            {/* Icons would go here */}
                            <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                            <div className="w-6 h-6 bg-sky-500 rounded-full"></div>
                            <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                        </div>
                    </div>

                    {/* Comments (Placeholder) */}
                    <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500 text-sm">
                        Sección de comentarios (Próximamente)
                    </div>

                    {/* Bottom Ad Banner */}
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center my-8 rounded-lg border border-gray-200">
                        <span className="text-gray-400 font-bold">ESPACIO PUBLICITARIO (MID)</span>
                    </div>

                    {/* "Lo Que Necesitas Saber" Section */}
                    <div className="mt-12">
                        <div className="bg-red-600 text-white font-bold text-lg px-4 py-2 mb-6 inline-block skew-x-[-10deg]">
                            <span className="skew-x-[10deg] inline-block uppercase italic">Lo que necesitas saber</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {relatedPosts.map((rPost: Post) => (
                                <Link key={rPost.id} href={`/posts/${rPost.slug}`} className="group flex gap-4">
                                    <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-md bg-gray-200">
                                        {rPost.featuredImage?.node?.sourceUrl && (
                                            <Image
                                                src={rPost.featuredImage.node.sourceUrl}
                                                alt={rPost.featuredImage.node.altText || rPost.title}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-red-600 text-xs font-bold uppercase block mb-1">
                                            {rPost.categories?.nodes[0]?.name}
                                        </span>
                                        <h3 className="font-bold text-sm leading-snug group-hover:text-red-600 transition-colors line-clamp-3">
                                            {rPost.title}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </article>

                {/* Sidebar Column */}
                <aside className="lg:col-span-1">
                    <div className="bg-black text-white p-4 mb-1">
                        <h3 className="font-bold uppercase text-sm">Noticias Más Recientes</h3>
                    </div>
                    <div className="flex flex-col gap-4">
                        {sidebarPosts.map((sPost: Post) => (
                            <Link key={sPost.id} href={`/posts/${sPost.slug}`} className="group block border-b border-gray-100 pb-4">
                                <span className="text-red-600 text-xs font-bold uppercase block mb-1">
                                    {sPost.categories?.nodes[0]?.name}
                                </span>
                                <h4 className="font-bold text-sm leading-snug group-hover:text-red-600 transition-colors">
                                    {sPost.title}
                                </h4>
                            </Link>
                        ))}
                    </div>

                    {/* Sidebar Ad Vertical */}
                    <div className="w-full h-[600px] bg-gray-100 flex items-center justify-center mt-8 rounded-lg border border-gray-200 sticky top-4">
                        <span className="text-gray-400 font-bold -rotate-90">PUBLICIDAD VERTICAL</span>
                    </div>
                </aside>

            </div>
        </main>
    );
}
