"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Play, Pause, Loader2 } from "lucide-react";

export default function RadioPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuffering, setIsBuffering] = useState(false);
    const [player, setPlayer] = useState<any>(null);

    useEffect(() => {
        // Define global callbacks required by the widget
        window.appReady = (object: any) => {
            console.log('Triton Player Ready', object);
            setPlayer(object);
            window.widgetPlayer = object;
            setIsLoading(false);

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
            // Optional cleanup
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
            <div className="fixed bottom-0 left-0 z-50">
                <td-player
                    id="td-player"
                    // @ts-ignore
                    type="mini"
                    highlightcolor="#333333"
                    primarycolor="#FFFFFF"
                    secondarycolor="#E40000"
                    station="LA_RED"
                    onappready="appReady"
                    defaultcoverart="https://www.lared1061.com/wp-content/uploads/2025/04/Diseno-sin-titulo-76.png"
                    class="w-full"
                >
                </td-player>
            </div>
        </>
    );
}
