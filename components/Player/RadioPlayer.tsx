"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Play, Pause, Loader2 } from "lucide-react";

export default function RadioPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuffering, setIsBuffering] = useState(false);
    const [player, setPlayer] = useState<any>(null);
    const [playerType, setPlayerType] = useState<"bar" | "mini" | null>(null);

    useEffect(() => {
        // Evaluate screen size for player type
        const checkScreenSize = () => {
            setPlayerType(window.innerWidth < 768 ? "mini" : "bar");
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        // Define global callbacks required by the widget
        window.appReady = (object: any) => {
            console.log('Triton Player Ready', object);
            setPlayer(object);
            window.widgetPlayer = object;
            setIsLoading(false);

            // Inyectar etiquetas de accesibilidad a los elementos inyectados por el SDK de Triton
            setTimeout(() => {
                const playBtn = document.getElementById('td-player-bar__nowplaying__cover-art__media-controls--play') || document.getElementById('td-player-mini__media-controls--play');
                if (playBtn) playBtn.setAttribute('aria-label', 'Reproducir/Pausar Radio');

                const coverImage = document.querySelector('.tdcoverart');
                if (coverImage) coverImage.setAttribute('alt', 'Portada de la red 106.1');
            }, 1500); // Give the widget time to render DOM nodes


            // Hook into player events to sync state
            // We use the object directly as it seemed to work best for the initial playback
            if (object.addEventListener) {
                object.addEventListener('stream-status', (e: any) => {
                    const status = e.data?.code;
                    console.log('Stream status:', status);

                    if (status === 'PLAYING') {
                        setIsPlaying(true);
                        setIsBuffering(false);
                    } else if (status === 'STOPPED') {
                        setIsPlaying(false);
                        setIsBuffering(false);
                    }
                });
            }
        };

        window.switchStation = (station: string) => {
            if (window.widgetPlayer) {
                window.widgetPlayer.trigger('play', { station: station });
            }
        };

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    const togglePlay = () => {
        if (!player) return;

        if (isPlaying) {
            console.log('Stopping player...');
            player.trigger('stop');
            // Optimistic update
            setIsPlaying(false);
            setIsBuffering(false);
        } else {
            console.log('Starting player for station LA_RED...');
            setIsBuffering(true);
            player.trigger('play', { station: 'LA_RED' });

            // Safety timeout: if audio doesn't start in 10s, stop buffering spinner so user isn't stuck
            setTimeout(() => {
                setIsBuffering(false);
            }, 10000);
        }
    };

    return (
        <>
            {/* 
                Triton Digital Widgets Script 
                Added to footer essentially via this component in Layout
            */}
            <Script
                src="//widgets.listenlive.co/1.0/tdwidgets.min.js"
                strategy="lazyOnload"
            />

            {/* 
                Hidden Player Container 
                NOTE: Using -left-[9999px] because some widgets won't initialize if display:none or w-0/h-0 
            */}
            {playerType && (
                <div className={`fixed bottom-0 z-50 ${playerType === 'mini' ? 'left-[1px] right-0 w-full' : 'left-0'}`}>
                    {/* Fixed styles for mobile triton player */}
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        /* Position play button relative to its existing container */
                        .td-player-mini__media-controls {
                             position: relative !important;
                             width: 100% !important;
                             height: 100% !important;
                        }
                        #td-player-mini__media-controls--play, 
                        #td-player-mini__media-controls--pause,
                        #td-player-mini__media-controls--stop,
                        .td-play-btn, .td-pause-btn, .td-stop-btn {
                            position: absolute !important;
                            top: 50% !important;
                            left: 50% !important;
                            transform: translate(-50%, -50%) !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            display: block !important;
                        }
                    `}} />
                    <td-player
                        id="td-player"
                        // @ts-ignore
                        type={playerType}
                        highlightcolor="#333333"
                        primarycolor="#FFFFFF"
                        secondarycolor="#E40000"
                        station="LA_RED"
                        onappready="appReady"
                        defaultcoverart="https://cms.lared1061.com/wp-content/uploads/2025/04/Diseno-sin-titulo-76.png"
                        class="w-full block"
                    >
                    </td-player>
                </div>
            )}
        </>
    );
}
