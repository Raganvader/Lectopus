// services/auth.ts
import { Account, Client, ID } from "react-native-appwrite";
import "react-native-url-polyfill/auto";

const ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
const account = new Account(client);

export async function signUpEmail({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name?: string;
}) {
  const user = await account.create(ID.unique(), email, password, name);
  await account.createEmailPasswordSession(email, password);
  return user;
}

export async function signInEmail({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return account.createEmailPasswordSession(email, password);
}

export async function signOut() {
  try {
    await account.deleteSessions();
  } catch {}
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}
