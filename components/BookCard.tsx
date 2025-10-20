// components/BookCard.tsx
import type { Book } from "@/services/api";
import { saveBook } from "@/services/saved";
import { Link } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const BookCard = ({ book }: { book: Book }) => {
  if (!book) return null; // guard

  const { id, title, cover_url, published_year } = book;
  const posterUri =
    cover_url || "https://placehold.co/600x400/1a1a1a/FFFFFF.png?text=No+Cover";

  return (
    <View className="w-[30%]">
      {/* Kartın tıklanınca detay sayfasına götüren kısmı */}
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

      {/* Kaydet butonu — Link’in DIŞINDA, böylece tıklayınca detay sayfasına gitmez */}
      <TouchableOpacity
        onPress={() => saveBook(book)}
        className="mt-2 self-start bg-accent px-2 py-1 rounded-md"
      >
        <Text className="text-xs text-white font-semibold">Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BookCard;
