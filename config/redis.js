const redis = require('redis');
const client = redis.createClient();

const connectRedis = async () => {
  try {
    await client.connect();
    console.log('✅ Redis Connected');
  } catch (err) {
    console.error('Redis connection failed:', err);
  }
};

module.exports = connectRedis;
module.exports.redisClient = client;