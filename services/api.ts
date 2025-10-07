// services/api.ts
const BASE_URL = "https://openlibrary.org";

export const OPENLIBRARY_CONFIG = {
  BASE_URL,
  headers: {
    accept: "application/json",
    // 'User-Agent': 'LectopusBookApp/1.0 (koray@example.com)', // opsiyonel
  },
};

export const fetchBooks = async ({ query }: { query: string }) => {
  const endpoint = `${
    OPENLIBRARY_CONFIG.BASE_URL
  }/search.json?q=${encodeURIComponent(query)}`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: OPENLIBRARY_CONFIG.headers,
  });

  if (!res.ok) {
    throw new Error(`Kitaplar getirilemedi (HTTP ${res.status})`);
  }

  return await res.json(); // data.docs -> liste
};
