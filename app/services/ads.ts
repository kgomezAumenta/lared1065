"use server";

export interface Ad {
    id: number;
    title: string;
    content: string; // The raw HTML/JS of the ad
}

const wpUrl = process.env.NEXT_PUBLIC_WP_URL || "https://cms.lared1061.com";
const API_URL = `${wpUrl}/wp-json/advanced-ads/v1/ads`;

export async function getAdsById(id: number): Promise<Ad[]> {
    try {
        // Advanced Ads API individual route (/v1/ads/[id]) is currently throwing 500 Critical Errors.
        // As a workaround, we fetch the complete list of ads and groups, and filter locally.

        let allAds: any[] = [];
        let allGroups: any[] = [];
        const [adsRes, groupsRes] = await Promise.all([
            fetch(`${API_URL}?per_page=100`, { next: { revalidate: 300 } }),
            fetch(`${wpUrl}/wp-json/advanced-ads/v1/groups?per_page=100`, { next: { revalidate: 300 } })
        ]);

        if (adsRes.ok) allAds = await adsRes.json();
        if (groupsRes.ok) allGroups = await groupsRes.json();

        // 1. Check if ID is a Group
        const group = allGroups.find(g => (g.ID || g.id) === id);

        if (group && group.ads && group.ads.length > 0) {
            // Return all ads within the group for client-side rotation
            return group.ads.map((adId: number) => {
                const ad = allAds.find(a => (a.ID || a.id) === adId);
                return ad ? { id: ad.ID || ad.id, title: ad.title || '', content: ad.content || '' } : null;
            }).filter(Boolean);
        }

        // 2. Otherwise find the single Ad by ID
        const ad = allAds.find(a => (a.ID || a.id) === id);

        if (ad) {
            return [{
                id: ad.ID || ad.id,
                title: ad.title || '',
                content: ad.content || '',
            }];
        }

        return [];
    } catch (error) {
        console.error(`Error fetching Ads for ID ${id}:`, error);
        return [];
    }
}
