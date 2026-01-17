import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bookmark } from "lucide-react";
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
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
}

async function getData() {
  const query = `
    query GetHomeData {
      posts(first: 20) {
        nodes {
          id
          title
          slug
          date
          categories {
            nodes {
              name
              slug
            }
          }
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
      categoryPosts: posts(first: 8, where: { categoryName: "internacionales" }) {
        nodes {
          id
          title
          slug
          date
          categories {
             nodes {
                name
                slug
             }
          }
           featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
      nacionalesPosts: posts(first: 8, where: { categoryName: "nacionales" }) {
        nodes {
          id
          title
          slug
          date
          categories {
             nodes {
                name
                slug
             }
          }
           featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
      sportsPosts: posts(first: 8, where: { categoryName: "futbol-nacional" }) {
        nodes {
          id
          title
          slug
          date
          categories {
             nodes {
                name
                slug
             }
          }
           featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
      internacionalesRow: posts(first: 6, where: { categoryName: "internacionales" }) {
        nodes {
          id
          title
          slug
          date
          categories {
             nodes {
                name
                slug
             }
          }
           featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
      deporteIntRow: posts(first: 6, where: { categoryName: "deporte-internacional" }) {
        nodes {
          id
          title
          slug
          date
          categories {
             nodes {
                name
                slug
             }
          }
           featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
      deporteNacRow: posts(first: 6, where: { categoryName: "deporte-nacional" }) {
        nodes {
          id
          title
          slug
          date
          categories {
             nodes {
                name
                slug
             }
          }
           featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
      economiaRow: posts(first: 6, where: { categoryName: "economia" }) {
        nodes {
          id
          title
          slug
          date
          categories {
             nodes {
                name
                slug
             }
          }
           featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://www.lared1061.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 60 },
    });

    const json = await res.json();
    return {
      posts: json.data?.posts?.nodes || [],
      categoryPosts: json.data?.categoryPosts?.nodes || [],
      nacionalesPosts: json.data?.nacionalesPosts?.nodes || [],
      sportsPosts: json.data?.sportsPosts?.nodes || [],
      internacionalesRow: json.data?.internacionalesRow?.nodes || [],
      deporteIntRow: json.data?.deporteIntRow?.nodes || [],
      deporteNacRow: json.data?.deporteNacRow?.nodes || [],
      economiaRow: json.data?.economiaRow?.nodes || []
    };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return {
      posts: [],
      categoryPosts: [],
      nacionalesPosts: [],
      sportsPosts: [],
      internacionalesRow: [],
      deporteIntRow: [],
      deporteNacRow: [],
      economiaRow: []
    };
  }
}

export default async function Home() {
  const {
    posts,
    categoryPosts,
    nacionalesPosts,
    sportsPosts,
    internacionalesRow,
    deporteIntRow,
    deporteNacRow,
    economiaRow
  } = await getData();

  // Helper to filter/group posts (simple version for now)
  const featuredPost = posts[0];
  const sidePosts = posts.slice(1, 3);
  const recentStripPosts = posts.slice(3, 7);

  // Other categories for bottom sections
  const otherPosts = posts.slice(7, 11);

  const dynamicCategoryTitle = "CRISIS VENEZUELA"; // In a real app, fetch this from Page ACF

  return (
    <main className="container mx-auto px-4 py-8 pb-32">
      {/* Top Section: Featured + Side Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Main Featured Post */}
        {featuredPost && (
          <div className="lg:col-span-2 relative group cursor-pointer">
            <Link href={`/posts/${featuredPost.slug}`}>
              <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
                {featuredPost.featuredImage?.node?.sourceUrl ? (
                  <Image
                    src={featuredPost.featuredImage.node.sourceUrl}
                    alt={featuredPost.featuredImage.node.altText || featuredPost.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">No Image</div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-sm w-fit mb-2">
                    {featuredPost.categories?.nodes[0]?.name || "Noticias"}
                  </span>
                  <h2 className="text-white text-3xl font-bold leading-tight shadow-sm">
                    {featuredPost.title}
                  </h2>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Side Posts (Right Column) */}
        <div className="flex flex-col gap-6">
          {sidePosts.map((post: Post) => (
            <Link key={post.id} href={`/posts/${post.slug}`} className="group">
              <div className="flex flex-col gap-2">
                <div className="relative h-40 w-full overflow-hidden rounded-lg">
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
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-red-700 leading-tight">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* "LO MÁS RECIENTE DE LA RED" Strip */}
      <section className="mb-12">
        <div className="bg-red-600 text-white text-center py-2 font-bold uppercase text-lg mb-6">
          LO MÁS RECIENTE DE LA RED
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentStripPosts.map((post: Post) => (
            <Link key={post.id} href={`/posts/${post.slug}`} className="group flex gap-4">
              {/* Image Left */}
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
              {/* Text Right */}
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

      {/* Banner Ad Area (Full Width) */}
      <div className="w-full h-32 bg-gray-100 flex items-center justify-center mb-12 rounded-lg border border-gray-200 overflow-hidden relative">
        <span className="text-gray-400 font-bold z-10">ESPACIO PUBLICITARIO (BANNER ANCHO)</span>
        <div className="absolute inset-0 bg-linear-to-r from-gray-50 to-gray-200 opacity-50"></div>
      </div>

      {/* Dynamic Category Section (e.g., Crisis Venezuela) */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6 group cursor-pointer">
          <h2 className="text-3xl font-extrabold text-red-600 uppercase">
            {dynamicCategoryTitle}
          </h2>
          <ArrowRight className="text-red-600 group-hover:translate-x-1 transition-transform" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryPosts.length > 0 ? (
            categoryPosts.map((post: Post) => (
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
                  {post.categories?.nodes[0]?.name || "Internacionales"}
                </span>
                <h3 className="font-bold text-lg leading-tight group-hover:text-red-600 transition-colors">
                  {post.title}
                </h3>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              No hay noticias disponibles en esta categoría.
            </div>
          )}
        </div>
      </section>

      {/* Nacionales Section */}
      <section className="mb-12 bg-gray-50 p-6 rounded-lg -mx-6 md:mx-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <h2 className="text-3xl font-extrabold text-red-600 uppercase">
              NACIONALES
            </h2>
            <ArrowRight className="text-red-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <Link href="/category/nacionales" className="hidden md:inline-block border border-black px-4 py-1 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors">
            VER TODAS
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {nacionalesPosts.length > 0 ? (
            nacionalesPosts.map((post: Post) => (
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
                <h3 className="font-bold text-lg leading-tight group-hover:text-red-600 transition-colors">
                  {post.title}
                </h3>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              No hay noticias disponibles en esta categoría.
            </div>
          )}
        </div>
        <div className="mt-6 text-center md:hidden">
          <Link href="/category/nacionales" className="inline-block border border-black px-6 py-2 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors">
            VER TODAS
          </Link>
        </div>
      </section>

      {/* La Red De Entrevistas (Iframe) */}
      <section className="mb-12">
        <h2 className="text-3xl font-extrabold text-red-600 uppercase mb-6">
          LA RED DE ENTREVISTAS
        </h2>
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
            <h2 className="text-3xl font-extrabold text-red-600 uppercase">
              FÚTBOL NACIONAL
            </h2>
            <ArrowRight className="text-red-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <Link href="/category/futbol-nacional" className="hidden md:inline-block border border-black px-4 py-1 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors">
            VER TODAS
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sportsPosts.length > 0 ? (
            sportsPosts.map((post: Post) => (
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
                <h3 className="font-bold text-lg leading-tight group-hover:text-red-600 transition-colors">
                  {post.title}
                </h3>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              No hay noticias disponibles en esta categoría.
            </div>
          )}
        </div>
        <div className="mt-6 text-center md:hidden">
          <Link href="/category/futbol-nacional" className="inline-block border border-black px-6 py-2 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors">
            VER TODAS
          </Link>
        </div>
      </section>

      {/* Banner Ad Area (Full Width) */}
      <div className="w-full h-32 bg-gray-100 flex items-center justify-center mb-12 rounded-lg border border-gray-200 overflow-hidden relative">
        <span className="text-gray-400 font-bold z-10">ESPACIO PUBLICITARIO (BANNER ANCHO)</span>
        <div className="absolute inset-0 bg-linear-to-r from-gray-50 to-gray-200 opacity-50"></div>
      </div>

      {/* Hablando con los Cracks (Iframe) */}
      <section className="mb-12">
        <h2 className="text-3xl font-extrabold text-red-600 uppercase mb-6">
          HABLANDO CON LOS CRACKS
        </h2>
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

      {/* Internacionales Section */}
      {internacionalesRow.length > 0 && (
        <TopicRow
          title="INTERNACIONALES"
          posts={internacionalesRow}
          viewAllLink="/category/internacionales"
        />
      )}

      {/* Deporte Internacional Section */}
      {deporteIntRow.length > 0 && (
        <TopicRow
          title="DEPORTE INTERNACIONAL"
          posts={deporteIntRow}
          viewAllLink="/category/deporte-internacional"
        />
      )}

      {/* Deporte Nacional Section */}
      {deporteNacRow.length > 0 && (
        <TopicRow
          title="DEPORTE NACIONAL"
          posts={deporteNacRow}
          viewAllLink="/category/deporte-nacional"
        />
      )}

      {/* Economia Section */}
      {economiaRow.length > 0 && (
        <TopicRow
          title="ECONOMÍA"
          posts={economiaRow}
          viewAllLink="/category/economia"
        />
      )}

      {/* Final Banner Ad Area */}
      <div className="w-full h-32 bg-gray-900 flex items-center justify-center mb-12 rounded-lg overflow-hidden relative">
        <span className="text-white/50 font-bold z-10">ESPACIO PUBLICITARIO (BANNER FINAL)</span>
      </div>

      {/* Grid: Otras Noticias */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6 border-b-2 border-red-100">
          <h2 className="text-2xl font-bold text-red-600 border-b-2 border-red-600 pb-1 -mb-[2px] uppercase">
            Otras Noticias
          </h2>
          <Link href="/category/noticias" className="text-xs font-bold text-gray-500 hover:text-red-600 uppercase">Ver Todo</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {otherPosts.map((post: Post) => (
            <Link key={post.id} href={`/posts/${post.slug}`} className="group">
              <div className="flex flex-col gap-2">
                <div className="relative h-40 w-full overflow-hidden rounded-lg">
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
                </div>
                <span className="text-red-600 text-xs font-bold uppercase">
                  {post.categories?.nodes[0]?.name}
                </span>
                <h3 className="font-bold text-sm text-gray-900 group-hover:text-red-700 leading-tight line-clamp-3">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
