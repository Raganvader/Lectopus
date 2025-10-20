// app/(tabs)/profile.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { images } from "@/constants/images";
import { getSavedCount } from "@/services/saved";

const NAME_KEY = "profile_name_v1";

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    const stored = await AsyncStorage.getItem(NAME_KEY);
    if (stored) setName(stored);
    const c = await getSavedCount();
    setCount(c);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveName = async () => {
    setSaving(true);
    await AsyncStorage.setItem(NAME_KEY, name.trim());
    setSaving(false);
  };

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full h-full z-0"
        resizeMode="cover"
      />

      <View className="px-5 pt-16">
        <Text className="text-white text-2xl font-bold">Profil</Text>

        <View className="bg-dark-100 rounded-2xl p-4 mt-5">
          <Text className="text-light-200 text-sm mb-2">Adınız</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Adınızı yazın"
            placeholderTextColor="#8b8b8b"
            className="bg-dark-200 rounded-xl px-3 py-3 text-white"
          />
          <TouchableOpacity
            className="bg-accent rounded-xl px-4 py-3 mt-3 items-center"
            onPress={handleSaveName}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Kaydet</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="bg-dark-100 rounded-2xl p-4 mt-5">
          <Text className="text-light-200 text-sm">
            Kaydedilen kitap sayısı
          </Text>
          <Text className="text-white text-xl font-bold mt-1">
            {count === null ? "—" : count}
          </Text>

          <TouchableOpacity
            className="bg-dark-200 rounded-xl px-4 py-3 mt-4 items-center"
            onPress={() => router.push("/saved")}
          >
            <Text className="text-light-100 font-semibold">
              Kaydedilenlere Git
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
