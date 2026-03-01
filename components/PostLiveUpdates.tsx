import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import MediaLightbox from "./MediaLightbox";
import { Image as ImageIcon, PlayCircle, Clock } from "lucide-react";

interface NewsItem {
    id: string;
    title: string;
    url?: string;
    timestamp: any;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    score?: string;
}

interface PostLiveUpdatesProps {
    slug: string;
    onHasUpdates?: (hasUpdates: boolean) => void;
}

export default function PostLiveUpdates({ slug, onHasUpdates }: PostLiveUpdatesProps) {
    const [updates, setUpdates] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<{ url: string, type: 'image' | 'video', title: string } | null>(null);

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

    if (loading) return null; // Or a skeleton if preferred

    if (updates.length === 0) {
        return null;
    }

    return (
        <>
            <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                    <h3 className="text-xl font-bold text-gray-800 uppercase">Minuto a Minuto</h3>
                </div>

                <div className="flex flex-col gap-0 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gray-200" />

                    {updates.map((item, index) => (
                        <div key={item.id} className="relative pl-8 pb-8 last:pb-0 group">
                            {/* Dot */}
                            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white bg-red-500 shadow-sm z-10" />

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                        <Clock size={12} />
                                        {item.timestamp?.toDate
                                            ? item.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : ''}
                                    </span>
                                    {item.score && (
                                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                                            Marcador: {item.score}
                                        </span>
                                    )}
                                </div>

                                <div className="text-base text-gray-800 font-medium leading-relaxed">
                                    {item.title}
                                </div>

                                {/* Media Thumbnail */}
                                {item.mediaUrl && (
                                    <div
                                        className="mt-2 relative w-full md:w-64 h-36 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition border border-gray-200"
                                        onClick={() => handleMediaClick(item)}
                                    >
                                        {item.mediaType === 'video' ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                <PlayCircle size={40} className="text-white drop-shadow-lg" />
                                                {/* Using video tag as thumb if possible, or just icon */}
                                                <video src={item.mediaUrl} className="absolute inset-0 w-full h-full object-cover -z-10" muted />
                                            </div>
                                        ) : (
                                            <img src={item.mediaUrl} alt="Media thumbnail" className="w-full h-full object-cover" />
                                        )}
                                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded font-bold uppercase flex gap-1 items-center">
                                            {item.mediaType === 'video' ? 'Video' : 'Imagen'}
                                        </div>
                                    </div>
                                )}

                                {item.url && (
                                    <Link href={item.url} className="text-blue-600 text-sm hover:underline mt-1 inline-block">
                                        Ver enlace relacionado
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
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
