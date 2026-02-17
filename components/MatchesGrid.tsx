"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { MapPin } from "lucide-react";

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

export default function MatchesGrid() {
    const [matches, setMatches] = useState<Match[]>([]);

    useEffect(() => {
        const q = query(
            collection(db, "matches"),
            orderBy("date", "desc"),
            limit(6)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match)));
        });

        return () => unsubscribe();
    }, []);

    if (matches.length === 0) return null;

    return (
        <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-black border-l-4 border-[#E40000] pl-3 uppercase">Partidos En Vivo</h3>
                <Link href="/minuto-a-minuto" className="text-xs font-bold text-gray-500 hover:text-[#E40000] uppercase">
                    Ver todos los resultados
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map(match => (
                    <Link key={match.id} href={`/partidos/${match.id}`} className="block group">
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition relative overflow-hidden">
                            {/* Status Badge */}
                            <div className="absolute top-0 left-0 w-full flex justify-center mt-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${match.status === 'live' ? 'bg-red-600 text-white animate-pulse' :
                                        match.status === 'finished' ? 'bg-gray-800 text-white' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    {match.status === 'live' ? '• En Vivo •' : match.status === 'finished' ? 'Finalizado' : 'Programado'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center mt-6">
                                {/* Home Team */}
                                <div className="flex flex-col items-center w-1/3">
                                    <div className="w-12 h-12 relative mb-2">
                                        <img src={match.homeLogo} alt={match.homeTeam} className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-800 text-center leading-tight line-clamp-2">{match.homeTeam}</span>
                                </div>

                                {/* Score */}
                                <div className="flex flex-col items-center justify-center">
                                    <div className="text-2xl font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-lg tracking-widest">
                                        {match.score.home}-{match.score.away}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 font-mono">
                                        {match.date?.seconds
                                            ? new Date(match.date.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : ''}
                                    </span>
                                </div>

                                {/* Away Team */}
                                <div className="flex flex-col items-center w-1/3">
                                    <div className="w-12 h-12 relative mb-2">
                                        <img src={match.awayLogo} alt={match.awayTeam} className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-800 text-center leading-tight line-clamp-2">{match.awayTeam}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 mt-3 pt-2 flex items-center justify-center gap-1 text-[10px] text-gray-400">
                                <MapPin size={10} /> {match.stadium}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
