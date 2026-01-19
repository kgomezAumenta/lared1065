import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bookmark, Clock, Search, Menu } from "lucide-react";
import TopicRow from "@/components/TopicRow";

interface Post {
  id: string;
  title: string;
  slug: string;
  date: string;
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

async function getData() {
  const query = `
    query GetHomeData {
      latestPosts: posts(first: 10) {
        nodes {
          id
          title
          slug
          date
          categories { nodes { name slug } }
          featuredImage { node { sourceUrl altText } }
        }
      }
      nacionales: posts(first: 8, where: { categoryName: "nacionales" }) {
        nodes { id title slug date categories { nodes { name slug } } featuredImage { node { sourceUrl altText } } } }
      futbolNacional: posts(first: 8, where: { categoryName: "futbol-nacional" }) {
        nodes { id title slug date categories { nodes { name slug } } featuredImage { node { sourceUrl altText } } } }
      futbolInternacional: posts(first: 1, where: { categoryName: "futbol-internacional" }) {
        nodes { id title slug date categories { nodes { name slug } } featuredImage { node { sourceUrl altText } } } }
      deporteNacional: posts(first: 6, where: { categoryName: "deporte-nacional" }) {
        nodes { id title slug date categories { nodes { name slug } } featuredImage { node { sourceUrl altText } } } }
      deporteInternacional: posts(first: 6, where: { categoryName: "deporte-internacional" }) {
        nodes { id title slug date categories { nodes { name slug } } featuredImage { node { sourceUrl altText } } } }
      internacionales: posts(first: 6, where: { categoryName: "internacionales" }) {
        nodes { id title slug date categories { nodes { name slug } } featuredImage { node { sourceUrl altText } } } }
      economia: posts(first: 6, where: { categoryName: "economia" }) {
        nodes { id title slug date categories { nodes { name slug } } featuredImage { node { sourceUrl altText } } } }
      ahoraPosts: posts(first: 10, where: { categoryName: "nacionales" }) {
        nodes { id title slug date categories { nodes { name slug } } }
      }
      dynamicCategory: category(id: "internacionales", idType: SLUG) {
        name
      }
    }
  `;

  try {
    const res = await fetch("https://www.lared1061.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      next: { revalidate: 60 },
    });

    const json = await res.json();
    const data = json.data;

    return {
      latestPosts: data?.latestPosts?.nodes || [],
      nacionalesPosts: data?.nacionales?.nodes || [],
      futbolNacionalPosts: data?.futbolNacional?.nodes || [],
      internacionalesPosts: data?.internacionales?.nodes || [],
      deporteIntPosts: data?.deporteInternacional?.nodes || [],
      deporteNacPosts: data?.deporteNacional?.nodes || [],
      economiaPosts: data?.economia?.nodes || [],
      ahoraPosts: data?.ahoraPosts?.nodes || [],
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
      latestPosts: [],
      nacionalesPosts: [],
      futbolNacionalPosts: [],
      internacionalesPosts: [],
      deporteIntPosts: [],
      deporteNacPosts: [],
      economiaPosts: [],
      ahoraPosts: [],
      dynamicCategoryName: "Noticias",
      categorySnapshots: [],
    };
  }
}

