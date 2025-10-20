// app/kitap/[id].tsx
import * as Linking from "expo-linking"; // ✅ Tip güvenli import
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import { fetchBookDetails } from "@/services/api";
import { translateText } from "@/services/translate"; // DeepL çeviri servisi
import useFetch from "@/services/useFetch";

// HTML etiketlerini temizler (ör. <p>, <b> vs.)
function stripHtml(html?: string | null) {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+\n/g, "\n")
    .trim();
}

// Bilgi satırı bileşeni
const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || "Bilgi yok"}
    </Text>
  </View>
);

export default function BookDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Kitap verisini getir
  const { data: book, loading } = useFetch(() =>
    fetchBookDetails(id as string)
  );

  const [translatedDesc, setTranslatedDesc] = useState("");

  // Açıklama metni (öncelik sırası)
  const descriptionOriginal = useMemo(() => {
    return (
      book?.description ||
      (book as any)?.searchInfo?.textSnippet ||
      "Bilgi bulunamadı"
    );
  }, [book]);

  // Açıklamayı Türkçeye çevir
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!descriptionOriginal) {
        setTranslatedDesc("");
        return;
      }

      try {
        const tr = await translateText({
          text: descriptionOriginal,
          targetLang: "TR",
        });

        if (!cancelled) setTranslatedDesc(tr);
      } catch (err) {
        console.warn("Çeviri başarısız:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [descriptionOriginal]);

  if (loading)
    return (
      <SafeAreaView className="bg-primary flex-1">
        <ActivityIndicator color="#ab8bff" size="large" />
      </SafeAreaView>
    );

  // Açıklamayı temizle ve gösterilecek metni belirle
  const cleanDesc =
    stripHtml(translatedDesc || descriptionOriginal) || "Bilgi bulunamadı";

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Kapak resmi */}
        <View>
          <Image
            source={{
              uri:
                book?.cover_url ||
                "https://placehold.co/400x600/1a1a1a/FFFFFF?text=No+Cover",
            }}
            className="w-full h-[550px]"
            resizeMode="stretch"
          />

          {/* Geri dön butonu */}
          <TouchableOpacity
            className="absolute bottom-5 right-5 rounded-full size-14 bg-white flex items-center justify-center"
            onPress={router.back}
          >
            <Image
              source={icons.arrow}
              className="size-6 rotate-180"
              resizeMode="contain"
              tintColor="#000"
            />
          </TouchableOpacity>
        </View>

        {/* Kitap bilgileri */}
        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{book?.title}</Text>

          {book?.authors && (
            <Text className="text-light-200 text-sm mt-2">
              {book.authors.join(", ")}
            </Text>
          )}

          <InfoRow
            label="Yayın Yılı"
            value={book?.published_year || "Bilinmiyor"}
          />

          <InfoRow label="Açıklama" value={cleanDesc} />

          {book?.categories && (
            <InfoRow label="Kategoriler" value={book.categories.join(" • ")} />
          )}

          {book?.pageCount && (
            <InfoRow label="Sayfa Sayısı" value={`${book.pageCount} sayfa`} />
          )}

          {book?.publisher && (
            <InfoRow label="Yayınevi" value={book.publisher} />
          )}

          {book?.language && (
            <InfoRow label="Dil" value={book.language.toUpperCase()} />
          )}

          {book?.previewLink ? (
            <TouchableOpacity
              className="mt-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center"
              onPress={() => {
                const url = book.previewLink; // ✅ url kesin string mi?
                if (url) Linking.openURL(url); // ✅ guard ile tipi garanti ettik
              }}
            >
              <Text className="text-white font-semibold text-base">
                Kitabı Google Books’ta Aç
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>

      {/* Geri Dön butonu */}
      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 mt-0.5 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white font-semibold text-base">Geri Dön</Text>
      </TouchableOpacity>
    </View>
  );
}
