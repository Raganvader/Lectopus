// components/BookCard.tsx
import type { Book } from "@/services/api";
import { account, saveBookForUser } from "@/services/appwrite"; // ⬅️ kullanıcıya özel kayıt
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

const BookCard = ({ book }: { book: Book }) => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);

  if (!book) return null;

  const { id, title, cover_url, published_year } = book;
  const posterUri =
    cover_url || "https://placehold.co/600x400/1a1a1a/FFFFFF.png?text=No+Cover";

  const handleSave = async () => {
    try {
      setSaving(true);
      const user = await account.get().catch(() => null);

      if (!user) {
        Alert.alert("Giriş gerekli", "Kaydetmek için lütfen giriş yapın.", [
          {
            text: "Profil ekranına git",
            onPress: () => router.push("/profile"), // profile ekranına yönlendir
          },
          { text: "İptal", style: "cancel" },
        ]);
        return;
      }

      // 🔥 Kullanıcıya özel kaydet
      await saveBookForUser(user.$id, book);
      setSavedOnce(true);
      Alert.alert("Başarılı", `"${book.title}" kaydedildi!`);
    } catch (e) {
      console.log("Kaydetme hatası:", e);
      Alert.alert("Hata", "Kaydetme sırasında bir sorun oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="w-[30%]">
      {/* Detay sayfasına giden tıklanabilir alan */}
      <Link href={`/kitap/${id}`} asChild>
        <TouchableOpacity>
          <Image
            source={{ uri: posterUri }}
            className="w-full h-52 rounded-lg"
            resizeMode="cover"
          />

          <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
            {title ?? "Adsız kitap"}
          </Text>

          {published_year ? (
            <Text className="text-xs text-light-300 mt-1">
              {published_year}
            </Text>
          ) : null}
        </TouchableOpacity>
      </Link>

      {/* Kaydet butonu */}
      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        className={`mt-2 self-start px-2 py-1 rounded-md ${
          savedOnce ? "bg-green-600" : "bg-accent"
        }`}
      >
        <Text className="text-xs text-white font-semibold">
          {saving ? "Kaydediliyor…" : savedOnce ? "Kaydedildi ✓" : "Kaydet"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default BookCard;
