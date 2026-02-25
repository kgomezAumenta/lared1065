"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const Tiktok = ({ size = 24, className = "" }: { size?: number | string, className?: string }) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
    );

    return (
        <footer className="bg-[#FF0000] text-white py-12 pb-32 text-sm">
            {/* pb-32 to account for the fixed player if needed, layout says pb-32 but mostly for player space */}
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Column 1: Logo & About */}
                <div className="flex flex-col gap-6">
                    {/* Logo SVG: White Pill, Red Text (Inverted for Red Background) */}
                    <div className="w-48 cursor-pointer" onClick={scrollToTop}>
                        <svg width="316" height="87" viewBox="0 0 316 87" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                            <path d="M272.272 0H43.7281C19.5777 0 0 19.4756 0 43.5C0 67.5244 19.5777 87 43.7281 87H272.272C296.422 87 316 67.5244 316 43.5C316 19.4756 296.422 0 272.272 0Z" fill="white" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M78.2858 26.8079C79.2781 37.9234 80.2988 49.0766 81.272 59.972C80.3462 60.2738 71.0558 60.3084 69.2672 60.0506C69.1566 58.7241 68.9891 57.1806 68.869 55.7754C68.4993 55.744 68.196 55.7063 67.8989 55.7063C64.7231 55.6937 61.5473 55.7189 58.3715 55.6843C57.6668 55.6748 57.2339 55.9075 56.8547 56.4859C56.2259 57.4572 55.4959 58.3625 54.8544 59.3245C54.5195 59.8369 54.1118 60.0758 53.5051 60.0066C53.3503 59.9877 53.1986 60.0066 53.0438 60.0066H20.6474C20.8054 59.4596 20.8939 59.1013 21.0108 58.7461C24.3794 48.5391 27.7416 38.3321 31.1102 28.1219C31.4515 27.0877 31.4515 27.0751 32.5575 27.0751H41.3865C41.7246 27.0783 42.0659 27.1254 42.5684 27.1537C39.9866 34.9999 37.4397 42.733 34.8485 50.6138H36.1188C40.192 50.6138 44.2558 50.5918 48.3227 50.6326C49.1506 50.6421 49.6689 50.3874 50.1492 49.7304C55.5686 42.4532 61.0291 35.2074 66.4358 27.9239C67.052 27.0877 67.6904 26.7545 68.7332 26.7828C71.4508 26.8551 74.1589 26.8048 76.8702 26.8048H78.2827L78.2858 26.8079ZM68.3982 40.4539C68.3034 40.4225 68.2118 40.3879 68.1201 40.3533C66.4137 42.7738 64.6852 45.1818 62.9219 47.7312H68.7237C68.6099 45.2541 68.5025 42.8524 68.3982 40.4539Z" fill="#FF0000" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M138.989 60.3838C140.001 57.2497 140.958 54.2571 141.979 51.0979C140.197 51.0224 138.519 51.0727 136.844 51.0664C135.137 51.057 133.437 51.0664 131.734 51.0664H126.463C126.795 49.7493 127.209 48.5831 127.67 47.3414H143.202C144.068 44.6537 144.921 42.0288 145.815 39.2562H130.243C130.641 38.0271 130.988 36.9426 131.358 35.7921H146.905C147.063 35.3426 147.212 34.9559 147.338 34.5567C148.093 32.2525 148.839 29.9357 149.591 27.6315C149.945 26.5533 149.951 26.5439 151.026 26.5439C155.671 26.5596 160.319 26.5753 164.968 26.613C167.227 26.6256 169.442 26.9777 171.575 27.7415C177.093 29.7031 179.681 33.9468 178.628 39.6806C176.796 49.6864 170.839 56.1212 161.125 59.139C158.234 60.0412 155.251 60.475 152.205 60.4656C148.255 60.4467 144.301 60.4656 140.348 60.4561C139.941 60.4561 139.527 60.4153 138.993 60.3838H138.989ZM158.13 36.5025C156.625 41.1581 155.134 45.7665 153.63 50.4189C155.576 50.6389 157.934 50.4094 159.646 49.9159C163.748 48.7182 165.881 45.8325 166.583 41.7994C167.031 39.2437 165.985 37.7128 163.473 36.9143C161.748 36.3642 159.978 36.4585 158.126 36.5025H158.13Z" fill="#FF0000" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M93.1126 60.3178C91.7822 60.5504 82.713 60.5033 81.7397 60.2455C85.3168 49.1929 88.8908 38.1434 92.4742 27.0783C92.8092 27.05 93.0746 26.9997 93.3338 26.9934C99.837 26.9211 106.34 26.8456 112.844 26.7796C115.144 26.7545 117.185 27.5341 118.958 28.9392C120.958 30.533 121.73 32.7209 121.445 35.2105C120.832 40.5294 118.156 44.5751 113.58 47.3854C113.119 47.6714 112.641 47.9261 112.171 48.1807C111.728 48.4196 111.283 48.6365 110.755 48.9068C112.126 52.7105 113.476 56.4639 114.834 60.2172C113.978 60.5096 103.635 60.6007 101.882 60.343C101.708 59.8777 101.515 59.3842 101.344 58.8812C100.554 56.5425 99.7707 54.21 98.9807 51.8775C98.5351 50.5541 98.7026 50.7049 97.2838 50.6987C96.9741 50.6924 96.6644 50.7301 96.2473 50.749C95.1982 53.9459 94.149 57.1523 93.1126 60.321V60.3178ZM98.9301 42.4406C101.107 42.4406 103.12 42.5569 105.114 42.4029C106.618 42.2772 107.901 41.5039 108.713 40.1396C110.063 37.8605 109.162 36.163 106.517 36.0436C105.203 35.987 103.885 36.0247 102.57 36.0216C102.036 36.0184 101.509 36.0216 100.994 36.0216C100.289 38.2095 99.6316 40.259 98.9301 42.4406Z" fill="#FF0000" />
                            <path d="M194.419 35.9053L189.202 37.2255L189.802 29.8257L199.731 27.0437H205.852L194.163 60.2707H185.871L194.416 35.9053H194.419Z" fill="#FF0000" />
                            <path d="M204.398 47.5457C205.495 37.0841 213.234 26.6193 223.393 26.6193C230.99 26.6193 234.984 32.416 234.188 40.0044C233.085 50.5132 225.352 60.9308 215.149 60.9308C207.596 60.9308 203.596 55.1813 204.395 47.5457H204.398ZM225.58 40.5231C225.991 36.6126 224.363 34.7264 221.804 34.7264C217.158 34.7264 213.562 41.7019 213 47.0742C212.595 50.9376 214.172 52.8708 216.735 52.8708C221.38 52.8708 225.02 45.8954 225.583 40.5231H225.58Z" fill="#FF0000" />
                            <path d="M237.945 57.583C236.137 55.3668 235.366 52.3521 235.774 48.4856C236.396 42.5475 239.054 36.2322 243.456 31.9444C246.695 28.7883 250.91 26.6665 255.947 26.6665C259.942 26.6665 263.19 27.9867 265.383 30.2469L260.495 36.7037C259.088 35.1948 257.028 34.1575 254.813 34.1575C252.468 34.1575 250.379 35.0534 248.638 36.7477C247.428 37.9265 246.35 39.5297 245.602 41.2712C247.27 39.8567 249.953 38.681 252.819 38.681C257.549 38.681 261.206 41.9314 260.605 47.6337C259.844 54.8921 253.356 60.8774 246.107 60.8774C242.59 60.8774 239.677 59.6985 237.945 57.5798V57.583ZM252.2 48.7245C252.427 46.5555 251.109 45.0498 248.939 45.0498C245.987 45.0498 243.734 47.5017 243.446 50.2334C243.336 51.2708 243.592 52.1667 244.135 52.7797C244.71 53.487 245.617 53.9585 246.834 53.9585C249.7 53.9585 251.925 51.3651 252.2 48.7277V48.7245Z" fill="#FF0000" />
                            <path d="M263.367 51.079H271.962L268.698 60.2707H260.147L263.367 51.079Z" fill="#FF0000" />
                            <path d="M284.015 35.9053L278.797 37.2255L279.398 29.8257L289.326 27.0437H295.447L283.759 60.2707H275.467L284.011 35.9053H284.015Z" fill="#FF0000" />
                        </svg>
                    </div>
                    <p className="text-white text-lg font-normal">
                        LO QUE NECESITAS SABER DEL DEPORTE Y LAS NOTICIAS
                    </p>
                </div>

                {/* Column 2: Secciones */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-white font-bold text-2xl">Secciones</h3>
                    <ul className="space-y-2 text-xl font-normal">
                        <li><Link href="/category/nacionales" className="hover:underline">Nacionales</Link></li>
                        <li><Link href="/category/internacionales" className="hover:underline">Internacionales</Link></li>
                        <li><Link href="/category/deporte-nacional" className="hover:underline">Deportes</Link></li>
                        <li><Link href="/category/futbol-nacional" className="hover:underline">Futbol</Link></li>
                        <li><Link href="/programacion" className="hover:underline">Programación</Link></li>
                    </ul>
                </div>

                {/* Column 3: Contacto */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-white font-bold text-2xl">Contacto</h3>
                    <ul className="space-y-4 text-lg font-normal">
                        <li className="flex items-center gap-3">
                            <a href="https://wa.me/50258581061" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-gray-200 transition-colors">
                                {/* WhatsApp SVG Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1zm0 0a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0-5-5v1z" />
                                    <path d="M9.5 9.5c-1 0-1.5 1.5-1.5 2.5s.5 2.5 1.5 2.5 2.5-.5 2.5-1.5-1.5-1.5-1.5-1.5" />
                                </svg>
                                <span>+502 5858-1061</span>
                            </a>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-white" />
                            <span>+502 2411-2013</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-white" />
                            <span>info@lared1061.com</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-white" />
                            <span>Guatemala, Guatemala</span>
                        </li>
                    </ul>
                </div>

                {/* Column 4: Socials */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-white font-bold text-2xl">Síguenos</h3>
                    <div className="flex gap-4">
                        <a href="https://www.facebook.com/lared1061" aria-label="Facebook" className="hover:text-gray-200 transition-colors bg-white/10 p-2 rounded-full"><Facebook size={24} /></a>
                        <a href="https://x.com/Lared106" aria-label="Twitter" className="hover:text-gray-200 transition-colors bg-white/10 p-2 rounded-full"><Twitter size={24} /></a>
                        <a href="https://www.instagram.com/lared1061/" aria-label="Instagram" className="hover:text-gray-200 transition-colors bg-white/10 p-2 rounded-full"><Instagram size={24} /></a>
                        <a href="https://www.youtube.com/@lared1061" aria-label="YouTube" className="hover:text-gray-200 transition-colors bg-white/10 p-2 rounded-full"><Youtube size={24} /></a>
                        <a href="https://www.tiktok.com/@lared1061" aria-label="TikTok" className="hover:text-gray-200 transition-colors bg-white/10 p-2 rounded-full"><Tiktok size={24} /></a>
                    </div>
                </div>
            </div>

            {/* Powered By */}
            <div className="mt-12 container mx-auto px-4">
                <div className="border-t border-white/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-sm opacity-80 flex flex-col md:flex-row items-center gap-2 md:gap-4">
                        <span>&copy; {new Date().getFullYear()} RCN. Todos los derechos reservados.</span>
                        <span className="hidden md:inline">|</span>
                        <Link href="/terminos-y-condiciones" className="hover:underline text-center">Términos y Condiciones</Link>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">POWERED BY</span>
                        <a href="https://aumenta.do" target="_blank" rel="noopener noreferrer">
                            <Image src="/au-light-logo.svg" alt="Aumenta" width={160} height={40} className="w-auto h-10" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
