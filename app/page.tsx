export const dynamic = 'force-dynamic'; // Force dynamic rendering to fix caching issues

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bookmark, Clock, Search, Menu } from "lucide-react";
import MediaLightbox from "@/components/MediaLightbox";
import MatchesGrid from "@/components/MatchesGrid";
import TopicRow from "@/components/TopicRow";
import BreakingNews from "@/components/BreakingNews";
import AdvertisingBanner from "@/components/AdvertisingBanner";
import BreakingNewsRealtime from "@/components/BreakingNewsRealtime";
import { generateSeoMetadata, SeoFragment } from "@/lib/seo";

import { Metadata } from "next";


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
      futbolInternacional: posts(first: 6, where: { categoryName: "futbol-internacional" }) {
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
      page(id: "/", idType: URI) {
        ${SeoFragment}
      }
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
      seo: data?.page?.seo || null,
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
      seo: null,
    };
  }
}

// Generate Metadata
export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getData();
  return generateSeoMetadata(seo, "La Red 106.1 - Noticias de Guatemala y el Mundo");
}

export default async function Home() {
  // ... existing Home component ...

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
    /*
    ahoraPosts,
    acfBreakingNews,
    */
  } = await getData();

  // 1. Determine Featured/Hero Post
  // If a post with tag "Portada" exists, use it. Otherwise, use latest.
  const featuredPost = stickyHero || latestPosts[0];

  // 2. Sidebar List (Lo Más Reciente)
  // If featured is sticky, use full latest. If default, skip first.
  const subFeaturedPosts = stickyHero
    ? latestPosts.filter((p: Post) => p.id !== stickyHero.id).slice(0, 5)
    : latestPosts.slice(1, 6);

  // 3. Filter Side Column Posts (Ensure Main Featured is not repeated)
  const sideFutbolNacional = futbolNacionalPosts.find((p: Post) => p.id !== featuredPost?.id) || futbolNacionalPosts[0];
  const sideInternacional = internacionalesPosts.find((p: Post) => p.id !== featuredPost?.id) || internacionalesPosts[0];
  const sideNacional = nacionalesPosts.find((p: Post) => p.id !== featuredPost?.id) || nacionalesPosts[0];
  const sideFutbolInternacional = futbolInternacionalPosts.find((p: Post) => p.id !== featuredPost?.id) || futbolInternacionalPosts[0];
  const sideEconomia = economiaPosts.find((p: Post) => p.id !== featuredPost?.id) || economiaPosts[0];



  return (
    <main className="container mx-auto px-4 py-6 pb-32">
      {/* Top Advertisement "Anuncio 1" */}
      <div className="mb-8 flex justify-center w-full">
        <AdvertisingBanner adId={37291} placeholderText="Anuncio 1" />
      </div>

      {/* Live Matches Grid */}
      <MatchesGrid />

      {/* Hero Section (Single Featured Post + 3 Side Categories) */}
      <div className="bg-[#FAFAFA] flex justify-center py-8 mb-8">
        <div className="flex flex-col lg:flex-row gap-8 items-stretch max-w-[1630px] mx-auto w-full">

          {/* Main Featured Post (Left - Larger) */}
          {featuredPost && (
            <div className="flex-1 flex flex-col gap-4 relative">
              <Link href={`/posts/${featuredPost.slug}`} className="block w-full aspect-[16/9] relative overflow-hidden rounded-[20px]">
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
                {/* Floating Category Pill */}
                <div className="absolute top-4 left-4">
                  <span className="bg-[#E40000] text-white text-xs font-bold uppercase px-4 py-1.5 rounded-[10px]">
                    {featuredPost.categories?.nodes[0]?.name || "DESTACADO"}
                  </span>
                </div>
              </Link>

              <div className="flex flex-col gap-2">
                <Link href={`/posts/${featuredPost.slug}`} className="group">
                  <h1 className="text-2xl md:text-4xl font-bold text-black leading-tight group-hover:text-[#E40000] transition-colors">
                    {featuredPost.title}
                  </h1>
                </Link>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    {new Date(featuredPost.date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Side Column: 3 Specific Category Posts */}
          <div className="w-full lg:w-[320px] xl:w-[380px] flex flex-col gap-6 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 pt-6 lg:pt-0 lg:pl-6">

            {/* 1. Futbol Nacional */}
            {sideFutbolNacional && (
              <div className="flex gap-4 items-start group">
                <Link href={`/posts/${sideFutbolNacional.slug}`} className="relative w-[100px] h-[70px] shrink-0 rounded-[10px] overflow-hidden">
                  {sideFutbolNacional.featuredImage?.node?.sourceUrl ? (
                    <Image
                      src={sideFutbolNacional.featuredImage.node.sourceUrl}
                      alt={sideFutbolNacional.title}
                      fill
                      className="object-cover"
                    />
                  ) : <div className="w-full h-full bg-gray-200" />}
                </Link>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#E40000] uppercase">FUTBOL NACIONAL</span>
                  <Link href={`/posts/${sideFutbolNacional.slug}`}>
                    <h3 className="text-sm font-bold text-black leading-snug group-hover:text-[#E40000] transition-colors line-clamp-2">
                      {sideFutbolNacional.title}
                    </h3>
                  </Link>
                </div>
              </div>
            )}

            {/* Separator */}
            <div className="h-[1px] bg-gray-200 w-full" />

            {/* 2. Internacionales */}
            {sideInternacional && (
              <div className="flex gap-4 items-start group">
                <Link href={`/posts/${sideInternacional.slug}`} className="relative w-[100px] h-[70px] shrink-0 rounded-[10px] overflow-hidden">
                  {sideInternacional.featuredImage?.node?.sourceUrl ? (
                    <Image
                      src={sideInternacional.featuredImage.node.sourceUrl}
                      alt={sideInternacional.title}
                      fill
                      className="object-cover"
                    />
                  ) : <div className="w-full h-full bg-gray-200" />}
                </Link>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#E40000] uppercase">INTERNACIONALES</span>
                  <Link href={`/posts/${sideInternacional.slug}`}>
                    <h3 className="text-sm font-bold text-black leading-snug group-hover:text-[#E40000] transition-colors line-clamp-2">
                      {sideInternacional.title}
                    </h3>
                  </Link>
                </div>
              </div>
            )}

            {/* Separator */}
            <div className="h-[1px] bg-gray-200 w-full" />

            {/* 3. Nacionales */}
            {sideNacional && (
              <div className="flex gap-4 items-start group">
                <Link href={`/posts/${sideNacional.slug}`} className="relative w-[100px] h-[70px] shrink-0 rounded-[10px] overflow-hidden">
                  {sideNacional.featuredImage?.node?.sourceUrl ? (
                    <Image
                      src={sideNacional.featuredImage.node.sourceUrl}
                      alt={sideNacional.title}
                      fill
                      className="object-cover"
                    />
                  ) : <div className="w-full h-full bg-gray-200" />}
                </Link>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#E40000] uppercase">NACIONALES</span>
                  <Link href={`/posts/${sideNacional.slug}`}>
                    <h3 className="text-sm font-bold text-black leading-snug group-hover:text-[#E40000] transition-colors line-clamp-2">
                      {sideNacional.title}
                    </h3>
                  </Link>
                </div>
              </div>
            )}

            {/* Separator */}
            <div className="h-[1px] bg-gray-200 w-full" />

            {/* 4. Futbol Internacional */}
            {sideFutbolInternacional && (
              <div className="flex gap-4 items-start group">
                <Link href={`/posts/${sideFutbolInternacional.slug}`} className="relative w-[100px] h-[70px] shrink-0 rounded-[10px] overflow-hidden">
                  {sideFutbolInternacional.featuredImage?.node?.sourceUrl ? (
                    <Image
                      src={sideFutbolInternacional.featuredImage.node.sourceUrl}
                      alt={sideFutbolInternacional.title}
                      fill
                      className="object-cover"
                    />
                  ) : <div className="w-full h-full bg-gray-200" />}
                </Link>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#E40000] uppercase">FUTBOL INTERNACIONAL</span>
                  <Link href={`/posts/${sideFutbolInternacional.slug}`}>
                    <h3 className="text-sm font-bold text-black leading-snug group-hover:text-[#E40000] transition-colors line-clamp-2">
                      {sideFutbolInternacional.title}
                    </h3>
                  </Link>
                </div>
              </div>
            )}

            {/* Separator */}
            <div className="h-[1px] bg-gray-200 w-full" />

            {/* 5. Economia */}
            {sideEconomia && (
              <div className="flex gap-4 items-start group">
                <Link href={`/posts/${sideEconomia.slug}`} className="relative w-[100px] h-[70px] shrink-0 rounded-[10px] overflow-hidden">
                  {sideEconomia.featuredImage?.node?.sourceUrl ? (
                    <Image
                      src={sideEconomia.featuredImage.node.sourceUrl}
                      alt={sideEconomia.title}
                      fill
                      className="object-cover"
                    />
                  ) : <div className="w-full h-full bg-gray-200" />}
                </Link>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#E40000] uppercase">ECONOMÍA</span>
                  <Link href={`/posts/${sideEconomia.slug}`}>
                    <h3 className="text-sm font-bold text-black leading-snug group-hover:text-[#E40000] transition-colors line-clamp-2">
                      {sideEconomia.title}
                    </h3>
                  </Link>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Mobile-Only Minuto a Minuto (Placed below Hero) */}
      <div className="md:hidden container mx-auto px-4 mb-8">
        <BreakingNewsRealtime />
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

                    <div className="flex justify-between items-center w-full mt-1">
                      <span className="text-[#9F9F9F] text-xs font-normal">
                        {new Date(post.date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Ad Slot (3rd Column in Row 1) */}
                <div className="flex-1 min-w-[280px]">
                  <AdvertisingBanner
                    adId={37292}
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

                      <div className="flex justify-between items-center w-full mt-1">
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
                      <span className="text-[#9F9F9F] text-xs font-normal">
                        {new Date(post.date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Ad Slot (3rd Column in Row 1) */}
                <div className="flex-1 min-w-[280px]">
                  <AdvertisingBanner
                    adId={37293}
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





        </div>

        {/* RIGHT COLUMN (Sidebar) - Width 400px (Narrower) */}
        <div className="flex flex-col gap-8 w-full xl:w-[400px] shrink-0">

          {/* AHORA Section - Realtime Firebase */}
          <div className="hidden md:block">
            <BreakingNewsRealtime />
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
            adId={37294}
            placeholderText="Anuncio Sidebar 1"
            className="w-full h-[450px] bg-[#FF0000] rounded-[15px] flex flex-col justify-center items-center text-white p-6 text-center"
          />

          {/* 2. Sidebar Gris (Long) */}
          <AdvertisingBanner
            adId={37295}
            placeholderText="Anuncio Sidebar 2"
            className="hidden md:flex w-full h-[600px] bg-[#F0F0F0] rounded-[15px] flex-col justify-center items-center text-[#717171] p-6 text-center"
          />

        </div>


      </div>

      {/* Fútbol Nacional Section (Full Width) */}
      <div className="container mx-auto px-4 max-w-[1630px] mb-16 mt-16">
        <section className="">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-extrabold text-[#E40000] uppercase">FÚTBOL NACIONAL</h2>
                <Link href="/category/futbol-nacional" className="border border-black px-4 py-1 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors">
                  Ver Más
                </Link>
              </div>
              <div className="h-[2px] bg-black w-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {futbolNacionalPosts.slice(0, 6).map((post: Post) => (
              <div key={post.id} className="flex flex-col gap-3">
                <Link href={`/posts/${post.slug}`} className="relative block h-[250px] w-full rounded-[20px] overflow-hidden">
                  {post.featuredImage?.node?.sourceUrl ? (
                    <Image
                      src={post.featuredImage.node.sourceUrl}
                      alt={post.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                  {/* Floating Pill inside image */}
                  <div className="absolute bottom-4 left-4 bg-[#E40000] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-[8px]">
                    FUTBOL NACIONAL
                  </div>
                </Link>

                <Link href={`/posts/${post.slug}`} className="group">
                  <h3 className="text-lg font-bold text-black leading-tight group-hover:text-[#E40000] transition-colors">
                    {post.title}
                  </h3>
                </Link>

                <div className="flex justify-between items-center w-full mt-1">
                  <span className="text-[#9F9F9F] text-xs font-normal">
                    {new Date(post.date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Fútbol Internacional Section (Full Width) */}
      <div className="container mx-auto px-4 max-w-[1630px] mb-16">
        <section className="">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-extrabold text-[#E40000] uppercase">FÚTBOL INTERNACIONAL</h2>
                <Link href="/category/futbol-internacional" className="border border-black px-4 py-1 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors">
                  Ver Más
                </Link>
              </div>
              <div className="h-[2px] bg-black w-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {futbolInternacionalPosts.slice(0, 6).map((post: Post) => (
              <div key={post.id} className="flex flex-col gap-3">
                <Link href={`/posts/${post.slug}`} className="relative block h-[250px] w-full rounded-[20px] overflow-hidden">
                  {post.featuredImage?.node?.sourceUrl ? (
                    <Image
                      src={post.featuredImage.node.sourceUrl}
                      alt={post.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                  {/* Floating Pill inside image */}
                  <div className="absolute bottom-4 left-4 bg-[#E40000] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-[8px]">
                    FUTBOL INTERNACIONAL
                  </div>
                </Link>

                <Link href={`/posts/${post.slug}`} className="group">
                  <h3 className="text-lg font-bold text-black leading-tight group-hover:text-[#E40000] transition-colors">
                    {post.title}
                  </h3>
                </Link>

                <div className="flex justify-between items-center w-full mt-1">
                  <span className="text-[#9F9F9F] text-xs font-normal">
                    {new Date(post.date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
