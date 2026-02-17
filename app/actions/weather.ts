"use server";

import { getCityWeather, getAllDepartmentsWeather } from "../services/weather";

export async function fetchCityWeather(city: string) {
    return await getCityWeather(city);
}

export async function fetchAllDepartmentsWeather() {
    return await getAllDepartmentsWeather();
}
