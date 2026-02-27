import { memo, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import AdvertisingBanner from "@/components/AdvertisingBanner";
import PostScripts from "@/components/PostScripts";
import PostLiveUpdates from "@/components/PostLiveUpdates";

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
    tags: {
        nodes: {
            name: string;
            slug: string;
        }[];
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
    let processed = content;

    // Remove the lazyload placeholder src
    processed = processed.replace(/src="data:image\/gif;base64,[^"]*"/g, '');
    // Replace data-src with src
    processed = processed.replace(/data-src=/g, 'src=');
    // Replace data-srcset with srcset
    processed = processed.replace(/data-srcset=/g, 'srcset=');
    // Remove inline scripts to clean up and prevent conflicts
    processed = processed.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gim, "");

    // Wrap Twitter Blockquotes
    processed = processed.replace(
        /<blockquote class="twitter-tweet"[^>]*>[\s\S]*?<\/blockquote>/gim,
        '<div class="twitter-embed-wrapper" style="min-height: 500px; display: flex; justify-content: center; background: #f9f9f9; border-radius: 12px; margin: 2rem 0;">$&</div>'
    );

    // Wrap Instagram Blockquotes
    processed = processed.replace(
        /<blockquote class="instagram-media"[^>]*>[\s\S]*?<\/blockquote>/gim,
        '<div class="instagram-embed-wrapper" style="min-height: 600px; display: flex; justify-content: center; background: #f9f9f9; border-radius: 12px; margin: 2rem 0;">$&</div>'
    );

    // Verify Iframes have aspect-ratio (Generic YouTube/Embeds)
    processed = processed.replace(
        /<iframe[^>]*>/gim,
        (match) => {
            if (match.includes('style="')) {
                return match.replace('style="', 'style="aspect-ratio: 16/9; ');
            } else {
                return match.replace('<iframe', '<iframe style="aspect-ratio: 16/9;"');
            }
        }
    );

    // Fix Google Drive Iframes (CSP blocking /view -> needs /preview)
    processed = processed.replace(
        /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view/gim,
        'https://drive.google.com/file/d/$1/preview'
    );

    // Fix Omny.fm CORS fonts by ensuring iframe sandbox has allow-same-origin
    processed = processed.replace(
        /<iframe[^>]*sandbox="([^"]*)"[^>]*>/gim,
        (match, sandboxValue) => {
            if (!sandboxValue.includes('allow-same-origin')) {
                return match.replace(`sandbox="${sandboxValue}"`, `sandbox="${sandboxValue} allow-same-origin"`);
            }
            return match;
        }
    );

    // Completely REMOVE WordPress internal embed IFrames
    // We only want the raw <a> tags to remain, which Next.js will intercept and route internally.

    // 1. Extract the <a> tag from inside the wp-embedded-content blockquote and replace the blockquote with just the link
    processed = processed.replace(
        /<blockquote class="wp-embedded-content"[^>]*>([\s\S]*?)<\/blockquote>/gim,
        (match, innerContent) => {
            // innerContent usually contains <p><a href="...">Title</a></p>
            return innerContent;
        }
    );

    // 2. Delete the iframe that actually renders the CMS preview card
    processed = processed.replace(
        /<iframe class="wp-embedded-content[\s\S]*?<\/iframe>/gim,
        ''
    );

    // 3. Clean up any empty <p></p> tags that might have wrapped the iframe
    processed = processed.replace(
        /<p>\s*<\/p>/gim,
        ''
    );

    // Fix internal links mapping back to Next.js frontend router
    processed = processed.replace(
        /href="https?:\/\/(www\.)?(cms\.)?lared1061\.com\/([^"]*)"/gim,
        (match, p1, p2, path) => {
            // Keep wp-content and admin paths pointing to the CMS
            if (path.startsWith('wp-content') || path.startsWith('wp-admin')) {
                return `href="https://cms.lared1061.com/${path}"`;
            }

            const cleanPath = path.replace(/\/$/, ''); // Remove trailing slash

            // Route standard Next.js pages properly
            if (cleanPath === '' || cleanPath === '/') {
                return `href="/"`;
            } else if (cleanPath.startsWith('category/')) {
                return `href="/${cleanPath}"`;
            } else if (cleanPath === 'en-vivo' || cleanPath === 'contacto' || cleanPath === 'programacion' || cleanPath === 'minuto-a-minuto') {
                return `href="/${cleanPath}"`;
            } else {
                // Default to post slug
                return `href="/posts/${cleanPath}"`;
            }
        }
    );

    return processed;
};

const Article = memo(({ post, relatedPosts, onLiveUpdatesFound }: {
    post: Post,
    relatedPosts: any[],
    onLiveUpdatesFound?: (slug: string) => void
}) => {
    if (!post) return null;

    const processedHtml = useMemo(() => processContent(post.content), [post.content]);

    return (
        <article className="flex-1 w-full max-w-[900px] mb-24 relative" id={`post-${post.slug}`} data-slug={post.slug} data-title={post.title}>

            {/* Top Red Ad Banner - Rendered once inside the main page, maybe we skip for subsequent? 
                Let's keep it to maximize impressions if that's the goal, or remove if too cluttered. 
                Based on request "load the next related", usually ads are interspersed.
                Let's add an ad slot between articles in the Feed component instead of top of article.
            */}

            {/* Category Pill */}
            <div className="flex justify-start mb-4">
                <span className="bg-[#E40000] text-white text-base font-bold uppercase px-6 py-2 rounded-[10px]">
                    {post.categories?.nodes[0]?.name || "NOTICIA"}
                </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-black">
                {post.title}
            </h1>

            {/* Meta: Author & Date */}
            <div className="flex justify-between items-center w-full mb-6">
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
                        priority={true} // Priority true might be bad for infinite scroll images, but okay for first
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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

            {/* Post Live Updates (Minuto a Minuto) */}
            <PostLiveUpdates slug={post.slug} onHasUpdates={() => onLiveUpdatesFound?.(post.slug)} />

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
                dangerouslySetInnerHTML={{ __html: processedHtml }}
            />

            {/* Post Scripts (Analytics, Widgets, etc) */}
            <PostScripts slug={post.slug} />

            {/* Divider for next post */}
            <div className="w-full h-px bg-gray-200 mt-12 mb-12"></div>
        </article>
    );
});

export default Article;
