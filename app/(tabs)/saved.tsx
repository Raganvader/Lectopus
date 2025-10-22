// app/(tabs)/saved.tsx
import { useFocusEffect } from "@react-navigation/native";
import { Link } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { images } from "@/constants/images";
import {
  account,
  clearAllSaved,
  getSavedBooks,
  removeSaved,
  type SavedDoc,
} from "@/services/appwrite";

const PLACEHOLDER = "https://placehold.co/160x220/1a1a1a/FFFFFF?text=No+Cover";

const Saved = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<SavedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const user = await account.get().catch(() => null);
      if (!user) {
        setUserId(null);
        setItems([]);
        return;
      }
      setUserId(user.$id);
      const rows = await getSavedBooks(user.$id);
      setItems(rows);
    } catch (e) {
      console.log("Saved load error:", e);
      Alert.alert("Hata", "Kaydedilenler yüklenemedi.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // İlk açılışta yükle
  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // Sayfa odaklandıkça tekrar yükle (sekmeden dönünce güncellensin)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
  };

  const handleRemove = async (bookId: string) => {
    if (!userId) return;
    try {
      await removeSaved(userId, bookId);
      setItems((prev) => prev.filter((x) => x.bookId !== bookId));
    } catch (e) {
      console.log("removeSaved error:", e);
      Alert.alert("Hata", "Silme sırasında sorun oluştu.");
    }
  };

  const handleClearAll = async () => {
    if (!userId || items.length === 0) return;
    Alert.alert("Tümünü Temizle", "Tüm kayıtlar silinecek. Emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Temizle",
        style: "destructive",
        onPress: async () => {
          try {
            await clearAllSaved(userId);
            setItems([]);
          } catch (e) {
            console.log("clearAllSaved error:", e);
            Alert.alert("Hata", "Temizleme sırasında sorun oluştu.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: SavedDoc }) => {
    const cover = item.cover_url || PLACEHOLDER;
    return (
      <View className="flex-row items-center bg-dark-200 rounded-2xl p-4 mb-4">
        <Image
          source={{ uri: cover }}
          className="w-16 h-22 rounded-md mr-4"
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text
            className="text-white font-semibold text-base"
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {item.published_year ? (
            <Text className="text-light-300 text-xs mt-1">
              {item.published_year}
            </Text>
          ) : null}

          <View className="flex-row mt-3">
            <Link href={`/kitap/${item.bookId}`} asChild>
              <TouchableOpacity className="bg-accent px-3 py-2 rounded-lg mr-2">
                <Text className="text-white font-semibold text-sm">Detay</Text>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity
              onPress={() => handleRemove(item.bookId)}
              className="bg-dark-100 px-3 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold text-sm">Sil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-primary">
      {/* Arka plan */}
      {images?.bg ? (
        <Image source={images.bg} className="absolute w-full h-full" />
      ) : null}

      {/* Başlık + Tümünü Temizle (biraz aşağı aldım) */}
      <View className="px-5 pt-14 pb-3 flex-row justify-between items-center">
        <Text className="text-white text-2xl font-bold">Kaydedilenler</Text>

        {items.length > 0 ? (
          <TouchableOpacity
            onPress={handleClearAll}
            className="bg-dark-100 px-3 py-2 rounded-lg"
          >
            <Text className="text-white text-xs font-semibold">
              Tümünü Temizle
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#7b5cff" className="mt-6" />
      ) : !userId ? (
        <View className="px-5 mt-6">
          <Text className="text-light-300">
            Kaydedilenleri görmek için lütfen giriş yapın.
          </Text>
        </View>
      ) : items.length === 0 ? (
        <View className="px-5 mt-6">
          <Text className="text-light-300">Henüz bir kitap kaydetmediniz.</Text>
        </View>
      ) : (
        <FlatList
          className="px-5 mt-2"
          data={items}
          keyExtractor={(it) => it.$id}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
};

export default Saved;
