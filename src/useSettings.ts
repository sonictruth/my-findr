import { useMemo } from 'react';

export const defaultSettings: AppSettings = {
  username: '',
  password: '',
  apiURL: '',
  devices: [],
  days: 1,
};

const key = 'settingsV1';

export function useSettings(): [
  AppSettings,
  (newSettings: AppSettings) => void,
  () => void,
] {
  const storedSettings = useMemo(() => {
    let storedSetting = defaultSettings;
    try {
      storedSetting = JSON.parse(localStorage.getItem(key) || '');
    } catch (error) {
      console.warn('Failed to parse settings:', error);
    }
    return storedSetting;
  }, []);

  const updateStoredSettings = (newSettings: AppSettings) => {
    localStorage.setItem(key, JSON.stringify(newSettings));
  };

  const deleteStoredSettings = () => {
    localStorage.removeItem(key);
  };

  return [storedSettings, updateStoredSettings, deleteStoredSettings];
}
