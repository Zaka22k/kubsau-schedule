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
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [schedule, setSchedule] = useState<Schedule | null>(null);

  const [searching, setSearching] = useState(false);
  const [parsing, setParsing] = useState<number>(0);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const urlType = searchParams.get("type");
    const urlValue = searchParams.get("value");

    if (urlType && urlValue) {
      loadScheduleData(urlType, urlValue);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setSearching(true);
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const trimmedQuery = debouncedQuery.trim().toLowerCase();
    const type = getType(trimmedQuery);

    if (!trimmedQuery || !type) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchSuggestions = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SUGGESTIONS_URL}/get.php?query=${encodeURIComponent(trimmedQuery)}&type_schedule=${type}`,
          { signal: controller.signal },
        );
        setSuggestions(response.data.suggestions || []);
      } catch (error) {
        if (axios.isCancel(error)) return;
        setSuggestions([]);
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
          setSearching(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  const loadScheduleData = async (type: string, value: string) => {
    setParsing(1);
    try {
      const result = await parseSchedule(type, value);
      setSchedule(result);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Ошибка загрузки расписания: ${error.message}`);
      }
      setParsing(-1);
      setSchedule(null);
    } finally {
      setParsing(0);
    }
  };

  const handleSelect = async (value: string) => {
    const cleanValue = value.trim();
    const detectedType = getType(cleanValue.toLowerCase());

    setSearchQuery(cleanValue);
    setSuggestions([]);

    if (!cleanValue || !detectedType) return;

    setSearchParams(
      { type: detectedType, value: cleanValue.toLowerCase() },
      { replace: true },
    );

    await loadScheduleData(detectedType, cleanValue.toLowerCase());
  };

  return {
    searchQuery,
    suggestions,
    searching,
    handleSearch: setSearchQuery,
    schedule,
    parsing,
    handleSelect,
  };
}

export default useApp;
