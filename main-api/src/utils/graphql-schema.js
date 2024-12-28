// export const typeDefs = `#graphql
//   type Game {
//     id: ID!
//     title: String!
//     platform: [String!]!
//     reviews: [Review!]
//   }
//   type Review {
//     id: ID!
//     rating: Int!
//     content: String!
//     author: Author!
//     game: Game!
//   }
//   type Author {
//     id: ID!
//     name: String!
//     verified: Boolean!
//     reviews: [Review!]
//   }
//   type Query {
//     games: [Game]
//     game(id: ID!): Game
//     reviews: [Review]
//     review(id: ID!): Review
//     authors: [Author]
//     author(id: ID!): Author
//   }
//   type Mutation {
//     addGame(game: AddGameInput!): Game
//     deleteGame(id: ID!): [Game]
//     updateGame(id: ID!, edits: EditGameInput): Game
//   }
//   input AddGameInput {
//     title: String!,
//     platform: [String!]!
//   }
//   input EditGameInput {
//     title: String,
//     platform: [String!]
//   }
// `

const typeDefs = `#graphql
  type Test {
    name: String!
  }
  type Query {
    tests: [Test]
    test(id: ID!): Test
  }
  type Mutation {
    addTest(test: AddTestInput!): Test
    deleteTest(id: ID!): [Test]
    updateTest(id: ID!, edits: EditTestInput): Test
  }
  input AddTestInput {
    name: String!
  }
  input EditTestInput {
    name: String,
  }
`

module.exports = typeDefs;