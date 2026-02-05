"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function PostScripts() {
    useEffect(() => {
        // Function to activate WP embeds and re-scan for social widgets
        const activeEmbeds = () => {
            // Handle WP oEmbebed iframes
            const iframes = document.querySelectorAll('iframe.wp-embedded-content');
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

            // Trigger re-scans for social libraries if they are loaded
            // @ts-ignore
            if (typeof window !== 'undefined') {
                // @ts-ignore
                if (window.instgrm) window.instgrm.Embeds.process();
                // @ts-ignore
                if (window.twttr) window.twttr.widgets.load();
            }
        };

        // Run immediately and periodically to catch lazy loads
        activeEmbeds();
        const t1 = setTimeout(activeEmbeds, 1000);
        const t2 = setTimeout(activeEmbeds, 3000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    return (
        <>
            <Script
                src="https://platform.twitter.com/widgets.js"
                strategy="afterInteractive"
                onLoad={() => {
                    // @ts-ignore
                    if (window.twttr) window.twttr.widgets.load();
                }}
            />
            <Script
                src="//www.instagram.com/embed.js"
                strategy="lazyOnload"
                onLoad={() => {
                    // @ts-ignore
                    if (window.instgrm) window.instgrm.Embeds.process();
                }}
            />
        </>
    );
}
