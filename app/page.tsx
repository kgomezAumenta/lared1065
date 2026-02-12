export const dynamic = 'force-dynamic'; // Force dynamic rendering to fix caching issues

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bookmark, Clock, Search, Menu } from "lucide-react";
import TopicRow from "@/components/TopicRow";
import BreakingNews from "@/components/BreakingNews";
import AdvertisingBanner from "@/components/AdvertisingBanner";


interface Post {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  categories: {
    nodes: {
      name: string;
      slug: string;
    }[];
  };
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
}

interface BreakingAcfItem {
  newsTitle: string;
  newsUrl?: {
    url: string;
    title?: string;
    target?: string;
  } | string | null;
  newsTimestamp?: string;
}

// Helper to strip HTML tags from excerpts
const stripHtml = (html: string) => {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "");
};

// Data fetching function
async function getData() {
  const query = `
    query GetHomeData {
      stickyPost: posts(first: 1, where: { tag: "urgente-portada" }) {
        nodes {
          id
          title
          slug
          date
          excerpt
          categories { nodes { name slug } }
          featuredImage { node { sourceUrl altText } }
        }
      }
      latestPosts: posts(first: 10) {
        nodes {
          id
          title
          slug
          date
          excerpt
          categories { nodes { name slug } }
          featuredImage { node { sourceUrl altText } }
        }
      }
      nacionales: posts(first: 8, where: { categoryName: "nacionales" }) {
        nodes { id title slug date excerpt categories { nodes { name slug } } featuredImage { node { sourceUrl altText } } } }
      futbolNacional: posts(first: 8, where: { categoryName: "futbol-nacional" }) {
        nodes { id title slug date excerpt categories { nodes { name slug } } featuredImage { node { sourceUrl altText } } } }
      futbolInternacional: posts(first: 4, where: { categoryName: "futbol-internacional" }) {
        nodes { id title slug date excerpt categories { nodes { name slug } } featuredImage { node { sourceUrl altText } } } }
      deporteNacional: posts(first: 6, where: { categoryName: "deporte-nacional" }) {
        nodes { id title slug date excerpt categories { nodes { name slug } } featuredImage { node { sourceUrl altText } } } }
      deporteInternacional: posts(first: 6, where: { categoryName: "deporte-internacional" }) {
        nodes { id title slug date excerpt categories { nodes { name slug } } featuredImage { node { sourceUrl altText } } } }
      internacionales: posts(first: 6, where: { categoryName: "internacionales" }) {
        nodes { id title slug date excerpt categories { nodes { name slug } } featuredImage { node { sourceUrl altText } } } }
      economia: posts(first: 6, where: { categoryName: "economia" }) {
        nodes { id title slug date excerpt categories { nodes { name slug } } featuredImage { node { sourceUrl altText } } } }
      ahoraPosts: posts(first: 10) {
        nodes { id title slug date excerpt categories { nodes { name slug } } }
      }
      # Remove old ACF Ad query - now using REST API
      # homeSettings: page(id: "/", idType: URI) { ... }
    }
  `;

  try {
    // Parallel Fetch: GraphQL only (Ads are client-side now)
    const res = await fetch("https://www.lared1061.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      next: { revalidate: 0 }, // Disable cache for news
    });

    const json = await res.json();

    if (json.errors) {
      console.error("GraphQL Errors in Home Query:", JSON.stringify(json.errors, null, 2));
    }

    const data = json.data;
    const now = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    // Validate Sticky Hero (must be < 24h old)
    let validStickyHero = null;
    if (data?.stickyPost?.nodes[0]) {
      const postDate = new Date(data.stickyPost.nodes[0].date).getTime();
      if ((now - postDate) < twentyFourHours) {
        validStickyHero = data.stickyPost.nodes[0];
      }
    }

    return {
      stickyHero: validStickyHero,
      latestPosts: data?.latestPosts?.nodes || [],
      nacionalesPosts: data?.nacionales?.nodes || [],
      futbolNacionalPosts: data?.futbolNacional?.nodes || [],
      futbolInternacionalPosts: data?.futbolInternacional?.nodes || [],
      internacionalesPosts: data?.internacionales?.nodes || [],
      deporteIntPosts: data?.deporteInternacional?.nodes || [],
      deporteNacPosts: data?.deporteNacional?.nodes || [],
      economiaPosts: data?.economia?.nodes || [],
      ahoraPosts: data?.ahoraPosts?.nodes || [],
      acfBreakingNews: data?.ahoraPage?.newsList?.repetidor || [],

      dynamicCategoryName: data?.dynamicCategory?.name || "Internacionales",
      categorySnapshots: [
        data?.nacionales?.nodes[0],
        data?.futbolNacional?.nodes[0],
        data?.futbolInternacional?.nodes[0],
        data?.deporteNacional?.nodes[0],
        data?.deporteInternacional?.nodes[0],
        data?.internacionales?.nodes[0],
        data?.economia?.nodes[0],
      ].filter(Boolean),
    };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return {
      stickyHero: null,
      latestPosts: [],
      nacionalesPosts: [],
      futbolNacionalPosts: [],
      futbolInternacionalPosts: [],
      internacionalesPosts: [],
      deporteIntPosts: [],
      deporteNacPosts: [],
      economiaPosts: [],
      ahoraPosts: [], // Fallback
      acfBreakingNews: [],

      dynamicCategoryName: "Noticias",
      categorySnapshots: [],
    };
  }
}

