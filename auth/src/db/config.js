import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

export default {
  MONGO_URI: MONGO_URI,
};
