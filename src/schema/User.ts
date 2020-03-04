import {
  gql,
  ValidationError,
  ApolloError,
  makeExecutableSchema,
} from 'apollo-server-express';
import * as admin from 'firebase-admin';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
};

async function createUser(_: null, userInput: CreateUserInput) {
  const userRef = admin
    .firestore()
    .collection('users')
    .doc();

  userRef.set({ id: userRef.id, ...userInput });
}

async function getUserById(_: null, args: { id: string }) {
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
}

async function getUsers() {
  const users = await admin
    .firestore()
    .collection('users')
    .get();
  return users.docs.map(user => user.data()) as User[];
}

export default makeExecutableSchema({
  typeDefs: gql`
    type User {
      id: ID!
      firstName: String
      lastName: String
      email: String!
    }

    input CreateUserInput {
      firstName: String
      lastName: String
      email: String!
    }

    type Query {
      getUsers: [User]
      getUserById(id: ID!): User
    }

    type Mutation {
      createUser(input: CreateUserInput!): User
    }
  `,
  resolvers: {
    Query: {
      getUsers,
      getUserById,
    },
    Mutation: {
      createUser,
    },
  },
});
