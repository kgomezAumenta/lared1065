import { fetchAllDepartmentsWeather } from "../actions/weather";
import WeatherWidget from "@/components/WeatherWidget";
import { CloudSun } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Clima en Guatemala | La Red 106.1",
    description: "Consulta el clima actual en los 22 departamentos de Guatemala.",
};

export default async function WeatherPage() {
    const departmentsWeather = await fetchAllDepartmentsWeather();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <div className="bg-[#E40000] text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center justify-center text-center">
                        <CloudSun size={64} className="mb-4 text-white/90" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[family-name:var(--font-geist-sans)]">
                            Clima en Guatemala
                        </h1>
                        <p className="text-xl md:text-2xl opacity-90 max-w-2xl">
                            Condiciones actuales en tiempo real para los 22 departamentos del país.
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid Section */}
            <div className="container mx-auto px-4 -mt-8">
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {departmentsWeather.map((item, index) => (
                            item.data ? (
                                <WeatherWidget
                                    key={index}
                                    variant="full-card"
                                    data={item.data}
                                    city={item.department}
                                />
                            ) : (
                                <div key={index} className="bg-gray-100 p-6 rounded-xl flex items-center justify-center text-gray-400">
                                    Error cargando {item.department}
                                </div>
                            )
                        ))}
                    </div>
                </div>

                <div className="text-center mt-8 text-gray-500 text-sm">
                    Datos proporcionados por WeatherAPI.com • Actualizado cada 30 minutos
                </div>
            </div>
        </div>
    );
}
