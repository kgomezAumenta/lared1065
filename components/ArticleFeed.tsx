"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Article from "./Article";
import { getPostContent, getMoreCategoryPosts } from "@/app/actions/getPost";
import { Loader2 } from "lucide-react";
import AdvertisingBanner from "@/components/AdvertisingBanner";
import ArticleSkeleton from "./ArticleSkeleton";

interface Post {
    id: string;
    slug: string;
    title: string;
    categories?: { nodes: { slug: string }[] };
    [key: string]: any;
}

const EMPTY_RELATED_POSTS: any[] = [];

export default function ArticleFeed({
    initialPost,
    initialRelatedPosts
}: {
    initialPost: any,
    initialRelatedPosts: any[]
}) {
    const [posts, setPosts] = useState<any[]>([initialPost]);
    const [relatedQueue, setRelatedQueue] = useState<any[]>(initialRelatedPosts);
    const [loading, setLoading] = useState(false);
    const [allLoaded, setAllLoaded] = useState(false);
    const loadedSlugs = useRef<Set<string>>(new Set([initialPost.slug]));
    const loadedIds = useRef<Set<string>>(new Set([initialPost.id, ...initialRelatedPosts.map(p => p.id)]));
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

    // Track posts that have live updates
    const postsWithLiveUpdates = useRef<Set<string>>(new Set());
    const [isLiveBlogMode, setIsLiveBlogMode] = useState(false); // To force re-render msg

    // NEW: Buffer for the next post
    const [preloadedPost, setPreloadedPost] = useState<any>(null);
    const isPreloading = useRef(false);

    // Stable callback for detecting live updates
    const handleLiveUpdatesFound = useCallback((slug: string) => {
        if (!postsWithLiveUpdates.current.has(slug)) {
            postsWithLiveUpdates.current.add(slug);
            setIsLiveBlogMode(true);
        }
    }, []);

    // Function to load next post
    const loadNextPost = useCallback(async () => {
        if (loading || allLoaded) return;

        // CHECK: If the current LAST post has live updates, disable scroll
        const lastPost = posts[posts.length - 1];
        if (lastPost && postsWithLiveUpdates.current.has(lastPost.slug)) {
            console.log("InfScroll: Stopped because current post has Live Updates active.");
            return;
        }

        setLoading(true);

        // 0. Use Preloaded Post if available
        if (preloadedPost) {
            // Validate it's not a duplicate
            if (loadedSlugs.current.has(preloadedPost.post.slug)) {
                console.warn("Preloaded post is duplicate, skipping:", preloadedPost.post.slug);
                setPreloadedPost(null);
                // Fall through to normal fetch logic...
            } else {
                console.log("Using preloaded post:", preloadedPost.post.slug);
                setPosts(prev => [...prev, preloadedPost.post]);
                loadedSlugs.current.add(preloadedPost.post.slug);
                loadedIds.current.add(preloadedPost.post.id);

                // Merge related posts from preloaded data
                if (preloadedPost.relatedPosts?.length) {
                    setRelatedQueue(prev => {
                        const newQueue = [...prev];
                        preloadedPost.relatedPosts.forEach((p: any) => {
                            if (!newQueue.some((existing: any) => existing.id === p.id)) {
                                newQueue.push(p);
                            }
                        });
                        return newQueue;
                    });
                }

                setPreloadedPost(null); // Clear buffer to trigger next preload
                setLoading(false);
                return;
            }
        }

        // 1. Try to get from Related Queue first
        let nextPostLite = relatedQueue.find(p => !loadedSlugs.current.has(p.slug));

        // 2. If queue is empty or all loaded, fetch more from current category
        if (!nextPostLite) {
            console.log("Queue empty, fetching from category...");
            const lastPost = posts[posts.length - 1];
            const categorySlug = lastPost.categories?.nodes[0]?.slug;

            if (categorySlug) {
                const morePosts = await getMoreCategoryPosts(categorySlug, Array.from(loadedIds.current));

                if (morePosts.length > 0) {
                    // Add to queue and pick first
                    setRelatedQueue(prev => [...prev, ...morePosts]);
                    // Filter valid ones
                    const validNewPosts = morePosts.filter((p: any) => !loadedSlugs.current.has(p.slug));
                    if (validNewPosts.length > 0) {
                        nextPostLite = validNewPosts[0];
                    } else {
                        setAllLoaded(true); // Truly no more content even in category
                        setLoading(false);
                        return;
                    }
                } else {
                    setAllLoaded(true);
                    setLoading(false);
                    return;
                }
            } else {
                setAllLoaded(true);
                setLoading(false);
                return;
            }
        }

        if (!nextPostLite) {
            setLoading(false);
            return;
        }

        console.log("Loading next post:", nextPostLite.slug);

        try {
            const data = await getPostContent(nextPostLite.slug);
            if (data?.post) {
                // Add to posts list
                setPosts(prev => [...prev, data.post]);
                loadedSlugs.current.add(data.post.slug);
                loadedIds.current.add(data.post.id);

                // Add new related posts to queue (if any specific related found)
                if (data.relatedPosts?.length) {
                    setRelatedQueue(prev => {
                        // Simple merge avoiding dups in queue array itself (though loadedIds checks execution)
                        const newQueue = [...prev];
                        data.relatedPosts.forEach((p: any) => {
                            if (!newQueue.some(existing => existing.id === p.id)) {
                                newQueue.push(p);
                            }
                        });
                        return newQueue;
                    });
                }
            } else {
                loadedSlugs.current.add(nextPostLite.slug); // Skip if failed
            }
        } catch (error) {
            console.error("Error loading next post:", error);
        } finally {
            setLoading(false);
        }
    }, [loading, allLoaded, relatedQueue, posts, preloadedPost]);

    // PRE-LOAD EFFECT
    useEffect(() => {
        const fillBuffer = async () => {
            if (preloadedPost || isPreloading.current || allLoaded) return;

            // Find next candidate
            let nextPostLite = relatedQueue.find(p => !loadedSlugs.current.has(p.slug));

            if (!nextPostLite) {
                // Try to fetch more if queue empty logic could be here, but for now we rely on main loader to handle empty queue
                return;
            }

            try {
                isPreloading.current = true;
                console.log("Preloading background:", nextPostLite.slug);
                const data = await getPostContent(nextPostLite.slug);
                if (data?.post) {
                    setPreloadedPost(data);
                }
            } catch (e) {
                console.error("Preload failed", e);
            } finally {
                isPreloading.current = false;
            }
        };

        const t = setTimeout(fillBuffer, 1000); // Small delay to prioritize main thread
        return () => clearTimeout(t);
    }, [relatedQueue, preloadedPost, allLoaded, posts]);

    // Intersection Observer for Infinite Scroll Trigger
    useEffect(() => {
        const trigger = loadMoreTriggerRef.current;
        if (!trigger) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loading && !allLoaded) {
                loadNextPost();
            }
        }, { threshold: 0.01, rootMargin: "2000px" });

        observer.observe(trigger);
        observerRef.current = observer;

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [loadNextPost, loading, allLoaded]);

    // URL Update on Scroll
    useEffect(() => {
        const handleScroll = () => {
            const articleElements = document.querySelectorAll('article[data-slug]');
            let visibleSlug = null;
            let maxVisibility = 0;

            articleElements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
                const visibility = visibleHeight / window.innerHeight; // percentage of viewport filled

                if (visibility > maxVisibility && visibility > 0.3) { // At least 30% visible
                    maxVisibility = visibility;
                    visibleSlug = el.getAttribute('data-slug');
                }
            });

            if (visibleSlug && visibleSlug !== window.location.pathname.split('/').pop()) {
                // Update URL without reloading
                // Optionally update document title as well
                window.history.replaceState(null, '', `/posts/${visibleSlug}`);
                const title = document.querySelector(`article[data-slug="${visibleSlug}"]`)?.getAttribute('data-title');
                if (title) document.title = `${title} - La Red 106.1`;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [posts]);

    return (
        <div className="flex flex-col w-full">
            {posts.map((post, index) => (
                <div key={post.id} className="flex flex-col w-full">
                    <Article
                        post={post}
                        relatedPosts={EMPTY_RELATED_POSTS}
                        onLiveUpdatesFound={handleLiveUpdatesFound}
                    />

                    {/* Inject Ad between posts */}
                    {index < posts.length - 1 && (
                        <div className="w-full flex justify-center my-12">
                            <AdvertisingBanner adId={37435} placeholderText="Headles entre Nota Vertical" className="w-full flex justify-center" />
                        </div>
                    )}
                </div>
            ))}

            {/* Load More Trigger */}
            <div ref={loadMoreTriggerRef} className="w-full py-12 flex flex-col justify-center items-center gap-4 min-h-[500px]">
                {posts.length > 0 && postsWithLiveUpdates.current.has(posts[posts.length - 1].slug) ? (
                    <div className="bg-gray-100 text-gray-500 px-6 py-3 rounded-full text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                        Cobertura en vivo activa. Scroll infinito pausado.
                    </div>
                ) : (
                    loading && <ArticleSkeleton />
                )}
                {allLoaded && <p className="text-gray-500">No hay más noticias relacionadas.</p>}
            </div>
        </div>
    );
}
