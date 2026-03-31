import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/** Colored half of med-style capsules (left half is always white). */
export type CapsuleColorId = 'red' | 'blue' | 'orange';

const CAPSULE_PAIR: Record<
  CapsuleColorId,
  { solid: string; deep: string; border: string; shadow: string }
> = {
  red: {
    solid: '#e11d48',
    deep: '#9f1239',
    border: '#fecdd3',
    shadow: 'rgba(190, 18, 60, 0.35)',
  },
  blue: {
    solid: '#93c5fd',
    deep: '#60a5fa',
    border: '#dbeafe',
    shadow: 'rgba(147, 197, 253, 0.35)',
  },
  orange: {
    solid: '#ea580c',
    deep: '#c2410c',
    border: '#fed7aa',
    shadow: 'rgba(194, 65, 12, 0.35)',
  },
};

const CYCLE: CapsuleColorId[] = ['red', 'blue', 'orange'];
const pickCapsule = (i: number): CapsuleColorId => CYCLE[i % CYCLE.length];

export type BubbleSpec = {
  leftPct: number;
  topPct: number;
  /** Diameter in dp — varied for visual depth */
  diameter: number;
  capsuleColor: CapsuleColorId;
};

/** Scale spread (actual px from `capsuleMetrics`). */
const BUBBLE_LAYOUT: BubbleSpec[] = [
  { leftPct: 4, topPct: 8, diameter: 20, capsuleColor: pickCapsule(0) },
  { leftPct: 16, topPct: 14, diameter: 14, capsuleColor: pickCapsule(1) },
  { leftPct: 30, topPct: 6, diameter: 22, capsuleColor: pickCapsule(2) },
  { leftPct: 44, topPct: 12, diameter: 15, capsuleColor: pickCapsule(3) },
  { leftPct: 58, topPct: 9, diameter: 23, capsuleColor: pickCapsule(4) },
  { leftPct: 72, topPct: 16, diameter: 13, capsuleColor: pickCapsule(5) },
  { leftPct: 86, topPct: 5, diameter: 19, capsuleColor: pickCapsule(6) },
  { leftPct: 94, topPct: 22, diameter: 16, capsuleColor: pickCapsule(7) },
  { leftPct: 8, topPct: 32, diameter: 21, capsuleColor: pickCapsule(8) },
  { leftPct: 36, topPct: 38, diameter: 14, capsuleColor: pickCapsule(9) },
  { leftPct: 52, topPct: 30, diameter: 22, capsuleColor: pickCapsule(10) },
  { leftPct: 76, topPct: 36, diameter: 15, capsuleColor: pickCapsule(11) },
  { leftPct: 22, topPct: 48, diameter: 18, capsuleColor: pickCapsule(12) },
  { leftPct: 64, topPct: 52, diameter: 23, capsuleColor: pickCapsule(13) },
  { leftPct: 12, topPct: 62, diameter: 14, capsuleColor: pickCapsule(14) },
  { leftPct: 48, topPct: 68, diameter: 21, capsuleColor: pickCapsule(15) },
  { leftPct: 82, topPct: 64, diameter: 16, capsuleColor: pickCapsule(16) },
  { leftPct: 6, topPct: 78, diameter: 21, capsuleColor: pickCapsule(17) },
  { leftPct: 40, topPct: 84, diameter: 13, capsuleColor: pickCapsule(18) },
  { leftPct: 88, topPct: 80, diameter: 20, capsuleColor: pickCapsule(19) },
  { leftPct: 28, topPct: 90, diameter: 16, capsuleColor: pickCapsule(20) },
  { leftPct: 56, topPct: 92, diameter: 14, capsuleColor: pickCapsule(21) },
  { leftPct: 92, topPct: 42, diameter: 22, capsuleColor: pickCapsule(22) },
  { leftPct: 20, topPct: 56, diameter: 15, capsuleColor: pickCapsule(23) },
];

const IMPULSE_SPEED_MIN = 400;
const IMPULSE_SPEED_MAX = 560;
const IMPULSE_MS = 780;
const COOLDOWN_LERP = 6.2;

/** Never let cruising speed drop this low (avoids “stuck” crawling at walls). */
const MIN_SPEED = 38;
/** Minimum velocity component pointing *into* the playfield from each edge. */
const WALL_OUT = 30;
/** Elastic bounce: opposite normal, slightly livelier than 1. */
const WALL_BOUNCE = 1.06;
const MAX_BOUNCE_SPEED = 520;

