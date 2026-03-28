import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import api from "../../src/services/api";

function InputField({ label, icon, value, onChangeText, placeholder, keyboardType = "default", multiline = false }) {
    return (
        <View className="mx-4 mt-3">
            <View className="flex-row items-center mb-1.5">
                <Ionicons name={icon} size={13} color="#ef4444" />
                <Text className="text-red-500 text-[13px] font-semibold ml-1 uppercase tracking-widest">
                    {label}
                </Text>
            </View>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#52525b"
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}
                className="bg-zinc-900 border border-white rounded-xl px-4 text-white text-[13px]"
                style={{
                    paddingVertical: 12,
                    textAlignVertical: multiline ? "top" : "center",
                    minHeight: multiline ? 100 : undefined,
                }}
            />
        </View>
    );
}

export default function EditProduct() {
    const { id } = useLocalSearchParams();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [collection, setCollection] = useState("");
    const [manufactureYear, setManufactureYear] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await api.get("/api/v1/getProductById", {
                    params: { id },
                });
                const p = response.data;
                setName(p.name ?? "");
                setCategory(p.category ?? "");
                setCollection(p.collection ?? "");
                setManufactureYear(p.manufactureYear?.toString() ?? "");
                setDescription(p.description ?? "");
                setImage(p.image ?? "");
            } catch (err) {
                console.error("Failed to fetch product:", err);
                setError("Could not load product. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    const handleSave = async () => {
        if (!name.trim()) {
            setError("Product name is required.");
            return;
        }

        try {
            setSaving(true);
            setError(null);
            await api.put("/api/v1/editProduct", {
                newProductName: name.trim(),
                newProductCategory: category.trim(),
                newProductCollection: collection.trim(),
                newManufactureYear: manufactureYear ? parseInt(manufactureYear) : null,
                newProductDescription: description.trim(),
                newProductImage: image.trim(),
            }, {
                params: { id },
            });
            router.back();
        } catch (err) {
            console.error("Failed to update product:", err);
            setError("Could not save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            setError(null);
            await api.delete("/api/v1/removeProduct", {
                params: { id },
            });
            router.back();
            router.back();
        } catch (err) {
            console.error("Failed to delete product:", err);
            setError("Could not delete product. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

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
                        Edit Item
                    </Text>
                    <Text className="text-white text-[22px] font-extrabold" numberOfLines={1}>
                        {name || "Loading..."}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={handleDelete}
                    disabled={deleting}
                    className="ml-2 flex-row items-center bg-zinc-900 border border-red-500 rounded-lg px-3 py-1.5"
                >
                    {deleting ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                    ) : (
                        <>
                            <Ionicons name="trash-outline" size={14} color="#ef4444" />
                            <Text className="text-red-500 text-[13px] font-semibold ml-1">
                                Delete
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className="ml-2 flex-row items-center bg-red-500 border border-white rounded-lg px-3 py-1.5"
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-outline" size={14} color="#fff" />
                            <Text className="text-white text-[13px] font-semibold ml-1">
                                Save
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {loading && (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#ef4444" size="large" />
                </View>
            )}

            {error && (
                <View className="mx-4 mt-3 p-3 bg-red-500/20 border border-red-500 rounded-xl flex-row items-center">
                    <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />
                    <Text className="text-red-400 text-[13px] ml-2 flex-1">{error}</Text>
                    <TouchableOpacity onPress={() => setError(null)}>
                        <Ionicons name="close" size={18} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            )}

            {!loading && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <ScrollView
                        contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <InputField
                            label="Name"
                            icon="cube-outline"
                            value={name}
                            onChangeText={setName}
                            placeholder="Product name"
                        />
                        <InputField
                            label="Category"
                            icon="pricetag-outline"
                            value={category}
                            onChangeText={setCategory}
                            placeholder="e.g. Sneakers, Watches..."
                        />
                        <InputField
                            label="Collection"
                            icon="library-outline"
                            value={collection}
                            onChangeText={setCollection}
                            placeholder="e.g. Summer 2024"
                        />
                        <InputField
                            label="Manufacture Year"
                            icon="calendar-outline"
                            value={manufactureYear}
                            onChangeText={setManufactureYear}
                            placeholder="e.g. 2023"
                            keyboardType="numeric"
                        />
                        <InputField
                            label="Image URL"
                            icon="image-outline"
                            value={image}
                            onChangeText={setImage}
                            placeholder="https://..."
                        />
                        <InputField
                            label="Description"
                            icon="document-text-outline"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe your item..."
                            multiline
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
}