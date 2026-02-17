import { unstable_cache } from "next/cache";

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = "http://api.weatherapi.com/v1/current.json";

export interface WeatherData {
    location: {
        name: string;
        region: string;
        country: string;
    };
    current: {
        temp_c: number;
        condition: {
            text: string;
            icon: string;
            code: number;
        };
        humidity: number;
        feelslike_c: number;
        wind_kph: number;
    };
}

// Mapping Departments to Search Queries (Capital Cities usually provide better matches)
const DEPARTMENTS = [
    { name: "Alta Verapaz", query: "Coban, Guatemala" },
    { name: "Baja Verapaz", query: "Salama, Guatemala" },
    { name: "Chimaltenango", query: "Chimaltenango, Guatemala" },
    { name: "Chiquimula", query: "Chiquimula, Guatemala" },
    { name: "El Progreso", query: "Guastatoya, Guatemala" },
    { name: "Escuintla", query: "Escuintla, Guatemala" },
    { name: "Guatemala", query: "Guatemala City, Guatemala" },
    { name: "Huehuetenango", query: "Huehuetenango, Guatemala" },
    { name: "Izabal", query: "Puerto Barrios, Guatemala" },
    { name: "Jalapa", query: "Jalapa, Guatemala" },
    { name: "Jutiapa", query: "Jutiapa, Guatemala" },
    { name: "Petén", query: "Flores, Guatemala" },
    { name: "Quetzaltenango", query: "Quetzaltenango, Guatemala" },
    { name: "Quiché", query: "Santa Cruz del Quiche, Guatemala" },
    { name: "Retalhuleu", query: "Retalhuleu, Guatemala" },
    { name: "Sacatepéquez", query: "Antigua Guatemala, Guatemala" },
    { name: "San Marcos", query: "San Marcos, Guatemala" },
    { name: "Santa Rosa", query: "Cuilapa, Guatemala" },
    { name: "Sololá", query: "Solola, Guatemala" },
    { name: "Suchitepéquez", query: "Mazatenango, Guatemala" },
    { name: "Totonicapán", query: "Totonicapan, Guatemala" },
    { name: "Zacapa", query: "Zacapa, Guatemala" },
];

async function fetchWeatherForQuery(query: string): Promise<WeatherData | null> {
    if (!API_KEY) {
        console.error("WEATHER_API_KEY is not defined");
        return null;
    }

    try {
        const res = await fetch(`${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(query)}&lang=es`, {
            next: { revalidate: 1800 } // Cache for 30 minutes
        });

        if (!res.ok) {
            console.error(`Weather API Error for ${query}: ${res.status} ${res.statusText}`);
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error("Weather Fetch Error:", error);
        return null;
    }
}

export const getCityWeather = async (cityQuery: string = "Guatemala City") => {
    return await fetchWeatherForQuery(cityQuery);
};

export const getAllDepartmentsWeather = async () => {
    // Fetch all in parallel
    const promises = DEPARTMENTS.map(async (dept) => {
        const data = await fetchWeatherForQuery(dept.query);
        return {
            department: dept.name,
            data: data
        };
    });

    return await Promise.all(promises);
};
