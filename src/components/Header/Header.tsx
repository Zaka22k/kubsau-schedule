import { useEffect, useRef, useState } from "react";
import { GlassPanel } from "../GlassPanel";
import styles from "./Header.module.css";

type HeaderProps = {
  activeWeek: string | null;
  /** Порядок недель на странице сверху вниз, например ["2", "1"] */
  weeksOrder?: string[];
};

type Roll = {
  /** Цифра, которая показывается сейчас */
  current: string | null;
  /** Уходящая цифра (пока идёт анимация) */
  prev: string | null;
  /** 1 — прокрутка вниз по странице (цифры едут вверх), -1 — наоборот */
  dir: 1 | -1;
  /** Меняется при каждой смене недели, чтобы анимация запускалась заново */
  tick: number;
};

const Header = ({ activeWeek, weeksOrder = ["1", "2"] }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [roll, setRoll] = useState<Roll>({
    current: activeWeek,
    prev: null,
    dir: 1,
    tick: 0,
  });
  const lastWeekRef = useRef<string | null>(activeWeek);

  const showPanel = scrolled && !!activeWeek;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);

    handleScroll(); // на случай, если страница восстановила позицию прокрутки
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const from = lastWeekRef.current;
    if (activeWeek === from) return;
    lastWeekRef.current = activeWeek;

    // Панель скрыта или недели нет — просто меняем цифру без анимации
    if (!showPanel || !from || !activeWeek) {
      setRoll((r) => ({
        ...r,
        current: activeWeek ?? r.current,
        prev: null,
      }));
      return;
    }

    // Направление определяется положением недели на странице, а не её номером:
    // и для [2, 1], и для [1, 2] переход вниз по странице крутит барабан вверх
    const dir =
      weeksOrder.indexOf(activeWeek) >= weeksOrder.indexOf(from) ? 1 : -1;

    setRoll((r) => ({
      current: activeWeek,
      prev: from,
      dir,
      tick: r.tick + 1,
    }));
  }, [activeWeek]);

  const handleOutEnd = (tick: number) => {
    setRoll((r) => (r.tick === tick ? { ...r, prev: null } : r));
  };

  const goingUp = roll.dir === 1;

  return (
    <header className={styles.header}>
      <div className={styles.content}>
        {/* Обе «страницы» заголовка всегда в DOM и плавно подменяют друг друга */}
        <a
          className={`${styles.layer} ${styles.headerLink} ${showPanel ? styles.hiddenUp : ""}`}
          href="https://kubsau.ru"
          aria-hidden={showPanel}
          tabIndex={showPanel ? -1 : undefined}
        >
          КУБГАУ <span className={styles.brandBadge}>Расписание</span>
        </a>

        <div
          className={`${styles.layer} ${showPanel ? "" : styles.hiddenDown}`}
          aria-hidden={!showPanel}
        >
          <GlassPanel
            style={{ padding: "6px 16px" }}
            width="max-content"
            height="max-content"
          >
            <span className={styles.weekText}>
              неделя
              <span className={styles.roller}>
                {roll.prev !== null && (
                  <span
                    key={`out-${roll.tick}`}
                    className={`${styles.digit} ${styles.digitOut} ${goingUp ? styles.outUp : styles.outDown}`}
                    onAnimationEnd={() => handleOutEnd(roll.tick)}
                  >
                    {roll.prev}
                  </span>
                )}
                <span
                  key={`in-${roll.tick}`}
                  className={`${styles.digit} ${
                    roll.prev !== null
                      ? goingUp
                        ? styles.inUp
                        : styles.inDown
                      : ""
                  }`}
                >
                  {roll.current}
                </span>
              </span>
            </span>
          </GlassPanel>
        </div>
      </div>
    </header>
  );
};

export default Header;
