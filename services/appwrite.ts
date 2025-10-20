// services/appwrite.ts
import Constants from "expo-constants";
import { Platform } from "react-native";
import { Client, Databases, ID, Query } from "react-native-appwrite";
import "react-native-url-polyfill/auto";

/** ENV */
const ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_TABLE_ID!; // metrics tablosu

/** Client (Expo uyumlu platform tanımı) */
const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
const devPlatform =
  Platform.select({ ios: "host.exp.Exponent", android: "host.exp.exponent" }) ??
  "host.exp.Exponent";
const releasePlatform =
  Constants?.expoConfig?.ios?.bundleIdentifier ||
  Constants?.expoConfig?.android?.package ||
  "com.jsm.lectopus";

client.setPlatform(__DEV__ ? devPlatform : releasePlatform);

export const databases = new Databases(client);

/** Google Books -> normalize yardımcıları */
const FALLBACK_POSTER =
  "https://placehold.co/400x600/1a1a1a/FFFFFF?text=No+Cover";

type GBItemLoose = {
  id?: string;
  title?: string;
  image?: string;
  volumeInfo?: {
    title?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
};

function normalizeBook(b: any): { id: string; title: string; poster: string } {
  const id = String(b?.id ?? "");
  const title = b?.volumeInfo?.title ?? b?.title ?? "Unknown";
  const poster =
    b?.volumeInfo?.imageLinks?.thumbnail ||
    b?.volumeInfo?.imageLinks?.smallThumbnail ||
    b?.image ||
    FALLBACK_POSTER;

  // Google bazen http verir; güvenli olması için https'e çevir
  const safePoster =
    typeof poster === "string"
      ? poster.replace(/^http:/, "https:")
      : FALLBACK_POSTER;

  return { id, title, poster: safePoster };
}

/** Tablo tipin (Columns sekline göre) */
export interface BookSearchMetric {
  $id: string;
  searchTerm: string; // required (Text)
  count: number; // required (Integer, default 0)
  poster_url: string; // required (URL/Text)
  kitap_id_str: string; // required (Text)  ← kitap_id yerine bunu kullanıyoruz
  title: string; // required (Text)
}

/** Arama sayacını artır / yoksa oluştur */
export const updateSearchCount = async (query: string, book: GBItemLoose) => {
  try {
    const meta = normalizeBook(book);

    // 1) Bu terim var mı?
    const found = await databases.listDocuments(DATABASE_ID, TABLE_ID, [
      Query.equal("searchTerm", query),
    ]);

    if (found.documents.length > 0) {
      // 2) Varsa → count++
      const doc = found.documents[0] as unknown as BookSearchMetric;
      await databases.updateDocument(DATABASE_ID, TABLE_ID, doc.$id, {
        count: (doc.count ?? 0) + 1,
        // istersen poster/title da güncellenebilir
      });
      return;
    }

    // 3) Yoksa → yeni belge (required alanların tamamı gönderilmeli)
    await databases.createDocument(DATABASE_ID, TABLE_ID, ID.unique(), {
      searchTerm: query,
      count: 1,
      poster_url: meta.poster,
      kitap_id_str: meta.id,
      title: meta.title,
    });
  } catch (error) {
    console.error("updateSearchCount failed:", error);
  }
};

/** En çok aranan ilk 5 */
export const getTrendingSearches = async (): Promise<BookSearchMetric[]> => {
  try {
    const res = await databases.listDocuments(DATABASE_ID, TABLE_ID, [
      Query.orderDesc("count"),
      Query.limit(5),
    ]);
    return res.documents as unknown as BookSearchMetric[];
  } catch (error) {
    console.error("getTrendingSearches failed:", error);
    return [];
  }
};

export { client };
