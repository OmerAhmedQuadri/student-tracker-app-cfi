import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/student-tracker',
  jwtSecret: process.env.JWT_SECRET || 'supersecretkey',
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'supersecretkey',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'supersecretkey',
  nodeEnv: process.env.NODE_ENV || 'development',
  githubToken: process.env.GITHUB_TOKEN,
};
