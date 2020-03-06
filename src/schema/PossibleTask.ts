import admin from 'firebase-admin';
import { gql } from 'apollo-server-express';
import { isAuthenticated } from '../middleware';
import { IdeaType } from './Idea';

// Types
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
  ideaId: string;
};

export type CreatePossibleTaskInputType = {
  category: PossibleTaskCategoryType;
  link: URL;
  ideaId: string;
};

// Resolvers
async function getPossibleTasks(): Promise<PossibleTaskType[]> {
  const querySnapshot = await admin
    .firestore()
    .collection('possibleTasks')
    .get();

  return querySnapshot.docs.map(doc => doc.data()) as PossibleTaskType[];
}

async function createPossibleTask(
  _: null,
  { input }: { input: CreatePossibleTaskInputType },
): Promise<PossibleTaskType> {
  const docRef = admin
    .firestore()
    .collection('possibleTasks')
    .doc();

  const possibleTaskData: PossibleTaskType = {
    id: docRef.id,
    category: input.category,
    link: input.link,
    ideaId: input.ideaId,
  };

  await docRef.set(possibleTaskData);

  return possibleTaskData;
}

async function getPossibleTaskIdea(
  possibleTask: PossibleTaskType,
): Promise<IdeaType> {
  const docSnapshot = await admin
    .firestore()
    .doc(`ideas/${possibleTask.ideaId}`)
    .get();

  return docSnapshot.data() as IdeaType;
}

export const resolvers = {
  Query: {
    getPossibleTasks,
  },
  Mutation: {
    createPossibleTask,
  },
  PossibleTask: {
    idea: getPossibleTaskIdea,
  },
};

// Shield
export const shield = {
  Query: {
    getPossibleTasks: isAuthenticated,
  },
  Mutation: {
    createPossibleTask: isAuthenticated,
  },
  PossibleTask: {
    idea: isAuthenticated,
  },
};

// TypeDef
export const typeDef = gql`
  enum PossibleTaskCategory {
    TWITTER
    FORUM
    PODCAST
    BLOG
    VIDEO
  }

  type PossibleTask {
    id: ID!
    category: PossibleTaskCategory!
    link: String
    ideaId: ID!
    idea: Idea!
  }

  extend type Query {
    getPossibleTasks: [PossibleTask]
  }

  input CreatePossibleTaskInput {
    category: PossibleTaskCategory!
    link: String
    ideaId: ID!
  }

  extend type Mutation {
    createPossibleTask(input: CreatePossibleTaskInput!): PossibleTask
  }
`;
