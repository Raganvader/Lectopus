// services/appwrite.ts
import {
  Account,
  Client,
  Databases,
  ID,
  Permission,
  Query,
  Role,
} from "react-native-appwrite";
import "react-native-url-polyfill/auto";
import type { Book } from "./api";

/* ──────────────────────────────────────────────
   ENV DEĞERLERİ (.env dosyasına göre)
────────────────────────────────────────────── */
const ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const METRICS_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_TABLE_ID!; // örn: "metrics"
const SAVED_TABLE_ID =
  process.env.EXPO_PUBLIC_APPWRITE_SAVED_TABLE_ID || "saved"; // örn: "saved"

/* ──────────────────────────────────────────────
   CLIENT OLUŞTURMA
────────────────────────────────────────────── */
export const appwrite = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);

export const account = new Account(appwrite);
export const databases = new Databases(appwrite);

/* ──────────────────────────────────────────────
   HELPER FONKSİYONLAR
────────────────────────────────────────────── */
const PLACEHOLDER = "https://placehold.co/400x600/1a1a1a/FFFFFF?text=No+Cover";

function httpsify(url?: string | null): string | null {
  if (!url) return null;
  return url.startsWith("http://")
    ? url.replace(/^http:\/\//, "https://")
    : url;
}

function normalizeForMetrics(b: Book) {
  return {
    id: String(b.id ?? ""),
    title: b.title ?? "Adsız kitap",
    poster: httpsify(b.cover_url ?? null) ?? PLACEHOLDER,
  };
}

/* ──────────────────────────────────────────────
   AUTH YARDIMCILARI
────────────────────────────────────────────── */
export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

export async function logout() {
  try {
    await account.deleteSessions();
  } catch {}
}

/* ──────────────────────────────────────────────
   METRICS (Trend Aramalar)
────────────────────────────────────────────── */
export type BookSearchMetric = {
  $id: string;
  searchTerm: string;
  count: number;
  poster_url: string;
  title: string;
  kitap_id_str: string;
  $createdAt?: string;
};

export async function updateSearchCount(query: string, book: Book) {
  try {
    const meta = normalizeForMetrics(book);

    const res = await databases.listDocuments(DATABASE_ID, METRICS_TABLE_ID, [
      Query.equal("searchTerm", query),
      Query.limit(1),
    ]);

    if (res.total > 0) {
      const doc = res.documents[0] as any;
      await databases.updateDocument(DATABASE_ID, METRICS_TABLE_ID, doc.$id, {
        count: (doc.count ?? 0) + 1,
      });
      return;
    }

    await databases.createDocument(DATABASE_ID, METRICS_TABLE_ID, ID.unique(), {
      searchTerm: query,
      count: 1,
      poster_url: meta.poster,
      title: meta.title,
      kitap_id_str: meta.id,
    });
  } catch (err) {
    console.error("updateSearchCount failed:", err);
  }
}

export async function getTrendingSearches(
  limit = 12
): Promise<BookSearchMetric[]> {
  try {
    const res = await databases.listDocuments(DATABASE_ID, METRICS_TABLE_ID, [
      Query.orderDesc("count"),
      Query.limit(limit),
    ]);
    return res.documents as unknown as BookSearchMetric[];
  } catch (err) {
    console.error("getTrendingSearches failed:", err);
    return [];
  }
}

/* ──────────────────────────────────────────────
   SAVED TABLOSU (Kullanıcıya özel kayıtlar)
────────────────────────────────────────────── */
export type SavedDoc = {
  $id: string;
  userId: string;
  bookId: string;
  title: string;
  cover_url?: string | null;
  published_year?: string | null;
  $createdAt?: string;
};

export async function saveBookForUser(
  userId: string,
  book: Book
): Promise<SavedDoc> {
  // 1️⃣ Aynısı var mı?
  const existsRes = (await databases.listDocuments(
    DATABASE_ID,
    SAVED_TABLE_ID,
    [Query.equal("userId", userId), Query.equal("bookId", String(book.id))]
  )) as any;

  const normalizedCover = httpsify(book.cover_url ?? null) || PLACEHOLDER;

  if (existsRes.total > 0) {
    const ex = existsRes.documents[0] as any;
    const doc: SavedDoc = {
      $id: ex.$id,
      userId: ex.userId,
      bookId: ex.bookId,
      title: ex.title,
      cover_url: ex.cover_url ?? null,
      published_year: ex.published_year ?? null,
      $createdAt: ex.$createdAt,
    };

    const needsUpdate =
      !doc.cover_url ||
      doc.cover_url.includes("placehold.co") ||
      doc.cover_url.startsWith("http://");

    if (needsUpdate) {
      await databases.updateDocument(DATABASE_ID, SAVED_TABLE_ID, doc.$id, {
        cover_url: normalizedCover,
        title: book.title ?? doc.title,
        published_year: book.published_year ?? doc.published_year ?? null,
      } as any);
      return {
        ...doc,
        cover_url: normalizedCover,
        title: book.title ?? doc.title,
        published_year: book.published_year ?? doc.published_year ?? null,
      };
    }

    return doc;
  }

  // 2️⃣ Yoksa oluştur
  const permissions = [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];

  const createdRes = (await databases.createDocument(
    DATABASE_ID,
    SAVED_TABLE_ID,
    ID.unique(),
    {
      userId,
      bookId: String(book.id),
      title: book.title ?? "Adsız kitap",
      cover_url: normalizedCover,
      published_year: book.published_year ?? null,
    } as any,
    permissions
  )) as any;

  return {
    $id: createdRes.$id,
    userId: createdRes.userId,
    bookId: createdRes.bookId,
    title: createdRes.title,
    cover_url: createdRes.cover_url ?? null,
    published_year: createdRes.published_year ?? null,
    $createdAt: createdRes.$createdAt,
  } as SavedDoc;
}

/** Kullanıcının kayıtlı kitaplarını getir */
export async function getSavedBooks(userId: string): Promise<SavedDoc[]> {
  const res = (await databases.listDocuments(DATABASE_ID, SAVED_TABLE_ID, [
    Query.equal("userId", userId),
    Query.orderDesc("$createdAt"),
    Query.limit(200),
  ])) as any;
  return res.documents as unknown as SavedDoc[];
}

/** Tek kayıt sil */
export async function removeSaved(
  userId: string,
  bookId: string
): Promise<void> {
  const res = (await databases.listDocuments(DATABASE_ID, SAVED_TABLE_ID, [
    Query.equal("userId", userId),
    Query.equal("bookId", String(bookId)),
    Query.limit(1),
  ])) as any;
  if (res.total > 0) {
    await databases.deleteDocument(
      DATABASE_ID,
      SAVED_TABLE_ID,
      res.documents[0].$id
    );
  }
}

/** Tüm kayıtları temizle */
export async function clearAllSaved(userId: string): Promise<void> {
  const res = (await databases.listDocuments(DATABASE_ID, SAVED_TABLE_ID, [
    Query.equal("userId", userId),
    Query.limit(500),
  ])) as any;
  await Promise.all(
    res.documents.map((d: any) =>
      databases.deleteDocument(DATABASE_ID, SAVED_TABLE_ID, d.$id)
    )
  );
}
