import pkg from 'pg';
import { createClient } from 'redis';
const { Pool } = pkg;

// PostgreSQL connection pool
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis client
let redisClient = null;

export const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    redisClient.on('connect', () => console.log('✅ Redis connected'));

    await redisClient.connect();
  }
  return redisClient;
};

// Test database connection
db.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

db.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

export default db;

