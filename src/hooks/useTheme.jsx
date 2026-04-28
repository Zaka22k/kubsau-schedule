import { useEffect, useState } from "react";

const THEME_KEY = "theme-mode";

const useTheme = () => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem(THEME_KEY) || "light";
  });

  const [systemTheme, setSystemTheme] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const listener = (e) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, mode);
  }, [mode]);

  const resolvedTheme = mode === "system" ? systemTheme : mode;

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  return {
    mode,
    setMode,
    resolvedTheme,
  };
};

export default useTheme;
