/**
 * Liquid Glass math: refraction table, displacement map and specular mask.
 * Pure functions, no React. Based on the approach from
 * https://kube.io/blog/liquid-glass-css-svg/ (the specular part is our own construction).
 */

export type GlassProfile = 'squircle' | 'circle' | 'concave' | 'lip';

/** Number of samples along the bezel. 128 matches the 8-bit resolution of the displacement map. */
export const SAMPLES = 128;

const smootherstep = (x: number): number => x * x * x * (x * (x * 6 - 15) + 10);
const squircle = (x: number): number => Math.pow(1 - Math.pow(1 - x, 4), 0.25);

/** Height profiles f(x), x in [0, 1] from the outer edge (0) to the end of the bezel (1). */
const PROFILES: Record<GlassProfile, (x: number) => number> = {
  circle: (x) => Math.sqrt(1 - (1 - x) * (1 - x)),
  squircle,
  concave: (x) => 1 - squircle(x),
  lip: (x) => {
    const s = smootherstep(x);
    return squircle(x) * (1 - s) + (1 - squircle(x)) * s;
  },
};

function derivative(f: (x: number) => number, x: number): number {
  const e = 0.001;
  const lo = Math.max(0, x - e);
  const hi = Math.min(1, x + e);
  return (f(hi) - f(lo)) / (hi - lo);
}

export interface RefractionTable {
  /** Signed displacement in px for each sample. Positive points towards the panel centre. */
  displacement: Float64Array;
  /** Largest absolute displacement in px. */
  maxAbs: number;
}

/**
 * Snell's law along one radius of the bezel. The incoming ray is vertical, the glass height at
 * distance d from the edge is h = H * f(d / B), the surface slope is H * f'(x) / B.
 */
export function computeRefractionTable(
  profile: GlassProfile,
  bezel: number,
  glassHeight: number,
  ior: number,
): RefractionTable {
  const f = PROFILES[profile];
  const displacement = new Float64Array(SAMPLES);
  const n = Math.max(1, ior);
  let maxAbs = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const x = i / (SAMPLES - 1);
    const h = glassHeight * f(x);
    const slope = (glassHeight * derivative(f, x)) / bezel;
    const t1 = Math.atan(Math.abs(slope)); // angle of incidence
    const t2 = Math.asin(Math.min(1, Math.sin(t1) / n)); // angle of refraction
    displacement[i] = Math.sign(slope) * h * Math.tan(t1 - t2);
    maxAbs = Math.max(maxAbs, Math.abs(displacement[i]));
  }
  return { displacement, maxAbs: maxAbs < 1e-3 ? 0 : maxAbs };
}

/** Normalised signed displacement in [-1, 1] at x in [0, 1], linearly interpolated. */
function lookup(table: RefractionTable, x: number): number {
  if (table.maxAbs === 0) return 0;
  const p = Math.min(1, Math.max(0, x)) * (SAMPLES - 1);
  const i = Math.floor(p);
  const j = Math.min(SAMPLES - 1, i + 1);
  const k = p - i;
  return (table.displacement[i] * (1 - k) + table.displacement[j] * k) / table.maxAbs;
}

interface FillOptions {
  width: number;
  height: number;
  radius: number;
  bezel: number;
  specularAngle: number;
  specularWidth: number;
}

