"use client";

import React from 'react';
import Image from "next/image";
import Link from "next/link";

import { getAdById } from "@/app/services/ads";

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
        ? `${className} overflow-hidden bg-transparent flex justify-center items-center`
        : `w-full bg-transparent py-4 flex items-center justify-center min-h-[${minHeight}]`;

    return (
        <div className={containerClass}>
            {/* 1. Advanced Ads */}
            {adId && adContent ? (
                <div
                    className="w-full h-full flex justify-center items-center"
                    dangerouslySetInnerHTML={{ __html: adContent }}
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

