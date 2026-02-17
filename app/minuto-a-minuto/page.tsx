"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft, Clock, PlayCircle } from "lucide-react";
import MediaLightbox from "@/components/MediaLightbox";

interface NewsItem {
    id: string;
    title: string;
    url?: string;
    timestamp: any;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
}

export default function MinutoAMinutoPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<{ url: string, type: 'image' | 'video', title: string } | null>(null);

    useEffect(() => {
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
            const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const filtered = allItems.filter(item => {
                if (!item.timestamp) return false;
                const date = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
                return date > twentyFourHoursAgo;
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

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition">
                    <ArrowLeft size={24} className="text-gray-700" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-[#E40000] uppercase">Minuto a Minuto</h1>
                    <p className="text-gray-500">Las noticias más recientes de las últimas 24 horas.</p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-6 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-gray-100 h-32 rounded-xl"></div>
                    ))}
                </div>
            ) : news.length > 0 ? (
                <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 pb-8">
                    {news.map((item) => (
                        <div key={item.id} className="relative pl-8 group">
                            {/* Timeline Dot */}
                            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-[#E40000] shadow-sm z-10" />

                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-red-50 text-[#E40000] text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                                <Clock size={12} />
                                                {item.timestamp?.toDate
                                                    ? item.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : ''}
                                            </span>
                                            <span className="text-gray-400 text-xs">
                                                {item.timestamp?.toDate
                                                    ? item.timestamp.toDate().toLocaleDateString()
                                                    : ''}
                                            </span>
                                        </div>

                                        <h2 className="text-xl font-bold text-gray-800 mb-2 leading-relaxed">
                                            {item.title}
                                        </h2>

                                        {item.url && (
                                            <Link
                                                href={item.url}
                                                target="_blank"
                                                className="text-blue-600 text-sm font-medium hover:underline inline-flex items-center gap-1 mt-1"
                                            >
                                                Leer nota completa →
                                            </Link>
                                        )}
                                    </div>

                                    {/* Media */}
                                    {item.mediaUrl && (
                                        <div
                                            className="shrink-0 w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden cursor-pointer relative hover:opacity-95 transition"
                                            onClick={() => handleMediaClick(item)}
                                        >
                                            {item.mediaType === 'video' ? (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
                                                    <PlayCircle size={32} className="text-white drop-shadow-lg" />
                                                </div>
                                            ) : null}

                                            {item.mediaType === 'video' ? (
                                                <video src={item.mediaUrl} className="w-full h-full object-cover" muted />
                                            ) : (
                                                <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 text-lg">No hay noticias en las últimas 24 horas.</p>
                    <Link href="/" className="text-[#E40000] font-bold hover:underline mt-2 inline-block">
                        Volver al inicio
                    </Link>
                </div>
            )}

            <MediaLightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                mediaUrl={selectedMedia?.url || ""}
                mediaType={selectedMedia?.type || 'image'}
                title={selectedMedia?.title}
            />
        </div>
    );
}
