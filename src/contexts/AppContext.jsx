import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { getSchedule, getType } from "@utils";
import { useSearchParams } from "react-router-dom";
// import { schedule as sh } from "@tests";

const AppContext = createContext(null);

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("value") ?? "");
  const [type, setType] = useState(() => searchParams.get("type") ?? "");

  const [loading, setLoading] = useState(0);
  const [schedule, setSchedule] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (value) => {
    const clearedValue = value.trim().toLowerCase();
    setQuery(clearedValue);
    setType(getType(clearedValue));

    if (!type || !clearedValue) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SUGGESTIONS_URL}/get.php?query=${clearedValue}&type_schedule=${type}`,
      );
      setSuggestions(response.data.suggestions || []);
    } catch (err) {
      console.error("Ошибка получения данных:", err.message);
      setSuggestions([]);
    }
  };

  const handleSuggestionChosen = (value) => {
    setQuery(value);
    setSuggestions([]);
  };

  const fetchSchedule = async () => {
    if (!type) return;

    setSearchParams({ type, value: query }, { replace: true });

    setLoading(1);
    try {
      const result = await getSchedule(type, query);
      setSchedule(result);
      setLoading(0);
    } catch (err) {
      console.log(`Ошибка получения расписания ${err.message}`);
      setLoading(-1);
    }
  };

  useEffect(() => {
    if (type && query) fetchSchedule();
  }, []);

  const values = {
    schedule,
    suggestions,
    fetchSuggestions,
    query,
    setQuery,
    handleSuggestionChosen,
    loading,
    fetchSchedule,
  };

  return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};
