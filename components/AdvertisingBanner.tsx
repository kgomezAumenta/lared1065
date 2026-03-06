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

        // Force a small delay to ensure the DOM layout has calculated the width
        // AdSense throws "No slot size for availableWidth=0" if container is hidden/0 width
        const timeoutId = setTimeout(() => {
            if (!containerRef.current) return;
            const scripts = containerRef.current.querySelectorAll('script');

            // Look for ad tags (ins) and ensure they are block level to force width
            const insTags = containerRef.current.querySelectorAll('ins.adsbygoogle');
            insTags.forEach((ins) => {
                (ins as HTMLElement).style.display = 'block';
                // Only required if you want to explicitly set width: 100%
                (ins as HTMLElement).style.width = '100%';
            });

            scripts.forEach((oldScript) => {
                if (oldScript.getAttribute('data-executed')) return;

                const newScript = document.createElement('script');

                // Copy all attributes (like async, src, etc)
                Array.from(oldScript.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });

                newScript.textContent = oldScript.textContent;
                newScript.setAttribute('data-executed', 'true');

                if (oldScript.parentNode) {
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                }
            });
        }, 100); // 100ms delay to let flexbox render the widths

        return () => clearTimeout(timeoutId);
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
                    className="w-full h-full flex justify-center items-center"
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

