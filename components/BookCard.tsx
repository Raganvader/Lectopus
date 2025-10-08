// components/BookCard.tsx
import { icons } from "@/constants/icons";
import { Link } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

// Google Books item tipi (sadeleştirilmiş)
export type GoogleBookItem = {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publishedDate?: string; // "2019-06-01" ya da "2019"
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    averageRating?: number; // 0–5
  };
};

function secure(url?: string) {
  return url ? url.replace(/^http:/, "https:") : undefined;
}

const BookCard = ({ book }: { book: GoogleBookItem }) => {
  const v = book?.volumeInfo ?? {};
  const title = v.title ?? "Adsız kitap";
  const year = (v.publishedDate || "").match(/\d{4}/)?.[0] ?? "";
  const rating =
    typeof v.averageRating === "number" ? Math.round(v.averageRating) : 0;
  const cover =
    secure(v.imageLinks?.thumbnail) ||
    secure(v.imageLinks?.smallThumbnail) ||
    "https://placehold.co/600x900/1a1a1a/FFFFFF.png?text=No+Cover";

  return (
    <Link href={{ pathname: "/kitap/[id]", params: { id: book.id } }} asChild>
      <TouchableOpacity className="w-[30%]">
        <Image
          source={{ uri: cover }}
          className="w-full h-52 rounded-lg"
          resizeMode="cover"
        />

        <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
          {title}
        </Text>

        <View className="flex-row items-center justify-start gap-x-1">
          <Image source={icons.star} className="size-4" />
          <Text className="text-xs text-white font-bold uppercase">
            {rating}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-light-300 font-medium mt-1">
            {year}
          </Text>
          <Text className="text-xs font-medium text-light-300 uppercase">
            Book
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default BookCard;
