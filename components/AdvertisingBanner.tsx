"use client";

import React from 'react';
import Image from "next/image";
import Link from "next/link";

import { getAdsById } from "@/app/services/ads";

interface AdvertisingBannerProps {
    className?: string;
    minHeight?: string;
    adId?: number;         // Advanced Ads ID (New)
    format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
    responsive?: "true" | "false";
    placeholderText?: string;
}

const AdvertisingBanner: React.FC<AdvertisingBannerProps> = ({
    className,
    minHeight = "280px",
    adId,
    format = "auto",
    responsive = "true",
    placeholderText = "Anuncio"
}) => {
    const [adContents, setAdContents] = React.useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = React.useState(0);

    // Add a ref to the container
    const containerRef = React.useRef<HTMLDivElement>(null);
    // Add a ref to track executed scripts by their content/src to prevent duplicates
    const executedScriptsRef = React.useRef<Set<string>>(new Set());

    // Fetch Advanced Ads if adId is present
    React.useEffect(() => {
        if (!adId) return;

        async function loadAd() {
            const ads = await getAdsById(adId!);
            if (ads && ads.length > 0) {
                setAdContents(ads.map(ad => ad.content));
            }
        }
        loadAd();
    }, [adId]);

    // Handle Rotation
    React.useEffect(() => {
        if (adContents.length <= 1) return;

        const intervalId = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % adContents.length);
        }, 3000);

        return () => clearInterval(intervalId);
    }, [adContents.length]);

    // Execute scripts inside the ad content since dangerouslySetInnerHTML doesn't execute script tags
    React.useEffect(() => {
        if (!containerRef.current || adContents.length === 0) return;

        const container = containerRef.current;
        let observer: ResizeObserver | null = null;
        let timeoutId: NodeJS.Timeout;

        const executeScripts = () => {
            const scripts = container.querySelectorAll('script');

            // Ensure ad tags (ins) are block level to force width
            const insTags = container.querySelectorAll('ins.adsbygoogle');
            insTags.forEach((ins) => {
                (ins as HTMLElement).style.display = 'block';
                (ins as HTMLElement).style.width = '100%';
                (ins as HTMLElement).style.minWidth = '250px';
                (ins as HTMLElement).style.minHeight = '50px';
            });

            scripts.forEach((oldScript) => {
                const scriptId = oldScript.src || oldScript.innerHTML;
                if (executedScriptsRef.current.has(scriptId)) return;

                const newScript = document.createElement('script');

                Array.from(oldScript.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });

                newScript.textContent = oldScript.textContent;

                // Track execution in memory
                executedScriptsRef.current.add(scriptId);

                if (oldScript.parentNode) {
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                }
            });
        };

        // AdSense throws "No slot size for availableWidth=0" if container is hidden/0 width.
        // We use a ResizeObserver to wait until the container actually has a painted width > 0.
        if (container.offsetWidth > 0) {
            // Already visible, execute with a tiny layout delay
            timeoutId = setTimeout(executeScripts, 50);
        } else {
            // Wait for flexbox to calculate dimensions
            observer = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    if (entry.contentRect.width > 0) {
                        executeScripts();
                        if (observer) {
                            observer.disconnect();
                            observer = null;
                        }
                        break;
                    }
                }
            });
            observer.observe(container);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (observer) observer.disconnect();
        };
    }, [currentIndex, adContents]);

    // Container styles
    const containerClass = className
        ? `${className} overflow-hidden bg-transparent flex justify-center items-center`
        : `w-full bg-transparent py-4 flex items-center justify-center min-h-[${minHeight}]`;

    const currentAdContent = adContents[currentIndex] || null;

    return (
        <div className={containerClass}>
            {/* 1. Advanced Ads */}
            {adId && currentAdContent ? (
                <div
                    ref={containerRef}
                    className="w-full h-full block text-center min-w-[250px]"
                    dangerouslySetInnerHTML={{ __html: currentAdContent }}
                />
            ) : (
                /* 2. Placeholder */
                <div className="flex flex-col gap-2 items-center text-gray-400">
                    <span className="text-xs uppercase tracking-widest font-bold">{placeholderText}</span>
                    {!adId && <span className="text-[10px] text-red-500">(Falta ID)</span>}
                </div>
            )}
        </div>
    );
};

export default AdvertisingBanner;

