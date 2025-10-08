// services/api.ts
export const GOOGLE_BOOKS_CONFIG = {
  BASE_URL: "https://www.googleapis.com/books/v1",
  API_KEY: process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY,
  headers: {
    accept: "application/json",
  },
};

// 📚 Kitap arama
export const fetchBooks = async ({ query }: { query: string }) => {
  const endpoint = query
    ? `${GOOGLE_BOOKS_CONFIG.BASE_URL}/volumes?q=${encodeURIComponent(
        query
      )}&key=${
        GOOGLE_BOOKS_CONFIG.API_KEY
      }&printType=books&langRestrict=tr&maxResults=20`
    : `${GOOGLE_BOOKS_CONFIG.BASE_URL}/volumes?q=bestsellers&key=${GOOGLE_BOOKS_CONFIG.API_KEY}&printType=books&orderBy=newest`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: GOOGLE_BOOKS_CONFIG.headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch books: ${response.statusText}`);
  }

  const data = await response.json();
  return data.items || [];
};

// 📘 Tek kitap detayları
export const fetchBookDetails = async (bookId: string) => {
  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_CONFIG.BASE_URL}/volumes/${bookId}?key=${GOOGLE_BOOKS_CONFIG.API_KEY}`,
      {
        method: "GET",
        headers: GOOGLE_BOOKS_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch book details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching book details:", error);
    throw error;
  }
};
