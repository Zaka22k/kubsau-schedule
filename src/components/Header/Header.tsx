import { useEffect, useState, useRef } from "react";
import { ThemeToggle } from "@components";
import styles from "./Header.module.css";

type HeaderProps = {
  activeWeek: string | null;
};

const Header = ({ activeWeek }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [digitAnimating, setDigitAnimating] = useState(false);

  const prevWeekRef = useRef<string | null>(activeWeek);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 250);
    return () => clearTimeout(timer);
  }, [scrolled]);

  useEffect(() => {
    if (prevWeekRef.current !== activeWeek && scrolled && activeWeek) {
      setDigitAnimating(true);
      const timer = setTimeout(() => setDigitAnimating(false), 200);
      prevWeekRef.current = activeWeek;
      return () => clearTimeout(timer);
    }
    prevWeekRef.current = activeWeek;
  }, [activeWeek, scrolled]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.left}>
        <div
          className={`${styles.content} ${isAnimating ? styles.animate : ""}`}
        >
          {scrolled && activeWeek ? (
            <span className={styles.weekText}>
              Неделя {/* Оборачиваем цифру в отдельный анимируемый спан */}
              <span
                className={`${styles.digit} ${digitAnimating ? styles.digitAnimate : ""}`}
              >
                {activeWeek}
              </span>
            </span>
          ) : (
            <a className={styles.headerLink} href="https://kubsau.ru">
              КУБГАУ <span className={styles.brandBadge}>Расписание</span>
            </a>
          )}
        </div>
      </div>

      <div className={styles.right}>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
