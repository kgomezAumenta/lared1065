"use client";

import { useEffect } from "react";

export default function PostScripts({ slug }: { slug?: string }) {
    useEffect(() => {
        const containerId = slug ? `post-${slug}` : null;

        const initEmbeds = () => {
            const container = containerId ? document.getElementById(containerId) : document;
            if (!container) return;

            // 1. WP Embeds (Native IFrames)
            const iframes = container.querySelectorAll('iframe.wp-embedded-content');
            iframes.forEach((iframe: Element) => {
                const el = iframe as HTMLIFrameElement;
                if (el.getAttribute('data-src') && !el.src) {
                    el.src = el.getAttribute('data-src') || "";
                }
                el.style.visibility = 'visible';
                el.style.position = 'static';

                const secret = el.getAttribute('data-secret');
                if (secret) {
                    const blockquote = document.querySelector('blockquote.wp-embedded-content[data-secret="' + secret + '"]');
                    if (blockquote) {
                        (blockquote as HTMLElement).style.display = 'none';
                    }
                }
            });

            // 2. Twitter
            const twitterEmbeds = container.querySelectorAll('.twitter-tweet:not(.twitter-tweet-rendered)');
            if (twitterEmbeds.length > 0) {
                // @ts-ignore
                if (window.twttr?.widgets?.load) {
                    try {
                        // @ts-ignore
                        window.twttr.widgets.load(container);
                    } catch (e) {
                        console.error("Twitter embed error", e);
                    }
                }
            }

            // 3. Instagram
            const igEmbeds = container.querySelectorAll('.instagram-media:not(.instagram-media-rendered)');
            if (igEmbeds.length > 0) {
                // @ts-ignore
                if (window.instgrm?.Embeds?.process) {
                    try {
                        // @ts-ignore
                        window.instgrm.Embeds.process();
                    } catch (e) {
                        console.error("Instagram embed error", e);
                    }
                }
            }
        };

        // Initial run
        initEmbeds();

        // Polling to catch late-loading libraries or dynamic content
        // We poll every 500ms for 8 seconds to ensure we catch the libraries once they load from layout.tsx
        const intervalId = setInterval(initEmbeds, 500);

        const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
        }, 30000);

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [slug]);

    return null;
}
