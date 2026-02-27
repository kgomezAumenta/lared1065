import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const wpUrl = process.env.NEXT_PUBLIC_WP_URL || "https://cms.lared1061.com";

const client = new ApolloClient({
    link: new HttpLink({
        uri: `${wpUrl}/graphql`,
    }),
    cache: new InMemoryCache(),
});

export default client;
