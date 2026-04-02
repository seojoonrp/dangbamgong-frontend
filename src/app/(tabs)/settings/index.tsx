import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Colors } from "../../../constants/colors";
import TabHeader from "../../../components/navigation/TabHeader";
import SettingsIcon from "../../../../assets/icons/header/settings.svg";
import { Layout } from "../../../constants/layout";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useAuth } from "../../../lib/AuthContext";
import { withdraw } from "../../../api/services/auth";
import { deleteDeviceToken } from "../../../api/services/devices";

import ProfileIcon from "../../../../assets/icons/settings/profile.svg";
import PushIcon from "../../../../assets/icons/settings/push.svg";
import BlockIcon from "../../../../assets/icons/settings/block.svg";
import StatDetailIcon from "../../../../assets/icons/settings/stat-detail.svg";
import VersionIcon from "../../../../assets/icons/settings/version.svg";
import WhatIsVoidIcon from "../../../../assets/icons/settings/what-is-void.svg";
import TermsIcon from "../../../../assets/icons/settings/terms.svg";
import CallIcon from "../../../../assets/icons/settings/call.svg";
import LogoutIcon from "../../../../assets/icons/settings/logout.svg";
import WithdrawIcon from "../../../../assets/icons/settings/withdraw.svg";
import ChevronIcon from "../../../../assets/icons/shared/chevron.svg";
import InstaIcon from "../../../../assets/icons/settings/instagram.svg";
import TutorialModal from "../../../components/main/TutorialModal";

type SvgIcon = React.FC<{ color: string; width: number; height: number }>;

type MenuItem = {
  label: string;
  icon: SvgIcon;
  route?: string;
  isDestructive?: boolean;
  onPress?: () => void;
  rightIcon?: SvgIcon;
  rightText?: string;
};

const accountItems: MenuItem[] = [
  { label: "프로필", icon: ProfileIcon, route: "/(tabs)/settings/profile" },
  { label: "푸시 알림 설정", icon: PushIcon, route: "/(tabs)/settings/push" },
  { label: "차단 목록", icon: BlockIcon, route: "/(tabs)/settings/block" },
  {
    label: "세부 공백 통계",
    icon: StatDetailIcon,
    route: "/(tabs)/settings/detail",
  },
];

const TERMS_URL =
  "https://pushy-billboard-69f.notion.site/319feaa4f65880828bffeb89b933d543";

type SectionConfig = {
  title: string;
  items: MenuItem[];
  indicatorColor: string;
};

function MenuSection({ title, items, indicatorColor }: SectionConfig) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.itemsContainer}>
        <View
          style={[styles.sideIndicator, { backgroundColor: indicatorColor }]}
        />
        {items.map((item, index) => (
          <Pressable
            key={item.label}
            style={styles.menuItem}
            onPress={() => {
              if (item.onPress) item.onPress();
              else if (item.route) router.push(item.route as any);
            }}
          >
            <View style={styles.iconContainer}>
              <item.icon
                width={16}
                height={16}
                color={item.isDestructive ? Colors.point.coral : Colors.white}
              />
            </View>
            <Text
              style={[
                styles.menuLabel,
                item.isDestructive && styles.destructiveLabel,
              ]}
            >
              {item.label}
            </Text>
            {item.rightIcon && (
              <item.rightIcon
                width={14}
                height={14}
                color={Colors.text.light}
              />
            )}
            {item.rightText && (
              <Text style={styles.rightText}>{item.rightText}</Text>
            )}
            {(item.route || item.onPress) && !item.rightText && (
              <View style={{ transform: [{ rotate: "180deg" }] }}>
                <ChevronIcon width={12} height={12} color={Colors.text.light} />
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { logout } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);

  const appItems: MenuItem[] = [
    { label: "앱 버전", icon: VersionIcon, rightText: "v1.0.0" },
    {
      label: "공백이 뭔가요?",
      icon: WhatIsVoidIcon,
      onPress: () => setShowTutorial(true),
    },
    {
      label: "서비스 이용 약관",
      icon: TermsIcon,
      onPress: () => {
        WebBrowser.openBrowserAsync(TERMS_URL);
      },
    },
    {
      label: "문의하기",
      icon: CallIcon,
      rightIcon: InstaIcon,
      rightText: "dangbamgong_official",
    },
  ];

  const handleLogout = () => {
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/landing");
        },
      },
    ]);
  };

  const handleWithdraw = () => {
    Alert.alert(
      "회원 탈퇴",
      "정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "최종 확인",
              "모든 데이터가 삭제됩니다. 계속하시겠습니까?",
              [
                { text: "취소", style: "cancel" },
                {
                  text: "탈퇴하기",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      // 디바이스 토큰 먼저 삭제 (인증 유효한 상태에서)
                      try {
                        if (Device.isDevice) {
                          const pushToken =
                            await Notifications.getExpoPushTokenAsync();
                          await deleteDeviceToken(pushToken.data);
                        }
                      } catch {
                        // 디바이스 토큰 삭제 실패해도 탈퇴 진행
                      }
                      await withdraw();
                      await logout({ skipDeviceToken: true });
                      router.replace("/(auth)/landing");
                    } catch {
                      Alert.alert("오류", "탈퇴 처리에 실패했습니다.");
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const otherItems: MenuItem[] = [
    {
      label: "로그아웃",
      icon: LogoutIcon,
      isDestructive: true,
      onPress: handleLogout,
    },
    {
      label: "회원 탈퇴",
      icon: WithdrawIcon,
      isDestructive: true,
      onPress: handleWithdraw,
    },
  ];

  const sections: SectionConfig[] = [
    {
      title: "계정 정보",
      items: accountItems,
      indicatorColor: Colors.white,
    },
    {
      title: "앱 정보",
      items: appItems,
      indicatorColor: Colors.white,
    },
    {
      title: "기타",
      items: otherItems,
      indicatorColor: Colors.point.coral,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TabHeader icon={SettingsIcon} title="Settings" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section) => (
          <MenuSection key={section.title} {...section} />
        ))}
      </ScrollView>
      <TutorialModal
        visible={showTutorial}
        onComplete={() => setShowTutorial(false)}
        initialStep={1}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black.dark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    color: "rgba(250, 250, 250, 0.4)",
    fontSize: 12,
    fontFamily: "A2Z-Regular",
    marginBottom: 8,
    paddingLeft: 24,
  },
  itemsContainer: {
    paddingLeft: 14,
    gap: 3.2,
  },
  sideIndicator: {
    position: "absolute",
    left: -19.2,
    top: 0,
    bottom: 0,
    width: 22.2,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: "rgba(41, 40, 45, 0.7)",
    paddingLeft: 18,
    paddingRight: 18,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  iconContainer: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    color: Colors.white,
    fontSize: 12.5,
    fontFamily: "A2Z-Regular",
    flex: 1,
    marginLeft: 8,
  },
  destructiveLabel: {
    color: Colors.point.coral,
  },
  rightText: {
    color: Colors.text.light,
    fontSize: 12,
    fontFamily: "A2Z-Regular",
    marginLeft: 2,
  },
});
