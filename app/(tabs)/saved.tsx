// app/(tabs)/saved.tsx
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { images } from "@/constants/images";
import type { Book } from "@/services/api";
import { clearAllSaved, loadSavedBooks, removeBook } from "@/services/saved";
import { useRouter } from "expo-router";

export default function SavedScreen() {
  const [items, setItems] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await loadSavedBooks();
    setItems(list);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleRemove = async (id: string) => {
    await removeBook(id);
    await refresh();
  };

  const handleClearAll = async () => {
    await clearAllSaved();
    await refresh();
  };

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full h-full z-0"
        resizeMode="cover"
      />

      <View className="px-5 pt-16 pb-3 flex-row items-center justify-between">
        <Text className="text-white text-2xl font-bold">Kaydedilenler</Text>
        {items.length > 0 && (
          <TouchableOpacity
            className="bg-dark-200 px-3 py-2 rounded-lg"
            onPress={handleClearAll}
          >
            <Text className="text-light-100 text-xs">Tümünü Temizle</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ab8bff" className="mt-10" />
      ) : items.length === 0 ? (
        <View className="px-5 mt-10">
          <Text className="text-light-200">
            Henüz kaydedilmiş kitabın yok. Bir kitap kartından “Kaydet”
            yapabilirsin.
          </Text>
        </View>
      ) : (
        <FlatList
          className="px-5"
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View className="flex-row items-center bg-dark-100 rounded-xl p-3 mb-3">
              <Image
                source={{
                  uri:
                    item.cover_url ||
                    "https://placehold.co/100x150/1a1a1a/FFFFFF?text=No+Cover",
                }}
                className="w-16 h-24 rounded-md"
                resizeMode="cover"
              />
              <View className="flex-1 ml-3">
                <Text className="text-white font-semibold" numberOfLines={2}>
                  {item.title}
                </Text>
                {item.published_year ? (
                  <Text className="text-light-200 text-xs mt-1">
                    {item.published_year}
                  </Text>
                ) : null}

                <View className="flex-row mt-3">
                  <TouchableOpacity
                    className="bg-accent px-3 py-2 rounded-lg mr-3"
                    onPress={() => router.push(`/kitap/${item.id}`)}
                  >
                    <Text className="text-white text-xs">Detay</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-dark-200 px-3 py-2 rounded-lg"
                    onPress={() => handleRemove(item.id)}
                  >
                    <Text className="text-light-100 text-xs">Sil</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}
