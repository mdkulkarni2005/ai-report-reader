import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { AnalyzerProvider } from '@/context/AnalyzerContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  
  const [firstLaunch, setFirstLaunch] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Check if this is the first launch
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        setFirstLaunch(!hasLaunched);
        setIsLoading(false);
      } catch (e) {
        console.error("Error checking first launch:", e);
        setIsLoading(false);
      }
    };
    
    if (loaded) {
      checkFirstLaunch();
    }
  }, [loaded]);

  // Early return for loading state
  if (!loaded || isLoading) {
    return null;
  }

  return (
    <AnalyzerProvider>
      <Stack initialRouteName="disclaimer">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="disclaimer" options={{ headerShown: false }} />
      </Stack>
    </AnalyzerProvider>
  );
}