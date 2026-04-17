import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ToastAndroid,
    KeyboardAvoidingView,
    ActivityIndicator,
    Platform,
    Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import api from "../../src/services/api";
import {useUser} from "../../src/context/UserContext";

function FormField({ icon, label, children, noBorder }) {
    return (
        <View className={`p-4 ${noBorder ? "" : "border-b border-white"}`}>
            <View className="flex-row items-center mb-2">
                <Ionicons name={icon} size={16} color="#ef4444" />
                <Text className="text-slate-400 text-[12px] ml-2 uppercase font-bold">
                    {label}
                </Text>
            </View>
            {children}
        </View>
    );
}

function FormInput({ value, onChangeText, placeholder, keyboardType, multiline, style }) {
    return (
        <TextInput
            className="text-white text-[15px] border-b border-white pb-1"
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#ffffff40"
            autoCapitalize="none"
            keyboardType={keyboardType ?? "default"}
            multiline={multiline}
            textAlignVertical={multiline ? "top" : "center"}
            style={style}
        />
    );
}

export default function AddListing() {
    const { productId, productName } = useLocalSearchParams();
    const { user } = useUser();
    const [price, setPrice] = useState("");
    const [contact, setContact] = useState("");
    const [link, setLink] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);

    const showToast = (msg) => {
        if (Platform.OS === "android") {
            ToastAndroid.show(msg, ToastAndroid.SHORT);
        }
    };

    async function handleSubmit() {
        if (!price.trim()) {
            showToast("Please enter a price.");
            return;
        }
        const parsedPrice = parseFloat(price.replace(",", "."));
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            showToast("Please enter a valid price.");
            return;
        }
        if (!contact.trim()) {
            showToast("Please enter a contact method.");
            return;
        }
        if (!description.trim()) {
            showToast("Please add a description.");
            return;
        }

        try {
            setSaving(true);
            await api.post("/api/v1/addListing", {
                productId: Number(productId),
                price: parsedPrice,
                contact: contact.trim(),
                link: link.trim(),
                description: description.trim(),
                isActive,
                userId: user.id,
            });
            showToast("Listing created successfully!");
            router.replace("/(tabs)/store");
        } catch (err) {
            console.error("Failed to create listing:", err);
            showToast("Failed to create listing. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar style="light" />

            <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-3"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-red-500 text-[13px] font-bold uppercase">
                        New Listing
                    </Text>
                    <Text
                        className="text-white text-[22px] font-extrabold"
                        numberOfLines={1}
                    >
                        {productName ?? "Sell Item"}
                    </Text>
                </View>
            </View>

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 48 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="mx-4 mt-4 bg-zinc-900 border border-white rounded-xl px-4 py-3 flex-row items-center">
                        <Ionicons name="cube-outline" size={20} color="#ef4444" />
                        <View className="ml-3">
                            <Text className="text-slate-500 text-[11px] uppercase tracking-widest">
                                Listing for
                            </Text>
                            <Text className="text-white text-[14px] font-semibold">
                                {productName ?? `Product #${productId}`}
                            </Text>
                        </View>
                    </View>

                    <View className="mx-4 mt-4 bg-zinc-900 border border-white rounded-xl overflow-hidden">

                        <FormField icon="cash-outline" label="Asking Price (USD)">
                            <FormInput
                                value={price}
                                onChangeText={setPrice}
                                placeholder="e.g. 49.99"
                                keyboardType="decimal-pad"
                            />
                        </FormField>

                        <FormField icon="chatbubble-ellipses-outline" label="Contact (email or phone)">
                            <FormInput
                                value={contact}
                                onChangeText={setContact}
                                placeholder="e.g. seller@email.com or +40..."
                                keyboardType="email-address"
                            />
                        </FormField>

                        <FormField icon="link-outline" label="External Link (optional)">
                            <FormInput
                                value={link}
                                onChangeText={setLink}
                                placeholder="e.g. https://ebay.com/..."
                                keyboardType="url"
                            />
                        </FormField>

                        <FormField icon="document-text-outline" label="Description">
                            <FormInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Describe the condition, included accessories, shipping details..."
                                multiline
                                style={{ minHeight: 100 }}
                            />
                        </FormField>

                        <FormField icon="eye-outline" label="List as Active" noBorder>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-slate-400 text-[13px]">
                                    {isActive
                                        ? "Visible in store immediately"
                                        : "Draft — hidden from store"}
                                </Text>
                                <Switch
                                    value={isActive}
                                    onValueChange={setIsActive}
                                    trackColor={{ false: "#3f3f46", true: "#ef4444" }}
                                    thumbColor={isActive ? "#fff" : "#94a3b8"}
                                />
                            </View>
                        </FormField>
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={saving}
                        className="mx-4 mt-6 bg-red-500 border border-white rounded-xl py-4 flex-row items-center justify-center"
                        activeOpacity={0.8}
                        style={{ opacity: saving ? 0.6 : 1 }}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                <Ionicons name="storefront-outline" size={20} color="#fff" />
                                <Text className="text-white text-[16px] font-extrabold ml-2">
                                    Publish Listing
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
