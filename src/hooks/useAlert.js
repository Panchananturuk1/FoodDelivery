import { useState, useCallback } from 'react';
import { Platform, Alert as RNAlert } from 'react-native';

export const useAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = useCallback((title, message, buttons = []) => {
    // For native platforms, use the native Alert
    if (Platform.OS !== 'web') {
      const formattedButtons = buttons.length > 0 
        ? buttons.map(button => ({
            text: button.text,
            onPress: button.onPress,
            style: button.style,
          }))
        : [{ text: 'OK' }];
      
      RNAlert.alert(title, message, formattedButtons);
      return;
    }

    // For web platform, use our custom alert
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons.length > 0 ? buttons : [{ text: 'OK' }],
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const showValidationError = useCallback((message) => {
    showAlert('Validation Error', message);
  }, [showAlert]);

  const showInvalidInput = useCallback((field, message) => {
    showAlert(`Invalid ${field}`, message);
  }, [showAlert]);

  const showNetworkError = useCallback(() => {
    showAlert(
      'Connection Error',
      'Unable to connect to the server. Please check your internet connection and try again.'
    );
  }, [showAlert]);

  const showSuccess = useCallback((message) => {
    showAlert('Success', message);
  }, [showAlert]);

  return {
    alertConfig,
    showAlert,
    hideAlert,
    showValidationError,
    showInvalidInput,
    showNetworkError,
    showSuccess,
  };
};

export default useAlert;