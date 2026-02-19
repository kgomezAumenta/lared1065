"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import MediaLightbox from "./MediaLightbox";
import { Image as ImageIcon, PlayCircle } from "lucide-react";

interface NewsItem {
    id: string;
    title: string;
    url?: string;
    timestamp: any;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
}

export default function BreakingNewsRealtime() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<{ url: string, type: 'image' | 'video', title: string } | null>(null);

    useEffect(() => {
        // ... (Same Fetch Logic)
        const yesterday = new Date();
        yesterday.setHours(yesterday.getHours() - 24);

        const q = query(
            collection(db, "breaking_news"),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as NewsItem[];

            const now = new Date();
            const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

            const filtered = allItems.filter(item => {
                if (!item.timestamp) return false;
                const date = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
                return date > threeHoursAgo;
            });

            setNews(filtered);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleMediaClick = (item: NewsItem) => {
        if (item.mediaUrl && item.mediaType) {
            setSelectedMedia({
                url: item.mediaUrl,
                type: item.mediaType,
                title: item.title
            });
            setLightboxOpen(true);
        }
    };

    if (!loading && news.length === 0) {
        return null; // Hide entire section if no news
    }

    if (loading) {
        return (
            <div className="bg-[#F7F7F7] rounded-[20px] p-6 flex flex-col gap-4 min-h-[200px] animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-[#F7F7F7] rounded-[20px] p-6 flex flex-col gap-4">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-5 h-5 bg-[#E40000] rounded-full shrink-0 flex items-center justify-center animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <Link href="/minuto-a-minuto" className="hover:underline decoration-black/30 underline-offset-4 transition">
                        <h3 className="text-xl font-bold text-black uppercase cursor-pointer">Minuto a Minuto</h3>
                    </Link>
                </div>

                {news.length > 0 ? (
                    news.slice(0, 10).map((item) => (
                        <div key={item.id} className="flex gap-4 items-start border-b border-gray-200 pb-4 last:border-0 last:pb-0 animate-in fade-in slide-in-from-top-2 duration-500">
                            {/* Circle Icon */}
                            <div className="shrink-0 mt-1">
                                <div className="w-4 h-4 rounded-full border-[2px] border-[#E40000] bg-white" />
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <span className="text-[#E40000] text-sm font-bold">
                                    {item.timestamp?.toDate
                                        ? item.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : ''}
                                </span>
                                <h4 className="text-lg font-bold text-black leading-tight">
                                    {item.title}
                                </h4>

                                {/* Media Thumbnail - Compact */}
                                {item.mediaUrl && (
                                    <div
                                        className="mt-1 relative w-full h-32 md:h-24 bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition border border-gray-300"
                                        onClick={() => handleMediaClick(item)}
                                    >
                                        {item.mediaType === 'video' ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                <PlayCircle size={32} className="text-white drop-shadow-lg" />
                                                <video src={item.mediaUrl} className="absolute inset-0 w-full h-full object-cover -z-10" muted />
                                            </div>
                                        ) : (
                                            <img src={item.mediaUrl} alt="Media" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                )}

                                {item.url ? (
                                    <Link href={item.url} className="text-black text-sm hover:underline mt-1 flex items-center gap-1 group">
                                        Ver más <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                ) : null}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm italic">Sin noticias recientes.</p>
                )}
            </div>

            <MediaLightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                mediaUrl={selectedMedia?.url || ""}
                mediaType={selectedMedia?.type || 'image'}
                title={selectedMedia?.title}
            />
        </>
    );
}
