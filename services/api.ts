// services/api.ts
export const GOOGLE_BOOKS_CONFIG = {
  BASE_URL: "https://www.googleapis.com/books/v1",
  API_KEY: process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY,
  headers: { accept: "application/json" },
};

// Uygulamanın kullandığı tip
export type Book = {
  id: string;
  title: string;
  cover_url: string | null;
  rating: number; // 0–5
  published_year?: string; // "1910"
};

function mapGoogleItemToBook(item: any): Book {
  const v = item?.volumeInfo || {};
  const title = v.title || "Adsız kitap";
  const img = v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || null;
  const cover_url = img ? img.replace(/^http:/, "https:") : null;
  const rating = typeof v.averageRating === "number" ? v.averageRating : 0;
  const year = (v.publishedDate || "").match(/\d{4}/)?.[0];
  return { id: item.id, title, cover_url, rating, published_year: year };
}

// Serbest arama (istersen kullan)
export const fetchBooks = async ({
  query,
}: {
  query: string;
}): Promise<Book[]> => {
  const q = (query || "").trim();
  const endpoint = q
    ? `${GOOGLE_BOOKS_CONFIG.BASE_URL}/volumes?q=${encodeURIComponent(
        q
      )}&orderBy=relevance&printType=books&maxResults=20&key=${
        GOOGLE_BOOKS_CONFIG.API_KEY
      }`
    : `${GOOGLE_BOOKS_CONFIG.BASE_URL}/volumes?q=subject:books&orderBy=relevance&printType=books&maxResults=20&key=${GOOGLE_BOOKS_CONFIG.API_KEY}`;

  const res = await fetch(endpoint, { headers: GOOGLE_BOOKS_CONFIG.headers });
  if (!res.ok) throw new Error(`Failed to fetch books: ${res.statusText}`);
  const data = await res.json();
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.map(mapGoogleItemToBook);
};

// ✅ POPÜLER/MEŞHUR (subject + relevance, dil önceliği)
export const fetchPopularBooks = async ({
  subject = "classic|literature", // classic veya literature
  langPriority = ["en", "tr"], // önce EN, sonra TR (daha sağlam meta)
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
      `?q=subject:${encodeURIComponent(subject)}` + // classic|literature
      `&orderBy=relevance` +
      `&printType=books` +
      `&projection=full` + // kapak/başlık için daha güvenilir
      `&maxResults=${Math.min(40, maxResults)}` +
      (lang ? `&langRestrict=${lang}` : ``) +
      // Yalnız ihtiyacımız olan alanları iste (partial response)
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
