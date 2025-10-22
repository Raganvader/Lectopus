// app/(tabs)/profile.tsx
import { images } from "@/constants/images";
import {
  getCurrentUser,
  signInEmail,
  signOut,
  signUpEmail,
} from "@/services/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Mode = "login" | "register";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);

  // form state
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // mevcut kullanıcıyı al
  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setMe(u);
      setLoading(false);
    })();
  }, []);

  const refreshUser = async () => {
    const u = await getCurrentUser();
    setMe(u);
  };

  const onSubmit = async () => {
    setErr(null);
    if (!email || !pw) {
      setErr("E-posta ve şifre gerekli");
      return;
    }
    try {
      setSubmitting(true);
      if (mode === "login") {
        await signInEmail({ email, password: pw });
      } else {
        await signUpEmail({ email, password: pw, name: name || undefined });
      }
      await refreshUser();
      // formu temizle
      setName("");
      setEmail("");
      setPw("");
    } catch (e: any) {
      setErr(e?.message ?? "İşlem başarısız");
    } finally {
      setSubmitting(false);
    }
  };

  const onLogout = async () => {
    await signOut();
    setMe(null);
  };

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full h-full z-0"
        resizeMode="cover"
      />

      <View className="px-5 pt-16 pb-8">
        <Text className="text-white text-2xl font-bold">Profil</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ab8bff" />
        </View>
      ) : me ? (
        // -------------------- GİRİŞ YAPMIŞ DURUM --------------------
        <View className="px-5">
          <View className="bg-dark-100 rounded-2xl p-4">
            <Text className="text-light-200 text-sm">Ad</Text>
            <Text className="text-white text-lg font-semibold mt-1">
              {me?.name ?? "—"}
            </Text>

            <Text className="text-light-200 text-sm mt-4">E-posta</Text>
            <Text className="text-white text-lg font-semibold mt-1">
              {me?.email ?? "—"}
            </Text>

            <TouchableOpacity
              onPress={onLogout}
              className="bg-accent rounded-xl px-4 py-3 mt-6 items-center"
            >
              <Text className="text-white font-semibold">Çıkış Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // -------------------- GİRİŞ / KAYIT FORMU --------------------
        <View className="px-5">
          <View className="bg-dark-100 rounded-2xl p-4">
            <View className="flex-row bg-dark-200 rounded-xl p-1 mb-4">
              <TouchableOpacity
                className={`flex-1 py-2 rounded-lg items-center ${
                  mode === "login" ? "bg-accent" : ""
                }`}
                onPress={() => setMode("login")}
                disabled={submitting}
              >
                <Text
                  className={`font-semibold ${
                    mode === "login" ? "text-white" : "text-light-200"
                  }`}
                >
                  Giriş
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-lg items-center ${
                  mode === "register" ? "bg-accent" : ""
                }`}
                onPress={() => setMode("register")}
                disabled={submitting}
              >
                <Text
                  className={`font-semibold ${
                    mode === "register" ? "text-white" : "text-light-200"
                  }`}
                >
                  Kayıt
                </Text>
              </TouchableOpacity>
            </View>

            {mode === "register" && (
              <>
                <Text className="text-light-200 mb-2">Ad</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Adınız"
                  placeholderTextColor="#8b8b8b"
                  className="bg-dark-200 text-white rounded-xl px-4 py-3 mb-4"
                />
              </>
            )}

            <Text className="text-light-200 mb-2">E-posta</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@mail.com"
              placeholderTextColor="#8b8b8b"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-dark-200 text-white rounded-xl px-4 py-3 mb-4"
            />

            <Text className="text-light-200 mb-2">Şifre</Text>
            <TextInput
              value={pw}
              onChangeText={setPw}
              placeholder="••••••••"
              placeholderTextColor="#8b8b8b"
              secureTextEntry
              className="bg-dark-200 text-white rounded-xl px-4 py-3"
            />

            {err ? <Text className="text-red-400 mt-3">{err}</Text> : null}

            <TouchableOpacity
              className="bg-accent rounded-xl px-4 py-3 mt-6 items-center"
              onPress={onSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold">
                  {mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
