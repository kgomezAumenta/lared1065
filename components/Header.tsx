"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X, Facebook, Twitter, Instagram, Youtube, TrendingUp } from "lucide-react";
import { getExchangeRate } from "@/app/actions/banguat";

const NAV_LINKS = [
    { href: "/", label: "Inicio" },
    { href: "/category/nacionales", label: "Nacionales" },
    { href: "/category/internacionales", label: "Internacionales" },
    { href: "/category/futbol-nacional", label: "Futbol" },
    { href: "/category/deporte-nacional", label: "Deporte" },
    { href: "/category/economia", label: "Economía" },
    { href: "/programacion", label: "Programación" },
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [exchangeRate, setExchangeRate] = useState<{ buy: number, sell: number } | null>(null);

    useEffect(() => {
        async function fetchRate() {
            const result = await getExchangeRate();
            if (result.success && result.buyRate && result.sellRate) {
                setExchangeRate({ buy: result.buyRate, sell: result.sellRate });
            }
        }
        fetchRate();
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleSearch = (e: React.FormEvent | React.KeyboardEvent) => {
        // If it's a keyboard event, only trigger on Enter
        if ('key' in e && e.key !== 'Enter') return;

        e.preventDefault();

        if (searchQuery.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
            setIsMenuOpen(false);
        }
    };

    return (
        <header className="w-full relative font-[family-name:var(--font-geist-sans)]">
            {/* Top Bar with Socials and Date - RED BACKGROUND */}
            <div className="bg-[#FF0000] text-white py-2">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
                    {/* Date and Socials */}
                    <div className="flex items-center gap-4 text-xs font-bold w-full md:w-auto justify-between md:justify-start">
                        {/* Desktop Date */}
                        <div className="hidden md:flex gap-2 items-center">
                            {/* Home Icon SVG from design */}
                            <svg width="14" height="14" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.16667 1V3.5M16.8333 1V3.5M1 18.5V6C1 5.33696 1.26339 4.70107 1.73223 4.23223C2.20107 3.76339 2.83696 3.5 3.5 3.5H18.5C19.163 3.5 19.7989 3.76339 20.2678 4.23223C20.7366 4.70107 21 5.33696 21 6V18.5M1 18.5C1 19.163 1.26339 19.7989 1.73223 20.2678C2.20107 20.7366 2.83696 21 3.5 21H18.5C19.163 21 19.7989 20.7366 20.2678 20.2678C20.7366 19.7989 21 19.163 21 18.5M1 18.5V10.1667C1 9.50363 1.26339 8.86774 1.73223 8.3989C2.20107 7.93006 2.83696 7.66667 3.5 7.66667H18.5C19.163 7.66667 19.7989 7.93006 20.2678 8.3989C20.7366 8.86774 21 9.50363 21 10.1667V18.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="capitalize">{new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>

                        {/* Mobile Exchange Rate */}
                        {exchangeRate && (
                            <div className="md:hidden flex items-center gap-2">
                                <span className="font-extrabold text-[#FFD700]">$</span>
                                <span>{exchangeRate.sell.toFixed(2)}</span>
                            </div>
                        )}

                        {/* Mobile Menu Button - Moved to Top Bar */}
                        <button
                            className="md:hidden text-white hover:bg-red-700 rounded-lg transition-colors p-1"
                            onClick={toggleMenu}
                        >
                            <Menu size={28} />
                        </button>
                    </div>

                    {/* Desktop Currency Rate */}
                    {exchangeRate && (
                        <div className="hidden md:flex items-center gap-2 text-xs font-bold">
                            <span>Tasa de Cambio Banguat - </span>
                            <span className="font-extrabold">Compra:</span>
                            <span>Q{exchangeRate.buy.toFixed(2)}</span>
                            <span className="font-extrabold">Venta:</span>
                            <span>Q{exchangeRate.sell.toFixed(2)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Header with Logo and Search - WHITE BACKGROUND */}
            <div className="bg-white py-6 border-b border-gray-200">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Logo SVG */}
                    <Link href="/" className="shrink-0 hover:opacity-90 transition-opacity">
                        <svg width="316" height="87" viewBox="0 0 316 87" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-60 md:w-80 h-auto">
                            <path d="M272.272 0H43.7281C19.5777 0 0 19.4756 0 43.5C0 67.5244 19.5777 87 43.7281 87H272.272C296.422 87 316 67.5244 316 43.5C316 19.4756 296.422 0 272.272 0Z" fill="#FF0000" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M78.2858 26.8079C79.2781 37.9234 80.2988 49.0766 81.272 59.972C80.3462 60.2738 71.0558 60.3084 69.2672 60.0506C69.1566 58.7241 68.9891 57.1806 68.869 55.7754C68.4993 55.744 68.196 55.7063 67.8989 55.7063C64.7231 55.6937 61.5473 55.7189 58.3715 55.6843C57.6668 55.6748 57.2339 55.9075 56.8547 56.4859C56.2259 57.4572 55.4959 58.3626 54.8544 59.3245C54.5195 59.8369 54.1118 60.0758 53.5051 60.0066C53.3503 59.9877 53.1986 60.0066 53.0438 60.0066H20.6474C20.8054 59.4596 20.8939 59.1013 21.0108 58.7461C24.3794 48.5391 27.7416 38.3321 31.1102 28.1219C31.4515 27.0877 31.4515 27.0751 32.5575 27.0751H41.3865C41.7246 27.0783 42.0659 27.1254 42.5684 27.1537C39.9866 34.9999 37.4397 42.733 34.8485 50.6138H36.1188C40.192 50.6138 44.2558 50.5918 48.3227 50.6326C49.1506 50.6421 49.6689 50.3874 50.1492 49.7304C55.5686 42.4532 61.0291 35.2074 66.4358 27.9239C67.052 27.0877 67.6904 26.7545 68.7332 26.7828C71.4508 26.8551 74.1589 26.8048 76.8702 26.8048H78.2827L78.2858 26.8079ZM68.3982 40.4539C68.3034 40.4225 68.2118 40.3879 68.1201 40.3533C66.4137 42.7738 64.6852 45.1818 62.9219 47.7312H68.7237C68.6099 45.2541 68.5025 42.8524 68.3982 40.4539Z" fill="white" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M138.989 60.3838C140.001 57.2497 140.958 54.2571 141.979 51.0979C140.197 51.0224 138.519 51.0727 136.844 51.0664C135.137 51.057 133.437 51.0664 131.734 51.0664H126.463C126.795 49.7493 127.209 48.5831 127.67 47.3414H143.202C144.068 44.6537 144.921 42.0288 145.815 39.2562H130.243C130.641 38.0271 130.988 36.9426 131.358 35.7921H146.905C147.063 35.3426 147.212 34.9559 147.338 34.5567C148.093 32.2525 148.839 29.9357 149.591 27.6315C149.945 26.5533 149.951 26.5439 151.026 26.5439C155.671 26.5596 160.319 26.5753 164.968 26.613C167.227 26.6256 169.442 26.9777 171.575 27.7415C177.093 29.7031 179.681 33.9468 178.628 39.6806C176.796 49.6864 170.839 56.1212 161.125 59.139C158.234 60.0412 155.251 60.475 152.205 60.4656C148.255 60.4467 144.301 60.4656 140.348 60.4561C139.941 60.4561 139.527 60.4153 138.993 60.3838H138.989ZM158.13 36.5025C156.625 41.1581 155.134 45.7665 153.63 50.4189C155.576 50.6389 157.934 50.4094 159.646 49.9159C163.748 48.7182 165.881 45.8325 166.583 41.7994C167.031 39.2437 165.985 37.7128 163.473 36.9143C161.748 36.3642 159.978 36.4585 158.126 36.5025H158.13Z" fill="white" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M93.1126 60.3178C91.7822 60.5504 82.713 60.5033 81.7397 60.2455C85.3169 49.1929 88.8908 38.1434 92.4743 27.0783C92.8092 27.05 93.0746 26.9997 93.3338 26.9934C99.837 26.9211 106.34 26.8456 112.844 26.7796C115.144 26.7545 117.185 27.5341 118.958 28.9392C120.958 30.533 121.73 32.7209 121.445 35.2105C120.832 40.5294 118.156 44.5751 113.58 47.3854C113.119 47.6714 112.641 47.9261 112.171 48.1807C111.728 48.4196 111.283 48.6365 110.755 48.9068C112.126 52.7105 113.476 56.4639 114.834 60.2172C113.978 60.5096 103.635 60.6007 101.882 60.343C101.708 59.8777 101.515 59.3842 101.344 58.8812C100.554 56.5425 99.7707 54.21 98.9807 51.8775C98.5351 50.5541 98.7026 50.7049 97.2838 50.6987C96.9741 50.6924 96.6644 50.7301 96.2473 50.749C95.1982 53.9459 94.149 57.1523 93.1126 60.321V60.3178ZM98.9301 42.4406C101.107 42.4406 103.12 42.5569 105.114 42.4029C106.618 42.2772 107.901 41.5039 108.713 40.1396C110.063 37.8605 109.162 36.163 106.517 36.0436C105.203 35.987 103.885 36.0247 102.57 36.0216C102.036 36.0184 101.509 36.0216 100.994 36.0216C100.289 38.2095 99.6317 40.259 98.9301 42.4406Z" fill="white" />
                            <path d="M194.419 35.9053L189.202 37.2255L189.802 29.8257L199.731 27.0437H205.852L194.163 60.2707H185.871L194.416 35.9053H194.419Z" fill="white" />
                            <path d="M204.398 47.5457C205.495 37.0841 213.234 26.6193 223.393 26.6193C230.99 26.6193 234.984 32.416 234.188 40.0044C233.085 50.5132 225.352 60.9308 215.149 60.9308C207.596 60.9308 203.596 55.1813 204.395 47.5457H204.398ZM225.58 40.5231C225.991 36.6126 224.363 34.7264 221.804 34.7264C217.158 34.7264 213.562 41.7019 213 47.0742C212.595 50.9376 214.172 52.8708 216.735 52.8708C221.38 52.8708 225.02 45.8954 225.583 40.5231H225.58Z" fill="white" />
                            <path d="M237.945 57.583C236.137 55.3668 235.366 52.3521 235.774 48.4856C236.396 42.5475 239.054 36.2322 243.456 31.9444C246.695 28.7883 250.91 26.6665 255.947 26.6665C259.942 26.6665 263.19 27.9867 265.383 30.2469L260.495 36.7037C259.088 35.1948 257.028 34.1575 254.813 34.1575C252.468 34.1575 250.379 35.0534 248.638 36.7477C247.428 37.9265 246.35 39.5297 245.602 41.2712C247.27 39.8567 249.953 38.681 252.819 38.681C257.549 38.681 261.206 41.9314 260.605 47.6337C259.844 54.8921 253.356 60.8774 246.107 60.8774C242.59 60.8774 239.677 59.6985 237.945 57.5798V57.583ZM252.2 48.7245C252.427 46.5555 251.109 45.0498 248.939 45.0498C245.987 45.0498 243.734 47.5017 243.446 50.2334C243.336 51.2708 243.592 52.1667 244.135 52.7797C244.71 53.487 245.617 53.9585 246.834 53.9585C249.7 53.9585 251.925 51.3651 252.2 48.7277V48.7245Z" fill="white" />
                            <path d="M263.367 51.079H271.962L268.698 60.2707H260.147L263.367 51.079Z" fill="white" />
                            <path d="M284.014 35.9053L278.797 37.2255L279.398 29.8257L289.326 27.0437H295.447L283.759 60.2707H275.467L284.011 35.9053H284.014Z" fill="white" />
                        </svg>
                    </Link>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative w-full md:w-auto">
                        <div className="flex items-center bg-[#F0F0F0] rounded-full px-6 py-3 w-full md:w-[500px] justify-between">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none outline-none text-xl text-gray-600 placeholder-gray-400 w-full"
                            />
                            <button type="submit">
                                <Search size={24} className="text-gray-500" />
                            </button>
                        </div>
                    </form>

                </div>
            </div>

            {/* Navigation Bar - RED BACKGROUND */}
            <nav className="bg-[#E40000] text-white shadow-md hidden md:block">
                <div className="container mx-auto px-4 flex justify-center">
                    <ul className="flex items-center gap-12 overflow-x-auto py-4 text-xl font-normal text-white/90">
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className="hover:text-white hover:font-bold transition-all">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* Mobile Menu Sidebar (Drawer) */}
            <div className={`fixed inset-0 z-50 transition-visibility duration-300 ${isMenuOpen ? 'visible' : 'invisible'}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={toggleMenu}
                />

                {/* Drawer Content */}
                <div className={`absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex flex-col h-full">
                        {/* Drawer Header */}
                        <div className="p-4 border-b flex justify-between items-center bg-[#E40000] text-white">
                            <span className="font-bold text-xl italic uppercase">Menú</span>
                            <button onClick={toggleMenu} className="p-1 hover:bg-red-700 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Search in Mobile Menu */}
                        <div className="p-4 bg-gray-50">
                            <form
                                onSubmit={handleSearch}
                                className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-2"
                            >
                                <input
                                    type="text"
                                    placeholder="Buscar noticias..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm w-full text-gray-700"
                                />
                                <button type="submit">
                                    <Search size={18} className="text-gray-400" />
                                </button>
                            </form>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex-1 overflow-y-auto p-4">
                            <ul className="space-y-4">
                                {NAV_LINKS.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="block py-2 text-gray-800 font-bold uppercase text-sm border-b border-gray-100 hover:text-[#E40000] transition-colors"
                                            onClick={toggleMenu}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Socials at bottom of menu */}
                        <div className="p-6 border-t bg-gray-50">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-4 text-center">Síguenos en</p>
                            <div className="flex justify-center gap-6 text-gray-600">
                                <a href="#" className="hover:text-[#E40000] transition-colors"><Facebook size={20} /></a>
                                <a href="#" className="hover:text-[#E40000] transition-colors"><Twitter size={20} /></a>
                                <a href="#" className="hover:text-[#E40000] transition-colors"><Instagram size={20} /></a>
                                <a href="#" className="hover:text-[#E40000] transition-colors"><Youtube size={20} /></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

