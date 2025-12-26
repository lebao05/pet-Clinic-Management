import { useEffect, useState } from "react";

const KEY = "petcarex_settings_v1";

export function getSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function useAppSettings() {
  const [settings, setSettings] = useState(() => getSettings());

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings));
  }, [settings]);

  return {
    settings,
    setSetting: (key, value) => setSettings((s) => ({ ...s, [key]: value })),
  };
}
