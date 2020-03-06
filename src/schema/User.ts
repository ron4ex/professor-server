import admin from 'firebase-admin';
import {
  gql,
  ValidationError,
  ApolloError,
  AuthenticationError,
} from 'apollo-server-express';
import { isAuthenticated } from '../middleware';
import { not } from 'graphql-shield';
import axios from 'axios';

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
  password: string;
};

export type TokenPayloadType = {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  uid: string;
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
): Promise<UserType | Error> {
  try {
    const userRecord = await admin.auth().createUser({
      email: input.email,
      displayName: input.firstName,
      password: input.password,
    });

    const docRef = admin
      .firestore()
      .collection('users')
      .doc(userRecord.uid);

    const userData: UserType = {
      id: docRef.id,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
    };

    await docRef.set(userData);

    return userData;
  } catch (error) {
    return new Error(error);
  }
}

async function signInWithPassword(
  _: null,
  { email, password }: { email: string; password: string },
): Promise<TokenPayloadType | AuthenticationError> {
  try {
    const result = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_WEB_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      },
      {
        headers: {
          'content-type': 'application/json',
        },
      },
    );

    const response: TokenPayloadType = {
      email: result?.data.email,
      idToken: result?.data.idToken,
      refreshToken: result?.data.refreshToken,
      expiresIn: result?.data.expiresIn,
      uid: result?.data.localId,
    };

    return response;
  } catch (result) {
    return new AuthenticationError(result.response.data.error.message);
  }
}

async function token(
  _: null,
  { refreshToken }: { refreshToken: string },
): Promise<TokenPayloadType | AuthenticationError> {
  try {
    const result = await axios.post(
      `https://securetoken.googleapis.com/v1/token?key=${process.env.FIREBASE_WEB_API_KEY}`,
      {
        // eslint-disable-next-line @typescript-eslint/camelcase
        grant_type: 'refresh_token',
        // eslint-disable-next-line @typescript-eslint/camelcase
        refresh_token: refreshToken,
      },
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const user = await admin.auth().getUser(result?.data.user_id);

    const response: TokenPayloadType = {
      email: user.email as string,
      uid: user.uid,
      idToken: result?.data.id_token,
      refreshToken: result?.data.refresh_token,
      expiresIn: result?.data.expires_in,
    };

    return response;
  } catch (result) {
    return new AuthenticationError(result.response.data.error.message);
  }
}

export const resolvers = {
  Query: {
    getUsers,
    getUserById,
  },
  Mutation: {
    registerUser,
    signInWithPassword,
    token,
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
    signInWithPassword: not(isAuthenticated),
    token: not(isAuthenticated),
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

  type TokenPayload {
    idToken: String!
    email: String!
    refreshToken: String!
    expiresIn: String!
    uid: String!
  }

  extend type Query {
    getUsers: [User]
    getUserById(id: ID!): User
  }

  input RegisterUserInput {
    firstName: String!
    lastName: String
    email: String!
    password: String!
  }

  extend type Mutation {
    registerUser(input: RegisterUserInput!): User
    signInWithPassword(email: String!, password: String!): TokenPayload
    token(refreshToken: String!): TokenPayload
  }
`;
