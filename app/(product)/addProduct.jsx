import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ToastAndroid,
    KeyboardAvoidingView,
    ActivityIndicator,
    Image,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "../../src/context/UserContext";
import api from "../../src/services/api";
import { uploadImageToCloudinary } from "../../src/services/cloudinary";

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

export default function AddProduct() {
    const { user } = useUser();

    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [collection, setCollection] = useState("");
    const [manufactureYear, setManufactureYear] = useState("");
    const [description, setDescription] = useState("");
    const [localImageUri, setLocalImageUri] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [saving, setSaving] = useState(false);

    async function pickImage() {
        if (Platform.OS !== "web") {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                ToastAndroid.show(
                    "Gallery permission is required to pick a photo.",
                    ToastAndroid.LONG
                );
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
            setUploadedImageUrl(null);
            await uploadImage(uri);
        }
    }

    async function uploadImage(uri) {
        setUploading(true);
        try {
            const url = await uploadImageToCloudinary(uri);
            setUploadedImageUrl(url);
            ToastAndroid.show("Image uploaded successfully!", ToastAndroid.SHORT);
        } catch (err) {
            console.error("Upload error:", err);
            ToastAndroid.show("Image upload failed. You can still save without it.", ToastAndroid.LONG);
            setLocalImageUri(null);
        } finally {
            setUploading(false);
        }
    }

    function removeImage() {
        setLocalImageUri(null);
        setUploadedImageUrl(null);
    }

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
        if (uploading) {
            ToastAndroid.show("Please wait for the image to finish uploading.", ToastAndroid.SHORT);
            return;
        }

        setSaving(true);
        try {
            await api.post("/api/v1/addProduct", {
                productName: name.trim(),
                productDescription: description.trim(),
                productImage: uploadedImageUrl ?? null,
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
            setSaving(false);
        }
    }

    const isBusy = saving || uploading;

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar style="light" />
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={0}
            >
                <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-white">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3" disabled={isBusy}>
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
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    <View className="mx-4 mt-6 mb-4">
                        <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">
                            Item Photo
                        </Text>

                        {localImageUri ? (
                            <View className="rounded-xl overflow-hidden border border-white">
                                <Image
                                    source={{ uri: localImageUri }}
                                    style={{ width: "100%", height: 200 }}
                                    resizeMode="cover"
                                />

                                {uploading && (
                                    <View
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            backgroundColor: "rgba(0,0,0,0.65)",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <ActivityIndicator color="#ef4444" size="large" />
                                        <Text className="text-white font-bold text-base mt-3">
                                            Uploading…
                                        </Text>
                                    </View>
                                )}

                                {!uploading && (
                                    <View className="absolute top-2 right-2 flex-row gap-2">
                                        {uploadedImageUrl && (
                                            <View className="flex-row items-center bg-black/70 border border-green-500 rounded-full px-2 py-1">
                                                <Ionicons name="cloud-done-outline" size={13} color="#22c55e" />
                                                <Text className="text-green-400 text-[11px] ml-1 font-bold">
                                                    Uploaded
                                                </Text>
                                            </View>
                                        )}
                                        <TouchableOpacity
                                            onPress={removeImage}
                                            className="bg-black/70 border border-white rounded-full p-1.5"
                                        >
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
                                <Text className="text-white font-semibold text-[15px] mt-3">
                                    Choose from Gallery
                                </Text>
                                <Text className="text-slate-500 text-[12px] mt-1">
                                    JPG, PNG or WebP · Optional
                                </Text>
                            </TouchableOpacity>
                        )}

                        {localImageUri && !uploading && (
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

                            <FormField icon="document-text-outline" label="Description *" noBorder>
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
                        <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">
                            Actions
                        </Text>
                        <View className="rounded-xl border border-white bg-black overflow-hidden">
                            <TouchableOpacity
                                className="flex-row items-center p-4 border-b border-white"
                                onPress={handleAddProduct}
                                disabled={isBusy}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#ef4444" size={20} />
                                ) : (
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#ef4444" />
                                )}
                                <Text className="text-white text-[16px] ml-3">
                                    {saving ? "Saving…" : uploading ? "Waiting for upload…" : "Save to Collection"}
                                </Text>
                                {!isBusy && (
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
                                disabled={isBusy}
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