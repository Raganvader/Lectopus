import type { Book } from "@/services/api";
import { Link } from "expo-router";
import { Image, Text, TouchableOpacity } from "react-native";

const BookCard = ({ book }: { book: Book }) => {
  if (!book) return null; // guard

  const { id, title, cover_url, published_year } = book;

  const posterUri =
    cover_url || "https://placehold.co/600x400/1a1a1a/FFFFFF.png?text=No+Cover";

  return (
    <Link href={`/kitap/${id}`} asChild>
      <TouchableOpacity className="w-[30%]">
        <Image
          source={{ uri: posterUri }}
          className="w-full h-52 rounded-lg"
          resizeMode="cover"
        />

        <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
          {title ?? "Adsız kitap"}
        </Text>

        {published_year ? (
          <Text className="text-xs text-light-300 mt-1">{published_year}</Text>
        ) : null}
      </TouchableOpacity>
    </Link>
  );
};

export default BookCard;
