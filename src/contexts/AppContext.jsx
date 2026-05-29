import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { getSchedule, getType } from "@utils";
import { useSearchParams } from "react-router-dom";

const AppContext = createContext(null);

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get("value") ?? "");
  const [type, setType] = useState(() => searchParams.get("type") ?? "");

  const [loading, setLoading] = useState(0);
  const [schedule, setSchedule] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const loadSchedule = async (value) => {
    const cleanedValue = value.trim().toLowerCase();
    const detectedType = getType(cleanedValue);

    if (!cleanedValue || !detectedType) {
      setSchedule(null);
      setLoading(-1);
      return;
    }

    setQuery(cleanedValue);
    setType(detectedType);
    setSearchParams(
      { type: detectedType, value: cleanedValue },
      { replace: true },
    );

    setLoading(1);
    try {
      const result = await getSchedule(detectedType, cleanedValue);
      setSchedule(result);
      setLoading(0);
    } catch (err) {
      console.log(`Ошибка получения расписания ${err.message}`);
      setLoading(-1);
    }
  };

  const fetchSuggestions = async (value) => {
    const cleanedValue = value.trim().toLowerCase();
    setQuery(cleanedValue);

    const detectedType = getType(cleanedValue);

    if (!cleanedValue || !detectedType) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SUGGESTIONS_URL}/get.php?query=${encodeURIComponent(cleanedValue)}&type_schedule=${detectedType}`,
      );
      setSuggestions(response.data.suggestions || []);
    } catch (err) {
      console.error("Ошибка получения данных:", err.message);
      setSuggestions([]);
    }
  };

  const handleSuggestionChosen = async (value) => {
    setSuggestions([]);
    await loadSchedule(value);
  };

  const handleSubmit = async () => {
    await loadSchedule(query);
  };

  useEffect(() => {
    if (type && query) {
      loadSchedule(query);
    }
  }, []);

  const values = {
    schedule,
    suggestions,
    fetchSuggestions,
    query,
    setQuery,
    handleSuggestionChosen,
    handleSubmit,
    loading,
  };

  return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};