/** On-screen pills; short body, modest length (`base` is layout scale from `BUBBLE_LAYOUT`). */
function capsuleMetrics(base: number) {
  const s = Math.max(7.5, base * 0.72);
  const h = Math.max(4.5, s * 0.38);
  const w = s * 1.12;
  const r = h / 2;
  return { w, h, r };
}

/** White half + soft shell edge (gelatin cap look). */
const CAPSULE_WHITE = '#ffffff';
const CAPSULE_WHITE_EDGE = '#e8e8e8';

/** Random cruising direction (both vx and vy), speed in a comfortable band. */
function randomBaseVelocity(): { vx: number; vy: number } {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.max(MIN_SPEED, 44 + Math.random() * 62);
  return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
}

type HitEntry = {
  xAnim: Animated.Value;
  yAnim: Animated.Value;
  width: number;
  height: number;
  onPress: () => void;
};

type RegAction =
  | { type: 'register'; index: number; entry: HitEntry }
  | { type: 'unregister'; index: number };

function hitReducer(state: Record<number, HitEntry>, action: RegAction): Record<number, HitEntry> {
  if (action.type === 'unregister') {
    const next = { ...state };
    delete next[action.index];
    return next;
  }
  return { ...state, [action.index]: action.entry };
}

export function useBubbleHitRegistry() {
  return useReducer(hitReducer, {});
}

function hypotClamp(vx: number, vy: number, min: number, bx: number, by: number) {
  const h = Math.hypot(vx, vy);
  if (h >= min) return { vx, vy };
  if (h < 1e-6) {
    const bh = Math.hypot(bx, by);
    if (bh < 1e-6) return { vx: min, vy: 0 };
    return { vx: (bx / bh) * min, vy: (by / bh) * min };
  }
  const s = min / h;
  return { vx: vx * s, vy: vy * s };
}

/**
 * Integrate one step with wall bounces, corner-safe multi-pass clamp, and minimum speed
 * so bubbles never rest in a corner.
 */
function integrateBubble(
  x: number,
  y: number,
  vx: number,
  vy: number,
  dt: number,
  mx: number,
  my: number,
  baseVx: number,
  baseVy: number,
  impulseOn: boolean
) {
  if (!impulseOn) {
    const t = Math.min(1, COOLDOWN_LERP * dt);
    vx += (baseVx - vx) * t;
    vy += (baseVy - vy) * t;
  }

  x += vx * dt;
  y += vy * dt;

  const clampV = (v: number) => Math.max(-MAX_BOUNCE_SPEED, Math.min(MAX_BOUNCE_SPEED, v));

  for (let pass = 0; pass < 8; pass++) {
    let moved = false;
    if (mx > 0) {
      if (x < 0) {
        x = 0;
        vx = clampV(-vx * WALL_BOUNCE);
        moved = true;
      } else if (x > mx) {
        x = mx;
        vx = clampV(-vx * WALL_BOUNCE);
        moved = true;
      }
    } else {
      x = 0;
      vx = 0;
    }
    if (my > 0) {
      if (y < 0) {
        y = 0;
        vy = clampV(-vy * WALL_BOUNCE);
        moved = true;
      } else if (y > my) {
        y = my;
        vy = clampV(-vy * WALL_BOUNCE);
        moved = true;
      }
    } else {
      y = 0;
      vy = 0;
    }
    if (!moved) break;
  }

  if (mx <= 0) {
    x = 0;
    vx = 0;
  }
  if (my <= 0) {
    y = 0;
    vy = 0;
  }

  if (mx > 0) {
    if (x <= 0) vx = Math.max(vx, WALL_OUT);
    if (x >= mx) vx = Math.min(vx, -WALL_OUT);
    if (x <= 0 && vx < 0) vx = Math.abs(vx);
    if (x >= mx && vx > 0) vx = -Math.abs(vx);
  }
  if (my > 0) {
    if (y <= 0) vy = Math.max(vy, WALL_OUT);
    if (y >= my) vy = Math.min(vy, -WALL_OUT);
    if (y <= 0 && vy < 0) vy = Math.abs(vy);
    if (y >= my && vy > 0) vy = -Math.abs(vy);
  }

  // During tap impulse, never re-scale velocity toward base (keeps fast burst + bounce)
  if (!impulseOn) {
    if (mx > 0 && my > 0) {
      const clamped = hypotClamp(vx, vy, MIN_SPEED, baseVx, baseVy);
      vx = clamped.vx;
      vy = clamped.vy;
    } else if (mx > 0 && my <= 0) {
      if (Math.abs(vx) < MIN_SPEED) vx = vx >= 0 ? MIN_SPEED : -MIN_SPEED;
    } else if (mx <= 0 && my > 0) {
      if (Math.abs(vy) < MIN_SPEED) vy = vy >= 0 ? MIN_SPEED : -MIN_SPEED;
    }

    if (mx > 0) {
      if (x <= 0) vx = Math.max(vx, WALL_OUT);
      if (x >= mx) vx = Math.min(vx, -WALL_OUT);
    }
    if (my > 0) {
      if (y <= 0) vy = Math.max(vy, WALL_OUT);
      if (y >= my) vy = Math.min(vy, -WALL_OUT);
    }
  }

  /** Push off corners so velocity never points into a corner seam (avoids sticking). */
  const CE = 1.5;
  if (mx > CE * 2 && my > CE * 2) {
    if (x <= CE && y <= CE) {
      x = CE;
      y = CE;
      vx = Math.max(WALL_OUT, Math.abs(vx));
      vy = Math.max(WALL_OUT, Math.abs(vy));
    } else if (x >= mx - CE && y <= CE) {
      x = mx - CE;
      y = CE;
      vx = -Math.max(WALL_OUT, Math.abs(vx));
      vy = Math.max(WALL_OUT, Math.abs(vy));
    } else if (x <= CE && y >= my - CE) {
      x = CE;
      y = my - CE;
      vx = Math.max(WALL_OUT, Math.abs(vx));
      vy = -Math.max(WALL_OUT, Math.abs(vy));
    } else if (x >= mx - CE && y >= my - CE) {
      x = mx - CE;
      y = my - CE;
      vx = -Math.max(WALL_OUT, Math.abs(vx));
      vy = -Math.max(WALL_OUT, Math.abs(vy));
    }
  }

  if (mx > 0) x = Math.max(0, Math.min(mx, x));
  if (my > 0) y = Math.max(0, Math.min(my, y));

  return { x, y, vx, vy };
}

