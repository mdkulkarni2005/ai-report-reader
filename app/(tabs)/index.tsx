import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Modal, View, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@/config/apiKeys';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAnalyzer } from '@/context/AnalyzerContext';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Language options
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const { history, addToHistory } = useAnalyzer();

  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      // Request camera roll permission
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
      }
      
      // Request camera permission
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera permissions to make this work!');
      }
    })();
  }, []);

  // Clean text for speech
  const cleanTextForSpeech = (text) => {
    // Remove markdown formatting, asterisks, etc.
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold text
      .replace(/\*(.*?)\*/g, '$1')     // Italic text
      .replace(/```(.*?)```/gs, '$1')  // Code blocks
      .replace(/`(.*?)`/g, '$1')       // Inline code
      .replace(/#+ /g, '')             // Headers
      .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Links
  };

  // Pick image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Take a photo with camera
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  
  // Handle text input function
  const handleTextInputFocus = () => {
    // Placeholder for future voice feature
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Alert.alert(
        "Voice Input", 
        "Voice input feature has been disabled.",
        [{ text: "OK" }]
      );
    }
  };
  
  // Navigate to disclaimer screen
  const openDisclaimer = () => {
    router.push('/disclaimer');
  };

  // Speak text in selected language
  const speakText = (text) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const cleanedText = cleanTextForSpeech(text);
    setIsSpeaking(true);
    
    // For debugging
    console.log(`Speaking in language: ${selectedLanguage.code}`);
    
    Speech.speak(cleanedText, {
      language: selectedLanguage.code,
      pitch: 1.0,
      rate: 0.9,
      onDone: () => setIsSpeaking(false),
      onError: (error) => {
        console.error("Speech error:", error);
        setIsSpeaking(false);
      },
    });
  };

  // Analyze with Gemini
  const analyzeWithGemini = async () => {
    if (!image && !textInput) {
      alert('Please select an image or enter text');
      return;
    }

    setIsLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      let prompt = "Analyze what's in this image and provide a detailed description.";
      
      if (textInput) {
        prompt = textInput;
      }

      // Add language instruction if not English
      if (selectedLanguage.code !== 'en') {
        prompt += `\nPlease respond in ${selectedLanguage.name} language.`;
      }

      // For history context
      if (history.length > 0) {
        prompt += "\nContext from our conversation: " + 
          history.map(item => `Q: ${item.prompt}\nA: ${item.response}`).join("\n");
      }
      
      let content = [];
      
      // Add text prompt
      content.push({ text: prompt });
      
      // Add image if available
      if (image) {
        const base64 = await FileSystem.readAsStringAsync(image, { 
          encoding: FileSystem.EncodingType.Base64 
        });
        
        content.push({
          inlineData: {
            data: base64,
            mimeType: "image/jpeg"
          }
        });
      }

      const result = await model.generateContent({
        contents: [{ role: "user", parts: content }]
      });
      const response = result.response.text();
      
      setResult(response);
      addToHistory({ prompt, response });
      
      // Automatically speak the result in selected language
      speakText(response);
    } catch (error) {
      console.error(error);
      setResult("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.appTitle}>AI Report Reader</ThemedText>
        <ThemedText style={styles.appSubtitle}>Analyze images with AI</ThemedText>
        <TouchableOpacity style={styles.disclaimerButton} onPress={openDisclaimer}>
          <FontAwesome name="info-circle" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <ThemedView style={styles.content}>
        <ThemedView style={styles.card}>
          <ThemedView style={styles.imageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholderContainer}>
                <View style={styles.imagePlaceholderIcon}>
                  <ThemedText style={styles.imagePlaceholderIconText}>📷</ThemedText>
                </View>
                <ThemedText style={styles.imagePlaceholder}>Select or capture an image</ThemedText>
              </View>
            )}
          </ThemedView>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
              <View style={styles.iconCircle}>
                <ThemedText style={styles.iconText}>🖼️</ThemedText>
              </View>
              <ThemedText style={styles.buttonText}>Gallery</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconButton} onPress={takePhoto}>
              <View style={styles.iconCircle}>
                <ThemedText style={styles.iconText}>📸</ThemedText>
              </View>
              <ThemedText style={styles.buttonText}>Camera</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
        
        <ThemedView style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Ask a question</ThemedText>
            <TouchableOpacity 
              style={styles.languageSelector}
              onPress={() => setShowLanguageModal(true)}
            >
              <ThemedText style={styles.languageSelectorText}>
                {selectedLanguage.flag} {selectedLanguage.name}
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="What would you like to know about this image?"
              placeholderTextColor="#999"
              value={textInput}
              onChangeText={setTextInput}
              multiline
            />
            <TouchableOpacity 
              style={styles.micButton}
              onPress={handleTextInputFocus}
            >
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.analyzeButton, isLoading && styles.disabledButton]}
            onPress={analyzeWithGemini}
            disabled={isLoading}
          >
            <ThemedText style={styles.analyzeButtonText}>
              {isLoading ? "Analyzing..." : "Analyze Image"}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        {result ? (
          <ThemedView style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <ThemedText style={styles.resultTitle}>Gemini's Response</ThemedText>
              <TouchableOpacity 
                style={[styles.speakButton, isSpeaking && styles.speakingButton]} 
                onPress={() => speakText(result)}
              >
                <ThemedText style={[styles.speakButtonText, isSpeaking && styles.speakingButtonText]}>
                  {isSpeaking ? "◼ Stop" : "▶ Speak"}
                </ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.resultDivider} />
            <ThemedText style={styles.resultText}>{result}</ThemedText>
          </ThemedView>
        ) : null}
      </ThemedView>
      
      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Select Language</ThemedText>
            <View style={styles.modalDivider} />
            
            {LANGUAGES.map(lang => (
              <TouchableOpacity 
                key={lang.code}
                style={[
                  styles.languageOption,
                  selectedLanguage.code === lang.code && styles.selectedLanguage
                ]}
                onPress={() => {
                  setSelectedLanguage(lang);
                  setShowLanguageModal(false);
                }}
              >
                <ThemedText style={styles.languageFlag}>{lang.flag}</ThemedText>
                <ThemedText 
                  style={[
                    styles.languageText,
                    selectedLanguage.code === lang.code && styles.selectedLanguageText
                  ]}
                >
                  {lang.name}
                </ThemedText>
                {selectedLanguage.code === lang.code && (
                  <View style={styles.checkmark}>
                    <ThemedText>✓</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <ThemedText style={styles.closeButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#4285F4',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    position: 'relative',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 10,
  },
  disclaimerButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imagePlaceholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  imagePlaceholderIconText: {
    fontSize: 30,
  },
  imagePlaceholder: {
    color: '#999',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f3f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  iconText: {
    fontSize: 30,
  },
  buttonText: {
    fontWeight: '600',
    color: '#444',
    fontSize: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  languageSelector: {
    backgroundColor: '#f1f3f5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  languageSelectorText: {
    fontWeight: '600',
    color: '#555',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    paddingRight: 50, // Space for microphone button
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: 'white',
    color: '#333',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  micButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  listeningButton: {
    backgroundColor: '#feeae6',
    borderColor: '#ffccc7',
  },
  micButtonText: {
    fontSize: 20,
  },
  analyzeButton: {
    backgroundColor: '#34A853',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  analyzeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#aad0b5',
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  speakButton: {
    backgroundColor: '#f1f3f5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  speakButtonText: {
    color: '#4285F4',
    fontWeight: 'bold',
    fontSize: 14,
  },
  speakingButton: {
    backgroundColor: '#feeae6',
    borderColor: '#ffccc7',
  },
  speakingButtonText: {
    color: '#ea4335',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
    width: '100%',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  selectedLanguage: {
    backgroundColor: '#e8f0fe',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedLanguageText: {
    fontWeight: 'bold',
    color: '#4285F4',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f1f3f5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: '100%',
  },
  closeButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
});