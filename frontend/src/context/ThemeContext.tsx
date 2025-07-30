import React, { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext({} as any);

export const ThemeProvider = ({ children }: any) => {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        document.body.dataset.theme = theme;
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggle: () => setTheme(t => t === "light" ? "dark" : "light")}}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);