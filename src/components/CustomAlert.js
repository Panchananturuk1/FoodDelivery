import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const CustomAlert = ({ visible, title, message, buttons = [], onDismiss, onClose }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible]);

  const getIconForTitle = (title) => {
    if (title.toLowerCase().includes('error') || title.toLowerCase().includes('failed')) {
      return { name: 'close-circle', color: '#FF6B6B' };
    }
    if (title.toLowerCase().includes('success')) {
      return { name: 'checkmark-circle', color: '#4ECDC4' };
    }
    if (title.toLowerCase().includes('warning') || title.toLowerCase().includes('invalid')) {
      return { name: 'warning', color: '#FFB347' };
    }
    return { name: 'information-circle', color: '#4A90E2' };
  };

  const icon = getIconForTitle(title);

  const handleButtonPress = (button) => {
    if (button.onPress) {
      button.onPress();
    }
    const closeCallback = onClose || onDismiss;
    if (closeCallback) {
      closeCallback();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose || onDismiss}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.overlayTouch} 
          activeOpacity={1} 
          onPress={onClose || onDismiss}
        >
          <Animated.View 
            style={[
              styles.alertContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={styles.iconContainer}>
                <Ionicons name={icon.name} size={40} color={icon.color} />
              </View>
              
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              
              <View style={styles.buttonContainer}>
                {buttons.length > 0 ? (
                  buttons.map((button, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        button.style === 'destructive' && styles.destructiveButton,
                        button.style === 'cancel' && styles.cancelButton,
                        buttons.length === 1 && styles.singleButton,
                      ]}
                      onPress={() => handleButtonPress(button)}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          button.style === 'destructive' && styles.destructiveButtonText,
                          button.style === 'cancel' && styles.cancelButtonText,
                        ]}
                      >
                        {button.text}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <TouchableOpacity
                    style={[styles.button, styles.singleButton]}
                    onPress={onClose || onDismiss}
                  >
                    <Text style={styles.buttonText}>OK</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouch: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    maxWidth: Platform.OS === 'web' ? 400 : width - 40,
    minWidth: Platform.OS === 'web' ? 300 : width * 0.8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  singleButton: {
    backgroundColor: '#4A90E2',
  },
  destructiveButton: {
    backgroundColor: '#FF6B6B',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  destructiveButtonText: {
    color: 'white',
  },
  cancelButtonText: {
    color: '#333',
  },
});

export default CustomAlert;