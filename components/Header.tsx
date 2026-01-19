"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, Facebook, Twitter, Instagram, Youtube, TrendingUp } from "lucide-react";
import { getExchangeRate } from "@/app/actions/banguat";
import { useEffect } from "react";

const NAV_LINKS = [
    { href: "/", label: "Inicio" },
    { href: "/category/nacionales", label: "Nacionales" },
    { href: "/category/futbol-nacional", label: "Futbol Nacional" },
    { href: "/category/futbol-internacional", label: "Futbol Internacional" },
    { href: "/category/deporte-nacional", label: "Deporte Nacional" },
    { href: "/category/deporte-internacional", label: "Deporte Internacional" },
    { href: "/category/internacionales", label: "Internacionales" },
    { href: "/category/economia", label: "Economía" },
    { href: "/programacion", label: "Programación" },
    { href: "/contacto", label: "Contacto" },
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [exchangeRate, setExchangeRate] = useState<{ buy: number, sell: number } | null>(null);
    const router = typeof window !== 'undefined' ? (require('next/navigation').useRouter()) : null;

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
        if ('key' in e && e.key !== 'Enter') return;
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
            setIsMenuOpen(false);
        }
    };

    return (
        <header className="w-full relative">
            {/* Top Bar with Socials and Date */}
            <div className="bg-white text-gray-600 text-xs py-1 border-b border-gray-100">
                <div className="container mx-auto px-4 flex justify-between items-center whitespace-nowrap overflow-x-auto gap-4 py-1">
                    <div className="flex items-center gap-4">
                        <span className="shrink-0">{new Date().toLocaleDateString('es-GT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        {exchangeRate && (
                            <div className="hidden lg:flex items-center gap-2 border-l border-gray-100 pl-4 text-[10px] md:text-xs">
                                <TrendingUp size={12} className="text-green-600" />
                                <span className="font-bold text-gray-400 uppercase tracking-tight">Tasa de Cambio Banguat -</span>
                                <span className="flex gap-2">
                                    <span className="text-gray-900 font-black">Compra: <span className="text-red-600">Q{exchangeRate.buy.toFixed(2)}</span></span>
                                    <span className="text-gray-900 font-black">Venta: <span className="text-red-600">Q{exchangeRate.sell.toFixed(2)}</span></span>
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-red-600"><Facebook size={14} /></a>
                        <a href="#" className="hover:text-red-600"><Twitter size={14} /></a>
                        <a href="#" className="hover:text-red-600"><Instagram size={14} /></a>
                        <a href="#" className="hover:text-red-600"><Youtube size={14} /></a>
                    </div>
                </div>
            </div>

            {/* Main Header with Logo and Banner */}
            <div className="bg-white py-4 shadow-sm">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-red-600 text-white font-bold text-2xl px-3 py-1 rounded-full italic border-4 border-red-700">
                            LA RED
                        </div>
                        <span className="text-gray-800 font-bold text-xl hidden sm:block">106.1</span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={toggleMenu}
                    >
                        <Menu size={28} />
                    </button>

                    {/* Search Bar - Hidden on mobile */}
                    <form
                        onSubmit={handleSearch}
                        className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-1/3"
                    >
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-500"
                        />
                        <button type="submit">
                            <Search size={18} className="text-gray-400 cursor-pointer hover:text-red-600" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Navigation Bar (Desktop) */}
            <nav className="bg-red-600 text-white shadow-md hidden md:block">
                <div className="container mx-auto px-4">
                    <ul className="flex items-center gap-6 overflow-x-auto py-3 text-sm font-bold uppercase whitespace-nowrap scrollbar-hide">
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className="hover:text-red-200 transition-colors">
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
                        <div className="p-4 border-b flex justify-between items-center bg-red-600 text-white">
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
                                            className="block py-2 text-gray-800 font-bold uppercase text-sm border-b border-gray-100 hover:text-red-600 transition-colors"
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
                                <a href="#" className="hover:text-red-600 transition-colors"><Facebook size={20} /></a>
                                <a href="#" className="hover:text-red-600 transition-colors"><Twitter size={20} /></a>
                                <a href="#" className="hover:text-red-600 transition-colors"><Instagram size={20} /></a>
                                <a href="#" className="hover:text-red-600 transition-colors"><Youtube size={20} /></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
