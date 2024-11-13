import mongoose from 'mongoose';

let dbConnection;
let isConnected = 0;

const connect = async () => {
  if (isConnected >= 3) {
    console.log('Database is already connected');
    return;
  }

  try {
    const url = process.env.mongo_url;
    if (!url) {
      throw new Error('Missing MongoDB URI');
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    dbConnection = await mongoose.connect(url, options);

    isConnected++;
    console.log(`Connected to MongoDB as ${dbConnection.connections[0].name}`);

    return dbConnection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    isConnected = 0;
    throw error;
  }
};

const disconnect = async () => {
  if (dbConnection && mongoose.connection.readyState > 0) {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

const getHealthStatus = () => {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
};

export { connect, disconnect, dbConnection, getHealthStatus };
