"use client";

import Script from "next/script";

export default function RadioPlayer() {
    return (
        <>
            <Script src="https://apps.elfsight.com/p/platform.js" strategy="afterInteractive" />
            <div className="elfsight-app-e3fc8c6a-60db-400a-9b23-73d7f12085ec"></div>
        </>
    );
}
