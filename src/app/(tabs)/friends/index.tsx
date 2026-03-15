import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/colors";
import { useState } from "react";

type FriendTab = "list" | "received" | "sent";

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<FriendTab>("list");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>친구</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/(tabs)/friends/search")}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {(
          [
            { key: "list", label: "친구 목록" },
            { key: "received", label: "받은 요청" },
            { key: "sent", label: "보낸 요청" },
          ] as const
        ).map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.content}>
        <Text style={styles.placeholder}>
          {activeTab === "list" && "친구 목록"}
          {activeTab === "received" && "받은 요청 목록"}
          {activeTab === "sent" && "보낸 요청 목록"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black.dark,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white,
  },
  addButton: {
    position: "absolute",
    right: 16,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.black.light,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.point.coral,
  },
  tabText: {
    color: Colors.text.mid,
    fontSize: 14,
  },
  activeTabText: {
    color: Colors.white,
    fontWeight: "600",
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
