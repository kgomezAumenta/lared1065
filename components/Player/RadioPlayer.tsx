"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Play, Pause, Loader2 } from "lucide-react";

export default function RadioPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuffering, setIsBuffering] = useState(false);
    const [player, setPlayer] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        // Define global callbacks required by the widget
        window.appReady = (object: any) => {
            console.log('Triton Player Ready', object);
            setPlayer(object);
            window.widgetPlayer = object;
            setIsLoading(false);

            // Hook into player events to sync state
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
            setIsPlaying(false);
            setIsBuffering(false);
        } else {
            console.log('Starting player for station LA_RED...');
            setIsBuffering(true);
            player.trigger('play', { station: 'LA_RED' });

            setTimeout(() => {
                setIsBuffering(false);
            }, 10000);
        }
    };

    if (!isMounted) return null;

    return (
        <>
            <Script
                src="//widgets.listenlive.co/1.0/tdwidgets.min.js"
                strategy="lazyOnload"
            />

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
                >
                </td-player>
            </div>
        </>
    );
}
