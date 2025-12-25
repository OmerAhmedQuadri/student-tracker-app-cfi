import mongoose from 'mongoose';
import env from './env';

const MONGO_URI = env.data?.MONGO_URI as string;

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI)
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}