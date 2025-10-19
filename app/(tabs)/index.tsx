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

import { fetchPopularBooks } from "@/services/api";
import useFetch from "@/services/useFetch";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";

import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";
import TrendingBookCard from "@/components/TrendingBookCard";

const Index = () => {
  const router = useRouter();

  // SADECE meşhur/popüler: klasikler + dil önceliği TR -> EN
  const {
    data: popular,
    loading,
    error,
  } = useFetch(() =>
    fetchPopularBooks({
      subject: "classic",
      langPriority: ["tr", "en"],
      maxResults: 24,
    })
  );

  const trending = Array.isArray(popular) ? popular.slice(0, 10) : [];
  const famous = Array.isArray(popular) ? popular : [];

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

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            className="mt-10 self-center"
          />
        ) : error ? (
          <Text className="text-red-400">Error: {error?.message}</Text>
        ) : (
          <View className="flex-1 mt-5">
            <SearchBar
              onPress={() => router.push("/search")}
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
                    <TrendingBookCard data={item} index={index} />
                  )}
                  keyExtractor={(item, idx) => String(item?.id ?? idx)}
                  ItemSeparatorComponent={() => <View className="w-4" />}
                />
              </View>
            )}

            <>
              <Text className="text-lg text-white font-bold mt-5 mb-3">
                Meşhur Kitaplar
              </Text>

              <FlatList
                data={famous}
                renderItem={({ item }) => <BookCard book={item} />}
                keyExtractor={(item, idx) => String(item?.id ?? idx)}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "flex-start",
                  gap: 20,
                  paddingRight: 5,
                  marginBottom: 10,
                }}
                className="mt-2 pb-32"
                // ScrollView içinde sanal liste uyarısını önlemek için
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
