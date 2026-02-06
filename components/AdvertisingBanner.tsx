"use client";

import React from 'react';
import Image from "next/image";
import Link from "next/link";

interface AdvertisingBannerProps {
    className?: string; // Allow custom classes for positioning/margins
    adData?: {
        content?: string | { rendered: string }; // REST API content
        imagen?: { sourceUrl: string; altText?: string }; // Spanish field names from ACF
        enlace?: string;
        codigo?: string;
    } | null;
    placeholderText?: string;
}

const AdvertisingBanner: React.FC<AdvertisingBannerProps> = ({ className, adData, placeholderText = "Anuncio" }) => {

    // 1. Dynamic Ad Content (ACF Provided)
    if (adData) {
        // Option A: Raw HTML Content (From Advanced Ads REST API)
        if (adData.content) {
            // Handle both direct string "content" and WP-style "content: { rendered: ... }"
            const htmlContent = typeof adData.content === 'object' && (adData.content as any).rendered
                ? (adData.content as any).rendered
                : adData.content;

            return (
                <div className={`${className} overflow-hidden`} dangerouslySetInnerHTML={{ __html: htmlContent }} />
            );
        }
        // Option A: Script/Code (Google Ads, etc)
        if (adData.codigo) {
            return (
                <div className={`${className} overflow-hidden`} dangerouslySetInnerHTML={{ __html: adData.codigo }} />
            );
        }

        // Option B: Image Banner
        // Check both direct structure and nested node structure (Edge case)
        const imageSource = adData.imagen?.sourceUrl || (adData.imagen as any)?.node?.sourceUrl;
        const imageAlt = adData.imagen?.altText || (adData.imagen as any)?.node?.altText || placeholderText;

        if (imageSource) {
            const Content = (
                <div className={`relative w-full h-full min-h-[100px] ${className}`}>
                    <Image
                        src={imageSource}
                        alt={imageAlt}
                        fill
                        className="object-cover rounded-[inherit]" // Inherit rounding from parent
                        unoptimized // often needed for external ad servers or if reliable sizing is tricky
                    />
                </div>
            );

            if (adData.enlace) {
                return (
                    <Link href={adData.enlace} target="_blank" rel="noopener noreferrer" className={`block w-full h-full ${className}`}>
                        {Content}
                    </Link>
                );
            }
            return Content;
        }
    }

    // 2. Default Static Placeholder (If no data)
    // If className is provided, use it (plus the base background).
    // If not, use the default centered layout.
    const containerClasses = className
        ? `w-full bg-[#E40000] text-white flex flex-col justify-center items-center text-center p-4 min-h-[150px] ${className}`
        : `w-full bg-[#E40000] py-8 flex items-center justify-center text-white min-h-[150px]`;

    return (
        <div className={containerClasses}>
            <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold uppercase tracking-widest text-center">
                    {placeholderText}
                </h3>
                {placeholderText === "Anuncio 1" && (
                    <p className="text-sm opacity-80 font-normal">
                        Espacio Publicitario
                    </p>
                )}
            </div>
        </div>
    );
};

export default AdvertisingBanner;
