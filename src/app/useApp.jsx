import axios from "axios";
import { useState } from "react";
import { getSchedule } from "@utils";
import { schedule as sc } from "@tests";

const useApp = () => {
  const [schedule, setSchedule] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [query, setQuery] = useState("");

  const reGroup = /^[А-ЯЁ]{2}\d{4,5}$/u;
  const reRoom = /^\d{3}[а-яё]{2}$/u;
  const [loading, setLoading] = useState(0);

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
        return [];
      }

      const response = await axios.get(
        `${import.meta.env.VITE_SCHEDULE_URL}/bitrix/components/atom/atom.education.schedule.remote.data/get.php?query=${trimmedValue}&type_schedule=${type}`,
      );
      setSuggestions(response.data.suggestions || []);
    } catch (err) {
      console.error("Ошибка получения данных:", err.message);
      return [];
    }
  };

  const onSuggestionChosen = async (value) => {
    setQuery(value);
    setSuggestions([]);
    setLoading(1);

    try {
      const type = reGroup.test(value) ? "1" : reRoom.test(value) ? "3" : null;

      const result = await getSchedule(type, value);
      setSchedule(result);

      console.log(result);

      setLoading(0);
    } catch (err) {
      console.log(`Ошибка получения расписания ${err.message}`);
      setLoading(-1);
    }
  };

  return {
    schedule,
    suggestions,
    getSuggestions,
    query,
    onSuggestionChosen,
    loading,
  };
};

export default useApp;
