import {
  typeDef as User,
  resolvers as userResolvers,
  shield as userShield,
} from './User';
import {
  typeDef as Idea,
  resolvers as ideaResolvers,
  shield as ideaShield,
} from './Idea';
import {
  typeDef as PossibleTask,
  resolvers as possibleTaskResolvers,
  shield as possibleTaskShield,
} from './PossibleTask';
import { makeExecutableSchema, gql } from 'apollo-server-express';
import { merge } from 'lodash';
import { applyMiddleware } from 'graphql-middleware';
import { shield } from 'graphql-shield';

const Root = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

const schema = makeExecutableSchema({
  typeDefs: [Root, User, Idea, PossibleTask],
  resolvers: merge({}, userResolvers, ideaResolvers, possibleTaskResolvers),
});

const middlewareShield = shield(
  merge({}, userShield, ideaShield, possibleTaskShield),
);

export default applyMiddleware(schema, middlewareShield);
