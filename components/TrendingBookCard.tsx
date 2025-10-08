import { Link } from "expo-router";
import { Image, Text, TouchableOpacity } from "react-native";

type VolumeInfo = {
  title?: string;
  imageLinks?: { thumbnail?: string; smallThumbnail?: string };
};

export type GoogleBookItemLite = {
  id: string;
  volumeInfo?: VolumeInfo;
};

function https(u?: string) {
  return u ? u.replace(/^http:/, "https:") : undefined;
}

// index.tsx içinde <TrendingBookCard data={item} index={index} /> diye çağırıyorsun
export default function TrendingBookCard({
  data,
  index,
}: {
  data: GoogleBookItemLite;
  index: number;
}) {
  const v = data?.volumeInfo ?? {};
  const title = v.title ?? "Adsız kitap";
  const cover =
    https(v.imageLinks?.thumbnail) ||
    https(v.imageLinks?.smallThumbnail) ||
    "https://placehold.co/600x900/1a1a1a/FFFFFF.png?text=No+Cover";

  return (
    <Link href={{ pathname: "/kitap/[id]", params: { id: data.id } }} asChild>
      <TouchableOpacity className="w-40">
        <Image
          source={{ uri: cover }}
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
