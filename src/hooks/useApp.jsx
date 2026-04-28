import axios from "axios";
import { useEffect, useState } from "react";
import { getSchedule } from "@utils";
import { useSearchParams } from "react-router-dom";

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

  const runScheduleSearch = async (type, value) => {
    if (!type || !value) return;

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

  const getSuggestions = async (value) => {
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
        `${import.meta.env.VITE_SCHEDULE_URL}/bitrix/components/atom/atom.education.schedule.remote.data/get.php?query=${trimmedValue}&type_schedule=${type}`,
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
    const type = searchParams.get("t");
    const value = searchParams.get("v");

    if (type && value) {
      if (value !== query) setQuery(value);
      runScheduleSearch(type, value);
    }
  }, [searchParams]);

  return {
    schedule,
    suggestions,
    getSuggestions,
    query,
    setQuery,
    onSuggestionChosen,
    loading,
  };
};

export default useApp;
