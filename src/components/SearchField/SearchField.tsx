import { useRef, useState } from "react";
import { ProgressRing } from "@components";
import { type Suggestion } from "@types";
import styles from "./SearchField.module.css";

type SearchFieldProps = {
  value: string;
  placeholder?: string;
  loading?: boolean;
  suggestions: Suggestion[];
  textChanged?: (text: string) => void;
  suggestionChosen?: (value: string, type: string) => void;
};

const SearchField = ({
  value = "",
  placeholder = "",
  loading = false,
  suggestions,
  textChanged,
  suggestionChosen,
}: SearchFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    textChanged?.(e.target.value);
  };

  const handleSuggestionChosen = (
    suggestionValue: string,
    suggestionType: string,
  ) => {
    inputRef.current?.blur();
    suggestionChosen?.(suggestionValue, suggestionType);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || loading) return;

    const first = suggestions?.[0];
    if (first) {
      e.preventDefault();
      handleSuggestionChosen(first.value, first.type);
    }
  };

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    inputRef.current?.blur();
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${isFocused ? styles.overlayVisible : ""}`}
        aria-hidden={!isFocused}
      >
        <div className={styles.overlayContainer}>
          <p>Результаты</p>
          {loading ? (
            <div className={styles.overlayCenterContainer}>
              <ProgressRing size={48} loading />
            </div>
          ) : (
            <ul className={styles.suggestionsList}>
              {suggestions?.map((suggestion, index) => (
                <li
                  key={`${suggestion.value}-${index}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    handleSuggestionChosen(suggestion.value, suggestion.type)
                  }
                >
                  {suggestion.value}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={`${styles.container} ${isFocused ? styles.focused : ""}`}>
        <div className={`${styles.inputWrapper} ${styles.glassPanel}`}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-secondary)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>

          <input
            className={styles.input}
            ref={inputRef}
            type="text"
            value={value}
            placeholder={placeholder}
            aria-label={placeholder || "Поиск"}
            enterKeyHint="search"
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </div>

        <div className={styles.btnWrapper}>
          <button
            type="button"
            className={`${styles.closeBtn} ${styles.glassPanel}`}
            aria-label="Закрыть"
            onMouseDown={handleClose}
            tabIndex={isFocused ? 0 : -1}
          >
            <svg
              viewBox="0 -960 960 960"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
              width={24}
              height={24}
            >
              <path
                fill="var(--text-secondary)"
                d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default SearchField;
