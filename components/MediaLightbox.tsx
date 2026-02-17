"use client";

import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

interface MediaLightboxProps {
    isOpen: boolean;
    onClose: () => void;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    title?: string;
}

export default function MediaLightbox({ isOpen, onClose, mediaUrl, mediaType, title }: MediaLightboxProps) {
    const [loading, setLoading] = useState(true);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 bg-white/10 p-2 rounded-full transition-colors z-50"
            >
                <X size={32} />
            </button>

            {/* Content Container */}
            <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center">

                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-0">
                        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                )}

                {mediaType === 'video' ? (
                    <video
                        src={mediaUrl}
                        controls
                        autoPlay
                        className="max-w-full max-h-[80vh] rounded-lg shadow-2xl z-10"
                        onLoadedData={() => setLoading(false)}
                    />
                ) : (
                    <div className="relative w-full h-[80vh]">
                        <Image
                            src={mediaUrl}
                            alt={title || "Media"}
                            fill
                            className="object-contain"
                            onLoadingComplete={() => setLoading(false)}
                            priority
                        />
                    </div>
                )}

                {title && (
                    <div className="mt-4 text-white text-center font-medium text-lg px-4 py-2 bg-black/50 rounded-lg backdrop-blur-md">
                        {title}
                    </div>
                )}
            </div>
        </div>
    );
}
