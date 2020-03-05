import admin from 'firebase-admin';
import { ApolloServer } from 'apollo-server-express';
import dotenv from 'dotenv';
import express from 'express';
import schema from './schema';
import { applyMiddleware } from 'graphql-middleware';
import { middlewareShield } from './middleware';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const { FIREBASE_CREDENTIALS = '' } = process.env;

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(FIREBASE_CREDENTIALS)),
});

const apolloServer = new ApolloServer({
  schema: applyMiddleware(schema, middlewareShield),
  engine: {
    apiKey: process.env.ENGINE_API_KEY,
  },
  context: ({ req, res }) => ({ req, res }),
  introspection: true,
  playground: true,
});

const PORT = process.env.PORT || 4000;
const app = express();
apolloServer.applyMiddleware({ app });
app.listen({ port: PORT }, () => {
  console.log(
    `🚀  Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`,
  );
});
