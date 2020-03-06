import admin from 'firebase-admin';
import { gql } from 'apollo-server-express';
import { PossibleTaskType } from './PossibleTask';
import { isAuthenticated } from '../middleware';

// Types
export type IdeaType = {
  id: string;
  name: string;
  description: string;
  possibleTasks: PossibleTaskType[];
};

export type CreateIdeaInputType = {
  name: string;
  description: string;
};

// Resolvers
async function createIdea(
  _: null,
  { input }: { input: CreateIdeaInputType },
): Promise<IdeaType> {
  const docRef = admin
    .firestore()
    .collection('ideas')
    .doc();

  const ideaData: IdeaType = {
    id: docRef.id,
    possibleTasks: [],
    description: input.description,
    name: input.name,
  };

  await docRef.set(ideaData);

  return ideaData;
}

async function getIdeas(): Promise<IdeaType[]> {
  const querySnapshot = await admin
    .firestore()
    .collection('ideas')
    .get();

  return querySnapshot.docs.map(doc => doc.data()) as IdeaType[];
}

async function getIdeaPossibleTasks(
  idea: IdeaType,
): Promise<PossibleTaskType[]> {
  const querySnapshot = await admin
    .firestore()
    .collection('possibleTasks')
    .where('ideaId', '==', idea.id)
    .get();

  return querySnapshot.docs.map(doc => doc.data()) as PossibleTaskType[];
}

export const resolvers = {
  Query: {
    getIdeas,
  },
  Mutation: {
    createIdea,
  },
  Idea: {
    possibleTasks: getIdeaPossibleTasks,
  },
};

// Shield
export const shield = {
  Query: {
    getIdeas: isAuthenticated,
  },
  Mutation: {
    createIdea: isAuthenticated,
  },
  Idea: {
    possibleTasks: isAuthenticated,
  },
};

// TypeDef
export const typeDef = gql`
  type Idea {
    id: ID!
    name: String!
    description: String
    possibleTasks: [PossibleTask]
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
