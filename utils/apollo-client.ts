import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
    link: new HttpLink({
        uri: "https://www.lared1061.com/graphql",
    }),
    cache: new InMemoryCache(),
});

export default client;
