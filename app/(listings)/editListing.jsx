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
import { useState, useCallback } from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import api from "../../src/services/api";

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

export default function EditListing() {
    const { id } = useLocalSearchParams();

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [price, setPrice] = useState("");
    const [contact, setContact] = useState("");
    const [link, setLink] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);

    const showToast = (msg) => {
        if (Platform.OS === "android") {
            ToastAndroid.show(msg, ToastAndroid.SHORT);
        }
    };

    const fetchListing = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get("/api/v1/getListingById", {
                params: { id },
            });
            const data = response.data;
            setListing(data);
            setPrice(data.price?.toString() ?? "");
            setContact(data.contact ?? "");
            setLink(data.link ?? "");
            setDescription(data.description ?? "");
            setIsActive(data.isActive ?? true);
        } catch (err) {
            console.error("Failed to fetch listing:", err);
            setError("Could not load listing. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            if (id) fetchListing();
        }, [id])
    );

    const product = listing?.product ?? {};

    async function handleSave() {
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
            await api.put("/api/v1/editListing", {
                newProductId: product.id,
                newPrice: parsedPrice,
                newContact: contact.trim(),
                newLink: link.trim(),
                newDescription: description.trim(),
                newIsActive: isActive,
            }, {
                params: { id },
            });
            showToast("Listing updated successfully!");
            router.back();
        } catch (err) {
            console.error("Failed to update listing:", err);
            showToast("Failed to update listing. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar style="light" />

            {/* Header */}
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
                        Edit Listing
                    </Text>
                    <Text className="text-white text-[22px] font-extrabold" numberOfLines={1}>
                        {product?.name ?? "Loading..."}
                    </Text>
                </View>
            </View>

            {loading && (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#ef4444" size="large" />
                </View>
            )}

            {error && !loading && (
                <View className="mx-4 mt-3 p-3 bg-red-500/20 border border-red-500 rounded-xl flex-row items-center">
                    <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />
                    <Text className="text-red-400 text-[13px] ml-2 flex-1">{error}</Text>
                    <TouchableOpacity onPress={fetchListing}>
                        <Text className="text-white text-[12px] font-bold">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {listing && !loading && (
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
                            <View className="ml-3 flex-1">
                                <Text className="text-slate-500 text-[11px] uppercase tracking-widest">
                                    Product
                                </Text>
                                <Text className="text-white text-[14px] font-semibold">
                                    {product?.name ?? `Product #${product?.id}`}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() =>
                                    router.push({
                                        pathname: "/(product)/productDetail",
                                        params: { id: product.id },
                                    })
                                }
                                className="flex-row items-center bg-black border border-white rounded-lg px-3 py-1.5"
                                activeOpacity={0.8}
                            >
                                <Ionicons name="open-outline" size={13} color="#ef4444" />
                                <Text className="text-white text-[12px] font-semibold ml-1">
                                    View
                                </Text>
                            </TouchableOpacity>
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
                                    placeholder="Describe condition, accessories, shipping..."
                                    multiline
                                    style={{ minHeight: 100 }}
                                />
                            </FormField>

                            <FormField icon="eye-outline" label="Active" noBorder>
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-slate-400 text-[13px]">
                                        {isActive ? "Visible in store" : "Draft — hidden from store"}
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
                            onPress={handleSave}
                            disabled={saving}
                            className="mx-4 mt-6 bg-red-500 border border-white rounded-xl py-4 flex-row items-center justify-center"
                            activeOpacity={0.8}
                            style={{ opacity: saving ? 0.6 : 1 }}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                                    <Text className="text-white text-[16px] font-extrabold ml-2">
                                        Save Changes
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
}