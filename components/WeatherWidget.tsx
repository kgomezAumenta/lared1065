"use client";

import { useEffect, useState } from "react";
import { fetchCityWeather } from "@/app/actions/weather";
import { CloudSun, Loader2, MapPin, Droplets, Wind } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface WeatherData {
    location: {
        name: string;
        region: string;
    };
    current: {
        temp_c: number;
        condition: {
            text: string;
            icon: string;
        };
        humidity: number;
        wind_kph: number;
    };
}

interface WeatherWidgetProps {
    variant: 'header-desktop' | 'header-mobile' | 'full-card';
    city?: string; // Default: Guatemala City
    data?: any; // For full-card where data is passed directly
}

export default function WeatherWidget({ variant, city = "Guatemala City", data }: WeatherWidgetProps) {
    const [weather, setWeather] = useState<WeatherData | null>(data || null);
    const [loading, setLoading] = useState(!data);

    useEffect(() => {
        if (data) return; // If data is provided (full-card list), don't fetch

        const loadWeather = async () => {
            try {
                const result = await fetchCityWeather(city);
                setWeather(result as any);
            } catch (error) {
                console.error("Error loading weather:", error);
            } finally {
                setLoading(false);
            }
        };

        loadWeather();
    }, [city, data]);

    if (loading) {
        if (variant === 'full-card') return <div className="h-48 bg-gray-100 rounded animate-pulse"></div>;
        return null; // Don't show loading state in header to avoid layout shift/clutter
    }

    if (!weather) return null;

    const iconUrl = weather.current.condition.icon.startsWith("//")
        ? `https:${weather.current.condition.icon}`
        : weather.current.condition.icon;

    // --- VARIANT: HEADER DESKTOP ---
    if (variant === 'header-desktop') {
        return (
            <Link href="/clima" className="flex items-center gap-2 text-gray-700 hover:text-[#E40000] transition group mr-2" title="Ver Clima Departamental">
                <div className="flex flex-col items-end leading-none justify-center">
                    <span className="text-[9px] uppercase font-bold text-gray-500 group-hover:text-red-500 tracking-wide mb-0.5">Capital</span>
                    <span className="text-lg font-bold text-gray-800">{Math.round(weather.current.temp_c)}°C</span>
                </div>
                <img src={iconUrl} alt={weather.current.condition.text} className="w-8 h-8" />
            </Link>
        );
    }

    // --- VARIANT: HEADER MOBILE ---
    if (variant === 'header-mobile') {
        return (
            <Link href="/clima" className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                    <CloudSun size={16} className="text-gray-500" />
                    <span className="font-bold text-gray-700">Capital</span>
                </div>
                <div className="flex items-center gap-1">
                    <img src={iconUrl} alt="icon" className="w-5 h-5" />
                    <span className="font-bold">{Math.round(weather.current.temp_c)}°</span>
                </div>
            </Link>
        );
    }

    // --- VARIANT: FULL CARD (For /clima page) ---
    if (variant === 'full-card') {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 text-lg">{weather.location.name}</h3>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{weather.location.region}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={iconUrl} alt={weather.current.condition.text} className="w-16 h-16" />
                        <div>
                            <span className="text-4xl font-bold text-gray-900">{Math.round(weather.current.temp_c)}°</span>
                            <p className="text-xs text-gray-500 capitalize">{weather.current.condition.text}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <Droplets size={14} className="text-blue-400" />
                        <span>Humedad: {weather.current.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Wind size={14} className="text-gray-400" />
                        <span>{weather.current.wind_kph} km/h</span>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
