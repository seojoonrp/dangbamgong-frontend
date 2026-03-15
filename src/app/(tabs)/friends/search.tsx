import { View, Text, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/colors";
import ScreenHeader from "../../../components/navigation/ScreenHeader";

export default function FriendSearchScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="친구 추가" />
      <TextInput
        style={styles.searchInput}
        placeholder="태그로 친구를 검색하세요..."
        placeholderTextColor={Colors.text.mid}
      />
      <Text style={styles.hint}>
        태그는 [설정] &gt; [프로필]에서 확인할 수 있습니다
      </Text>
      <View style={styles.content}>
        <Text style={styles.placeholder}>검색 결과 영역</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black.dark,
    paddingHorizontal: 16,
  },
  searchInput: {
    height: 44,
    backgroundColor: Colors.black.mid,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: Colors.white,
    fontSize: 15,
    marginTop: 12,
  },
  hint: {
    color: Colors.text.mid,
    fontSize: 12,
    marginTop: 8,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    color: Colors.text.light,
    fontSize: 16,
  },
});
