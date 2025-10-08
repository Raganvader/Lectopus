// app/(tabs)/index.tsx
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";

import { fetchBooks } from "@/services/api";
import useFetch from "@/services/useFetch";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";

import SearchBar from "@/components/SearchBar";
// ↓ Bunları film örneğindeki MovieCard/TrendingCard gibi oluşturmalısın
import BookCard from "@/components/BookCard";
import TrendingBookCard from "@/components/TrendingBookCard";

const Index = () => {
  const router = useRouter();

  // TMDB'deki "getTrendingMovies" yerine:
  const {
    data: trendingBooks,
    loading: trendingLoading,
    error: trendingError,
  } = useFetch(() => fetchBooks({ query: "bestsellers" }));

  // TMDB'deki "fetchMovies({query:''})" yerine:
  const {
    data: books,
    loading: booksLoading,
    error: booksError,
  } = useFetch(() => fetchBooks({ query: "" })); // api.ts boşta newest + bestsellers çekiyor

  const trending = Array.isArray(trendingBooks) ? trendingBooks : [];
  const latest = Array.isArray(books) ? books : [];

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

        {booksLoading || trendingLoading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            className="mt-10 self-center"
          />
        ) : booksError || trendingError ? (
          <Text className="text-red-400">
            Error: {String(booksError?.message || trendingError?.message)}
          </Text>
        ) : (
          <View className="flex-1 mt-5">
            <SearchBar
              onPress={() => {
                router.push("/search");
              }}
              placeholder="Kitap, yazar veya tür ara..."
            />

            {trending.length > 0 && (
              <View className="mt-10">
                <Text className="text-lg text-white font-bold mb-3">
                  Öne Çıkanlar
                </Text>

                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-4 mt-3"
                  data={trending}
                  contentContainerStyle={{ gap: 26 }}
                  renderItem={({ item, index }) => (
                    <TrendingBookCard
                      // Google Books item
                      data={item}
                      index={index}
                    />
                  )}
                  keyExtractor={(item, idx) => String(item?.id ?? idx)}
                  ItemSeparatorComponent={() => <View className="w-4" />}
                />
              </View>
            )}

            <>
              <Text className="text-lg text-white font-bold mt-5 mb-3">
                Son Çıkan Kitaplar
              </Text>

              <FlatList
                data={latest}
                renderItem={({ item }) => (
                  // MovieCard yerine BookCard
                  <BookCard book={item} />
                )}
                keyExtractor={(item, idx) => String(item?.id ?? idx)}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "flex-start",
                  gap: 20,
                  paddingRight: 5,
                  marginBottom: 10,
                }}
                className="mt-2 pb-32"
                // ScrollView içinde uyarı vermesin
                scrollEnabled={false}
              />
            </>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Index;
