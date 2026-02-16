"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Clock } from "lucide-react";

interface NewsItem {
    id: string;
    title: string;
    url?: string;
    timestamp: any;
}

interface PostLiveUpdatesProps {
    slug: string;
    onHasUpdates?: (hasUpdates: boolean) => void;
}

export default function PostLiveUpdates({ slug, onHasUpdates }: PostLiveUpdatesProps) {
    const [updates, setUpdates] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        // Query updates for this specific post slug
        const q = query(
            collection(db, "post_live_updates"),
            where("postSlug", "==", slug),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as NewsItem[];
            setUpdates(items);
            setLoading(false);

            // Notify parent if updates exist
            if (items.length > 0 && onHasUpdates) {
                onHasUpdates(true);
            }
        });

        return () => unsubscribe();
    }, [slug, onHasUpdates]);

    if (loading) return <div className="p-4 bg-yellow-100 text-yellow-800 rounded">Cargando actualizaciones para: {slug}...</div>;

    if (updates.length === 0) {
        return (
            <div className="p-4 bg-gray-100 border border-gray-300 rounded mb-8 text-sm">
                <p className="font-bold text-gray-700">Debug de Minuto a Minuto:</p>
                <p>No se encontraron actualizaciones para el slug: <span className="font-mono bg-white px-1">{slug}</span></p>
                <p className="text-xs text-gray-500 mt-1">Asegúrate de que en el Admin Dashboard el "Post Slug" coincida exactamente con lo de arriba.</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <h3 className="text-xl font-bold text-gray-800 uppercase">Minuto a Minuto</h3>
            </div>

            <div className="flex flex-col gap-0 relative">
                {/* Vertical Line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gray-200" />

                {updates.map((item, index) => (
                    <div key={item.id} className="relative pl-8 pb-6 last:pb-0 group">
                        {/* Dot */}
                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white bg-red-500 shadow-sm z-10" />

                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                <Clock size={12} />
                                {item.timestamp?.toDate
                                    ? item.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : ''}
                            </span>
                            <div className="text-base text-gray-800 font-medium leading-relaxed">
                                {item.title}
                            </div>
                            {item.url && (
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline mt-1 inline-block">
                                    Ver enlace relacionado
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
