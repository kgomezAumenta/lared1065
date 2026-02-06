
/**
 * Advanced Ads REST API Service
 */

export interface Ad {
    ID: number;
    title: string;
    type: string;
    content: string; // The rendered HTML
}

const API_URL = "https://www.lared1061.com/wp-json/advanced-ads/v1/ads";

/**
 * Fetches an ad (or ads) for a specific group.
 * Note: The API might return a list. We usually want the first one or a random one depending on logic.
 */
export async function getAdByGroup(groupId: number): Promise<Ad | null> {
    try {
        // Attempt to fetch ads belonging to this group
        // The official endpoint usually filters by ?group_id=123 or ?groups=123 depending on version
        // We try 'group_id' as that is standard for many WP plugins
        const res = await fetch(`${API_URL}?group_id=${groupId}&per_page=1`, {
            next: { revalidate: 60 }, // Revalidate every minute to allow rotation
        });

        if (!res.ok) {
            console.error(`Failed to fetch ad group ${groupId}:`, res.statusText);
            return null;
        }

        const json = await res.json();

        // API returns an array of ads
        if (Array.isArray(json) && json.length > 0) {
            // If group is "Random", the API might already randomize the response if 'orderby' is supported
            // Or we can pick one randomly here if we receive multiple. 
            // For now, let's take the first one returned by the API.
            return json[0] as Ad;
        }

        return null;
    } catch (error) {
        console.error(`Error fetching ad group ${groupId}:`, error);
        return null;
    }
}
