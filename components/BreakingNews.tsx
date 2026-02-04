"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

interface Post {
    id: string;
    title: string;
    slug: string;
    date: string;
    type?: 'post';
}

interface BreakingItem {
    id: string;
    title: string;
    date: string;
    link?: string; // Optional link
    type: 'custom';
}

type NewsItem = Post | BreakingItem;

interface BreakingNewsProps {
    posts: Post[];
    customItems?: BreakingItem[]; // Allow passing manual items
}

const parseDate = (dateStr: string) => {
    // If it's a SQL format "YYYY-MM-DD HH:MM:SS", treat it as Guatemala Time (-06:00)
    // to prevents browser from assuming UTC or Local Time.
    if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        return new Date(dateStr.replace(' ', 'T') + '-06:00');
    }
    return new Date(dateStr);
};

export default function BreakingNews({ posts, customItems = [] }: BreakingNewsProps) {
    const [now, setNow] = useState(new Date());
    const [mergedItems, setMergedItems] = useState<NewsItem[]>([]);

    useEffect(() => {
        // Update clock every minute
        const interval = setInterval(() => {
            setNow(new Date());
        }, 60000);

        // Merge and sort items
        const combined = [...posts, ...customItems].map(item => {
            const parsedDate = parseDate(item.date);
            // DEBUG: Log dates to console to identify parsing issues
            console.log(`[BreakingNews] ID: ${item.id}, Raw: "${item.date}", Parsed: ${parsedDate.toString()}, Timestamp: ${parsedDate.getTime()}`);
            return {
                ...item,
                parsedDate
            };
        }).sort((a, b) => {
            return b.parsedDate.getTime() - a.parsedDate.getTime();
        });

        // Filter: Only show items from the last 3 hours
        const threeHoursMs = 3 * 60 * 60 * 1000;
        const futureBufferMs = 5 * 60 * 1000; // Allow 5 mins of future clock drift
        const nowMs = new Date().getTime();

        const filtered = combined.filter(item => {
            const diff = nowMs - item.parsedDate.getTime();

            // Check 1: Is it too old? (Diff > 3 hours)
            if (diff > threeHoursMs) return false;

            // Check 2: Is it too far in the future? (Diff < -5 mins)
            // This catches dates parsed as "Next Month" due to DD/MM confusion
            if (diff < -futureBufferMs) return false;

            return true;
        }).slice(0, 10); // Keep top 10

        setMergedItems(filtered);



        return () => clearInterval(interval);
    }, [posts, customItems]);

    return (
        <div className="bg-[#111111] text-white py-3 border-b border-red-600 overflow-hidden">
            <div className="container mx-auto px-4 flex items-center">
                <div className="flex items-center gap-2 shrink-0 mr-6 z-10 bg-[#111111] pr-4">
                    <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                    <h2 className="font-extrabold text-lg italic uppercase tracking-wider text-white">
                        AHORA
                    </h2>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <div className="flex animate-marquee hover:[animation-play-state:paused] gap-8">
                        {mergedItems.map((item, index) => {
                            const itemTime = parseDate(item.date).toLocaleTimeString('es-GT', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                                timeZone: 'America/Guatemala'
                            });
                            const isCustom = 'type' in item && item.type === 'custom';

                            return (
                                <div key={item.id} className="flex items-center gap-3 shrink-0 whitespace-nowrap">
                                    <span className="text-xs font-mono text-red-500 font-bold">
                                        {itemTime}
                                    </span>
                                    {isCustom && !(item as BreakingItem).link ? (
                                        <span className="text-sm font-bold text-gray-200">
                                            {item.title}
                                        </span>
                                    ) : (
                                        <Link
                                            href={(item as any).link || `/posts/${(item as Post).slug}`}
                                            className="text-sm font-bold text-gray-200 hover:text-white hover:underline transition-colors decoration-red-600 underline-offset-4"
                                        >
                                            {item.title}
                                        </Link>
                                    )}
                                    {/* Separator */}
                                    <span className="text-gray-600 text-[10px] ml-4">•</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
            `}</style>
        </div>
    );
}
