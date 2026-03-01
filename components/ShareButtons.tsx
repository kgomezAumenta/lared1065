"use client";

import { useState } from "react";
import { FaFacebookF, FaTwitter, FaWhatsapp, FaLink, FaCheck } from "react-icons/fa";

interface ShareButtonsProps {
    url: string;
    title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + url)}`,
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const openPopup = (e: React.MouseEvent<HTMLAnchorElement>, platformUrl: string) => {
        e.preventDefault();
        window.open(platformUrl, 'Compartir', 'width=600,height=400,scrollbars=yes');
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <span className="text-gray-500 font-medium text-sm mr-2">Compartir:</span>

            <a
                href={shareUrls.facebook}
                onClick={(e) => openPopup(e, shareUrls.facebook)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1877F2] text-white hover:opacity-80 transition-opacity"
                title="Compartir en Facebook"
            >
                <FaFacebookF size={18} />
            </a>

            <a
                href={shareUrls.twitter}
                onClick={(e) => openPopup(e, shareUrls.twitter)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-black text-white hover:opacity-80 transition-opacity"
                title="Compartir en X (Twitter)"
            >
                <FaTwitter size={18} />
            </a>

            <a
                href={shareUrls.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] text-white hover:opacity-80 transition-opacity"
                title="Compartir en WhatsApp"
            >
                <FaWhatsapp size={20} />
            </a>

            <button
                onClick={handleCopyLink}
                className="flex items-center justify-center w-auto px-4 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors gap-2"
                title="Copiar Enlace"
            >
                {copied ? (
                    <>
                        <FaCheck size={16} className="text-green-500" />
                        <span className="text-sm font-medium">¡Copiado!</span>
                    </>
                ) : (
                    <>
                        <FaLink size={16} />
                        <span className="text-sm font-medium">Copiar enlace</span>
                    </>
                )}
            </button>
        </div>
    );
}
