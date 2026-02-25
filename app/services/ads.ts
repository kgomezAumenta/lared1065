"use server";

export interface Ad {
    id: number;
    title: string;
    content: string; // The raw HTML/JS of the ad
}

const API_URL = "https://www.lared1061.com/wp-json/advanced-ads/v1/ads";

export async function getAdById(id: number): Promise<Ad | null> {
    try {
        // Advanced Ads API individual route (/v1/ads/[id]) is currently throwing 500 Critical Errors.
        // As a workaround, we fetch the complete list of ads and groups, and filter locally.

        let allAds: any[] = [];
        let allGroups: any[] = [];
        const [adsRes, groupsRes] = await Promise.all([
            fetch(`${API_URL}?per_page=100`, { next: { revalidate: 300 } }),
            fetch("https://www.lared1061.com/wp-json/advanced-ads/v1/groups?per_page=100", { next: { revalidate: 300 } })
        ]);

        if (adsRes.ok) allAds = await adsRes.json();
        if (groupsRes.ok) allGroups = await groupsRes.json();

        // 1. Check if ID is a Group
        const group = allGroups.find(g => (g.ID || g.id) === id);
        let targetAdId = id;

        if (group && group.ads && group.ads.length > 0) {
            // For random ads, we can pick a random ad from the group, or just the first one
            // Advanced ads group 'ad_weights' could be used, but picking the first one is easiest for now
            targetAdId = group.ads[0];
        }

        // 2. Find the Ad by targetAdId in the Ads list
        const ad = allAds.find(a => (a.ID || a.id) === targetAdId);

        if (ad) {
            return {
                id: ad.ID || ad.id,
                title: ad.title || '',
                content: ad.content || '',
            };
        }

        return null;
    } catch (error) {
        console.error(`Error fetching Ad ${id}:`, error);
        return null;
    }
}
