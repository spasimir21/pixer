import mongoose from 'mongoose';

mongoose
  .connect(process.env['MONGODB_CONNECTION_STRING'] as string)
  .then(() => console.log('Database connected successfully!'))
  .catch(console.log);
