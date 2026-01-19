import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

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

async function getCategoryData(slug: string) {
    const query = `
    query GetCategoryPosts($slug: String!) {
      posts(first: 20, where: { categoryName: $slug }) {
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
      category(id: $slug, idType: SLUG) {
        name
        description
      }
    }
  `;

    try {
        const res = await fetch("https://www.lared1061.com/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, variables: { slug } }),
            next: { revalidate: 60 },
        });

        const json = await res.json();
        return {
            posts: json.data?.posts?.nodes || [],
            categoryInfo: json.data?.category || null,
        };
    } catch (error) {
        console.error("Error fetching category data:", error);
        return { posts: [], categoryInfo: null };
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    // A quick fetch or just title casing the slug could work, but let's try to be nice
    // For metadata, we might want to fetch the category name properly if possible
    // reusing the same data function:
    const { categoryInfo } = await getCategoryData(slug);

    const title = categoryInfo?.name || slug.charAt(0).toUpperCase() + slug.slice(1);

    return {
        title: `${title} - La Red 106.1`,
        description: `Noticias y artículos sobre ${title}`,
    };
}

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const { posts, categoryInfo } = await getCategoryData(slug);

    const title = categoryInfo?.name || slug.replace("-", " ");

    return (
        <main className="container mx-auto px-4 py-8 pb-32">
            {/* Header */}
            <div className="mb-12 border-b-2 border-red-600 pb-4">
                <h1 className="text-4xl font-extrabold uppercase text-gray-900">
                    {title}
                </h1>
                {categoryInfo?.description && (
                    <p className="text-gray-500 mt-2">{categoryInfo.description}</p>
                )}
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {posts.length > 0 ? (
                    posts.map((post: Post) => (
                        <Link key={post.id} href={`/posts/${post.slug}`} className="group flex flex-col gap-3">
                            <div className="relative h-48 w-full overflow-hidden rounded-lg bg-gray-200">
                                {post.featuredImage?.node?.sourceUrl ? (
                                    <Image
                                        src={post.featuredImage.node.sourceUrl}
                                        alt={post.featuredImage.node.altText || post.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-xs uppercase font-bold">Sin imagen</div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-red-600 text-xs font-bold uppercase mb-1">
                                    {post.categories?.nodes[0]?.name || title}
                                </span>
                                <h2 className="font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                                    {post.title}
                                </h2>
                                <span className="text-gray-400 text-xs mt-2">
                                    {new Date(post.date).toLocaleDateString()}
                                </span>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        <p className="text-xl">No hay noticias en esta categoría aún.</p>
                    </div>
                )}
            </div>

            {/* Pagination Placeholder */}
            {posts.length >= 20 && (
                <div className="mt-12 flex justify-center">
                    <button className="px-6 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors font-bold uppercase text-sm">
                        Cargar más
                    </button>
                </div>
            )}
        </main>
    );
}
