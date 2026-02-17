"use client";

import React from 'react';
import Image from "next/image";
import Link from "next/link";

import { getAdById } from "@/app/services/ads";

interface AdvertisingBannerProps {
    className?: string;
    minHeight?: string;
    slotId?: string;       // Google AdSense Data Slot ID (Legacy)
    adId?: number;         // Advanced Ads ID (New)
    format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
    responsive?: "true" | "false";
    placeholderText?: string;
}

const AdvertisingBanner: React.FC<AdvertisingBannerProps> = ({
    className,
    minHeight = "280px",
    slotId,
    adId,
    format = "auto",
    responsive = "true",
    placeholderText = "Anuncio"
}) => {
    const [adContent, setAdContent] = React.useState<string | null>(null);

    // Fetch Advanced Ad if adId is present
    React.useEffect(() => {
        if (!adId) return;

        async function loadAd() {
            const ad = await getAdById(adId!);
            if (ad && ad.content) {
                // Determine if the content is just an image or script
                // We will render it raw. Scripts might need execute logic if they are written via document.write (less likely in modern ads)
                // But usually dangerousSetInnerHTML works for standard tags.
                // For scripts that need execution, we might need a helper, but let's try direct first.
                setAdContent(ad.content);
            }
        }
        loadAd();
    }, [adId]);

    // Container styles
    const containerClass = className
        ? `${className} overflow-hidden bg-gray-100 flex justify-center items-center`
        : `w-full bg-gray-100 py-4 flex items-center justify-center min-h-[${minHeight}]`;

    return (
        <div className={containerClass}>
            {/* 1. Advanced Ads (Priority) */}
            {adId && adContent ? (
                <div
                    className="w-full h-full flex justify-center items-center"
                    dangerouslySetInnerHTML={{ __html: adContent }}
                />
            ) : slotId ? (
                /* 2. Google AdSense (Legacy/Fallback) */
                <ins className="adsbygoogle"
                    style={{ display: 'block', width: '100%', height: '100%' }}
                    data-ad-client="ca-pub-6134329722127197"
                    data-ad-slot={slotId}
                    data-ad-format={format}
                    data-full-width-responsive={responsive}
                />
            ) : (
                /* 3. Placeholder */
                <div className="flex flex-col gap-2 items-center text-gray-400">
                    <span className="text-xs uppercase tracking-widest font-bold">{placeholderText}</span>
                    {!adId && !slotId && <span className="text-[10px] text-red-500">(Falta ID)</span>}
                </div>
            )}

            {/* Initialize AdSense if using slotId (Existing Logic) */}
            {slotId && !adId && <AdSenseScript slotId={slotId} />}
        </div>
    );
};

// Extracted AdSense Logic to separate component to clean up main effect
const AdSenseScript = ({ slotId }: { slotId: string }) => {
    const adsPushedRef = React.useRef(false);

    React.useEffect(() => {
        if (adsPushedRef.current) return;
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            adsPushedRef.current = true;
        } catch (err) { }
    }, [slotId]);

    return null;
}

export default AdvertisingBanner;

