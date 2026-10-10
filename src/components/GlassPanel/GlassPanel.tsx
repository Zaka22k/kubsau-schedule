import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { createGlassMaps } from "./liquidGlass";
import type { GlassProfile } from "./liquidGlass";

export type { GlassProfile } from "./liquidGlass";

/** Visual parameters of the glass. Every one is optional, defaults are in GLASS_DEFAULTS. */
export interface GlassOptions {
  /** Shape of the bezel cross-section. */
  profile?: GlassProfile;
  /** Bezel width in px: the zone along the edge where light is refracted. */
  bezel?: number;
  /** Glass height in px above the background. Larger values refract more. */
  glassHeight?: number;
  /** Refractive index n of the glass. 1 means no refraction, 1.5 is ordinary glass. */
  ior?: number;
  /** Multiplier for the displacement scale. 0 turns refraction off. */
  strength?: number;
  /** Gaussian blur of the backdrop in px. */
  blur?: number;
  /** Backdrop saturation multiplier. 1 leaves colours unchanged. */
  saturation?: number;
  /** Direction of the light in degrees. 0 is right, 90 is down, -60 is up and to the right. */
  specularAngle?: number;
  /** Brightness of the edge highlight, 0..1. A number or a CSS value such as 'var(--token)'. */
  specularOpacity?: number | string;
  /** Thickness of the edge highlight in px. */
  specularWidth?: number;
  /**
   * Strength of the thin outline and the soft inner shadow along the edge, 0..1.
   * 0 turns it off. Around 0.15 to 0.3 gives the look of glass on a light background.
   * A number or a CSS value such as 'var(--token)'. A token must resolve to a plain number.
   */
  edgeShadowOpacity?: number | string;
  /** Width of the soft inner shadow in px. The outline itself is always about 1.4 px. */
  edgeShadowWidth?: number;
  /**
   * Opacity of the drop shadow around the panel, 0..1. Ignored when `boxShadow` is set.
   * A number or a CSS value such as 'var(--token)'. A token must resolve to a plain number.
   */
  outerShadowOpacity?: number | string;
  /** Panel width: a number in px or any CSS size. Use 'auto' to size by content. */
  width?: number | string;
  /** Panel height: a number in px or any CSS size. Use 'auto' to size by content. */
  height?: number | string;
  /** Corner radius in px. A value above half the shorter side gives a pill or a circle. */
  radius?: number;
  /** Tint of the panel: any CSS colour or token, for example 'rgba(255, 255, 255, 0.08)'. */
  backgroundColor?: string;
  /** Full CSS box-shadow of the panel. When set, it replaces the shadow made by `outerShadowOpacity`. */
  boxShadow?: string;
  /** Blur in px used where SVG backdrop filters are not supported (everything except Chromium). */
  fallbackBlur?: number;
}

export const GLASS_DEFAULTS = {
  profile: "squircle",
  bezel: 30,
  glassHeight: 50,
  ior: 1.5,
  strength: 1,
  blur: 1.5,
  saturation: 1.4,
  specularAngle: -90,
  specularOpacity: 0.6,
  specularWidth: 2,
  edgeShadowOpacity: "var(--edge-shadow-opacity)",
  edgeShadowWidth: 0,
  outerShadowOpacity: "var(--glass-outer-shadow-opacity)",
  width: 320,
  height: 160,
  radius: 80,
  backgroundColor: "var(--glass-bg)",
  fallbackBlur: 24,
} as const satisfies Required<Omit<GlassOptions, "boxShadow">>;

/** Ready-made edge looks. Spread one into the panel: <GlassPanel {...GLASS_PRESETS.light} />. */
export const GLASS_PRESETS = {
  /** For dark or colourful backgrounds. Same as the defaults. */
  dark: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    specularOpacity: 0.6,
    specularWidth: 3,
    edgeShadowOpacity: 0,
    edgeShadowWidth: 8,
    outerShadowOpacity: 0.38,
  },
  /** For light backgrounds: grey tint, dark outline and inner shadow, soft outer shadow. */
  light: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    specularOpacity: 1,
    specularWidth: 2,
    edgeShadowOpacity: 0.2,
    edgeShadowWidth: 9,
    outerShadowOpacity: 0.12,
  },
} as const satisfies Record<"dark" | "light", GlassOptions>;

/** The drop shadow used when `boxShadow` is not set. */
export function outerShadow(opacity: number | string): string {
  const second =
    typeof opacity === "number"
      ? Math.round(opacity * 0.66 * 1000) / 1000
      : `calc(${opacity} * 0.66)`;
  return `0 14px 40px rgba(0, 0, 0, ${opacity}), 0 2px 8px rgba(0, 0, 0, ${second})`;
}

export interface GlassPanelProps
  extends GlassOptions, Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children?: ReactNode;
}

/** A token cannot be compared in JS, so a string value always counts as visible. */
const isVisible = (v: number | string): boolean =>
  typeof v === "string" || v > 0;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Chromium is the only engine that accepts an SVG filter in backdrop-filter. */
function supportsSvgBackdropFilter(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Chrome\//.test(navigator.userAgent);
}

function hashString(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

interface Size {
  w: number;
  h: number;
}

/** Overlay layers sit under the content and over the panel background. */
const OVERLAY_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: -1,
  borderRadius: "inherit",
  pointerEvents: "none",
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
};