export default async function Home() {
  const {
    stickyHero,
    latestPosts,
    nacionalesPosts,
    futbolNacionalPosts,
    futbolInternacionalPosts,
    internacionalesPosts,
    deporteIntPosts,
    deporteNacPosts,
    economiaPosts,
    ahoraPosts,
    acfBreakingNews,
    dynamicCategoryName,
    categorySnapshots,

  } = await getData();

  // 1. Determine Featured/Hero Post
  // If a post with tag "Portada" exists, use it. Otherwise, use latest.
  const featuredPost = stickyHero || latestPosts[0];

  // 2. Sidebar List (Lo Más Reciente)
  // If featured is sticky, use full latest. If default, skip first.
  const subFeaturedPosts = stickyHero
    ? latestPosts.filter((p: Post) => p.id !== stickyHero.id).slice(0, 5)
    : latestPosts.slice(1, 6);

  // 3. AHORA Logic
  // Helper: Repair malformed "YYYY-DD-MM" dates with incorrect "UTC" label.
  // Input: "2026-05-02T16:03:00+00:00" (Day 05, Month 02, Time 16:03 Local)
  // Output: Date object for "2026-02-05T16:03:00-06:00"
  const repairDate = (dateString: string) => {
    if (!dateString) return new Date();

    // Check for the specific malformed pattern with +00:00 suffix
    // Warning: We are assuming YYYY-DD-MM based on logs (2026-05-02 for Feb 5th)
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\+00:00$/);

    if (match) {
      const [, year, day, month, hour, minute, second] = match;
      // Swap Day (group 2) and Month (group 3). Force -06:00 timezone.
      return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}-06:00`);
    }

    // Fallback for standard ISO or other string formats
    return new Date(dateString);
  };

  const isRecentBoxItem = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    // 3 hour window (Strict filtering per user request)
    const timeLimit = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    return date >= timeLimit;
  };

  const mappedAcfItems = acfBreakingNews.map((item: BreakingAcfItem, index: number) => {
    let linkUrl = null;
    if (item.newsUrl && typeof item.newsUrl === 'object' && 'url' in item.newsUrl) {
      linkUrl = item.newsUrl.url;
    } else if (typeof item.newsUrl === 'string') {
      linkUrl = item.newsUrl;
    }

    // Apply repair logic
    const validDate = item.newsTimestamp ? repairDate(item.newsTimestamp).toISOString() : new Date().toISOString();

    return {
      id: `acf-${index}`,
      title: item.newsTitle,
      date: validDate,
      link: linkUrl,
      type: 'custom' as const
    };
  });

  const mappedFallbackPosts = ahoraPosts.map((post: Post) => ({
    id: post.id,
    title: post.title,
    date: post.date,
    link: `/posts/${post.slug}`,
    type: 'post' as const
  }));

  // Filter items by 24 hours
  const validAcfItems = mappedAcfItems.filter((item: any) => item.date ? isRecentBoxItem(item.date) : false);
  const validFallbackPosts = mappedFallbackPosts.filter((item: any) => isRecentBoxItem(item.date));

  // Decision Logic: Use ACF (if valid), else Fallback (if valid), else Unfiltered Fallback
  // "sino en ACF no hay nada mostrar las ultimas noticias": If no recent news, just show latest.
  const finalBreakingNews = validAcfItems.length > 0
    ? validAcfItems
    : (validFallbackPosts.length > 0 ? validFallbackPosts : mappedFallbackPosts.slice(0, 5));

  return (
    <main className="container mx-auto px-4 py-6 pb-32">
      {/* Top Advertisement "Anuncio 1" */}
      <div className="mb-8 flex justify-center w-full">
        <AdvertisingBanner slotId="2850891862" placeholderText="Anuncio 1" />
      </div>

      {/* Hero Section (Single Featured Post) */}
      <div className="bg-[#FAFAFA] flex justify-center py-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center max-w-[1630px] mx-auto w-full">
          {featuredPost && (
            <>
              {/* Left Column: Image (Narrower: 700px) */}
              <div className="relative w-full md:w-[700px] aspect-[16/9] shrink-0">
                <Link href={`/posts/${featuredPost.slug}`} className="block w-full h-full relative overflow-hidden rounded-[20px]">
                  {featuredPost.featuredImage?.node?.sourceUrl ? (
                    <Image
                      src={featuredPost.featuredImage.node.sourceUrl}
                      alt={featuredPost.featuredImage.node.altText || featuredPost.title}
                      fill
                      priority
                      className="object-cover hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </Link>
              </div>

              {/* Right Column: Content (Wider: flex-1) */}
              <div className="flex flex-col gap-4 w-full flex-1">
                {/* Category Pill */}
                <div className="self-start">
                  <span className="bg-[#E40000] text-white text-xs font-bold uppercase px-4 py-1.5 rounded-[10px]">
                    {featuredPost.categories?.nodes[0]?.name || "NACIONALES"}
                  </span>
                </div>

                {/* Title (Reduced from 4xl to 3xl) */}
                <Link href={`/posts/${featuredPost.slug}`} className="group">
                  <h1 className="text-2xl md:text-3xl font-bold text-black leading-tight group-hover:text-[#E40000] transition-colors">
                    {featuredPost.title}
                  </h1>
                </Link>

                {/* Excerpt (Reduced from xl to lg) */}
                <div className="text-[#717171] text-base md:text-lg font-normal leading-snug line-clamp-3">
                  {stripHtml(featuredPost.excerpt) || "Lorem ipsum dolor sit amet, consectetuer adipiscing elit..."}
                </div>

                {/* Meta (Reduced from lg to base) */}
                <div className="flex justify-between items-center text-base mt-2 w-full">
                  <span className="text-black font-normal">Redacción</span>
                  <span className="text-[#9F9F9F] font-normal">
                    {new Date(featuredPost.date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content + Sidebar Layout */}
      {/* Updated: Main Content takes flex-1 (fills space), Sidebar fixed to 400px (narrower) */}
      <div className="flex flex-col xl:flex-row gap-12 justify-center items-start max-w-[1630px] mx-auto w-full">

        {/* LEFT COLUMN (Main Content) - Flexible width */}
        <div className="flex flex-col gap-12 w-full xl:flex-1">

          {/* Nacionales Section */}
          <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-black uppercase">Nacionales</h2>
                <Link href="/category/nacionales" className="border border-black px-4 py-1 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors">
                  Ver Más
                </Link>
              </div>
              <div className="h-[2px] bg-black w-full" />
            </div>

            {/* Nacionales Section - 2 Rows */}
            <div className="flex flex-col gap-8">
              {/* Row 1: Post 1, Post 2, Ad */}
              <div className="flex flex-col md:flex-row gap-8">
                {nacionalesPosts.slice(0, 2).map((post: Post) => (
                  <div key={post.id} className="flex-1 flex flex-col gap-3 min-w-[280px]">
                    <Link href={`/posts/${post.slug}`} className="relative block h-[200px] w-full rounded-[10px] overflow-hidden">
                      {post.featuredImage?.node?.sourceUrl && (
                        <Image
                          src={post.featuredImage.node.sourceUrl}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </Link>
                    <div className="self-start">
                      <span className="bg-[#E40000] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-[8px] inline-block">
                        NACIONALES
                      </span>
                    </div>
                    <Link href={`/posts/${post.slug}`} className="group">
                      <h3 className="text-lg font-bold text-black leading-tight group-hover:text-[#E40000] transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-[#717171] text-sm font-normal leading-snug line-clamp-3">
                      {stripHtml(post.excerpt) || "Lorem ipsum dolor sit amet..."}
                    </p>
                    <div className="flex justify-between items-center w-full mt-1">
                      <span className="text-black text-xs font-normal">Redacción</span>
                      <span className="text-[#9F9F9F] text-xs font-normal">
                        {new Date(post.date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Ad Slot (3rd Column in Row 1) */}
                <div className="flex-1 min-w-[280px]">
                  <AdvertisingBanner
                    slotId="4048423466"
                    placeholderText="Anuncio Nacionales"
                    className="h-full w-full rounded-[15px] px-4 py-4 flex flex-col justify-center items-start text-left min-h-[350px]"
                  />
                </div>
              </div>

              {/* Row 2: Post 3, Post 4, Post 5 */}
              {nacionalesPosts.length > 2 && (
                <div className="flex flex-col md:flex-row gap-8">
                  {nacionalesPosts.slice(2, 5).map((post: Post) => (
                    <div key={post.id} className="flex-1 flex flex-col gap-3 min-w-[280px]">
                      <Link href={`/posts/${post.slug}`} className="relative block h-[200px] w-full rounded-[10px] overflow-hidden">
                        {post.featuredImage?.node?.sourceUrl && (
                          <Image
                            src={post.featuredImage.node.sourceUrl}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </Link>
                      <div className="self-start">
                        <span className="bg-[#E40000] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-[8px] inline-block">
                          NACIONALES
                        </span>
                      </div>
                      <Link href={`/posts/${post.slug}`} className="group">
                        <h3 className="text-lg font-bold text-black leading-tight group-hover:text-[#E40000] transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-[#717171] text-sm font-normal leading-snug line-clamp-3">
                        {stripHtml(post.excerpt) || "Lorem ipsum dolor sit amet..."}
                      </p>
                      <div className="flex justify-between items-center w-full mt-1">
                        <span className="text-black text-xs font-normal">Redacción</span>
                        <span className="text-[#9F9F9F] text-xs font-normal">
                          {new Date(post.date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {/* Fill empty slots if less than 3 posts in row 2 */}
                  {nacionalesPosts.slice(2, 5).length < 3 && Array.from({ length: 3 - nacionalesPosts.slice(2, 5).length }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex-1 hidden md:block"></div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Internacionales Section */}
          <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-black uppercase">Internacional</h2>
                <Link href="/category/internacionales" className="border border-black px-4 py-1 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors">
                  Ver Más
                </Link>
              </div>
              <div className="h-[2px] bg-black w-full" />
            </div>

            {/* Internacionales Section - 2 Rows */}
            <div className="flex flex-col gap-8">
              {/* Row 1: Post 1, Post 2, Ad */}
              <div className="flex flex-col md:flex-row gap-8">
                {internacionalesPosts.slice(0, 2).map((post: Post) => (
                  <div key={post.id} className="flex-1 flex flex-col gap-3 min-w-[280px]">
                    <Link href={`/posts/${post.slug}`} className="relative block h-[200px] w-full rounded-[10px] overflow-hidden">
                      {post.featuredImage?.node?.sourceUrl && (
                        <Image
                          src={post.featuredImage.node.sourceUrl}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </Link>
                    <div className="self-start">
                      <span className="bg-[#E40000] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-[8px] inline-block">
                        INTERNACIONAL
                      </span>
                    </div>
                    <Link href={`/posts/${post.slug}`} className="group">
                      <h3 className="text-lg font-bold text-black leading-tight group-hover:text-[#E40000] transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-[#717171] text-sm font-normal leading-snug line-clamp-3">
                      {stripHtml(post.excerpt) || "Lorem ipsum dolor sit amet..."}
                    </p>
                    <div className="flex justify-between items-center w-full mt-1">
                      <span className="text-black text-xs font-normal">Redacción</span>
                      <span className="text-[#9F9F9F] text-xs font-normal">
                        {new Date(post.date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Ad Slot (3rd Column in Row 1) */}
                <div className="flex-1 min-w-[280px]">
                  <AdvertisingBanner
                    slotId="1502151177"
                    placeholderText="Anuncio Inter"
                    className="h-full w-full rounded-[15px] px-4 py-4 flex flex-col justify-center items-start text-left min-h-[350px]"
                  />
                </div>
              </div>

              {/* Row 2: Post 3, Post 4, Post 5 */}
              {internacionalesPosts.length > 2 && (
                <div className="flex flex-col md:flex-row gap-8">
                  {internacionalesPosts.slice(2, 5).map((post: Post) => (
                    <div key={post.id} className="flex-1 flex flex-col gap-3 min-w-[280px]">
                      <Link href={`/posts/${post.slug}`} className="relative block h-[200px] w-full rounded-[10px] overflow-hidden">
                        {post.featuredImage?.node?.sourceUrl && (
                          <Image
                            src={post.featuredImage.node.sourceUrl}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </Link>
                      <div className="self-start">
                        <span className="bg-[#E40000] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-[8px] inline-block">
                          INTERNACIONAL
                        </span>
                      </div>
                      <Link href={`/posts/${post.slug}`} className="group">
                        <h3 className="text-lg font-bold text-black leading-tight group-hover:text-[#E40000] transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-[#717171] text-sm font-normal leading-snug line-clamp-3">
                        {stripHtml(post.excerpt) || "Lorem ipsum dolor sit amet..."}
                      </p>
                      <div className="flex justify-between items-center w-full mt-1">
                        <span className="text-black text-xs font-normal">Redacción</span>
                        <span className="text-[#9F9F9F] text-xs font-normal">
                          {new Date(post.date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {/* Fill empty slots */}
                  {internacionalesPosts.slice(2, 5).length < 3 && Array.from({ length: 3 - internacionalesPosts.slice(2, 5).length }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex-1 hidden md:block"></div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Hablando con los Cracks (Iframe) */}
          <section className="hidden md:block">
            {/* Reduced from 3xl to 2xl */}
            <h2 className="text-2xl font-extrabold text-[#E40000] uppercase mb-6">HABLANDO CON LOS CRACKS</h2>
            <div className="w-full">
              <iframe
                src="https://omny.fm/shows/cracks/playlists/podcast/embed?style=cover"
                allow="autoplay; clipboard-write"
                width="100%"
                height="482"
                frameBorder="0"
                title="Hablando con los Cracks"
                className="w-full rounded-[16px] shadow-md border border-white"
              ></iframe>
            </div>
          </section>

          {/* Fútbol Nacional Section */}
          <section className="">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col gap-4 w-full">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-black uppercase">FÚTBOL NACIONAL</h2>
                  <Link href="/category/futbol-nacional" className="border border-black px-4 py-1 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors">
                    Ver Más
                  </Link>
                </div>
                <div className="h-[2px] bg-black w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {futbolNacionalPosts.slice(0, 2).map((post: Post) => (
                <div key={post.id} className="flex flex-col gap-3">
                  <Link href={`/posts/${post.slug}`} className="relative block h-[300px] w-full rounded-[20px] overflow-hidden">
                    {post.featuredImage?.node?.sourceUrl && (
                      <Image
                        src={post.featuredImage.node.sourceUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    )}
                    {/* Floating Pill inside image */}
                    <div className="absolute bottom-4 left-4 bg-[#E40000] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-[8px]">
                      FUTBOL NACIONAL
                    </div>
                  </Link>

                  <Link href={`/posts/${post.slug}`} className="group">
                    <h3 className="text-xl font-bold text-black leading-tight group-hover:text-[#E40000] transition-colors">
                      {post.title}
                    </h3>
                  </Link>

                  <div className="flex justify-between items-center w-full mt-1">
                    <span className="text-black text-sm font-normal">Redacción</span>
                    <span className="text-[#9F9F9F] text-sm font-normal">
                      {new Date(post.date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Fútbol Internacional Section */}
          <section className="">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col gap-4 w-full">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-black uppercase">FÚTBOL INTERNACIONAL</h2>
                  <Link href="/category/futbol-internacional" className="border border-black px-4 py-1 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors">
                    Ver Más
                  </Link>
                </div>
                <div className="h-[2px] bg-black w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 3 Columns for Futbol Internacional */}
              {futbolInternacionalPosts.slice(0, 3).map((post: Post) => (
                <div key={post.id} className="flex flex-col gap-3">
                  <Link href={`/posts/${post.slug}`} className="relative block h-[270px] w-full rounded-[20px] overflow-hidden">
                    {post.featuredImage?.node?.sourceUrl ? (
                      <Image
                        src={post.featuredImage.node.sourceUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                    <div className="absolute bottom-4 left-4 bg-[#E40000] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-[8px]">
                      FUTBOL INTERNACIONAL
                    </div>
                  </Link>
                  <Link href={`/posts/${post.slug}`} className="group">
                    <h3 className="text-lg font-bold text-black leading-tight group-hover:text-[#E40000] transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Redacción</span>
                    <span>{new Date(post.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN (Sidebar) - Width 400px (Narrower) */}
        <div className="flex flex-col gap-8 w-full xl:w-[400px] shrink-0">

          {/* AHORA Section */}
          <div className="bg-[#F7F7F7] rounded-[20px] p-6 hidden md:flex flex-col gap-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-5 h-5 bg-[#E40000] rounded-full shrink-0" />
              <h3 className="text-xl font-bold text-black">AHORA</h3>
            </div>

            {/* Ahora Items List */}
            {finalBreakingNews.length > 0 ? finalBreakingNews.slice(0, 5).map((item: any, i: number) => (
              <div key={i} className="flex gap-4 items-start border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                {/* Circle Icon */}
                <div className="shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full border-[3px] border-[#E40000] bg-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#E40000] text-base font-bold">
                    {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {/* Title reduced to lg */}
                  <h4 className="text-lg font-bold text-black leading-tight">
                    {item.title}
                  </h4>
                  {item.link ? (
                    <Link href={item.link} className="text-black text-sm hover:underline mt-1">Ver más</Link>
                  ) : (
                    <span className="text-black text-sm mt-1 cursor-default">Ver más</span>
                  )}
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-sm">No hay noticias urgentes.</p>
            )}
          </div>

          {/* LO MÁS RECIENTE DE LA RED Section */}
          <div className="hidden md:flex flex-col">
            <div className="bg-[#FF0000] rounded-[15px] py-3 px-4 mb-4 flex justify-center items-center">
              <h3 className="text-xl font-bold text-white text-center">LO MÁS RECIENTE DE LA RED</h3>
            </div>

            <div className="flex flex-col gap-0 border border-[#DCDCDC] rounded-[15px] overflow-hidden">
              {subFeaturedPosts.map((post: Post, i: number) => (
                <div key={post.id} className="p-5 border-b border-[#DCDCDC] last:border-0 flex gap-6 items-center hover:bg-gray-50 transition-colors">
                  <span className="text-[#9F9F9F] text-xl font-bold">0{i + 1}</span>
                  <div className="flex flex-col gap-1">
                    <span className="text-[#E40000] text-xs font-bold uppercase">
                      {post.categories?.nodes[0]?.name || "NOTICIAS"}
                    </span>
                    <Link href={`/posts/${post.slug}`}>
                      <h4 className="text-base font-bold text-black leading-tight hover:text-[#E40000] transition-colors">{post.title}</h4>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Ads */}
          {/* 1. Sidebar Rojo */}
          <AdvertisingBanner
            slotId="1330868584"
            placeholderText="Anuncio Sidebar 1"
            className="w-full h-[450px] bg-[#FF0000] rounded-[15px] flex flex-col justify-center items-center text-white p-6 text-center"
          />

          {/* 2. Sidebar Gris (Long) */}
          <AdvertisingBanner
            slotId="4243864586"
            placeholderText="Anuncio Sidebar 2"
            className="hidden md:flex w-full h-[600px] bg-[#F0F0F0] rounded-[15px] flex-col justify-center items-center text-[#717171] p-6 text-center"
          />

        </div>


      </div>
    </main>
  );
}
