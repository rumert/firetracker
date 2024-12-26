const { typeDefs } = require("../utils/graphql-schema");
const resolvers = require("../utils/graphql-resolvers")
const { ApolloServer } = require("@apollo/server")

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers
})

const connectApollo = async () => {
    try {
        await apolloServer.start();
    } catch (error) {
        console.log(error);
        //process.exit(1)
    }
}

module.exports = {
    apolloServer,
    connectApollo
}