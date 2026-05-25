import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
    console.log('Connected database success');
  } catch (error) {
    console.log('Error when connect database:', error);
    process.exit(1);
  }
};
