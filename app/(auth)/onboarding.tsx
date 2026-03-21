import { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";
import { Colors } from "../../constants/colors";

const { width } = Dimensions.get("window");

interface OnboardingStep {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  description: string;
}

const STEPS: OnboardingStep[] = [
  {
    icon: "leaf-outline",
    title: "穏やかに見守る",
    description:
      "MimamoriBridgeは、離れて暮らすご家族の安否を穏やかに確認できるアプリです。GPS追跡は行いません。",
  },
  {
    icon: "sunny-outline",
    title: "毎朝のチェックイン",
    description:
      "見守られる方には毎朝通知が届きます。ボタンをタップするだけで「元気です」を家族に伝えられます。",
  },
  {
    icon: "walk-outline",
    title: "歩数で安心",
    description:
      "HealthKitと連携して歩数を共有。いつもより歩数が少ない日は、さりげなく気づけます。",
  },
  {
    icon: "people-outline",
    title: "家族みんなで",
    description:
      "招待コードで家族をつなげましょう。兄弟姉妹で一緒に親を見守れます。",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState(0);

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const step = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentStep(step);
  }

  function handleNext() {
    if (currentStep < STEPS.length - 1) {
      scrollRef.current?.scrollTo({
        x: (currentStep + 1) * width,
        animated: true,
      });
    } else {
      router.replace("/(auth)/register");
    }
  }

  function handleSkip() {
    router.replace("/(auth)/register");
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={{ flex: 1 }}
      >
        {STEPS.map((step, index) => (
          <View
            key={index}
            style={{
              width,
              justifyContent: "center",
              alignItems: "center",
              padding: 40,
            }}
          >
            <Ionicons name={step.icon} size={80} color={Colors.primary} style={{ marginBottom: 32 }} />
            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: Colors.text,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              {step.title}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: Colors.textSecondary,
                textAlign: "center",
                lineHeight: 26,
                paddingHorizontal: 20,
              }}
            >
              {step.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
          marginBottom: 24,
        }}
      >
        {STEPS.map((_, index) => (
          <View
            key={index}
            style={{
              width: currentStep === index ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                currentStep === index ? Colors.primary : Colors.border,
            }}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={{ padding: 24, paddingBottom: 48, gap: 12 }}>
        <Button
          title={
            currentStep === STEPS.length - 1 ? "はじめる" : "次へ"
          }
          onPress={handleNext}
          size="lg"
        />
        {currentStep < STEPS.length - 1 && (
          <Button
            title="スキップ"
            onPress={handleSkip}
            variant="secondary"
          />
        )}
      </View>
    </View>
  );
}
