"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface NewsItem {
    id: string;
    title: string;
    url?: string;
    timestamp: any;
}

export default function BreakingNewsRealtime() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Filter for last 24 hours
        const yesterday = new Date();
        yesterday.setHours(yesterday.getHours() - 24);

        // Note: Ideally we'd use a compound query with 'where' clause, but that might require an index.
        // For simplicity and small dataset, we can filter client-side or use orderBy only.
        // Let's stick to orderBy closest to now.

        const q = query(
            collection(db, "breaking_news"),
            orderBy("timestamp", "desc")
            // limit(20) // optional limit
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as NewsItem[];

            // Client-side filtering for 3h window (as requested)
            const now = new Date();
            const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

            const filtered = allItems.filter(item => {
                if (!item.timestamp) return false;
                // Handle Firestore Timestamp or JS Date
                const date = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
                return date > threeHoursAgo;
            });

            setNews(filtered);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="bg-[#F7F7F7] rounded-[20px] p-6 hidden md:flex flex-col gap-4 min-h-[200px] animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#F7F7F7] rounded-[20px] p-6 hidden md:flex flex-col gap-4">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-5 h-5 bg-[#E40000] rounded-full shrink-0 flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <h3 className="text-xl font-bold text-black uppercase">Minuto a Minuto</h3>
            </div>

            {news.length > 0 ? (
                news.slice(0, 10).map((item) => (
                    <div key={item.id} className="flex gap-4 items-start border-b border-gray-200 pb-4 last:border-0 last:pb-0 animate-in fade-in slide-in-from-top-2 duration-500">
                        {/* Circle Icon */}
                        <div className="shrink-0 mt-1">
                            <div className="w-4 h-4 rounded-full border-[2px] border-[#E40000] bg-white" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[#E40000] text-sm font-bold">
                                {item.timestamp?.toDate
                                    ? item.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : ''}
                            </span>
                            <h4 className="text-lg font-bold text-black leading-tight">
                                {item.title}
                            </h4>
                            {item.url ? (
                                <Link href={item.url} target={item.url.startsWith('http') ? '_blank' : undefined} className="text-black text-sm hover:underline mt-1 flex items-center gap-1 group">
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
    );
}
