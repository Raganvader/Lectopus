import { icons } from "@/constants/icons";
import React from "react";
import { Image, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  placeholder: string;
  onPress: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
}

const SearchBar = ({ placeholder, onPress, value, onChangeText }: Props) => {
  const isControlled = typeof onChangeText === "function";

  return (
    <View className="flex-row items-center bg-dark-200 rounded-full px-5 py-4">
      {/* ✅ İKONU TIKLAYINCA onPress çalışsın */}
      <TouchableOpacity onPress={onPress}>
        <Image
          source={icons.search}
          className="size-5"
          resizeMode="contain"
          tintColor="#ab8bff"
        />
      </TouchableOpacity>

      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#ab8bff"
        className="flex-1 ml-2 text-white"
        returnKeyType="search"
        /* ✅ Kontrollü kullanım varsa state bağla */
        value={isControlled ? value ?? "" : undefined}
        onChangeText={isControlled ? onChangeText : undefined}
        /* ✅ Klavyeden 'search' tuşu her durumda onPress'i tetiklesin */
        onSubmitEditing={onPress}

        /* ❌ ESKİSİ: onFocus ile navigate vardı — KALDIRILDI
           onFocus={!isControlled ? onPress : undefined}
        */
      />
    </View>
  );
};

export default SearchBar;
