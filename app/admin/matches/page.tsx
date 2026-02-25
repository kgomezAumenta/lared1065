"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc,
    serverTimestamp,
    updateDoc,
    where
} from "firebase/firestore";
import {
    Trash2,
    LogOut,
    Plus,
    Upload,
    Calendar,
    MapPin,
    Trophy,
    Clock,
    MessageSquare,
    Image as ImageIcon,
    Video
} from "lucide-react";

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
    matchId: string;
    content: string;
    timestamp: any;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    scoreSnapshot: string;
}

function MatchUpdatesList({ matchId }: { matchId: string }) {
    const [updates, setUpdates] = useState<MatchUpdate[]>([]);

    useEffect(() => {
        const q = query(
            collection(db, "match_updates"),
            where("matchId", "==", matchId),
            orderBy("timestamp", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setUpdates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MatchUpdate)));
        }, (error) => {
            console.error("Error fetching updates:", error);
            if (error.code === 'failed-precondition') {
                alert("Falta un índice en Firestore. Revisa la consola para el enlace de creación.");
            }
        });
        return () => unsubscribe();
    }, [matchId]);

    const handleDelete = async (id: string) => {
        if (!confirm("¿Borrar esta actualización?")) return;
        await deleteDoc(doc(db, "match_updates", id));
    };

    if (updates.length === 0) return <p className="text-sm text-gray-400 italic">No hay actualizaciones aún.</p>;

    return (
        <div className="space-y-3">
            {updates.map(update => (
                <div key={update.id} className="bg-gray-50 p-3 rounded border border-gray-100 flex justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <span className="font-bold">{update.timestamp?.toDate ? update.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}</span>
                            {update.scoreSnapshot && <span className="bg-white px-1 rounded border">Marcador: {update.scoreSnapshot}</span>}
                        </div>
                        <p className="text-sm text-gray-800">{update.content}</p>
                        {update.mediaUrl && (
                            <a href={update.mediaUrl} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                                <ImageIcon size={10} /> Ver Media
                            </a>
                        )}
                    </div>
                    <button onClick={() => handleDelete(update.id)} className="text-gray-400 hover:text-red-500 self-start">
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
}

export default function AdminMatches() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [matches, setMatches] = useState<Match[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    // Form States - New Match
    const [homeTeam, setHomeTeam] = useState("");
    const [awayTeam, setAwayTeam] = useState("");
    const [stadium, setStadium] = useState("");
    const [matchDate, setMatchDate] = useState("");
    const [homeLogoFile, setHomeLogoFile] = useState<File | null>(null);
    const [awayLogoFile, setAwayLogoFile] = useState<File | null>(null);
    const [creatingMatch, setCreatingMatch] = useState(false);

    // Form States - Update (Minuto a Minuto)
    const [updateText, setUpdateText] = useState("");
    const [updateFile, setUpdateFile] = useState<File | null>(null);
    const [postingUpdate, setPostingUpdate] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push("/admin/login");
            } else {
                setUser(currentUser);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    // Listen to Matches
    useEffect(() => {
        const q = query(collection(db, "matches"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match)));
        });
        return () => unsubscribe();
    }, []);

    const uploadFile = async (file: File) => {
        // 1. Get Pre-signed URL
        const presignRes = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`);
        const presignData = await presignRes.json();

        if (!presignRes.ok) throw new Error(presignData.error || "Error solicitando URL de subida");

        // 2. Upload directly to S3
        const uploadRes = await fetch(presignData.uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type
            }
        });

        if (!uploadRes.ok) throw new Error("Error al subir el archivo a S3");

        return presignData.publicUrl;
    };

    const handleCreateMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!homeTeam || !awayTeam || !matchDate || !homeLogoFile || !awayLogoFile) {
            alert("Por favor completa todos los campos e imágenes.");
            return;
        }

        try {
            setCreatingMatch(true);
            const homeLogoUrl = await uploadFile(homeLogoFile);
            const awayLogoUrl = await uploadFile(awayLogoFile);

            await addDoc(collection(db, "matches"), {
                homeTeam,
                homeLogo: homeLogoUrl,
                awayTeam,
                awayLogo: awayLogoUrl,
                stadium,
                date: new Date(matchDate),
                score: { home: 0, away: 0 },
                status: 'scheduled',
                createdAt: serverTimestamp()
            });

            // Reset
            setHomeTeam("");
            setAwayTeam("");
            setStadium("");
            setMatchDate("");
            setHomeLogoFile(null);
            setAwayLogoFile(null);
            alert("Partido creado exitosamente.");
        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setCreatingMatch(false);
        }
    };

    const handleDeleteMatch = async (id: string) => {
        if (!confirm("¿Eliminar este partido y todo su historial?")) return;
        await deleteDoc(doc(db, "matches", id));
        if (selectedMatch?.id === id) setSelectedMatch(null);
    };

    const handleUpdateScore = async (matchId: string, type: 'home' | 'away', delta: number) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;

        const newScore = { ...match.score };
        if (type === 'home') newScore.home = Math.max(0, newScore.home + delta);
        if (type === 'away') newScore.away = Math.max(0, newScore.away + delta);

        await updateDoc(doc(db, "matches", matchId), { score: newScore });
    };

    const handleUpdateStatus = async (matchId: string, status: 'scheduled' | 'live' | 'finished') => {
        await updateDoc(doc(db, "matches", matchId), { status });
    };

    const handlePostUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMatch || (!updateText && !updateFile)) return;

        try {
            setPostingUpdate(true);
            let mediaUrl = null;
            let mediaType = null;

            if (updateFile) {
                mediaUrl = await uploadFile(updateFile);
                mediaType = updateFile.type.startsWith('video/') ? 'video' : 'image';
            }

            await addDoc(collection(db, "match_updates"), {
                matchId: selectedMatch.id,
                content: updateText,
                mediaUrl,
                mediaType,
                timestamp: serverTimestamp(),
                scoreSnapshot: `${selectedMatch.score.home}-${selectedMatch.score.away}`
            });

            setUpdateText("");
            setUpdateFile(null);
        } catch (error: any) {
            alert("Error publicando actualización: " + error.message);
        } finally {
            setPostingUpdate(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Simulado */}
            <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-4 fixed h-full">
                <h2 className="text-xl font-bold text-[#E40000]">Lared Admin</h2>
                <button onClick={() => router.push('/admin/dashboard')} className="text-left px-4 py-2 hover:bg-gray-50 rounded text-gray-600">
                    Noticias Generales
                </button>
                <button className="text-left px-4 py-2 bg-red-50 text-red-700 font-bold rounded">
                    Partidos en Vivo
                </button>
                <div className="mt-auto">
                    <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-gray-500 hover:text-red-600">
                        <LogOut size={18} /> Cerrar Sesión
                    </button>
                </div>
            </div>

            <div className="pl-64 flex-1 p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                    <Trophy className="text-[#E40000]" /> Gestión de Partidos
                </h1>

                {/* Create Match Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Plus size={18} /> Crear Nuevo Partido
                    </h3>
                    <form onSubmit={handleCreateMatch} className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Equipo Local</label>
                            <input
                                type="text"
                                value={homeTeam}
                                onChange={(e) => setHomeTeam(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded mb-2"
                                placeholder="Ej: Guatemala"
                            />
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-xs font-bold transition">
                                    <Upload size={14} />
                                    {homeLogoFile ? "Cambiar Logo" : "Subir Logo"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setHomeLogoFile(file);
                                        }}
                                        className="hidden"
                                    />
                                </label>
                                {homeLogoFile && (
                                    <div className="flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                        <ImageIcon size={14} />
                                        <span className="truncate max-w-[100px]">{homeLogoFile.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Equipo Visitante</label>
                            <input
                                type="text"
                                value={awayTeam}
                                onChange={(e) => setAwayTeam(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded mb-2"
                                placeholder="Ej: Costa Rica"
                            />
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-xs font-bold transition">
                                    <Upload size={14} />
                                    {awayLogoFile ? "Cambiar Logo" : "Subir Logo"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setAwayLogoFile(file);
                                        }}
                                        className="hidden"
                                    />
                                </label>
                                {awayLogoFile && (
                                    <div className="flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                        <ImageIcon size={14} />
                                        <span className="truncate max-w-[100px]">{awayLogoFile.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Estadio</label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="text"
                                    value={stadium}
                                    onChange={(e) => setStadium(e.target.value)}
                                    className="w-full pl-9 p-2 border border-gray-300 rounded"
                                    placeholder="Ej: Doroteo Guamuch Flores"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Fecha y Hora</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="datetime-local"
                                    value={matchDate}
                                    onChange={(e) => setMatchDate(e.target.value)}
                                    className="w-full pl-9 p-2 border border-gray-300 rounded"
                                />
                            </div>
                        </div>
                        <div className="col-span-2 mt-2">
                            <button
                                type="submit"
                                disabled={creatingMatch}
                                className="w-full bg-[#E40000] text-white font-bold py-2 rounded hover:bg-red-700 transition flex justify-center items-center gap-2"
                            >
                                {creatingMatch ? 'Creando...' : 'Crear Partido'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* List Matches */}
                    <div className="lg:col-span-1 flex flex-col gap-4">
                        <h3 className="font-bold text-gray-700">Partidos Activos</h3>
                        {matches.map(match => (
                            <div
                                key={match.id}
                                className={`p-4 border rounded-lg cursor-pointer transition relative ${selectedMatch?.id === match.id ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                                onClick={() => setSelectedMatch(match)}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${match.status === 'live' ? 'bg-red-600 text-white animate-pulse' :
                                        match.status === 'finished' ? 'bg-gray-800 text-white' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {match.status === 'live' ? 'En Vivo' : match.status === 'finished' ? 'Finalizado' : 'Programado'}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteMatch(match.id); }}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col items-center w-1/3">
                                        <img src={match.homeLogo} className="w-10 h-10 object-contain mb-1" />
                                        <span className="text-xs font-bold text-center leading-tight">{match.homeTeam}</span>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-800">{match.score.home} - {match.score.away}</div>
                                    <div className="flex flex-col items-center w-1/3">
                                        <img src={match.awayLogo} className="w-10 h-10 object-contain mb-1" />
                                        <span className="text-xs font-bold text-center leading-tight">{match.awayTeam}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Live Control Panel */}
                    <div className="lg:col-span-2">
                        {selectedMatch ? (
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-8">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Clock className="text-[#E40000]" />
                                        Control: {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                                    </h2>
                                    <div className="flex gap-2">
                                        {['scheduled', 'live', 'finished'].map((st: any) => (
                                            <button
                                                key={st}
                                                onClick={() => handleUpdateStatus(selectedMatch.id, st)}
                                                className={`px-3 py-1 text-xs font-bold rounded uppercase ${selectedMatch.status === st ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}
                                            >
                                                {st === 'scheduled' ? 'Previa' : st === 'live' ? 'En Vivo' : 'Final'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Scoreboard Control */}
                                <div className="flex justify-center items-center gap-12 mb-8 bg-gray-50 p-4 rounded-lg">
                                    <div className="text-center">
                                        <h4 className="font-bold text-gray-500 mb-2">{selectedMatch.homeTeam}</h4>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleUpdateScore(selectedMatch.id, 'home', -1)} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold">-</button>
                                            <span className="text-4xl font-bold">{selectedMatch.score.home}</span>
                                            <button onClick={() => handleUpdateScore(selectedMatch.id, 'home', 1)} className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 font-bold">+</button>
                                        </div>
                                    </div>
                                    <div className="text-gray-300 font-light text-4xl">-</div>
                                    <div className="text-center">
                                        <h4 className="font-bold text-gray-500 mb-2">{selectedMatch.awayTeam}</h4>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleUpdateScore(selectedMatch.id, 'away', -1)} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold">-</button>
                                            <span className="text-4xl font-bold">{selectedMatch.score.away}</span>
                                            <button onClick={() => handleUpdateScore(selectedMatch.id, 'away', 1)} className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 font-bold">+</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Minuto a Minuto Update Form */}
                                <div className="border-t border-gray-100 pt-6">
                                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <MessageSquare size={18} /> Agregar Comentario / Jugada
                                    </h4>
                                    <form onSubmit={handlePostUpdate} className="flex flex-col gap-3">
                                        <textarea
                                            value={updateText}
                                            onChange={(e) => setUpdateText(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:outline-none"
                                            rows={2}
                                            placeholder="Ej: ¡GOLAZO! Disparo desde fuera del área..."
                                        />
                                        <div className="flex justify-between items-center">
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id="updateMedia"
                                                    onChange={(e) => setUpdateFile(e.target.files?.[0] || null)}
                                                    className="hidden"
                                                />
                                                <label htmlFor="updateMedia" className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-red-500 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
                                                    {updateFile ? (
                                                        <span className="text-green-600 font-bold flex items-center gap-1"><Upload size={14} /> {updateFile.name}</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1"><ImageIcon size={14} /> Agregar Foto/Video</span>
                                                    )}
                                                </label>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={postingUpdate || (!updateText && !updateFile)}
                                                className={`px-6 py-2 rounded font-bold text-white transition ${postingUpdate ? 'bg-gray-400' : 'bg-[#E40000] hover:bg-red-700'}`}
                                            >
                                                {postingUpdate ? 'Publicando...' : 'Publicar'}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* List of Previous Updates */}
                                <div className="mt-8 border-t border-gray-100 pt-6">
                                    <h5 className="font-bold text-gray-500 mb-4 text-xs uppercase tracking-wider">Historial del Minuto a Minuto</h5>
                                    <MatchUpdatesList matchId={selectedMatch.id} />
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-10">
                                Selecciona un partido de la izquierda para gestionarlo
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
