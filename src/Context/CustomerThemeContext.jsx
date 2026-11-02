import { createContext, useContext, useEffect, useState } from "react";

const CustomerThemeContext = createContext(null);

// Completely separate from the admin's ThemeContext — its own storage key,
// its own state, so toggling one never affects the other.
export const CustomerThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem("hh-portal-theme") || "light");

  useEffect(() => {
    localStorage.setItem("hh-portal-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return <CustomerThemeContext.Provider value={{ theme, toggleTheme }}>{children}</CustomerThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCustomerTheme = () => {
  const ctx = useContext(CustomerThemeContext);
  if (!ctx) throw new Error("useCustomerTheme must be used within a CustomerThemeProvider");
  return ctx;
};