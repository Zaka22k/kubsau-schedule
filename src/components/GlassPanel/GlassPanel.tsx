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
  /** Brightness of the edge highlight, 0..1. */
  specularOpacity?: number;
  /** Thickness of the edge highlight in px. */
  specularWidth?: number;
  /** Panel width: a number in px or any CSS size. Use 'auto' to size by content. */
  width?: number | string;
  /** Panel height: a number in px or any CSS size. Use 'auto' to size by content. */
  height?: number | string;
  /** Corner radius in px. A value above half the shorter side gives a pill or a circle. */
  radius?: number;
  /** Tint of the panel: any CSS colour, for example 'rgba(255, 255, 255, 0.08)'. */
  backgroundColor?: string;
  /** CSS box-shadow of the panel. */
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
  blur: 1,
  saturation: 1.4,
  specularAngle: -90,
  specularOpacity: 0.6,
  specularWidth: 2,
  width: 320,
  height: 160,
  radius: 80,
  backgroundColor: "var(--glass-bg)",
  boxShadow: "none",
  fallbackBlur: 24,
} as const satisfies Required<GlassOptions>;

export interface GlassPanelProps
  extends GlassOptions, Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children?: ReactNode;
}

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

/**
 * A panel that refracts whatever is behind it, like Apple's Liquid Glass.
 *
 * The refraction map is generated from the panel's measured size, so the panel can have a
 * fixed size, a percentage, or 'auto'. Maps are rebuilt when the size or any parameter changes.
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
      width = GLASS_DEFAULTS.width,
      height = GLASS_DEFAULTS.height,
      radius = GLASS_DEFAULTS.radius,
      backgroundColor = GLASS_DEFAULTS.backgroundColor,
      boxShadow = GLASS_DEFAULTS.boxShadow,
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

    const maps = useMemo(() => {
      if (!svgFilterOk || !size || size.w < 2 || size.h < 2) return null;
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
        profile,
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
      profile,
    ]);

    // A new id for every new set of maps makes Chrome re-evaluate the backdrop filter.
    const filterId = useMemo(() => {
      const key = [
        size?.w,
        size?.h,
        radius,
        bezel,
        glassHeight,
        ior,
        strength,
        specularAngle,
        specularWidth,
        profile,
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
      specularAngle,
      specularWidth,
      profile,
    ]);

    const backdrop = maps
      ? `url(#${filterId})`
      : `blur(${fallbackBlur}px) saturate(${saturation})`;

    const rootStyle: CSSProperties = {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      verticalAlign: "middle",
      boxSizing: "border-box",
      width,
      height,
      borderRadius: radius,
      background: backgroundColor,
      boxShadow,
      backdropFilter: backdrop,
      WebkitBackdropFilter: backdrop,
      ...style,
    };

    return (
      <div ref={setRefs} style={rootStyle} {...rest}>
        {maps && size && (
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
                result="sat"
              />
              <feImage
                href={maps.specularUrl}
                x={0}
                y={0}
                width={size.w}
                height={size.h}
                preserveAspectRatio="none"
                result="spec"
              />
              <feComponentTransfer in="spec" result="spec2">
                <feFuncA type="linear" slope={specularOpacity} />
              </feComponentTransfer>
              <feBlend in="spec2" in2="sat" mode="normal" />
            </filter>
          </svg>
        )}
        {children}
      </div>
    );
  },
);
