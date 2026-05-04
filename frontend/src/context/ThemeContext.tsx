import React, { createContext, useState, useContext, useEffect } from "react";

/**
 * Theme context for managing light/dark mode throughout the app.
 * Automatically respects user's system theme preference on first load.
 * Changes persist across page navigation.
 */
const ThemeContext = createContext({} as any);

export const ThemeProvider = ({ children }: any) => {

  const getDefaultTheme = () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  };

  const [theme, setTheme] = useState<string>(getDefaultTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access and control the theme.
 * Must be used within a ThemeProvider.
 *
 * @returns Object with current theme and toggleTheme function
 */
export const useTheme = () => useContext(ThemeContext);
