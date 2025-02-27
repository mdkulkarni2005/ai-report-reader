import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Dimensions, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

const { width } = Dimensions.get('window');

export default function DisclaimerScreen() {
  const router = useRouter();
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start();
  }, []);
  
  const handleContinue = () => {
    router.push('/(tabs)');
  };
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Animated.View style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          <View style={styles.logoCircle}>
            <FontAwesome name="eye" size={50} color="#ffffff" />
          </View>
          <ThemedText style={styles.appName}>AI Report Reader</ThemedText>
          <ThemedText style={styles.tagline}>Analyze images with advanced AI</ThemedText>
        </Animated.View>
        
        <Animated.View style={[
          styles.contentBox,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          <ThemedText style={styles.title}>Welcome</ThemedText>
          
          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <FontAwesome name="image" size={24} color="#4285F4" />
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>Image Analysis</ThemedText>
              <ThemedText style={styles.featureText}>
                Upload photos or take pictures to get detailed AI-powered analysis of content
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <FontAwesome name="volume-up" size={24} color="#FBBC05" />
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>Voice Feedback</ThemedText>
              <ThemedText style={styles.featureText}>
                Hear analysis results read aloud in multiple languages
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <FontAwesome name="language" size={24} color="#34A853" />
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>Multilingual Support</ThemedText>
              <ThemedText style={styles.featureText}>
                Get responses in Hindi, Marathi, and other languages
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <ThemedText style={styles.disclaimerTitle}>Important Information</ThemedText>
          <ThemedText style={styles.disclaimerText}>
            • This app uses advanced AI to analyze images and text
          </ThemedText>
          <ThemedText style={styles.disclaimerText}>
            • Results may not always be accurate - verify important information
          </ThemedText>
          <ThemedText style={styles.disclaimerText}>
            • Your data is processed securely but not permanently stored
          </ThemedText>
          <ThemedText style={styles.disclaimerText}>
            • History is saved locally on your device only
          </ThemedText>
          
          <ThemedText style={styles.creatorText}>
            Created by <ThemedText style={styles.creatorName}>MANAS KULKARNI</ThemedText>
          </ThemedText>
        </Animated.View>
        
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.continueButtonText}>Get Started</ThemedText>
            <FontAwesome name="arrow-right" size={20} color="white" style={styles.buttonIcon} />
          </TouchableOpacity>
        </Animated.View>
        
        <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  contentBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: 'white',
    textAlign: 'center',
  },
  feature: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.8)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: '100%',
    marginVertical: 24,
  },
  disclaimerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  creatorText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  creatorName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: 'bold',
    fontStyle: 'normal',
  },
  continueButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    width: width * 0.8,
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
});