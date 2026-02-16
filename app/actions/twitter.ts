"use server";

import { TwitterApi } from "twitter-api-v2";

export async function postTweet(text: string, url?: string) {
    const appKey = process.env.TWITTER_APP_KEY;
    const appSecret = process.env.TWITTER_APP_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
        console.error("Missing Twitter API keys");
        throw new Error("Configuración de Twitter incompleta");
    }

    const client = new TwitterApi({
        appKey,
        appSecret,
        accessToken,
        accessSecret,
    });

    try {
        const tweetText = url ? `${text}\n${url}` : text;
        // Twitter has a character limit, we might want to truncate if needed
        // standard limit is 280 chars. 

        const rwClient = client.readWrite;
        const result = await rwClient.v2.tweet(tweetText);

        return { success: true, data: result };
    } catch (error: any) {
        console.error("Twitter API Error:", error);
        throw new Error(error.message || "Error al publicar en Twitter");
    }
}
