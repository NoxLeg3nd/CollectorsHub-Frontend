import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export const CATEGORIES = [
    "Trading Cards",
    "Comics",
    "Vinyl Records",
    "Stamps",
    "Coins & Banknotes",
    "Figurines & Statues",
    "Action Figures",
    "Funko Pops",
    "Sports Memorabilia",
    "Video Games",
    "Consoles",
    "Books & Manuscripts",
    "Watches",
    "Sneakers",
    "Clothing & Apparel",
    "Jewelry",
    "Posters & Artwork",
    "Photographs",
    "Fossils & Minerals",
    "Toys & Models",
    "Antiques & Furniture",
    "Movie & TV Memorabilia",
    "Musical Instruments",
    "Other",
];

export function CategoryPicker({ value, onChange }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <TouchableOpacity
                onPress={() => setOpen(true)}
                className="flex-row items-center justify-between border-b border-white pb-1"
                activeOpacity={0.7}
            >
                <Text
                    className={`text-[15px] ${value ? "text-white" : "text-white/25"}`}
                >
                    {value || "Select a category…"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#ef4444" />
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="slide">
                <View className="flex-1 justify-end bg-black/70">
                    <View className="bg-zinc-950 border-t border-white rounded-t-2xl">
                        <View className="flex-row items-center justify-between px-4 py-4 border-b border-white">
                            <Text className="text-red-500 text-[13px] font-bold uppercase">
                                Select Category
                            </Text>
                            <TouchableOpacity onPress={() => setOpen(false)}>
                                <Ionicons name="close" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={CATEGORIES}
                            keyExtractor={(item) => item}
                            style={{ maxHeight: 400 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => { onChange(item); setOpen(false); }}
                                    className={`flex-row items-center justify-between px-5 py-4 border-b border-white/10 ${value === item ? "bg-red-500/10" : ""}`}
                                    activeOpacity={0.7}
                                >
                                    <Text className={`text-[15px] ${value === item ? "text-red-400 font-bold" : "text-white"}`}>
                                        {item}
                                    </Text>
                                    {value === item && (
                                        <Ionicons name="checkmark" size={18} color="#ef4444" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                        <View className="h-6" />
                    </View>
                </View>
            </Modal>
        </>
    );
}