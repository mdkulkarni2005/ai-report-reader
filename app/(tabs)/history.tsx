import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Image } from 'react-native';
import * as Speech from 'expo-speech';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAnalyzer } from '@/context/AnalyzerContext';

export default function HistoryScreen() {
  const { history } = useAnalyzer();
  const [speakingId, setSpeakingId] = React.useState(null);
  
  // Clean text for speech
  const cleanTextForSpeech = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') 
      .replace(/\*(.*?)\*/g, '$1')     
      .replace(/```(.*?)```/gs, '$1')  
      .replace(/`(.*?)`/g, '$1')       
      .replace(/#+ /g, '')             
      .replace(/\[(.*?)\]\(.*?\)/g, '$1');
  };
  
  // Get language code from response text
  const detectLanguage = (text) => {
    // Simple language detection based on common characters/words
    if (/[हिंदी|भारत]/.test(text)) return 'hi'; // Hindi
    if (/[मराठी]/.test(text)) return 'mr'; // Marathi
    if (/[こんにちは|ありがとう|日本]/.test(text)) return 'ja'; // Japanese
    if (/[ñ|hola|gracias|españa]/.test(text)) return 'es'; // Spanish
    if (/[ç|é|à|français|bonjour|merci]/.test(text)) return 'fr'; // French
    if (/[ä|ö|ü|ß|deutsch|guten]/.test(text)) return 'de'; // German
    return 'en'; // Default to English
  };

  const speakText = (text, id) => {
    if (speakingId) {
      Speech.stop();
      if (speakingId === id) {
        setSpeakingId(null);
        return;
      }
    }
    
    const cleanedText = cleanTextForSpeech(text);
    setSpeakingId(id);
    
    // Detect language from text
    const languageCode = detectLanguage(cleanedText);
    
    Speech.speak(cleanedText, {
      language: languageCode,
      pitch: 1.0,
      rate: 0.9,
      onDone: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Conversation History</ThemedText>
        <ThemedText style={styles.subtitle}>Your AI analysis conversations</ThemedText>
      </View>
      
      {history.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <ThemedText style={styles.emptyIcon}>💬</ThemedText>
          </View>
          <ThemedText style={styles.emptyText}>No conversations yet</ThemedText>
          <ThemedText style={styles.emptySubText}>
            Start analyzing images to build your history
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.historyCard}>
              <View style={styles.userSection}>
                <View style={styles.avatarContainer}>
                  <ThemedText style={styles.avatarText}>👤</ThemedText>
                </View>
                <View style={styles.messageContainer}>
                  <ThemedText style={styles.userLabel}>You asked</ThemedText>
                  <View style={styles.promptBubble}>
                    <ThemedText style={styles.promptText}>{item.prompt}</ThemedText>
                  </View>
                  <TouchableOpacity 
                    style={[
                      styles.speakButton, 
                      speakingId === `p-${index}` && styles.speakingButton
                    ]}
                    onPress={() => speakText(item.prompt, `p-${index}`)}
                  >
                    <ThemedText style={[
                      styles.speakButtonText,
                      speakingId === `p-${index}` && styles.speakingButtonText
                    ]}>
                      {speakingId === `p-${index}` ? '◼ Stop' : '▶ Listen'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.aiSection}>
                <View style={styles.avatarContainer}>
                  <ThemedText style={styles.avatarText}>🤖</ThemedText>
                </View>
                <View style={styles.messageContainer}>
                  <ThemedText style={styles.aiLabel}>Gemini AI</ThemedText>
                  <View style={styles.responseBubble}>
                    <ThemedText style={styles.responseText}>{item.response}</ThemedText>
                  </View>
                  <TouchableOpacity 
                    style={[
                      styles.speakButton,
                      speakingId === `r-${index}` && styles.speakingButton
                    ]}
                    onPress={() => speakText(item.response, `r-${index}`)}
                  >
                    <ThemedText style={[
                      styles.speakButtonText,
                      speakingId === `r-${index}` && styles.speakingButtonText
                    ]}>
                      {speakingId === `r-${index}` ? '◼ Stop' : '▶ Listen'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.timestampContainer}>
                <ThemedText style={styles.timestamp}>Conversation {history.length - index}</ThemedText>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
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
    backgroundColor: '#FBBC05',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  emptySubText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    maxWidth: '70%',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  userSection: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  aiSection: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f9f9fb',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  messageContainer: {
    flex: 1,
  },
  userLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 6,
  },
  aiLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4285F4',
    marginBottom: 6,
  },
  promptBubble: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  promptText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  responseBubble: {
    backgroundColor: '#e8f0fe',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  responseText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  speakButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f3f5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  speakButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  speakingButton: {
    backgroundColor: '#feeae6',
    borderColor: '#ffccc7',
  },
  speakingButtonText: {
    color: '#ea4335',
  },
  timestampContainer: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
});