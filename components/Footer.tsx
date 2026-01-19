import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-neutral-900 text-gray-400 py-12 pb-32 text-sm border-t border-gray-800">
            {/* pb-32 to account for the fixed player */}
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Column 1: About */}
                <div>
                    <h3 className="text-white font-bold text-lg mb-4">La Red 106.1</h3>
                    <p className="mb-4">
                        Somos la radio que te conecta con la información deportiva y nacional más relevante de Guatemala.
                    </p>
                    <div className="text-xs">
                        &copy; {new Date().getFullYear()} Radio La Red. Todos los derechos reservados.
                    </div>
                </div>

                {/* Column 2: Sections */}
                <div>
                    <h3 className="text-white font-bold text-lg mb-4">Secciones</h3>
                    <ul className="space-y-2">
                        <li><Link href="/category/nacionales" className="hover:text-red-500 transition-colors">Nacionales</Link></li>
                        <li><Link href="/category/internacionales" className="hover:text-red-500 transition-colors">Internacionales</Link></li>
                        <li><Link href="/category/noticias" className="hover:text-red-500 transition-colors">Noticias</Link></li>
                        <li><Link href="/category/deportes" className="hover:text-red-500 transition-colors">Deportes</Link></li>
                        <li><Link href="/programacion" className="hover:text-red-500 transition-colors">Programación</Link></li>
                        <li><Link href="/contacto" className="hover:text-red-500 transition-colors">Contacto</Link></li>
                    </ul>
                </div>

                {/* Column 3: Contact */}
                <div>
                    <h3 className="text-white font-bold text-lg mb-4">Contacto</h3>
                    <ul className="space-y-2">
                        <li>Tel: +502 1234 5678</li>
                        <li>Email: info@lared1061.com</li>
                        <li>Dirección: Guatemala, Guatemala</li>
                    </ul>
                </div>

                {/* Column 4: Legal */}
                <div>
                    <h3 className="text-white font-bold text-lg mb-4">Legal</h3>
                    <ul className="space-y-2">
                        <li><Link href="/terminos" className="hover:text-red-500 transition-colors">Términos y Condiciones</Link></li>
                        <li><Link href="/privacidad" className="hover:text-red-500 transition-colors">Política de Privacidad</Link></li>
                    </ul>
                </div>
            </div>

            <div className="mt-12 flex flex-col items-center justify-center gap-2 border-t border-gray-800 pt-8">
                <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Powered by</span>
                <img src="/au-light-logo.svg" alt="Aurum Logo" className="h-6 opacity-70 hover:opacity-100 transition-opacity" />
            </div>
        </footer>
    );
}
