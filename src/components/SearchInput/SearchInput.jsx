import { useState, useRef } from "react";
import { Spinner } from "@components";
import { useApp } from "@contexts";
import styles from "./SearchInput.module.css";

const SearchInput = () => {
  const {
    suggestions,
    fetchSuggestions,
    query,
    handleSuggestionChosen,
    fetchSchedule,
  } = useApp();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleSearch = (value) => {
    setLoading(true);
    setTimeout(() => {
      fetchSuggestions(value);
      setLoading(false);
    }, 80);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    inputRef.current?.blur();
    await fetchSchedule();
  };

  const handleSelect = (value) => {
    handleSuggestionChosen(value);
    setOpen(false);
  };

  const showSuggestions = open && suggestions.length > 0;

  return (
    <form
      className={`${styles.searchContainer} ${open && styles.focus}`}
      onSubmit={handleSubmit}
    >
      <ul
        className={`${styles.suggestionList} ${showSuggestions ? styles.visible : ""}`}
      >
        {suggestions.map((group, index) => (
          <li
            key={`${group.value}-${index}`}
            onMouseDown={(e) => {
              e.preventDefault();
              handleSelect(group.value);
            }}
          >
            {group.value}
          </li>
        ))}
      </ul>
      <div className={styles.inputContainer}>
        <Spinner loading={loading} />

        <input
          ref={inputRef}
          type="search"
          value={query}
          className={styles.input}
          placeholder="Поиск по группе / аудитории"
          onChange={(e) => {
            const value = e.target.value;
            handleSearch(value);
          }}
          maxLength={7}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        />

        <button
          type="submit"
          className={`${styles.submitButton} ${query && styles.show}`}
        >
          <svg
            viewBox="0 -960 960 960"
            className={styles.icon}
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M792-120.67 532.67-380q-30 25.33-69.67 39.67Q423.33-326 378.67-326q-108.34 0-183.5-75.17Q120-476.33 120-583.33t75.17-182.17q75.16-75.17 182.83-75.17 107 0 181.83 75.17 74.84 75.17 74.84 182.17 0 43.33-14 83-14 39.66-40.67 73l260 258.66-48 48Zm-414-272q79 0 134.5-55.83T568-583.33q0-79-55.5-134.84Q457-774 378-774q-79.67 0-135.5 55.83-55.83 55.84-55.83 134.84T242.5-448.5q55.83 55.83 135.5 55.83Z" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default SearchInput;
