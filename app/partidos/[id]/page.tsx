"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, Share2, PlayCircle, Image as ImageIcon } from "lucide-react";
import MediaLightbox from "@/components/MediaLightbox";

interface Match {
    id: string;
    homeTeam: string;
    homeLogo: string;
    awayTeam: string;
    awayLogo: string;
    stadium: string;
    date: any;
    score: { home: number, away: number };
    status: 'scheduled' | 'live' | 'finished';
}

interface MatchUpdate {
    id: string;
    content: string;
    timestamp: any;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    scoreSnapshot: string;
}

export default function MatchDetailPage() {
    const params = useParams();
    const router = useRouter();
    const matchId = params?.id as string;

    const [match, setMatch] = useState<Match | null>(null);
    const [updates, setUpdates] = useState<MatchUpdate[]>([]);
    const [loading, setLoading] = useState(true);

    // Lightbox
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<{ url: string, type: 'image' | 'video', title: string } | null>(null);

    // 1. Fetch Match Data Real-time
    useEffect(() => {
        if (!matchId) return;
        const unsub = onSnapshot(doc(db, "matches", matchId), (doc) => {
            if (doc.exists()) {
                setMatch({ id: doc.id, ...doc.data() } as Match);
            } else {
                router.push("/");
            }
            setLoading(false);
        });
        return () => unsub();
    }, [matchId, router]);

    // 2. Fetch Match Updates Real-time
    useEffect(() => {
        if (!matchId) return;
        const q = query(
            collection(db, "match_updates"),
            where("matchId", "==", matchId),
            orderBy("timestamp", "desc")
        );
        const unsub = onSnapshot(q, (snapshot) => {
            setUpdates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MatchUpdate)));
        });
        return () => unsub();
    }, [matchId]);

    const handleMediaClick = (url: string, type: 'image' | 'video', title: string) => {
        setSelectedMedia({ url, type, title });
        setLightboxOpen(true);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    if (!match) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Scoreboard */}
            <div className="bg-[#1a1a1a] text-white pt-8 pb-16 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black"></div>

                <div className="container mx-auto px-4 relative z-10 max-w-4xl">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
                        <ArrowLeft size={20} /> Volver al Inicio
                    </Link>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Home Team */}
                        <div className="flex flex-col items-center flex-1 order-2 md:order-1">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-4 mb-4 shadow-lg">
                                <img src={match.homeLogo} alt={match.homeTeam} className="w-full h-full object-contain" />
                            </div>
                            <h2 className="text-2xl font-bold text-center">{match.homeTeam}</h2>
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-center order-1 md:order-2">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase mb-4 ${match.status === 'live' ? 'bg-red-600 animate-pulse' :
                                    match.status === 'finished' ? 'bg-gray-700' : 'bg-blue-600'
                                }`}>
                                {match.status === 'live' ? '• En Vivo •' : match.status === 'finished' ? 'Finalizado' : 'Programado'}
                            </span>
                            <div className="text-6xl md:text-8xl font-black tracking-tighter flex items-center gap-4">
                                <span>{match.score.home}</span>
                                <span className="text-gray-600">-</span>
                                <span>{match.score.away}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 mt-4 text-sm">
                                <MapPin size={14} /> {match.stadium}
                            </div>
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center flex-1 order-3">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-4 mb-4 shadow-lg">
                                <img src={match.awayLogo} alt={match.awayTeam} className="w-full h-full object-contain" />
                            </div>
                            <h2 className="text-2xl font-bold text-center">{match.awayTeam}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline Content */}
            <div className="container mx-auto px-4 -mt-8 relative z-20 max-w-3xl">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden min-h-[500px]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 uppercase flex items-center gap-2">
                            <Clock size={18} className="text-[#E40000]" /> Minuto a Minuto
                        </h3>
                        <button className="text-gray-400 hover:text-gray-600">
                            <Share2 size={18} />
                        </button>
                    </div>

                    <div className="p-6 md:p-8">
                        {updates.length > 0 ? (
                            <div className="space-y-8 relative border-l-2 border-gray-100 ml-3">
                                {updates.map((update) => (
                                    <div key={update.id} className="relative pl-8 group">
                                        <div className="absolute -left-[7px] top-1.5 w-3.5 h-3.5 bg-[#E40000] rounded-full border-2 border-white shadow-sm" />

                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-400">
                                                    {update.timestamp?.toDate ? update.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                                {update.scoreSnapshot && (
                                                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-mono font-bold">
                                                        Marcador: {update.scoreSnapshot}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-gray-800 text-lg leading-relaxed">
                                                {update.content}
                                            </p>

                                            {update.mediaUrl && (
                                                <div
                                                    className="mt-2 w-full max-w-md h-64 bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer hover:opacity-95 transition"
                                                    onClick={() => handleMediaClick(update.mediaUrl!, update.mediaType || 'image', update.content)}
                                                >
                                                    {update.mediaType === 'video' ? (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
                                                            <PlayCircle size={40} className="text-white drop-shadow-lg" />
                                                        </div>
                                                    ) : null}

                                                    {update.mediaType === 'video' ? (
                                                        <video src={update.mediaUrl} className="w-full h-full object-cover" muted />
                                                    ) : (
                                                        <img src={update.mediaUrl} alt="Match Update" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-400">
                                <p>Aún no hay actualizaciones para este partido.</p>
                                <p className="text-sm mt-1">El minuto a minuto comenzará pronto.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
