import { Metadata } from 'next';

export const SeoFragment = `
  seo {
    title
    description
    canonicalUrl
    focusKeywords
    fullHead
    robots
    openGraph {
      title
      description
      url
      siteName
      locale
      type
      image {
        url
        width
        height
      }
      twitterMeta {
        card
        description
        title
      }
    }
    jsonLd {
      raw
    }
  }
`;

export function generateSeoMetadata(seoData: any, fallbackTitle?: string): Metadata {
  if (!seoData) {
    return {
      title: fallbackTitle || 'La Red 106.1',
    };
  }

  const title = seoData.title || fallbackTitle || 'La Red 106.1';
  const description = seoData.description || '';
  const url = seoData.canonicalUrl || seoData.openGraph?.url || 'https://www.lared1061.com';

  // Parse Robots
  const robots: any = {
    index: true,
    follow: true,
  };
  if (seoData.robots) {
    if (Array.isArray(seoData.robots)) {
      if (seoData.robots.includes('noindex')) robots.index = false;
      if (seoData.robots.includes('nofollow')) robots.follow = false;
    }
  }

  // Handle OpenGraph Image (Single object based on schema inference)
  // The query returns 'image' (singular object), so we wrap it in array for Next.js metadata
  const ogImages = [];
  if (seoData.openGraph?.image?.url) {
    ogImages.push({
      url: seoData.openGraph.image.url,
      width: seoData.openGraph.image.width,
      height: seoData.openGraph.image.height,
    });
  }

  return {
    title,
    description,
    openGraph: {
      title: seoData.openGraph?.title || title,
      description: seoData.openGraph?.description || description,
      url: url,
      siteName: seoData.openGraph?.siteName || 'La Red 106.1',
      images: ogImages,
      locale: seoData.openGraph?.locale || 'es_GT',
      type: 'website',
    },
    twitter: {
      card: seoData.openGraph?.twitterMeta?.card || 'summary_large_image',
      title: seoData.openGraph?.twitterMeta?.title || title,
      description: seoData.openGraph?.twitterMeta?.description || description,
      images: ogImages.map(img => img.url), // Fallback to OG image as Twitter image usually not explicit in this schema subset
    },
    alternates: {
      canonical: url,
    },
    robots: robots,
    other: {
      // Inject JSON-LD if available
      'script:ld+json': seoData.jsonLd?.raw || '',
    }
  };
}
