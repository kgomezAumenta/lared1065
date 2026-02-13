"use server";

import client from "@/utils/apollo-client";
import { gql } from "@apollo/client";

const GET_POST_QUERY = gql`
  query GetPostData($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      title
      content
      slug
      date
      excerpt
      categories {
        nodes {
          name
          slug
        }
      }
      tags {
        nodes {
          slug
          name
        }
      }
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      author {
        node {
          name
        }
      }
    }
  }
`;

const GET_RELATED_POSTS_QUERY = gql`
  query GetRelatedPosts($tagSlugs: [String], $notIn: [ID]) {
    posts(first: 6, where: { tagSlugIn: $tagSlugs, notIn: $notIn }) {
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

export async function getPostContent(slug: string) {
  try {
    const { data } = await client.query({
      query: GET_POST_QUERY,
      variables: { slug },
      fetchPolicy: "no-cache", // Ensure fresh data or rely on Next.js cache
    }) as any;

    const post = data?.post;
    if (!post) return null;

    // Fetch related posts for this new post to continue the chain
    let relatedPosts = [];
    if (post.tags?.nodes?.length > 0) {
      const firstTagSlug = post.tags.nodes[0].slug;
      // Exclude current post ID from related
      const { data: relatedData } = await client.query({
        query: GET_RELATED_POSTS_QUERY,
        variables: {
          tagSlugs: [firstTagSlug],
          notIn: [post.id]
        },
        fetchPolicy: "no-cache"
      }) as any;
      relatedPosts = relatedData?.posts?.nodes || [];
    }

    // Fallback to Category
    if (relatedPosts.length === 0 && post.categories?.nodes?.length > 0) {
      const categorySlug = post.categories.nodes[0].slug;
      const GET_CATEGORY_POSTS_QUERY = gql`
              query GetCategoryPosts($categorySlug: String, $notIn: [ID]) {
                posts(first: 6, where: { categoryName: $categorySlug, notIn: $notIn }) {
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

      const { data: catData } = await client.query({
        query: GET_CATEGORY_POSTS_QUERY,
        variables: { categorySlug, notIn: [post.id] },
        fetchPolicy: "no-cache"
      }) as any;
      relatedPosts = catData?.posts?.nodes || [];
    }

    // Filter related posts (same logic as page.tsx)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const filteredRelated = relatedPosts
      .filter((p: any) => new Date(p.date) > twoWeeksAgo)
      .slice(0, 5);

    return {
      post,
      relatedPosts: filteredRelated
    };
  } catch (error) {
    console.error("Error fetching post content:", error);
    return null;
  }
}

export async function getMoreCategoryPosts(categorySlug: string, notIn: string[]) {
  try {
    const GET_CATEGORY_POSTS_QUERY = gql`
          query GetCategoryPosts($categorySlug: String, $notIn: [ID]) {
            posts(first: 6, where: { categoryName: $categorySlug, notIn: $notIn }) {
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

    const { data } = await client.query({
      query: GET_CATEGORY_POSTS_QUERY,
      variables: { categorySlug, notIn },
      fetchPolicy: "no-cache"
    }) as any;

    return data?.posts?.nodes || [];
  } catch (error) {
    console.error("Error fetching more category posts:", error);
    return [];
  }
}
