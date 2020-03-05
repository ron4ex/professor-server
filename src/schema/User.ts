import admin from 'firebase-admin';
import { gql, ValidationError, ApolloError } from 'apollo-server-express';
import { isAuthenticated } from '../middleware';

export type UserType = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type RegisterUserInputType = {
  firstName: string;
  lastName: string;
  email: string;
};

async function getUserById(_: null, args: { id: string }) {
  try {
    const docSnapshot = await admin
      .firestore()
      .doc(`users/${args.id}`)
      .get();

    const user = docSnapshot.data() as UserType | undefined;

    return user || new ValidationError('User ID not found');
  } catch (error) {
    throw new ApolloError(error);
  }
}

async function getUsers() {
  const querySnapshot = await admin
    .firestore()
    .collection('users')
    .get();

  return querySnapshot.docs.map(user => user.data()) as UserType[];
}

// TODO: Collection strings as constants

async function registerUser(
  _: null,
  { input }: { input: RegisterUserInputType },
) {
  const docRef = admin
    .firestore()
    .collection('users')
    .doc();

  try {
    const userData = { id: docRef.id, ...input };
    await docRef.set(userData);
    return userData as UserType;
  } catch (error) {
    throw new ApolloError(error);
  }
}

export const resolvers = {
  Query: {
    getUsers,
    getUserById,
  },
  Mutation: {
    registerUser,
  },
};

export const shield = {
  Query: {
    getUsers: isAuthenticated,
    getUserById: isAuthenticated,
  },
};

export const typeDef = gql`
  type User {
    id: ID!
    firstName: String
    lastName: String
    email: String!
  }

  input RegisterUserInput {
    firstName: String
    lastName: String
    email: String!
  }

  extend type Query {
    getUsers: [User]
    getUserById(id: ID!): User
  }

  extend type Mutation {
    registerUser(input: RegisterUserInput!): User
  }
`;
