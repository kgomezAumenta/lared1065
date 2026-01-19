import { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export const metadata: Metadata = {
    title: "Contacto - La Red 106.1",
    description: "Contáctanos - La Red 106.1 FM Guatemala",
};

export default function ContactoPage() {
    return (
        <main className="container mx-auto px-4 py-8 pb-32">
            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-extrabold uppercase text-gray-900">
                    Contáctanos
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Envíanos un mensaje</h2>

                    <form className="space-y-6">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                                Nombre completo *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
                                placeholder="Tu nombre"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                                Correo electrónico *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
                                placeholder="tu@email.com"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
                                placeholder="+502 1234 5678"
                            />
                        </div>

                        {/* Subject */}
                        <div>
                            <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-2">
                                Asunto *
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
                                placeholder="¿En qué podemos ayudarte?"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
                                Mensaje *
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all resize-none"
                                placeholder="Escribe tu mensaje aquí..."
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-red-600 text-white font-bold py-4 rounded-lg hover:bg-red-700 transition-colors uppercase text-sm tracking-wide"
                        >
                            Enviar mensaje
                        </button>

                        <p className="text-xs text-gray-500 text-center">
                            * Campos obligatorios
                        </p>
                    </form>
                </div>

                {/* Contact Information */}
                <div className="space-y-8">
                    {/* Info Cards */}
                    <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Información de contacto</h2>

                        <div className="space-y-6">
                            {/* Address */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <MapPin className="text-red-600" size={24} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Dirección</h3>
                                    <p className="text-gray-600">
                                        Guatemala, Guatemala<br />
                                        Centro América
                                    </p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <Phone className="text-red-600" size={24} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Teléfono</h3>
                                    <p className="text-gray-600">
                                        <a href="tel:+50212345678" className="hover:text-red-600 transition-colors">
                                            +502 1234 5678
                                        </a>
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <Mail className="text-red-600" size={24} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Correo electrónico</h3>
                                    <p className="text-gray-600">
                                        <a href="mailto:info@lared1061.com" className="hover:text-red-600 transition-colors">
                                            info@lared1061.com
                                        </a>
                                    </p>
                                </div>
                            </div>

                            {/* Hours */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <Clock className="text-red-600" size={24} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Horario</h3>
                                    <p className="text-gray-600">
                                        24 horas al aire<br />
                                        7 días a la semana
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg shadow-md p-8 text-white">
                        <h2 className="text-2xl font-bold mb-4">Síguenos en redes sociales</h2>
                        <p className="mb-6 text-red-100">
                            Mantente conectado con nosotros en nuestras redes sociales
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <a
                                href="#"
                                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-colors group"
                            >
                                <Facebook size={24} />
                                <span className="font-semibold">Facebook</span>
                            </a>
                            <a
                                href="#"
                                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-colors group"
                            >
                                <Twitter size={24} />
                                <span className="font-semibold">Twitter</span>
                            </a>
                            <a
                                href="#"
                                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-colors group"
                            >
                                <Instagram size={24} />
                                <span className="font-semibold">Instagram</span>
                            </a>
                            <a
                                href="#"
                                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-colors group"
                            >
                                <Youtube size={24} />
                                <span className="font-semibold">YouTube</span>
                            </a>
                        </div>
                    </div>

                    {/* Radio Info */}
                    <div className="bg-gray-900 rounded-lg shadow-md p-8 text-white text-center">
                        <h3 className="text-3xl font-bold mb-2">106.1 FM</h3>
                        <p className="text-gray-300 text-lg">La Red - Conectando con tu vida</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
