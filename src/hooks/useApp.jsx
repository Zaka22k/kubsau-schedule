import axios from "axios";
import { useEffect, useState } from "react";
import { getSchedule } from "@utils";
import { useSearchParams } from "react-router-dom";
// import { schedule as sh } from "@tests";

const reGroup = /^[А-ЯЁ]{2}\d{4,5}$/u;
const reRoom = /^\d{3}[а-яё]{2}$/u;

const useApp = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [schedule, setSchedule] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [query, setQuery] = useState(() => searchParams.get("v") ?? "");
  const [loading, setLoading] = useState(0);

  const getType = (value) =>
    reGroup.test(value) ? "1" : reRoom.test(value) ? "3" : null;

  const searchSchedule = async () => {
    const type = searchParams.get("t");
    const value = searchParams.get("v");

    if (type && value) {
      if (value !== query) setQuery(value);
    } else return;

    setLoading(1);
    try {
      const result = await getSchedule(type, value);
      setSchedule(result);
      setLoading(0);
    } catch (err) {
      console.log(`Ошибка получения расписания ${err.message}`);
      setLoading(-1);
    }
  };

  const searchSuggestions = async (value) => {
    setQuery(value);

    try {
      const trimmedValue = value.trim().toLowerCase();
      const type = /^[а-яё]{2}/iu.test(trimmedValue)
        ? "1"
        : /^\d{2}/.test(trimmedValue)
          ? "3"
          : null;

      if (!type || !value) {
        setSuggestions([]);
        return [];
      }

      const response = await axios.get(
        `${import.meta.env.VITE_SUGGESTIONS_URL}/get.php?query=${trimmedValue}&type_schedule=${type}`,
      );

      setSuggestions(response.data.suggestions || []);
      return response.data.suggestions || [];
    } catch (err) {
      console.error("Ошибка получения данных:", err.message);
      setSuggestions([]);
      return [];
    }
  };

  const onSuggestionChosen = (value) => {
    const type = getType(value);
    if (!type) return;

    setQuery(value);
    setSuggestions([]);
    setSearchParams({ t: type, v: value }, { replace: true });
  };

  useEffect(() => {
    searchSchedule();
  }, [searchParams]);

  return {
    schedule,
    suggestions,
    searchSuggestions,
    query,
    setQuery,
    onSuggestionChosen,
    loading,
  };
};

export default useApp;
