import { icons } from "@/constants/icons";
import React from "react";
import { Image, Pressable, TextInput, View } from "react-native";

interface Props {
  placeholder: string;
  value?: string; // search.tsx için
  onChangeText?: (text: string) => void; // search.tsx için
  onPress?: () => void; // index.tsx için
}

const SearchBar = ({ placeholder, value, onChangeText, onPress }: Props) => {
  const isControlled = typeof onChangeText === "function"; // search ekranı mı?

  // Anasayfada (kontrolsüz) tüm bar'a basılınca onPress → /search
  // Search ekranında (kontrollü) basılınca bir şey yapma; yazmaya izin ver
  return (
    <Pressable disabled={isControlled} onPress={onPress}>
      <View className="flex-row items-center bg-dark-200 rounded-full px-5 py-4">
        <Image
          source={icons.search}
          className="w-5 h-5"
          resizeMode="contain"
          tintColor="#AB8BFF"
        />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#AB8BFF"
          className="flex-1 ml-2 text-white"
          // Kontrollü ise state'e bağla, değilse TextInput değerini kontrol etme
          editable={isControlled}
          value={isControlled ? value ?? "" : undefined}
          onChangeText={isControlled ? onChangeText : undefined}
          returnKeyType="search"
          // Enter/“Search” tuşu sadece kontrollü modda aramayı tetiklesin
          onSubmitEditing={isControlled ? onPress : undefined}
        />
      </View>
    </Pressable>
  );
};

export default SearchBar;
