"use client";

import { useState } from "react";

// YouTube Channel handle for La Red Guatemala
const YOUTUBE_HANDLE = "laredguatemala";
const YOUTUBE_CHANNEL_ID = "UCMJ_FUWKr7PyXfvY55BdGZg";

export default function EnVivoPage() {
    const [playerError, setPlayerError] = useState(false);

    // The /live URL automatically redirects to the active live stream on the channel.
    // If there is no live in progress, YouTube shows a "not available" screen.
    const liveEmbedUrl = `https://www.youtube.com/embed/live_stream?channel=${YOUTUBE_CHANNEL_ID}&autoplay=1&rel=0&modestbranding=1`;

    return (
        <main className="min-h-screen bg-[#0a0a0a] pb-32">
            {/* Header Banner */}
            <div className="bg-[#E40000] py-5 px-4">
                <div className="container mx-auto max-w-[1200px] flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white"></span>
                        </span>
                        <span className="text-white font-extrabold text-base uppercase tracking-widest">
                            En Vivo
                        </span>
                    </div>
                    <div className="h-5 w-[2px] bg-white/40" />
                    <h1 className="text-white font-bold text-lg md:text-xl">
                        La Red 106.1 Guatemala
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto max-w-[1200px] px-4 py-8">
                <div className="flex flex-col xl:flex-row gap-8">

                    {/* YouTube Player */}
                    <div className="flex-1">
                        <div
                            className="relative w-full overflow-hidden rounded-2xl shadow-2xl bg-[#111]"
                            style={{ aspectRatio: "16/9" }}
                        >
                            {!playerError ? (
                                <iframe
                                    key="live-player"
                                    src={liveEmbedUrl}
                                    title="La Red 106.1 - Transmisión en Vivo"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    loading="lazy"
                                    className="absolute inset-0 w-full h-full"
                                    onError={() => setPlayerError(true)}
                                />
                            ) : (
                                /* Fallback cuando no hay live */
                                <NoLiveScreen />
                            )}
                        </div>

                        {/* Info below player */}
                        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                                <h2 className="text-white font-bold text-lg">
                                    La Red 106.1 — Transmisión en Vivo
                                </h2>
                                <p className="text-gray-400 text-sm mt-1">
                                    Noticias, deportes y más en directo desde Guatemala
                                </p>
                            </div>
                            <a
                                href={`https://www.youtube.com/@${YOUTUBE_HANDLE}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-[#FF0000] hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors shrink-0"
                            >
                                <YouTubeIcon />
                                Suscribirse
                            </a>
                        </div>

                        {/* Notice banner */}
                        <div className="mt-4 bg-[#1a1a1a] border border-yellow-500/30 rounded-xl px-5 py-3 flex items-start gap-3">
                            <span className="text-yellow-400 text-lg mt-0.5">ℹ️</span>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                El player muestra la transmisión en vivo cuando el canal está al aire.
                                Si ves &quot;No disponible&quot;, es porque no hay live en este momento.
                                Puedes{" "}
                                <a
                                    href={`https://www.youtube.com/@${YOUTUBE_HANDLE}?sub_confirmation=1`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#FF4444] hover:underline font-semibold"
                                >
                                    suscribirte con notificaciones activadas
                                </a>{" "}
                                para que YouTube te avise cuando empiecen.
                            </p>
                        </div>
                    </div>

                    {/* Side Panel */}
                    <div className="xl:w-[300px] shrink-0 flex flex-col gap-4">
                        {/* About Card */}
                        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10">
                            <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#E40000] inline-block"></span>
                                Sobre el canal
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                En La Red Guatemala llevamos la experiencia de la{" "}
                                <strong className="text-white">106.1 FM</strong> a tu pantalla.
                                Cobertura sin filtros, objetiva y con el estilo único que ya
                                conoces en la radio.
                            </p>
                        </div>

                        {/* What to find */}
                        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10">
                            <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#E40000] inline-block"></span>
                                ¿Qué encontrarás?
                            </h3>
                            <ul className="flex flex-col gap-3">
                                {[
                                    "Noticieros y coberturas de última hora",
                                    "Análisis de la Liga Nacional y Selección",
                                    "Entrevistas y contenido exclusivo de cabina",
                                    "Debates deportivos con el equipo",
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-2 text-gray-400 text-sm"
                                    >
                                        <span className="text-[#E40000] mt-0.5 shrink-0">▸</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Visit Channel CTA */}
                        <a
                            href={`https://www.youtube.com/@${YOUTUBE_HANDLE}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-center bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-semibold px-6 py-4 rounded-2xl transition-all"
                        >
                            Ver más videos en YouTube →
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}

/* ─── Sub-components ─── */

function NoLiveScreen() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-2">
                <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                    />
                </svg>
            </div>
            <p className="text-white font-bold text-xl">No hay live en este momento</p>
            <p className="text-gray-400 text-sm max-w-xs">
                El canal no está transmitiendo en vivo ahora. Activa las notificaciones
                en YouTube para saber cuándo comienza.
            </p>
            <a
                href="https://www.youtube.com/@laredguatemala"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-2 bg-[#FF0000] hover:bg-red-700 text-white text-sm font-bold px-6 py-3 rounded-full transition-colors"
            >
                <YouTubeIcon />
                Ir al canal de YouTube
            </a>
        </div>
    );
}

function YouTubeIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    );
}
