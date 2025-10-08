// components/TrendingBookCard.tsx
import type { Book } from "@/services/api";
import { Link } from "expo-router";
import { Image, Text, TouchableOpacity } from "react-native";

export default function TrendingBookCard({
  data,
  index,
}: {
  data: Book;
  index: number;
}) {
  const { id, title, cover_url } = data;

  const posterUri =
    cover_url || "https://placehold.co/600x900/1a1a1a/FFFFFF.png?text=No+Cover";

  return (
    <Link href={`/kitap/${id}`} asChild>
      <TouchableOpacity className="w-40">
        <Image
          source={{ uri: posterUri }}
          className="w-40 h-56 rounded-xl"
          resizeMode="cover"
        />
        <Text className="text-white font-semibold mt-2" numberOfLines={1}>
          {title}
        </Text>
      </TouchableOpacity>
    </Link>
  );
}
