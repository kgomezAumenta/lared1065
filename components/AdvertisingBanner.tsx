"use client";

import React from 'react';
import Image from "next/image";
import Link from "next/link";

interface AdvertisingBannerProps {
    className?: string;
    minHeight?: string;
    slotId?: string;       // Google AdSense Data Slot ID
    format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal"; // AdSense Data Format
    responsive?: "true" | "false"; // Full Width Responsive
    placeholderText?: string;
}

const AdvertisingBanner: React.FC<AdvertisingBannerProps> = ({
    className,
    minHeight = "280px",
    slotId,
    format = "auto",
    responsive = "true",
    placeholderText = "Anuncio"
}) => {
    // Determine development mode to show placeholder
    const isDev = process.env.NODE_ENV === 'development';

    const adRef = React.useRef<HTMLDivElement>(null);
    const adsPushedRef = React.useRef(false);

    React.useEffect(() => {
        // Check if the element is visible (width > 0)
        // This prevents "No slot size for availableWidth=0" error when component is rendered but hidden (e.g. mobile sidebar)
        if (adRef.current && adRef.current.offsetWidth === 0) {
            return;
        }

        if (adsPushedRef.current) return;

        try {
            // Push the ad to Google's queue
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            adsPushedRef.current = true;
        } catch (err) {
            // console.error("AdSense Error:", err); 
            // Suppress error locally as it's often benign (already filled)
        }
    }, [slotId]); // Re-run if slotId changes

    // Container styles
    // If className provided, use it. Else use default layout.
    const containerClass = className
        ? `${className} overflow-hidden bg-gray-100 flex justify-center items-center`
        : `w-full bg-gray-100 py-4 flex items-center justify-center min-h-[${minHeight}]`;

    return (
        <div ref={adRef} className={containerClass}>
            {/* If slotId is present, render the ad unit */}
            {slotId ? (
                <ins className="adsbygoogle"
                    style={{ display: 'block', width: '100%', height: '100%' }}
                    data-ad-client="ca-pub-6134329722127197"
                    data-ad-slot={slotId}
                    data-ad-format={format}
                    data-full-width-responsive={responsive}
                />
            ) : (
                // Fallback / Placeholder
                <div className="flex flex-col gap-2 items-center text-gray-400">
                    <span className="text-xs uppercase tracking-widest font-bold">{placeholderText}</span>
                    {!slotId && <span className="text-[10px] text-red-500">(Falta Slot ID)</span>}
                </div>
            )}
        </div>
    );
};

export default AdvertisingBanner;
