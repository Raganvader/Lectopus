// services/saved.ts
import type { Book } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "saved_books_v1";

export async function loadSavedBooks(): Promise<Book[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as Book[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function saveBook(book: Book): Promise<void> {
  const current = await loadSavedBooks();
  if (current.find((b) => b.id === book.id)) return; // zaten kayıtlı
  const next = [book, ...current];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function removeBook(id: string): Promise<void> {
  const current = await loadSavedBooks();
  const next = current.filter((b) => b.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function clearAllSaved(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function getSavedCount(): Promise<number> {
  const list = await loadSavedBooks();
  return list.length;
}
