// app/kitap/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import { fetchBookDetails, type BookDetails } from "@/services/api";
import useFetch from "@/services/useFetch";

const BilgiSatiri = ({
  etiket,
  deger,
}: {
  etiket: string;
  deger?: string | null;
}) =>
  deger ? (
    <View className="mt-5">
      <Text className="text-light-200 font-normal text-sm">{etiket}</Text>
      <Text className="text-light-100 font-bold text-sm mt-2">{deger}</Text>
    </View>
  ) : null;

const KitapDetayEkrani = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const {
    data: kitap,
    loading,
    error,
  } = useFetch<BookDetails>(() => fetchBookDetails(String(id)));

  if (loading)
    return (
      <SafeAreaView className="bg-primary flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ab8bff" />
        <Text className="text-light-200 mt-3">Yükleniyor...</Text>
      </SafeAreaView>
    );

  if (error)
    return (
      <SafeAreaView className="bg-primary flex-1 justify-center items-center px-5">
        <Text className="text-red-400 text-center">
          Kitap detayları alınamadı: {String(error)}
        </Text>
        <TouchableOpacity
          className="mt-4 bg-accent rounded-lg px-4 py-2"
          onPress={router.back}
        >
          <Text className="text-white font-semibold">Geri Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        {/* Kapak */}
        <Image
          source={{
            uri:
              kitap?.cover_url ||
              "https://placehold.co/600x800/1a1a1a/FFFFFF?text=Kapak+Yok",
          }}
          className="w-full h-[520px]"
          resizeMode="cover"
        />

        {/* Kitap Bilgileri */}
        <View className="px-5 mt-5">
          <Text className="text-white font-bold text-2xl">
            {kitap?.title ?? "Adsız Kitap"}
          </Text>

          {/* Yazar */}
          {kitap?.authors?.length ? (
            <Text className="text-light-200 text-sm mt-2">
              {kitap.authors.join(", ")}
            </Text>
          ) : null}

          {/* Yayın yılı */}
          {kitap?.published_year ? (
            <Text className="text-light-200 text-sm mt-2">
              Yayın Yılı: {kitap.published_year}
            </Text>
          ) : null}

          {/* Açıklama */}
          <BilgiSatiri etiket="Açıklama" deger={kitap?.description ?? ""} />

          {/* Diğer bilgiler */}
          <BilgiSatiri
            etiket="Kategoriler"
            deger={
              kitap?.categories?.length ? kitap.categories.join(" • ") : ""
            }
          />
          <BilgiSatiri
            etiket="Sayfa Sayısı"
            deger={
              typeof kitap?.pageCount === "number"
                ? `${kitap.pageCount} sayfa`
                : ""
            }
          />
          <BilgiSatiri etiket="Yayınevi" deger={kitap?.publisher ?? ""} />
          <BilgiSatiri
            etiket="Dil"
            deger={
              kitap?.language?.toLowerCase() === "tr"
                ? "Türkçe"
                : kitap?.language?.toUpperCase() ?? ""
            }
          />

          {kitap?.previewLink && (
            <TouchableOpacity
              className="mt-6 bg-accent rounded-lg px-4 py-2"
              onPress={() => Linking.openURL(kitap.previewLink!)}
            >
              <Text className="text-white text-center font-semibold">
                Kitabı Google Books’ta Aç
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Geri Butonu */}
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
};

export default KitapDetayEkrani;
