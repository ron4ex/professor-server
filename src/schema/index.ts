import userSchema from './User';
import { mergeSchemas } from 'apollo-server-express';

export default mergeSchemas({
  schemas: [userSchema],
});
