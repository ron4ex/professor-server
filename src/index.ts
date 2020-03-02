import * as admin from 'firebase-admin';
import { ApolloServer, ApolloError, ValidationError, gql } from 'apollo-server';
import * as dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String
    email: String!
  }

  type Query {
    getUsers: [User]
    getUserById(id: ID!): User
  }
`;

const resolvers = {
  Query: {
    async getUsers() {
      const users = await admin
        .firestore()
        .collection('users')
        .get();
      return users.docs.map(user => user.data()) as User[];
    },
    async getUserById(_: null, args: { id: string }) {
      try {
        const userDoc = await admin
          .firestore()
          .doc(`users/${args.id}`)
          .get();
        const user = userDoc.data() as User | undefined;
        return user || new ValidationError('User ID not found');
      } catch (error) {
        throw new ApolloError(error);
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    apiKey: process.env.ENGINE_API_KEY,
  },
  introspection: true,
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
