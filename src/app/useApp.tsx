import { type Schedule, type Suggestion } from "@types";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getType, parseSchedule, useNow, getCurrentWeek } from "@utils";

interface RawSuggestion {
  data: string;
  value: string;
}

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

  const now = useNow();
  const currentWeek = getCurrentWeek(schedule, now);

  const abortRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<{ type: string; value: string } | null>(null);

  const loadScheduleData = async (type: string, value: string) => {
    lastRequestRef.current = { type, value };

    abortRef.current?.abort();
    const controller = (abortRef.current = new AbortController());
    setParsing(1);

    try {
      const result = await parseSchedule(type, value, controller.signal);
      setSchedule(result);
      setParsing(0);
    } catch (error) {
      if (axios.isCancel(error)) return;

      console.error("Ошибка загрузки расписания:", error);
      setSchedule(null);
      setParsing(-1);
    }
  };

  const retry = () => {
    const last = lastRequestRef.current;
    if (last) loadScheduleData(last.type, last.value);
  };

  useEffect(() => {
    const urlType = searchParams.get("type");
    const urlValue = searchParams.get("value");

    if (urlType && urlValue) {
      loadScheduleData(urlType, urlValue);
    }
    return () => abortRef.current?.abort();
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
        const { data } = await axios.get<{ suggestions?: RawSuggestion[] }>(
          `${import.meta.env.VITE_SUGGESTIONS_URL}/get.php`,
          {
            params: { query, type_schedule: type },
            signal: controller.signal,
          },
        );

        setSuggestions(
          data?.suggestions?.map((s) => ({
            id: s.data,
            value: s.value,
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

    const normalized = value.toLowerCase();
    setSearchParams({ type, value: normalized }, { replace: true });

    await loadScheduleData(type, normalized);
  };

  return {
    searchQuery,
    suggestions,
    searching,
    handleSearch,
    schedule,
    parsing,
    handleSelect,
    retry,
    now,
    currentWeek,
  };
}

export default useApp;
