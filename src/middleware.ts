import { rule } from 'graphql-shield';
import admin from 'firebase-admin';
import { AuthenticationError } from 'apollo-server-express';

export const isAuthenticated = rule()(async (_, __, context) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(context.req.idToken);
    return Boolean(decodedToken.uid);
  } catch (error) {
    throw new AuthenticationError('Failed to authorize');
  }
});
