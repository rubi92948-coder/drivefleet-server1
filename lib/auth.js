import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// Ensure the URI is present
if (!process.env.MONGO_URI) {
  throw new Error("Missing MONGO_URI in environment variables");
}

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db("drivefleet");

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),

  emailAndPassword: { 
    enabled: true 
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },

  // Base URL should ideally come from env variable for production
  baseURL: process.env.AUTH_BASE_URL || "http://localhost:3000",
  basePath: "/api/auth",
});