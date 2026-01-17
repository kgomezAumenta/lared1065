import Link from "next/link";
import { Search, Menu, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Header() {
    return (
        <header className="w-full">
            {/* Top Bar with Socials and Date (Optional per design, but good for "News" feel) */}
            <div className="bg-white text-gray-600 text-xs py-1 border-b border-gray-100">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <span>{new Date().toLocaleDateString('es-GT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
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
                        {/* Logo Placeholder - would use Image in real implementation if asset provided */}
                        <div className="bg-red-600 text-white font-bold text-2xl px-3 py-1 rounded-full italic border-4 border-red-700">
                            LA RED
                        </div>
                        <span className="text-gray-800 font-bold text-xl hidden sm:block">106.1</span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2 text-gray-700">
                        <Menu size={24} />
                    </button>

                    {/* Search Bar - Hidden on mobile for now */}
                    <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-1/3">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-500"
                        />
                        <Search size={18} className="text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <nav className="bg-red-600 text-white shadow-md">
                <div className="container mx-auto px-4">
                    <ul className="flex items-center gap-6 overflow-x-auto py-3 text-sm font-bold uppercase whitespace-nowrap scrollbar-hide">
                        <li><Link href="/" className="hover:text-red-200">Inicio</Link></li>
                        <li><Link href="/category/noticias" className="hover:text-red-200">Noticias</Link></li>
                        <li><Link href="/category/deportes" className="hover:text-red-200">Deportes</Link></li>
                        <li><Link href="/category/nacionales" className="hover:text-red-200">Nacionales</Link></li>
                        <li><Link href="/category/internacionales" className="hover:text-red-200">Internacionales</Link></li>
                        <li><Link href="/category/economia" className="hover:text-red-200">Economía</Link></li>
                        <li><Link href="/programacion" className="hover:text-red-200">Programación</Link></li>
                        <li><Link href="/contacto" className="hover:text-red-200">Contacto</Link></li>
                    </ul>
                </div>
            </nav>
        </header>
    );
}
