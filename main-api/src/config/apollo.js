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
            async (req, res, next) => {
                try {
                    await expressMiddleware(apolloServer, {
                        context: async ({ req, res }) => {
                            return { req, res };
                        },
                    })(req, res, next);
                } catch (error) {
                    console.error('Apollo middleware error:', error);
                    next(error);
                }
            }
        );
        
        console.log('Apollo middleware initialized!');
    } catch (error) {
        console.error('Apollo initialization error:', error);
        process.exit(1);
    }
};

module.exports = initApollo;