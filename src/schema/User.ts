import admin from 'firebase-admin';
import { gql, ValidationError, ApolloError } from 'apollo-server-express';
import { isAuthenticated } from '../middleware';
import { not } from 'graphql-shield';

// Types
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

// Resolvers
async function getUserById(
  _: null,
  args: { id: string },
): Promise<UserType | ValidationError> {
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

async function getUsers(): Promise<UserType[]> {
  const querySnapshot = await admin
    .firestore()
    .collection('users')
    .get();

  return querySnapshot.docs.map(user => user.data()) as UserType[];
}

async function registerUser(
  _: null,
  { input }: { input: RegisterUserInputType },
): Promise<UserType> {
  const docRef = admin
    .firestore()
    .collection('users')
    .doc();

  const userData: UserType = {
    id: docRef.id,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
  };

  await docRef.set(userData);

  return userData;
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

// Shield
export const shield = {
  Query: {
    getUsers: isAuthenticated,
    getUserById: isAuthenticated,
  },
  Mutation: {
    registerUser: not(isAuthenticated),
  },
};

// TypeDef
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
