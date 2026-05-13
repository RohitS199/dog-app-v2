import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { FloatingTabBar } from '../../src/components/ui/FloatingTabBar';
import { ArticleExpandOverlay } from '../../src/components/ui/ArticleExpandOverlay';
import { useUserAchievementsStore } from '../../src/stores/userAchievementsStore';

export default function TabsLayout() {
  // Post-auth fetch + cold-launch seasonal check (once per app process).
  // The store has an internal idempotency guard so re-mounts do not
  // duplicate the seasonal Edge Function invocation.
  useEffect(() => {
    const ach = useUserAchievementsStore.getState();
    ach.fetch();
    ach.checkSeasonal();
  }, []);

  return (
    <>
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="health" />
        <Tabs.Screen name="learn" />
        <Tabs.Screen
          name="triage"
          options={{ href: null }}
        />
        <Tabs.Screen name="profile" />
      </Tabs>
      <ArticleExpandOverlay />
    </>
  );
}
