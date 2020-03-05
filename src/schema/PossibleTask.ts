import admin from 'firebase-admin';
import { gql } from 'apollo-server-express';
import { isAuthenticated } from '../middleware';

export type PossibleTaskCategoryType =
  | 'TWITTER'
  | 'FORUM'
  | 'PODCAST'
  | 'BLOG'
  | 'VIDEO';

export type PossibleTaskType = {
  id: string;
  category: PossibleTaskCategoryType;
  link: URL;
};

export type CreatePossibleTaskInputType = {
  category: PossibleTaskCategoryType;
  link: URL;
};

async function getPossibleTasks() {
  const querySnapshot = await admin
    .firestore()
    .collection('possibleTasks')
    .get();

  return querySnapshot.docs.map(doc => doc.data()) as PossibleTaskType[];
}

async function createPossibleTask(
  _: null,
  { input }: { input: CreatePossibleTaskInputType },
) {
  const docRef = admin
    .firestore()
    .collection('possibleTasks')
    .doc();

  await docRef.set({ id: docRef.id, ...input });
}

export const resolvers = {
  Query: {
    getPossibleTasks,
  },
  Mutation: {
    createPossibleTask,
  },
};

export const shield = {
  Query: {
    getPossibleTasks: isAuthenticated,
  },
  Mutation: {
    createPossibleTask: isAuthenticated,
  },
};

// TODO: GraphQL category as enum

export const typeDef = gql`
  type PossibleTask {
    id: ID!
    idea: Idea!
    category: String!
    link: String
  }

  extend type Query {
    getPossibleTasks: [PossibleTask]
  }

  input CreatePossibleTaskInput {
    category: String!
    link: String!
  }

  extend type Mutation {
    createPossibleTask(input: CreatePossibleTaskInput!): PossibleTask
  }
`;
