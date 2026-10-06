import { type Schedule, type Suggestion } from "@types";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getType, parseSchedule } from "@utils";

export function useApp() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState<string>(
    () => searchParams.get("value") || "",
  );
  const [typedQuery, setTypedQuery] = useState("");

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [schedule, setSchedule] = useState<Schedule | null>(null);

  const [searching, setSearching] = useState(false);
  const [parsing, setParsing] = useState<number>(() =>
    searchParams.get("type") && searchParams.get("value") ? 1 : 0,
  );

  const requestIdRef = useRef(0);

  const loadScheduleData = async (type: string, value: string) => {
    const requestId = ++requestIdRef.current;
    setParsing(1);

    try {
      const result = await parseSchedule(type, value);
      if (requestId !== requestIdRef.current) return;

      setSchedule(result);
      setParsing(0);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      if (error instanceof Error) {
        console.error(`Ошибка загрузки расписания: ${error.message}`);
      }
      setSchedule(null);
      setParsing(-1);
    }
  };

  useEffect(() => {
    const urlType = searchParams.get("type");
    const urlValue = searchParams.get("value");

    if (urlType && urlValue) {
      loadScheduleData(urlType, urlValue);
    }
  }, []);

  useEffect(() => {
    const query = typedQuery.trim().toLowerCase();
    const type = getType(query);

    if (!query || !type) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_SUGGESTIONS_URL}/get.php`,
          {
            params: { query, type_schedule: type },
            signal: controller.signal,
          },
        );

        setSuggestions(
          data?.suggestions?.map((suggestion: any) => ({
            id: suggestion.data,
            value: suggestion.value,
            type,
          })) ?? [],
        );
      } catch (error) {
        if (axios.isCancel(error)) return;
        setSuggestions([]);
      }
      setSearching(false);
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [typedQuery]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setTypedQuery(text);
  };

  const handleSelect = async (value: string, type: string) => {
    setSearchQuery(value);
    setTypedQuery("");

    if (!value || !type) return;

    setSearchParams(
      { type: type, value: value.toLowerCase() },
      { replace: true },
    );

    await loadScheduleData(type, value.toLowerCase());
  };

  return {
    searchQuery,
    suggestions,
    searching,
    handleSearch,
    schedule,
    parsing,
    handleSelect,
  };
}

export default useApp;