/** Fills RGBA buffers: displacement map (R = x, G = y, 128 = neutral) and white specular mask. */
function fillMaps(
  o: FillOptions,
  table: RefractionTable,
  mapData: Uint8ClampedArray,
  specData: Uint8ClampedArray,
): void {
  const { width: W, height: H, radius: R, bezel: B, specularWidth: rimW } = o;
  const cx = W / 2;
  const cy = H / 2;
  const hx = W / 2 - R;
  const hy = H / 2 - R;
  const a = (o.specularAngle * Math.PI) / 180;
  const lx = Math.cos(a);
  const ly = Math.sin(a);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const px = x + 0.5 - cx;
      const py = y + 0.5 - cy;
      const qx = Math.abs(px) - hx;
      const qy = Math.abs(py) - hy;
      const ox = Math.max(qx, 0);
      const oy = Math.max(qy, 0);
      const len = Math.hypot(ox, oy);
      const sd = len + Math.min(Math.max(qx, qy), 0) - R; // signed distance to the rounded rect

      mapData[i] = 128;
      mapData[i + 1] = 128;
      mapData[i + 2] = 128;
      mapData[i + 3] = 255;
      specData[i] = 255;
      specData[i + 1] = 255;
      specData[i + 2] = 255;
      specData[i + 3] = 0;
      if (sd >= 0) continue; // outside the shape

      const d = -sd;
      const sx = px < 0 ? -1 : 1;
      const sy = py < 0 ? -1 : 1;
      let nx: number; // outward normal of the contour
      let ny: number;
      if (qx > 0 && qy > 0 && len > 0) {
        nx = (sx * ox) / len;
        ny = (sy * oy) / len;
      } else if (qx > qy) {
        nx = sx;
        ny = 0;
      } else {
        nx = 0;
        ny = sy;
      }

      if (d < B) {
        const m = lookup(table, d / B);
        mapData[i] = Math.round(128 - nx * m * 127); // inward = -normal
        mapData[i + 1] = Math.round(128 - ny * m * 127);
      }

      const c = nx * lx + ny * ly;
      const lit = Math.max(c, 0) + 0.5 * Math.max(-c, 0);
      const t = Math.max(0, 1 - d / rimW);
      const rim = t * t * (3 - 2 * t);
      const wide = 0.18 * Math.pow(Math.max(0, 1 - d / B), 2);
      const edgeAA = Math.min(1, d);
      specData[i + 3] = Math.round(255 * Math.min(1, lit * Math.min(1, rim + wide) * edgeAA));
    }
  }
}

export interface GlassMapOptions {
  width: number;
  height: number;
  radius: number;
  bezel: number;
  glassHeight: number;
  ior: number;
  strength: number;
  specularAngle: number;
  specularWidth: number;
  profile: GlassProfile;
}

export interface GlassMaps {
  /** PNG data URL for feDisplacementMap. */
  displacementUrl: string;
  /** PNG data URL, white with alpha, for the specular overlay. */
  specularUrl: string;
  /** Value for feDisplacementMap `scale`. */
  scale: number;
  /** Largest displacement in px, before the strength multiplier. */
  maxDisplacement: number;
}

/** Builds both maps on canvas. Returns null on the server or when canvas is unavailable. */
export function createGlassMaps(o: GlassMapOptions): GlassMaps | null {
  if (typeof document === 'undefined') return null;
  const W = Math.round(o.width);
  const H = Math.round(o.height);
  if (W < 2 || H < 2) return null;

  const R = Math.min(Math.max(0, o.radius), W / 2, H / 2);
  const B = Math.max(1, Math.min(o.bezel, Math.min(W, H) / 2));
  const rimW = Math.max(0.5, o.specularWidth);
  const table = computeRefractionTable(o.profile, B, o.glassHeight, o.ior);

  const mapCanvas = document.createElement('canvas');
  const specCanvas = document.createElement('canvas');
  mapCanvas.width = specCanvas.width = W;
  mapCanvas.height = specCanvas.height = H;
  const mapCtx = mapCanvas.getContext('2d');
  const specCtx = specCanvas.getContext('2d');
  if (!mapCtx || !specCtx) return null;

  const mapImg = mapCtx.createImageData(W, H);
  const specImg = specCtx.createImageData(W, H);
  fillMaps(
    { width: W, height: H, radius: R, bezel: B, specularAngle: o.specularAngle, specularWidth: rimW },
    table,
    mapImg.data,
    specImg.data,
  );
  mapCtx.putImageData(mapImg, 0, 0);
  specCtx.putImageData(specImg, 0, 0);

  return {
    displacementUrl: mapCanvas.toDataURL('image/png'),
    specularUrl: specCanvas.toDataURL('image/png'),
    // Per the SVG spec the offset is scale * (C - 0.5), so a 0..255 channel spans +-scale/2.
    scale: ((table.maxAbs * 255) / 127) * o.strength,
    maxDisplacement: table.maxAbs,
  };
}
