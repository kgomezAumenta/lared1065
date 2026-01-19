"use server";

import { BanguatService } from "@softlari/banguat-exchange-rate";

export async function getExchangeRate() {
    try {
        const banguat = new BanguatService();
        const current = await banguat.getCurrentRate();

        return {
            buyRate: current.buyRate,
            sellRate: current.sellRate,
            success: true
        };
    } catch (error) {
        console.error("Error fetching exchange rate from Banguat:", error);
        return {
            success: false,
            error: "Failed to fetch exchange rate"
        };
    }
}
