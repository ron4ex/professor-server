import admin from 'firebase-admin';
import { ApolloServer } from 'apollo-server-express';
import dotenv from 'dotenv';
import express from 'express';
import schema from './schema';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const { FIREBASE_CREDENTIALS = '' } = process.env;

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(FIREBASE_CREDENTIALS)),
});

const PORT = process.env.PORT || 4000;
const GRAPHQL_PATH = `/graphql`;
const END_POINT = `http://localhost:${PORT}${GRAPHQL_PATH}`;

const apolloServer = new ApolloServer({
  schema,
  context: ({ req, res }) => ({ req, res }),
  engine: false,
  introspection: true,
  playground: true,
});

const app = express();
apolloServer.applyMiddleware({ app, path: GRAPHQL_PATH });
app.listen({ port: PORT }, () => {
  console.log(`🚀  Server ready at ${END_POINT}`);
});
