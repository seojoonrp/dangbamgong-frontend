import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/colors";
import TabHeader from "../../../components/navigation/TabHeader";
import SettingsIcon from "../../../../assets/icons/header/settings.svg";
import { Layout } from "../../../constants/layout";

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  isDestructive?: boolean;
};

const accountItems: MenuItem[] = [
  { label: "프로필", icon: "person", route: "/(tabs)/settings/profile" },
  {
    label: "푸시 알림 설정",
    icon: "notifications",
    route: "/(tabs)/settings/push",
  },
  {
    label: "차단 목록",
    icon: "ban",
    route: "/(tabs)/settings/block",
  },
  {
    label: "세부 공백 통계",
    icon: "analytics",
    route: "/(tabs)/settings/detail",
  },
];

const appItems: MenuItem[] = [
  { label: "앱 버전 1.0.0", icon: "information-circle" },
  { label: "서비스 이용약관", icon: "document-text" },
  { label: "문의하기 @dangbamgong", icon: "logo-instagram" },
];

const otherItems: MenuItem[] = [
  { label: "로그아웃", icon: "log-out", isDestructive: true },
  { label: "회원 탈퇴", icon: "trash", isDestructive: true },
];

function MenuSection({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item) => (
        <Pressable
          key={item.label}
          style={styles.menuItem}
          onPress={() => item.route && router.push(item.route as any)}
        >
          <Ionicons
            name={item.icon}
            size={20}
            color={item.isDestructive ? Colors.point.coral : Colors.text.light}
          />
          <Text
            style={[
              styles.menuLabel,
              item.isDestructive && styles.destructiveLabel,
            ]}
          >
            {item.label}
          </Text>
          {item.route && (
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.text.dark}
              style={styles.chevron}
            />
          )}
        </Pressable>
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <TabHeader icon={SettingsIcon} title="Settings" />
      <MenuSection title="계정 정보" items={accountItems} />
      <MenuSection title="앱 정보" items={appItems} />
      <MenuSection title="기타" items={otherItems} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black.dark,
    paddingBottom: Layout.bottomTabHeight,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: Colors.text.mid,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  menuLabel: {
    color: Colors.white,
    fontSize: 15,
    flex: 1,
  },
  destructiveLabel: {
    color: Colors.point.coral,
  },
  chevron: {
    marginLeft: "auto",
  },
});
