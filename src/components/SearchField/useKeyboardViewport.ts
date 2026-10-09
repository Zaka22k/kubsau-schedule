import { useEffect } from "react";

/**
 * Пока поле поиска в фокусе, пишет в :root три CSS-переменные
 * по реальной видимой области (visualViewport), т.е. без экранной клавиатуры:
 *  --vv-top      — смещение видимой области от верха страницы
 *  --vv-height   — высота видимой области
 *  --kb-inset    — высота, которую занимает клавиатура снизу
 */
export function useKeyboardViewport(active: boolean) {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!active || !vv) return;

    const root = document.documentElement;

    const update = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      root.style.setProperty("--vv-top", `${vv.offsetTop}px`);
      root.style.setProperty("--vv-height", `${vv.height}px`);
      root.style.setProperty("--kb-inset", `${inset}px`);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      root.style.removeProperty("--vv-top");
      root.style.removeProperty("--vv-height");
      root.style.removeProperty("--kb-inset");
    };
  }, [active]);
}

export default useKeyboardViewport;
