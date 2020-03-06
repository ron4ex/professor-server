import { rule } from 'graphql-shield';
import admin from 'firebase-admin';
import { AuthenticationError } from 'apollo-server-express';

export const isAuthenticated = rule()(async (_, __, context) => {
  try {
    const tokenWithBearer = context.req.headers.authorization || '';
    const token = tokenWithBearer.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    return Boolean(decodedToken.uid);
  } catch (error) {
    return new AuthenticationError(error);
  }
});
