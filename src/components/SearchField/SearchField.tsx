import { useRef, useState } from "react";
import { ProgressRing, GlassPanel } from "@components";
import { type Suggestion } from "@types";
import { useKeyboardViewport } from "./useKeyboardViewport";
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

  // Подгоняет оверлей и поле поиска под видимую область (над клавиатурой)
  useKeyboardViewport(isFocused);

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
        <GlassPanel
          style={{
            height: "var(--height)",
            width: "100%",
            minWidth: 0,
            borderRadius: "var(--circular-radius)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg
            className={styles.searchIcon}
            viewBox="0 -960 960 960"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="var(--text-secondary)"
              d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"
            />
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
        </GlassPanel>

        <div className={styles.btnWrapper}>
          <GlassPanel
            className={styles.closeBtn}
            width="var(--height)"
            height="var(--height)"
            boxShadow="none"
            fallbackBlur={24}
            specularWidth={2}
          >
            <button
              type="button"
              className={styles.closeBtnInner}
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
          </GlassPanel>
        </div>
      </div>
    </>
  );
};

export default SearchField;
