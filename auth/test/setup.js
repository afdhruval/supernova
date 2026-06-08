import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

export const connectToMockDB = async () => {
  try {
    // Download and start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: "test-auth-db",
      },
      binary: {
        version: "7.0.14",
      }
    });
    
    const mongoUri = mongoServer.getUri();
    console.log("MongoDB Memory Server URI:", mongoUri);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("Connected to in-memory MongoDB");
  } catch (error) {
    console.error("Error connecting to in-memory MongoDB:", error);
    throw error;
  }
};

export const disconnectFromMockDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log("Disconnected from in-memory MongoDB");
  } catch (error) {
    console.error("Error disconnecting from in-memory MongoDB:", error);
  }
};

export const clearDatabase = async () => {
  try {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
};

export default {
  connectToMockDB,
  disconnectFromMockDB,
  clearDatabase,
};