export default async function Home() {
  const {
    latestPosts,
    nacionalesPosts,
    futbolNacionalPosts,
    internacionalesPosts,
    deporteIntPosts,
    deporteNacPosts,
    economiaPosts,
    ahoraPosts,
    dynamicCategoryName,
    categorySnapshots
  } = await getData();

  const featuredPost = latestPosts[0];
  const subFeaturedPosts = latestPosts.slice(1, 5);
  const now = new Date("2026-01-19T15:31:34-06:00");
  const displayAhoraPosts = ahoraPosts.slice(0, 5);

  return (
    <main className="container mx-auto px-4 py-6 pb-32">
      {/* New Hero Section (3 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Column 1: Main Feed (6/12) */}
        <div className="lg:col-span-6 space-y-8">
          {featuredPost && (
            <div className="group">
              <Link href={`/posts/${featuredPost.slug}`}>
                <div className="relative aspect-video w-full overflow-hidden rounded-sm mb-4">
                  {featuredPost.featuredImage?.node?.sourceUrl ? (
                    <Image
                      src={featuredPost.featuredImage.node.sourceUrl}
                      alt={featuredPost.featuredImage.node.altText || featuredPost.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 leading-[1.1] group-hover:text-red-600 transition-colors mb-4 line-clamp-2">
                  {featuredPost.title}
                </h1>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  La Red 106.1 - Lo último en noticias nacionales e internacionales, deportes y más.
                </p>
              </Link>
            </div>
          )}

          <div className="space-y-6 pt-6 border-t border-gray-100">
            {subFeaturedPosts.map((post: Post) => (
              <Link key={post.id} href={`/posts/${post.slug}`} className="group flex gap-4">
                <div className="relative w-32 h-24 shrink-0 overflow-hidden rounded-sm bg-gray-100">
                  {post.featuredImage?.node?.sourceUrl && (
                    <Image
                      src={post.featuredImage.node.sourceUrl}
                      alt={post.featuredImage.node.altText || post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-red-600 text-[10px] font-bold uppercase mb-1">
                    {post.categories?.nodes[0]?.name}
                  </span>
                  <h3 className="font-bold text-lg leading-tight group-hover:text-red-600 transition-colors overflow-hidden">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 2: Categories Snapshots (3/12) */}
        <div className="lg:col-span-3 space-y-8 border-l border-r border-gray-50 px-4">
          <div className="space-y-8">
            {categorySnapshots.map((post: Post) => (
              <div key={post.id} className="pb-6 border-b border-gray-100 last:border-0">
                <span className="text-blue-500 text-[10px] font-bold uppercase mb-2 block tracking-wider">
                  {post.categories?.nodes[0]?.name}
                </span>
                <Link href={`/posts/${post.slug}`} className="group">
                  <h3 className="text-lg font-bold leading-tight group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: "Ahora" Timeline (3/12) */}
        <div className="lg:col-span-3">
          <div className="bg-gray-50 p-4 rounded-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <h2 className="font-black text-xl italic uppercase tracking-tighter">Ahora</h2>
              <span className="ml-auto text-[10px] font-bold text-gray-400">
                {now.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
            </div>

            <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-200">
              {displayAhoraPosts.map((post: Post) => {
                const postTime = new Date(post.date).toLocaleTimeString('es-GT', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                });
                return (
                  <div key={post.id} className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-red-600 z-10" />
                    <span className="text-[10px] font-bold text-red-600 mb-1 block">{postTime}</span>
                    <Link href={`/posts/${post.slug}`} className="group">
                      <h4 className="text-sm font-bold leading-snug group-hover:text-red-700 transition-colors">
                        {post.title}
                      </h4>
                    </Link>
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-[10px] font-bold text-gray-500 flex items-center gap-1 mt-2 hover:text-red-600 uppercase"
                    >
                      Ver más <ArrowRight size={10} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Restore Original Sections */}

      {/* "LO MÁS RECIENTE DE LA RED" Strip */}
      <section className="mb-12">
        <div className="bg-red-600 text-white text-center py-2 font-bold uppercase text-lg mb-6">
          LO MÁS RECIENTE DE LA RED
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestPosts.slice(5, 9).map((post: Post) => (
            <Link key={post.id} href={`/posts/${post.slug}`} className="group flex gap-4">
              <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-md bg-gray-200">
                {post.featuredImage?.node?.sourceUrl && (
                  <Image
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.featuredImage.node.altText || post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase text-gray-500 mb-1">
                  {post.categories?.nodes[0]?.name || "Noticias"}
                </span>
                <h3 className="font-bold text-sm leading-tight group-hover:text-red-600 transition-colors line-clamp-3">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Nacionales Section */}
      <section className="mb-12 bg-gray-50 p-6 rounded-lg -mx-6 md:mx-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <h2 className="text-3xl font-extrabold text-red-600 uppercase">NACIONALES</h2>
            <ArrowRight className="text-red-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <Link href="/category/nacionales" className="hidden md:inline-block border border-black px-4 py-1 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors">
            VER TODAS
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {nacionalesPosts.map((post: Post) => (
            <Link key={post.id} href={`/posts/${post.slug}`} className="group relative block">
              <div className="relative h-64 w-full overflow-hidden rounded-lg mb-3">
                {post.featuredImage?.node?.sourceUrl ? (
                  <Image
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.featuredImage.node.altText || post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200"></div>
                )}
                <div className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full hover:bg-white text-gray-700 transition-colors z-10">
                  <Bookmark size={16} />
                </div>
              </div>
              <span className="text-red-600 text-xs font-bold uppercase block mb-1">
                {post.categories?.nodes[0]?.name || "Nacionales"}
              </span>
              <h3 className="font-bold text-lg leading-tight group-hover:text-red-600 transition-colors line-clamp-2">
                {post.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* La Red De Entrevistas (Iframe) */}
      <section className="mb-12">
        <h2 className="text-3xl font-extrabold text-red-600 uppercase mb-6">LA RED DE ENTREVISTAS</h2>
        <div className="w-full">
          <iframe
            src="https://omny.fm/shows/la-red-de-entrevistas/playlists/podcast/embed?style=cover"
            allow="autoplay; clipboard-write"
            width="100%"
            height="590"
            frameBorder="0"
            title="La Red De Entrevistas"
            className="w-full rounded-lg shadow-md"
          ></iframe>
        </div>
      </section>

      {/* Fútbol Nacional Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <h2 className="text-3xl font-extrabold text-red-600 uppercase">FÚTBOL NACIONAL</h2>
            <ArrowRight className="text-red-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <Link href="/category/futbol-nacional" className="hidden md:inline-block border border-black px-4 py-1 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors">
            VER TODAS
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {futbolNacionalPosts.map((post: Post) => (
            <Link key={post.id} href={`/posts/${post.slug}`} className="group relative block">
              <div className="relative h-64 w-full overflow-hidden rounded-lg mb-3">
                {post.featuredImage?.node?.sourceUrl ? (
                  <Image
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.featuredImage.node.altText || post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200"></div>
                )}
                <div className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full hover:bg-white text-gray-700 transition-colors z-10">
                  <Bookmark size={16} />
                </div>
              </div>
              <span className="text-red-600 text-xs font-bold uppercase block mb-1">
                {post.categories?.nodes[0]?.name || "Deportes"}
              </span>
              <h3 className="font-bold text-lg leading-tight group-hover:text-red-600 transition-colors line-clamp-2">
                {post.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Hablando con los Cracks (Iframe) */}
      <section className="mb-12">
        <h2 className="text-3xl font-extrabold text-red-600 uppercase mb-6">HABLANDO CON LOS CRACKS</h2>
        <div className="w-full">
          <iframe
            src="https://omny.fm/shows/cracks/playlists/podcast/embed?style=cover"
            allow="autoplay; clipboard-write"
            width="100%"
            height="590"
            frameBorder="0"
            title="Hablando con los Cracks"
            className="w-full rounded-lg shadow-md"
          ></iframe>
        </div>
      </section>

      {/* Topic Rows */}
      {internacionalesPosts.length > 0 && (
        <TopicRow
          title={dynamicCategoryName.toUpperCase()}
          posts={internacionalesPosts}
          viewAllLink="/category/internacionales"
        />
      )}

      {deporteIntPosts.length > 0 && (
        <TopicRow
          title="DEPORTE INTERNACIONAL"
          posts={deporteIntPosts}
          viewAllLink="/category/deporte-internacional"
        />
      )}

      {deporteNacPosts.length > 0 && (
        <TopicRow
          title="DEPORTE NACIONAL"
          posts={deporteNacPosts}
          viewAllLink="/category/deporte-nacional"
        />
      )}

      {economiaPosts.length > 0 && (
        <TopicRow
          title="ECONOMÍA"
          posts={economiaPosts}
          viewAllLink="/category/economia"
        />
      )}
    </main>
  );
}
