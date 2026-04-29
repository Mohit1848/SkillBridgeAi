import { MongoClient, ObjectId } from "mongodb";
import type { AnalysisResponse, SavedAnalysisRecord, UserProfile } from "@skillbridge/shared";
import { env, flags } from "../config/env.js";

let clientPromise: Promise<MongoClient> | null = null;

const getClient = async (): Promise<MongoClient | null> => {
  if (!flags.mongoEnabled) {
    return null;
  }

  if (!clientPromise) {
    clientPromise = MongoClient.connect(env.mongoUri);
  }

  return clientPromise;
};

const getDb = async () => {
  const client = await getClient();
  return client?.db(env.mongoDbName) ?? null;
};

type AnalysisDocument = {
  _id: ObjectId;
  userId: string;
  createdAt: Date;
  targetJobId: string;
  source: "manual" | "pdf";
  resumeFileName: string | null;
  analysis: AnalysisResponse;
};

export const saveUserProfile = async (userId: string, profile: UserProfile): Promise<void> => {
  const db = await getDb();
  if (!db) {
    return;
  }

  await db.collection("profiles").updateOne(
    { userId },
    {
      $set: {
        userId,
        profile,
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );
};

export const saveAnalysisRecord = async (input: {
  userId: string;
  targetJobId: string;
  source: "manual" | "pdf";
  resumeFileName: string | null;
  analysis: AnalysisResponse;
}): Promise<string | null> => {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const result = await db.collection<AnalysisDocument>("analyses").insertOne({
    userId: input.userId,
    createdAt: new Date(),
    targetJobId: input.targetJobId,
    source: input.source,
    resumeFileName: input.resumeFileName,
    analysis: input.analysis
  } as AnalysisDocument);

  return result.insertedId.toString();
};

export const listSavedAnalyses = async (userId: string): Promise<SavedAnalysisRecord[]> => {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const records = await db
    .collection<AnalysisDocument>("analyses")
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();

  return records.map((record) => ({
    id: record._id.toString(),
    userId: record.userId,
    createdAt: record.createdAt.toISOString(),
    targetJobId: record.targetJobId,
    source: record.source,
    resumeFileName: record.resumeFileName,
    analysis: record.analysis
  }));
};
