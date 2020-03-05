import admin from 'firebase-admin';
import { gql } from 'apollo-server-express';
import { PossibleTaskType } from './PossibleTask';
import { isAuthenticated } from '../middleware';

export type IdeaType = {
  id: string;
  name: string;
  description: string;
  tasks: PossibleTaskType[];
};

export type CreateIdeaInputType = {
  name: string;
  description: string;
};

async function createIdea(_: null, { input }: { input: CreateIdeaInputType }) {
  const docRef = admin
    .firestore()
    .collection('ideas')
    .doc();

  await docRef.set({ id: docRef.id, ...input });
}

async function getIdeas() {
  const querySnapshot = await admin
    .firestore()
    .collection('ideas')
    .get();

  return querySnapshot.docs.map(doc => doc.data()) as IdeaType[];
}

export const resolvers = {
  Query: {
    getIdeas,
  },
  Mutation: {
    createIdea,
  },
};

export const shield = {
  Query: {
    getIdeas: isAuthenticated,
  },
  Mutation: {
    createIdea: isAuthenticated,
  },
};

export const typeDef = gql`
  type Idea {
    id: ID!
    name: String!
    description: String
    tasks: [PossibleTask]
  }

  extend type Query {
    getIdeas: [Idea]
  }

  input CreateIdeaInput {
    name: String!
    description: String
  }

  extend type Mutation {
    createIdea(input: CreateIdeaInput!): Idea
  }
`;
