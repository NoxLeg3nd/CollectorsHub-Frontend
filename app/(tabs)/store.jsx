import { View, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function Store() {
    return(    
        <SafeAreaView className="flex-1 bg-black">
            <View className="flex-1 items-center justify-center">
                <Text className="text-white text-3xl font-bold">Store</Text>
            </View>
        </SafeAreaView>
    );
}