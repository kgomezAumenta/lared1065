"use client";

import { useEffect } from "react";
import Script from "next/script";



export default function RadioPlayer() {

    useEffect(() => {
        // Define global callbacks required by the widget
        window.appReady = (object: any) => {
            console.log('Triton Player Ready', object);
            window.widgetPlayer = object;
        };

        window.switchStation = (station: string) => {
            if (window.widgetPlayer) {
                window.widgetPlayer.trigger('play', { station: station });
            }
        };

        // Cleanup
        return () => {
            // Optional: cleanup globals if needed, but for a persistent player usually fine
            // delete window.appReady;
            // delete window.switchStation;
        };
    }, []);

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

            {/* Player Container - Fixed at bottom */}
            <div className="fixed bottom-0 left-0 w-full z-50">
                <td-player
                    id="td-player"
                    type="bar" // Changed from classic to bar for footer layout
                    highlightcolor="#E40000"
                    primarycolor="#FFFFFF"
                    secondarycolor="#333333"
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