type BouncingBubbleProps = {
  spec: BubbleSpec;
  width: number;
  height: number;
  index: number;
  dispatch: React.Dispatch<RegAction>;
};

function BouncingBubble({ spec, width, height, index, dispatch }: BouncingBubbleProps) {
  const { diameter, capsuleColor } = spec;
  const pair = CAPSULE_PAIR[capsuleColor];
  const cap = capsuleMetrics(diameter);

  const maxX = Math.max(0, width - cap.w);
  const maxY = Math.max(0, height - cap.h);

  const baseVel = useRef(randomBaseVelocity());
  const pos = useRef({
    x: (spec.leftPct / 100) * maxX,
    y: (spec.topPct / 100) * maxY,
  });
  const vel = useRef({ vx: baseVel.current.vx, vy: baseVel.current.vy });
  const impulseUntil = useRef(0);

  const xAnim = useRef(new Animated.Value(pos.current.x)).current;
  const yAnim = useRef(new Animated.Value(pos.current.y)).current;
  const op = useRef(new Animated.Value(0.78)).current;

  const applyImpulse = useCallback(() => {
    const angle = Math.random() * Math.PI * 2;
    const mag = IMPULSE_SPEED_MIN + Math.random() * (IMPULSE_SPEED_MAX - IMPULSE_SPEED_MIN);
    vel.current = { vx: Math.cos(angle) * mag, vy: Math.sin(angle) * mag };
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    impulseUntil.current = now + IMPULSE_MS;
  }, []);

  useEffect(() => {
    pos.current.x = (spec.leftPct / 100) * maxX;
    pos.current.y = (spec.topPct / 100) * maxY;
    xAnim.setValue(pos.current.x);
    yAnim.setValue(pos.current.y);
  }, [maxX, maxY, spec.leftPct, spec.topPct, xAnim, yAnim]);

  useEffect(() => {
    dispatch({
      type: 'register',
      index,
      entry: { xAnim, yAnim, width: cap.w, height: cap.h, onPress: applyImpulse },
    });
    return () => dispatch({ type: 'unregister', index });
  }, [applyImpulse, index, dispatch, xAnim, yAnim, cap.w, cap.h]);

  useEffect(() => {
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(op, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0.52, duration: 2800, useNativeDriver: true }),
      ])
    );
    breathe.start();
    return () => breathe.stop();
  }, [op]);

  useEffect(() => {
    if (width <= 0 || height <= 0) return;

    let frameId: number;
    let last = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const step = () => {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.064) dt = 0.064;

      const mx = Math.max(0, width - cap.w);
      const my = Math.max(0, height - cap.h);

      let { x, y } = pos.current;
      let { vx, vy } = vel.current;

      const impulseOn = now < impulseUntil.current;
      const bx = baseVel.current.vx;
      const by = baseVel.current.vy;

      const next = integrateBubble(x, y, vx, vy, dt, mx, my, bx, by, impulseOn);
      x = next.x;
      y = next.y;
      vx = next.vx;
      vy = next.vy;

      pos.current = { x, y };
      vel.current = { vx, vy };
      xAnim.setValue(x);
      yAnim.setValue(y);

      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [width, height, cap.w, cap.h, xAnim, yAnim]);

  const halfW = cap.w / 2;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.bubbleWrap,
        {
          left: 0,
          top: 0,
          width: cap.w,
          height: cap.h,
          opacity: op,
          transform: [{ translateX: xAnim }, { translateY: yAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.capsuleOuter,
          {
            width: cap.w,
            height: cap.h,
            borderRadius: cap.r,
            borderColor: pair.border,
            shadowColor: pair.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.28,
            shadowRadius: cap.h * 0.35,
            elevation: 3,
          },
        ]}
      >
        <View style={styles.capsuleHalves}>
          <View
            style={[
              styles.capsuleHalf,
              {
                width: halfW,
                height: cap.h,
                borderTopLeftRadius: cap.r,
                borderBottomLeftRadius: cap.r,
                backgroundColor: CAPSULE_WHITE,
              },
            ]}
          />
          <LinearGradient
            colors={[pair.solid, pair.deep]}
            locations={[0, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[
              styles.capsuleHalf,
              {
                width: halfW,
                height: cap.h,
                borderTopRightRadius: cap.r,
                borderBottomRightRadius: cap.r,
              },
            ]}
          />
        </View>
        <View
          pointerEvents="none"
          style={[
            styles.capsuleSeam,
            {
              left: halfW - StyleSheet.hairlineWidth,
              height: cap.h * 0.72,
              top: cap.h * 0.14,
            },
          ]}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.06)']}
          locations={[0, 0.45, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { borderRadius: cap.r }]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.creamGloss,
            {
              width: halfW * 0.55,
              height: cap.h * 0.28,
              borderRadius: cap.h * 0.2,
              top: cap.h * 0.14,
              left: cap.w * 0.06,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}

function BubbleField({
  width,
  height,
  dispatch,
}: {
  width: number;
  height: number;
  dispatch: React.Dispatch<RegAction>;
}) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {BUBBLE_LAYOUT.map((spec, i) => (
        <BouncingBubble key={i} spec={spec} width={width} height={height} index={i} dispatch={dispatch} />
      ))}
    </View>
  );
}

export function BubbleHitOverlay({
  hits,
}: {
  hits: Record<number, HitEntry>;
}) {
  return (
    <View style={[StyleSheet.absoluteFill, styles.hitLayer]} pointerEvents="box-none">
      {BUBBLE_LAYOUT.map((spec, i) => {
        const hit = hits[i];
        if (!hit) return null;
        const { xAnim, yAnim, width: hw, height: hh, onPress } = hit;
        return (
          <Animated.View
            key={i}
            collapsable={false}
            pointerEvents="auto"
            style={[
              styles.hitTarget,
              {
                width: hw,
                height: hh,
                transform: [{ translateX: xAnim }, { translateY: yAnim }],
              },
            ]}
          >
            <Pressable
              onPress={onPress}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Background bubble"
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

/**
 * Theme-colored base + continuously bouncing capsule bubbles (behind all UI).
 * Pair with {@link BubbleHitOverlay} and {@link useBubbleHitRegistry} for tap impulses.
 */
export function AnimatedDarkBackdrop({ dispatch }: { dispatch: React.Dispatch<RegAction> }) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const w = width || Dimensions.get('window').width;
  const h = height || Dimensions.get('window').height;

  return (
    <View style={[StyleSheet.absoluteFill, styles.backdropZ]} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
      {/* Floating capsule animation disabled temporarily. */}
      {/* <BubbleField width={w} height={h} dispatch={dispatch} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  backdropZ: {
    zIndex: 0,
  },
  bubbleWrap: {
    position: 'absolute',
  },
  capsuleOuter: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth * 2,
    backgroundColor: CAPSULE_WHITE_EDGE,
  },
  capsuleHalves: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  capsuleHalf: {
    overflow: 'hidden',
  },
  capsuleSeam: {
    position: 'absolute',
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: 'rgba(40,35,30,0.12)',
  },
  creamGloss: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  hitLayer: {
    zIndex: 2,
  },
  hitTarget: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: 'transparent',
  },
});