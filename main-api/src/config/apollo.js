const typeDefs = require("../graphql/schemas");
const resolvers = require("../graphql/resolvers")
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
});

const initApollo = async (app) => {
    try {
        await apolloServer.start();
        
        app.use('/graphql', 
            expressMiddleware(apolloServer, {
                context: async ({ req, res }) => {
                    return { req, res };
                },
            })
        );
        
        console.log('Apollo middleware initialized');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

module.exports = initApollo;