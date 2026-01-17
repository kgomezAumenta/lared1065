import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bookmark } from "lucide-react";

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

interface TopicRowProps {
    title: string;
    posts: Post[];
    viewAllLink?: string;
    categorySlug?: string;
}

export default function TopicRow({ title, posts, viewAllLink, categorySlug }: TopicRowProps) {
    const featuredPosts = posts.slice(0, 2);
    const listPosts = posts.slice(2, 6);

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <h2 className="text-3xl font-extrabold text-red-600 uppercase">
                        {title}
                    </h2>
                    <ArrowRight className="text-red-600 group-hover:translate-x-1 transition-transform" />
                </div>
                {viewAllLink && (
                    <Link href={viewAllLink} className="hidden md:inline-block border border-black px-4 py-1 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors">
                        VER TODAS
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: 2 Featured Posts */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredPosts.map((post) => (
                        <Link key={post.id} href={`/posts/${post.slug}`} className="group relative block">
                            <div className="relative h-64 w-full overflow-hidden rounded-lg mb-3">
                                {post.featuredImage?.node?.sourceUrl ? (
                                    <Image
                                        src={post.featuredImage.node.sourceUrl}
                                        alt={post.featuredImage.node.altText || post.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200"></div>
                                )}
                                <div className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full hover:bg-white text-gray-700 transition-colors z-10">
                                    <Bookmark size={16} />
                                </div>
                            </div>
                            <span className="text-red-600 text-xs font-bold uppercase block mb-1">
                                {post.categories?.nodes[0]?.name || title}
                            </span>
                            <h3 className="font-bold text-lg leading-tight group-hover:text-red-600 transition-colors">
                                {post.title}
                            </h3>
                        </Link>
                    ))}
                </div>

                {/* Right Column: List of 4 Posts */}
                <div className="flex flex-col gap-6 border-t md:border-t-0 border-gray-100 pt-6 md:pt-0">
                    {listPosts.map((post) => (
                        <Link key={post.id} href={`/posts/${post.slug}`} className="group flex flex-col pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                            <span className="text-red-600 text-[10px] font-bold uppercase mb-1">
                                {post.categories?.nodes[0]?.name}
                            </span>
                            <h3 className="font-bold text-sm text-gray-900 group-hover:text-red-700 leading-tight">
                                {post.title}
                            </h3>
                        </Link>
                    ))}
                </div>
            </div>

            {viewAllLink && (
                <div className="mt-6 text-center md:hidden">
                    <Link href={viewAllLink} className="inline-block border border-black px-6 py-2 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors">
                        VER TODAS
                    </Link>
                </div>
            )}
        </section>
    );
}
