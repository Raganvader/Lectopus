// app/(tabs)/search.tsx
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";

import { fetchBooks, type Book } from "@/services/api";
import {
  getTrendingSearches,
  updateSearchCount,
  type BookSearchMetric,
} from "@/services/appwrite";
import useFetch from "@/services/useFetch";

import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";
import TrendingBookCard from "@/components/TrendingBookCard"; // yoksa BookCard ile değiştir

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Appwrite'tan Meşhur Kitaplar
  const [trending, setTrending] = useState<BookSearchMetric[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);

  // Boş olduğunda göstermek için fallback (klasikler)
  const [fallback, setFallback] = useState<Book[]>([]);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  // Google Books araması
  const {
    data: booksRaw,
    loading,
    error,
    refetch: loadBooks,
    reset,
  } = useFetch<Book[]>(() => fetchBooks({ query: searchQuery }), false);

  const books = booksRaw ?? [];

  // Debounce arama (500ms)
  useEffect(() => {
    const t = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadBooks();
      } else {
        reset();
      }
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Arama sonrası Appwrite'a sayaç yaz
  useEffect(() => {
    if (searchQuery.trim() && books.length > 0) {
      updateSearchCount(searchQuery, books[0]);
    }
  }, [books, searchQuery]);

  // Appwrite'tan trend çek + boşsa fallback doldur
  useEffect(() => {
    const loadTrending = async () => {
      try {
        setTrendingLoading(true);
        const res = await getTrendingSearches();
        setTrending(res);

        if (!res || res.length === 0) {
          // Boşsa "klasikler" ile doldur
          setFallbackLoading(true);
          const fb = await fetchBooks({ query: "classic" });
          setFallback(fb ?? []);
        }
      } finally {
        setTrendingLoading(false);
        setFallbackLoading(false);
      }
    };
    loadTrending();
  }, []);

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      <FlatList
        className="px-5"
        data={searchQuery.trim() ? books : []} // yalnızca arama varsa listeyi göster
        keyExtractor={(item, idx) => String(item.id ?? idx)}
        renderItem={({ item }) => <BookCard book={item} />}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            {/* Logo */}
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>

            {/* Arama kutusu */}
            <View className="my-5">
              <SearchBar
                placeholder="Kitap, yazar veya tür ara..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onPress={loadBooks} // klavyeden 'search' basınca tetikle
              />
            </View>

            {/* Arama yükleniyor/hata */}
            {loading && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-3"
              />
            )}
            {error && (
              <Text className="text-red-500 px-5 my-3">
                Error: {error.message}
              </Text>
            )}

            {/* Arama sonuç başlığı */}
            {!loading && !error && searchQuery.trim() && books.length > 0 && (
              <Text className="text-xl text-white font-bold">
                “<Text className="text-accent">{searchQuery}</Text>” için
                sonuçlar
              </Text>
            )}

            {/* Meşhur Kitaplar */}
            {!searchQuery.trim() && (
              <>
                <Text className="text-lg text-white font-bold mb-2 mt-4">
                  Trend Aramalar
                </Text>

                {trendingLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#0000ff"
                    className="my-3"
                  />
                ) : trending.length > 0 ? (
                  <FlatList
                    horizontal
                    data={trending}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, idx) => item.$id ?? String(idx)}
                    renderItem={({ item, index }) => (
                      <TrendingBookCard
                        data={{
                          id: String(item.kitap_id_str),
                          title: item.title ?? "Adsız kitap",
                          cover_url: item.poster_url ?? "",
                          rating: 0, // bileşenin tipi istiyorsa
                        }}
                        index={index}
                      />
                    )}
                    contentContainerStyle={{ gap: 20 }}
                  />
                ) : fallbackLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#0000ff"
                    className="my-3"
                  />
                ) : (
                  <FlatList
                    horizontal
                    data={fallback}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(b, i) => String(b.id ?? i)}
                    renderItem={({ item, index }) => (
                      <TrendingBookCard
                        data={{
                          id: String(item.id),
                          title: item.title,
                          cover_url: item.cover_url,
                          rating: item.rating ?? 0,
                        }}
                        index={index}
                      />
                    )}
                    contentContainerStyle={{ gap: 20 }}
                  />
                )}
              </>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && !error && searchQuery.trim() ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                “{searchQuery}” için sonuç bulunamadı
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Search;
