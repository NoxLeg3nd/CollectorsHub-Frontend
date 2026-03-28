import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ToastAndroid,
    KeyboardAvoidingView,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { router } from "expo-router";
import { useUser } from "../../src/context/UserContext";
import api from "../../src/services/api";

function FormField({ icon, label, children }) {
    return (
        <View className="p-4 border-b border-white">
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

function FormInput({ value, onChangeText, placeholder, keyboardType, multiline, numberOfLines }) {
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
            numberOfLines={numberOfLines}
        />
    );
}

export default function AddProduct() {
    const { user } = useUser();

    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [collection, setCollection] = useState("");
    const [manufactureYear, setManufactureYear] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleAddProduct() {
        if (!name.trim() || !category.trim() || !collection.trim() || !description.trim()) {
            ToastAndroid.show("Please fill in all required fields!", ToastAndroid.SHORT);
            return;
        }
        const year = parseInt(manufactureYear, 10);
        if (!manufactureYear || isNaN(year) || year < 1 || year > new Date().getFullYear()) {
            ToastAndroid.show("Please enter a valid manufacture year!", ToastAndroid.SHORT);
            return;
        }

        setLoading(true);
        try {
            await api.post("/api/v1/addProduct", {
                productName: name.trim(),
                productDescription: description.trim(),
                productImage: image.trim() || null,
                productCollection: collection.trim(),
                productCategory: category.trim(),
                manufactureYear: year,
                userId: user.id,
            });
            ToastAndroid.show("Product added to your collection!", ToastAndroid.SHORT);
            router.back();
        } catch (error) {
            console.error("Add product error:", error);
            ToastAndroid.show("Failed to add product. Please try again.", ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar style="light" />
            <KeyboardAvoidingView className="flex-1" behavior="padding" keyboardVerticalOffset={0}>
                <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-white">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back" size={22} color="#ef4444" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-red-500 text-[13px] font-bold uppercase">
                            My Collection
                        </Text>
                        <Text className="text-white text-[22px] font-extrabold">
                            Add New Item
                        </Text>
                    </View>
                    <View className="bg-zinc-900 border border-white rounded-full p-2">
                        <Ionicons name="cube-outline" size={22} color="#ef4444" />
                    </View>
                </View>

                <ScrollView
                    className="flex-1"
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 32 }}
                >
                    <View className="mx-4 mt-6 mb-4">
                        <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">
                            Item Details
                        </Text>
                        <View className="rounded-xl border border-white bg-black overflow-hidden">
                            <FormField icon="cube-outline" label="Name *">
                                <FormInput
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="e.g. Charizard Holo 1st Edition"
                                />
                            </FormField>

                            <FormField icon="pricetag-outline" label="Category *">
                                <FormInput
                                    value={category}
                                    onChangeText={setCategory}
                                    placeholder="e.g. Trading Card, Figurine, Stamp…"
                                />
                            </FormField>

                            <FormField icon="library-outline" label="Collection *">
                                <FormInput
                                    value={collection}
                                    onChangeText={setCollection}
                                    placeholder="e.g. Pokémon Base Set"
                                />
                            </FormField>

                            <FormField icon="calendar-outline" label="Manufacture Year *">
                                <FormInput
                                    value={manufactureYear}
                                    onChangeText={setManufactureYear}
                                    placeholder={`e.g. ${new Date().getFullYear()}`}
                                    keyboardType="numeric"
                                />
                            </FormField>

                            <FormField icon="image-outline" label="Image URL (optional)">
                                <FormInput
                                    value={image}
                                    onChangeText={setImage}
                                    placeholder="https://example.com/image.jpg"
                                    keyboardType="url"
                                />
                            </FormField>

                            <View className="p-4">
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="document-text-outline" size={16} color="#ef4444" />
                                    <Text className="text-slate-400 text-[12px] ml-2 uppercase font-bold">
                                        Description *
                                    </Text>
                                </View>
                                <TextInput
                                    className="text-white text-[15px] border-b border-white pb-1"
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Describe your item…"
                                    placeholderTextColor="#ffffff40"
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    style={{ minHeight: 80 }}
                                />
                            </View>
                        </View>
                    </View>

                    <View className="mx-4 mb-4">
                        <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">
                            Actions
                        </Text>
                        <View className="rounded-xl border border-white bg-black overflow-hidden">
                            <TouchableOpacity
                                className="flex-row items-center p-4 border-b border-white"
                                onPress={handleAddProduct}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#ef4444" size={20} />
                                ) : (
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#ef4444" />
                                )}
                                <Text className="text-white text-[16px] ml-3">
                                    {loading ? "Saving…" : "Save to Collection"}
                                </Text>
                                {!loading && (
                                    <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color="#ffffff40"
                                        style={{ marginLeft: "auto" }}
                                    />
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-row items-center p-4"
                                onPress={() => router.back()}
                                disabled={loading}
                            >
                                <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
                                <Text className="text-red-500 text-[16px] ml-3 font-semibold">
                                    Cancel
                                </Text>
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color="#ffffff40"
                                    style={{ marginLeft: "auto" }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}