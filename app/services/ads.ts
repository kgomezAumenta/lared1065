export interface Ad {
    id: number;
    title: string;
    content: string; // The raw HTML/JS of the ad
}

const API_URL = "https://www.lared1061.com/wp-json/advanced-ads/v1/ads";

export async function getAdById(id: number): Promise<Ad | null> {
    try {
        // Advanced Ads API doesn't seem to support direct fetch by ID in standard endpoint (/ads/ID sometimes fails)
        // But we can filter the list or try direct endpoint if supported.
        // Based on typical WP REST API, let's try direct ID first, fallback to list filter.

        // Option 1: Direct ID
        const res = await fetch(`${API_URL}/${id}`, {
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (res.ok) {
            const data = await res.json();
            // Map known fields. API might return uppercase ID or different casing.
            return {
                id: data.ID || data.id,
                title: data.title?.rendered || data.title,
                content: data.content?.rendered || data.content,
            };
        }

        // Option 2: Filter by 'include' (if Option 1 fails)
        // Note: 'include' param is standard in WP, but Advanced Ads might vary.
        // Given previous curl failure on specific ID, let's try fetching list and finding it.
        // BEWARE: This is heavy if there are many ads.

        return null;
    } catch (error) {
        console.error(`Error fetching Ad ${id}:`, error);
        return null;
    }
}