/**
 * A panel that refracts whatever is behind it, like Apple's Liquid Glass.
 *
 * Refraction is an SVG displacement filter used as a backdrop-filter (Chromium only, other
 * browsers get a plain blur). The edge highlight and the edge shade are ordinary layers of the
 * panel itself, so they also show up in browsers without the filter. All maps are generated from
 * the panel's measured size, so it can have a fixed size, a percentage, or 'auto'.
 */
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  function GlassPanel(
    {
      profile = GLASS_DEFAULTS.profile,
      bezel = GLASS_DEFAULTS.bezel,
      glassHeight = GLASS_DEFAULTS.glassHeight,
      ior = GLASS_DEFAULTS.ior,
      strength = GLASS_DEFAULTS.strength,
      blur = GLASS_DEFAULTS.blur,
      saturation = GLASS_DEFAULTS.saturation,
      specularAngle = GLASS_DEFAULTS.specularAngle,
      specularOpacity = GLASS_DEFAULTS.specularOpacity,
      specularWidth = GLASS_DEFAULTS.specularWidth,
      edgeShadowOpacity = GLASS_DEFAULTS.edgeShadowOpacity,
      edgeShadowWidth = GLASS_DEFAULTS.edgeShadowWidth,
      outerShadowOpacity = GLASS_DEFAULTS.outerShadowOpacity,
      width = GLASS_DEFAULTS.width,
      height = GLASS_DEFAULTS.height,
      radius = GLASS_DEFAULTS.radius,
      backgroundColor = GLASS_DEFAULTS.backgroundColor,
      boxShadow,
      fallbackBlur = GLASS_DEFAULTS.fallbackBlur,
      style,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    const baseId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const [size, setSize] = useState<Size | null>(null);
    const [svgFilterOk, setSvgFilterOk] = useState(false);

    // Measure the panel and keep the measurement in sync with layout changes.
    useIsomorphicLayoutEffect(() => {
      setSvgFilterOk(supportsSvgBackdropFilter());
      const el = innerRef.current;
      if (!el) return;
      const measure = () => {
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        setSize((prev) =>
          prev && prev.w === w && prev.h === h ? prev : { w, h },
        );
      };
      measure();
      if (typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    // Opacities are applied in CSS, so they are not dependencies: changing them does not rebuild the maps.
    const maps = useMemo(() => {
      if (!size || size.w < 2 || size.h < 2) return null;
      return createGlassMaps({
        width: size.w,
        height: size.h,
        radius,
        bezel,
        glassHeight,
        ior,
        strength,
        specularAngle,
        specularWidth,
        edgeShadowWidth,
        profile,
        refraction: svgFilterOk,
        pixelRatio:
          typeof window === "undefined"
            ? 1
            : Math.min(2, window.devicePixelRatio || 1),
      });
    }, [
      svgFilterOk,
      size,
      radius,
      bezel,
      glassHeight,
      ior,
      strength,
      specularAngle,
      specularWidth,
      edgeShadowWidth,
      profile,
    ]);

    // A new id for every new filter makes Chrome re-evaluate the backdrop filter.
    const filterId = useMemo(() => {
      const key = [
        size?.w,
        size?.h,
        radius,
        bezel,
        glassHeight,
        ior,
        strength,
        profile,
        blur,
        saturation,
      ].join("|");
      return `lg-${baseId}-${hashString(key)}`;
    }, [
      baseId,
      size,
      radius,
      bezel,
      glassHeight,
      ior,
      strength,
      profile,
      blur,
      saturation,
    ]);

    const refracts =
      svgFilterOk &&
      maps !== null &&
      maps.displacementUrl !== "" &&
      size !== null;
    const backdrop = refracts
      ? `url(#${filterId})`
      : `blur(${fallbackBlur}px) saturate(${saturation})`;

    const rootStyle: CSSProperties = {
      position: "relative",
      isolation: "isolate",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      verticalAlign: "middle",
      boxSizing: "border-box",
      width,
      height,
      borderRadius: radius,
      background: backgroundColor,
      boxShadow: boxShadow ?? outerShadow(outerShadowOpacity),
      backdropFilter: backdrop,
      WebkitBackdropFilter: backdrop,
      ...style,
    };

    return (
      <div ref={setRefs} style={rootStyle} {...rest}>
        {refracts && maps && size && (
          <svg
            aria-hidden="true"
            focusable="false"
            width={0}
            height={0}
            style={{ position: "absolute", pointerEvents: "none" }}
          >
            <filter
              id={filterId}
              filterUnits="userSpaceOnUse"
              x={0}
              y={0}
              width={size.w}
              height={size.h}
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation={blur}
                result="blur"
              />
              <feImage
                href={maps.displacementUrl}
                x={0}
                y={0}
                width={size.w}
                height={size.h}
                preserveAspectRatio="none"
                result="map"
              />
              <feDisplacementMap
                in="blur"
                in2="map"
                scale={maps.scale}
                xChannelSelector="R"
                yChannelSelector="G"
                result="disp"
              />
              <feColorMatrix
                in="disp"
                type="saturate"
                values={String(saturation)}
              />
            </filter>
          </svg>
        )}
        {maps && isVisible(specularOpacity) && (
          <div
            aria-hidden="true"
            style={{
              ...OVERLAY_STYLE,
              backgroundImage: `url(${maps.specularUrl})`,
              opacity: specularOpacity,
            }}
          />
        )}
        {maps && isVisible(edgeShadowOpacity) && (
          <div
            aria-hidden="true"
            style={{
              ...OVERLAY_STYLE,
              backgroundImage: `url(${maps.edgeShadowUrl})`,
              opacity: edgeShadowOpacity,
            }}
          />
        )}
        {children}
      </div>
    );
  },
);
