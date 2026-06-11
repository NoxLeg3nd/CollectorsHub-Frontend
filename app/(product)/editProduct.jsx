import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    Image,
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import api from "../../src/services/api";
import { uploadImageToCloudinary } from "../../src/services/cloudinary";
import { CategoryPicker } from "../../src/components/categories";

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

export default function EditProduct() {
    const { id } = useLocalSearchParams();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [collection, setCollection] = useState("");
    const [manufactureYear, setManufactureYear] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [localImageUri, setLocalImageUri] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await api.get("/api/v1/getProductById", { params: { id } });
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

    async function pickImage() {
        if (Platform.OS !== "web") {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                setError("Gallery permission is required to pick a photo.");
                return;
            }
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.85,
        });
        if (!result.canceled && result.assets?.length > 0) {
            const uri = result.assets[0].uri;
            setLocalImageUri(uri);
            setUploading(true);
            try {
                const url = await uploadImageToCloudinary(uri);
                setImage(url);
            } catch (err) {
                console.error("Upload error:", err);
                setError("Image upload failed. The previous image will be kept.");
                setLocalImageUri(null);
            } finally {
                setUploading(false);
            }
        }
    }

    function removeImage() {
        setLocalImageUri(null);
        setImage("");
    }

    const handleSave = async () => {
        if (!name.trim()) { setError("Product name is required."); return; }
        try {
            setSaving(true);
            setError(null);
            await api.put("/api/v1/editProduct", {
                newProductName: name.trim(),
                newProductCategory: category,
                newProductCollection: collection.trim(),
                newManufactureYear: manufactureYear ? parseInt(manufactureYear) : null,
                newProductDescription: description.trim() || null,
                newProductImage: image.trim() || null,
            }, { params: { id } });
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
            await api.delete("/api/v1/removeProduct", { params: { id } });
            router.back();
            router.back();
        } catch (err) {
            console.error("Failed to delete product:", err);
            setError("Could not delete product. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    const isBusy = saving || uploading || deleting;

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar style="light" />

            <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-white">
                <TouchableOpacity onPress={() => router.back()} className="mr-3" disabled={isBusy}>
                    <Ionicons name="arrow-back" size={22} color="#ef4444" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-red-500 text-[13px] font-bold uppercase">My Collection</Text>
                    <Text className="text-white text-[22px] font-extrabold" numberOfLines={1}>
                        {name || "Edit Item"}
                    </Text>
                </View>
                <View className="bg-zinc-900 border border-white rounded-full p-2">
                    <Ionicons name="pencil-outline" size={22} color="#ef4444" />
                </View>
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
                <KeyboardAwareScrollView
                    keyboardShouldPersistTaps="handled"
                    enableOnAndroid={true}
                    extraScrollHeight={20}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    <View className="mx-4 mt-6 mb-4">
                        <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">
                            Item Photo
                        </Text>

                        {(localImageUri || image) ? (
                            <View className="rounded-xl overflow-hidden border border-white">
                                <Image
                                    source={{ uri: localImageUri ?? image }}
                                    style={{ width: "100%", height: 200 }}
                                    resizeMode="cover"
                                />
                                {uploading && (
                                    <View style={{
                                        position: "absolute", inset: 0,
                                        backgroundColor: "rgba(0,0,0,0.65)",
                                        alignItems: "center", justifyContent: "center",
                                    }}>
                                        <ActivityIndicator color="#ef4444" size="large" />
                                        <Text className="text-white font-bold text-base mt-3">Uploading…</Text>
                                    </View>
                                )}
                                {!uploading && (
                                    <View className="absolute top-2 right-2 flex-row gap-2">
                                        <TouchableOpacity
                                            onPress={pickImage}
                                            className="bg-black/70 border border-white rounded-full px-2 py-1 flex-row items-center"
                                        >
                                            <Ionicons name="refresh-outline" size={13} color="#fff" />
                                            <Text className="text-white text-[11px] ml-1">Change</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={removeImage} className="bg-black/70 border border-white rounded-full p-1.5">
                                            <Ionicons name="close" size={14} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={pickImage}
                                className="border border-dashed border-white rounded-xl items-center justify-center py-10"
                                style={{ borderStyle: "dashed" }}
                            >
                                <Ionicons name="image-outline" size={44} color="#ef4444" />
                                <Text className="text-white font-semibold text-[15px] mt-3">Choose from Gallery</Text>
                                <Text className="text-slate-500 text-[12px] mt-1">JPG, PNG or WebP · Optional</Text>
                            </TouchableOpacity>
                        )}

                        {(localImageUri || image) && !uploading && (
                            <TouchableOpacity
                                onPress={pickImage}
                                className="mt-2 flex-row items-center justify-center py-2 border border-white rounded-xl"
                            >
                                <Ionicons name="refresh-outline" size={15} color="#ef4444" />
                                <Text className="text-white text-[13px] ml-2">Change Photo</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="mx-4 mb-4">
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
                                <CategoryPicker value={category} onChange={setCategory} />
                            </FormField>

                            <FormField icon="library-outline" label="Collection *">
                                <FormInput
                                    value={collection}
                                    onChangeText={setCollection}
                                    placeholder="e.g. Pokémon Base Set"
                                />
                            </FormField>

                            <FormField icon="calendar-outline" label="Manufacture Year">
                                <FormInput
                                    value={manufactureYear}
                                    onChangeText={setManufactureYear}
                                    placeholder={`e.g. ${new Date().getFullYear()}`}
                                    keyboardType="numeric"
                                />
                            </FormField>

                            <FormField icon="document-text-outline" label="Description (optional)" noBorder>
                                <FormInput
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Describe your item…"
                                    multiline
                                    style={{ minHeight: 80 }}
                                />
                            </FormField>
                        </View>
                    </View>

                    <View className="mx-4 mb-4">
                        <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">Actions</Text>
                        <View className="rounded-xl border border-white bg-black overflow-hidden">
                            <TouchableOpacity
                                className="flex-row items-center p-4 border-b border-white"
                                onPress={handleSave}
                                disabled={isBusy}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#ef4444" size={20} />
                                ) : (
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#ef4444" />
                                )}
                                <Text className="text-white text-[16px] ml-3">
                                    {saving ? "Saving…" : uploading ? "Waiting for upload…" : "Save Changes"}
                                </Text>
                                {!isBusy && (
                                    <Ionicons name="chevron-forward" size={20} color="#ffffff40" style={{ marginLeft: "auto" }} />
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center p-4 border-b border-white"
                                onPress={() => router.back()}
                                disabled={isBusy}
                            >
                                <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
                                <Text className="text-red-500 text-[16px] ml-3 font-semibold">Cancel</Text>
                                <Ionicons name="chevron-forward" size={20} color="#ffffff40" style={{ marginLeft: "auto" }} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center p-4"
                                onPress={handleDelete}
                                disabled={isBusy}
                            >
                                {deleting ? (
                                    <ActivityIndicator color="#ef4444" size={20} />
                                ) : (
                                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                )}
                                <Text className="text-red-500 text-[16px] ml-3 font-semibold">
                                    {deleting ? "Deleting…" : "Delete Product"}
                                </Text>
                                {!isBusy && (
                                    <Ionicons name="chevron-forward" size={20} color="#ffffff40" style={{ marginLeft: "auto" }} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            )}
        </SafeAreaView>
    );
}