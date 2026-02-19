"use client";

import { createContext, useContext, useState } from "react";
import { DEFAULT_SCHEME } from "@/app/(protected)/ejercicios/(browse)/mundos/world-color-schemes";

type WorldTheme = {
  navGradient: string;
  accentColor: string;
  buttonGradient: string;
};

const DEFAULT_THEME: WorldTheme = {
  navGradient: DEFAULT_SCHEME.navGradient,
  accentColor: DEFAULT_SCHEME.accentColor,
  buttonGradient: DEFAULT_SCHEME.buttonGradient,
};

const WorldThemeContext = createContext<{
  theme: WorldTheme;
  setTheme: (theme: WorldTheme) => void;
}>({ theme: DEFAULT_THEME, setTheme: () => {} });

export function WorldThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<WorldTheme>(DEFAULT_THEME);
  return (
    <WorldThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </WorldThemeContext.Provider>
  );
}

export function useWorldTheme() {
  return useContext(WorldThemeContext);
}
