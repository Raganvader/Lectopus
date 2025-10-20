// services/api.ts
export const GOOGLE_BOOKS_CONFIG = {
  BASE_URL: "https://www.googleapis.com/books/v1",
  API_KEY: process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY,
  headers: { accept: "application/json" },
};

// Kitap tipi
export type Book = {
  id: string;
  title: string;
  cover_url: string | null;
  rating: number;
  published_year?: string;
};

// Detay tipi
export type BookDetails = {
  id: string;
  title: string;
  cover_url: string | null;
  authors: string[];
  description?: string | null;
  categories?: string[];
  pageCount?: number;
  publisher?: string | null;
  published_year?: string | null;
  language?: string | null;
  previewLink?: string | null;
};

// Yardımcı fonksiyonlar
const toHttps = (u?: string | null) =>
  u ? u.replace(/^http:/, "https:") : null;
const stripHtml = (html?: string | null) =>
  (html ?? "")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s{2,}/g, " ")
    .trim();

// Listeleme için map
function mapGoogleItemToBook(item: any): Book {
  const v = item?.volumeInfo || {};
  const title = v.title || "Adsız Kitap";
  const img = v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || null;
  const cover_url = toHttps(img);
  const rating = typeof v.averageRating === "number" ? v.averageRating : 0;
  const year = (v.publishedDate || "").match(/\d{4}/)?.[0];
  return { id: item.id, title, cover_url, rating, published_year: year };
}

// 📘 Kitap detayları (tek kitap)
export const fetchBookDetails = async (
  bookId: string
): Promise<BookDetails> => {
  const url = `${GOOGLE_BOOKS_CONFIG.BASE_URL}/volumes/${bookId}?key=${GOOGLE_BOOKS_CONFIG.API_KEY}`;
  const res = await fetch(url, {
    method: "GET",
    headers: GOOGLE_BOOKS_CONFIG.headers,
  });

  if (!res.ok) throw new Error("Kitap detayları alınamadı");

  const data = await res.json();
  const v = data?.volumeInfo ?? {};

  return {
    id: data?.id ?? bookId,
    title: v.title ?? "Adsız Kitap",
    cover_url: toHttps(
      v.imageLinks?.thumbnail ?? v.imageLinks?.smallThumbnail ?? null
    ),
    authors: Array.isArray(v.authors) ? v.authors : [],
    description: stripHtml(v.description ?? ""),
    categories: Array.isArray(v.categories) ? v.categories : [],
    pageCount: typeof v.pageCount === "number" ? v.pageCount : undefined,
    publisher: v.publisher ?? null,
    published_year: (v.publishedDate || "").match(/\d{4}/)?.[0] ?? null,
    language: v.language ?? null,
    previewLink: v.previewLink ?? null,
  };
};

// 🔍 Arama (Türkçe öncelikli)
export const fetchBooks = async ({
  query,
}: {
  query: string;
}): Promise<Book[]> => {
  const q = (query || "").trim();
  const endpoint = q
    ? `${GOOGLE_BOOKS_CONFIG.BASE_URL}/volumes?q=${encodeURIComponent(
        q
      )}&langRestrict=tr&orderBy=relevance&printType=books&maxResults=20&key=${
        GOOGLE_BOOKS_CONFIG.API_KEY
      }`
    : `${GOOGLE_BOOKS_CONFIG.BASE_URL}/volumes?q=subject:books&langRestrict=tr&orderBy=relevance&printType=books&maxResults=20&key=${GOOGLE_BOOKS_CONFIG.API_KEY}`;

  const res = await fetch(endpoint, { headers: GOOGLE_BOOKS_CONFIG.headers });
  if (!res.ok) throw new Error(`Kitaplar getirilemedi: ${res.statusText}`);
  const data = await res.json();
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.map(mapGoogleItemToBook);
};

// ⭐ Popüler kitaplar (önce Türkçe)
export const fetchPopularBooks = async ({
  subject = "roman|edebiyat",
  langPriority = ["tr", "en"],
  maxResults = 24,
}: {
  subject?: string;
  langPriority?: string[];
  maxResults?: number;
}): Promise<Book[]> => {
  let results: Book[] = [];
  for (const lang of langPriority) {
    const url =
      `${GOOGLE_BOOKS_CONFIG.BASE_URL}/volumes` +
      `?q=subject:${encodeURIComponent(subject)}` +
      `&langRestrict=${lang}` +
      `&orderBy=relevance&printType=books&projection=full` +
      `&maxResults=${Math.min(40, maxResults)}` +
      `&fields=items(id,volumeInfo(title,imageLinks/thumbnail,imageLinks/smallThumbnail,publishedDate,averageRating)),totalItems` +
      `&key=${GOOGLE_BOOKS_CONFIG.API_KEY}`;

    const r = await fetch(url, { headers: GOOGLE_BOOKS_CONFIG.headers });
    if (!r.ok) continue;
    const data = await r.json();
    const items = Array.isArray(data?.items) ? data.items : [];
    results = results.concat(items.map(mapGoogleItemToBook));
    if (results.length >= maxResults) break;
  }

  const uniq = new Map<string, Book>();
  for (const b of results) if (!uniq.has(b.id)) uniq.set(b.id, b);
  return Array.from(uniq.values()).slice(0, maxResults);
};
