import { normalizeHrefInRuntime } from '@rspress/core/runtime';
import { useEffect, useRef } from 'react';
import styles from './index.module.scss';

export interface Hero {
  name: string;
  text: string;
  accent: string;
  tagline: string;
  terminal: {
    install: string;
    trace: string;
    connected: string;
    ready: string;
  };
  actions: {
    text: string;
    link: string;
    theme: 'brand' | 'alt';
  }[];
}

interface Star {
  x: number;
  y: number;
  depth: number;
  radius: number;
  phase: number;
  kind: 'host' | 'remote' | 'ambient';
}

interface Mote {
  x: number;
  y: number;
  depth: number;
  phase: number;
  speed: number;
}

interface Point {
  x: number;
  y: number;
}

interface Ripple extends Point {
  startedAt: number;
}

const TAU = Math.PI * 2;

function createRandom(seed = 731) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function createField(width: number, height: number) {
  const random = createRandom(Math.round(width + height));
  const compact = width < 680;
  const focusX = width * (compact ? 0.62 : 0.74);
  const focusY = height * (compact ? 0.7 : 0.47);
  const anchors: Point[] = compact
    ? [
        { x: focusX, y: focusY },
        { x: width * 0.34, y: height * 0.52 },
        { x: width * 0.88, y: height * 0.48 },
        { x: width * 0.86, y: height * 0.83 },
      ]
    : [
        { x: focusX, y: focusY },
        { x: width * 0.56, y: height * 0.24 },
        { x: width * 0.9, y: height * 0.24 },
        { x: width * 0.88, y: height * 0.67 },
      ];

  const stars: Star[] = anchors.map((point, index) => ({
    ...point,
    depth: index === 0 ? 1 : 0.82 + random() * 0.12,
    radius: index === 0 ? (compact ? 5 : 7) : 3.2 + random() * 1.8,
    phase: random() * TAU,
    kind: index === 0 ? 'host' : 'remote',
  }));

  const count = compact ? 24 : width < 1000 ? 28 : 34;
  for (let index = stars.length; index < count; index += 1) {
    const clustered = random() > 0.2;
    const angle = random() * TAU;
    const distance = Math.pow(random(), 0.72) * Math.min(width, height) * 0.52;
    const rawX = clustered
      ? focusX + Math.cos(angle) * distance * 1.25
      : random() * width;
    const rawY = clustered
      ? focusY + Math.sin(angle) * distance
      : random() * height;
    const depth = 0.25 + random() * 0.72;
    stars.push({
      x: Math.max(width * (compact ? 0.12 : 0.31), Math.min(width, rawX)),
      y: Math.max(0, Math.min(height, rawY)),
      depth,
      radius: 0.65 + depth * 1.7 + random(),
      phase: random() * TAU,
      kind: 'ambient',
    });
  }

  const motes: Mote[] = Array.from({ length: compact ? 36 : 62 }, () => {
    const start = compact ? 0.08 : 0.3;
    return {
      x: width * (start + Math.pow(random(), 0.72) * (1 - start)),
      y: random() * height,
      depth: 0.18 + random() * 0.82,
      phase: random() * TAU,
      speed: 0.35 + random() * 0.85,
    };
  });

  return { stars, motes };
}

function quadraticPoint(
  from: Point,
  control: Point,
  to: Point,
  amount: number,
) {
  const inverse = 1 - amount;
  return {
    x:
      inverse * inverse * from.x +
      2 * inverse * amount * control.x +
      amount * amount * to.x,
    y:
      inverse * inverse * from.y +
      2 * inverse * amount * control.y +
      amount * amount * to.y,
  };
}

function ConstellationField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const surface = canvas?.closest<HTMLElement>(
      '[data-constellation-surface]',
    );
    const context = canvas?.getContext('2d');
    if (!canvas || !surface || !context) return;

    let width = 1;
    let height = 1;
    let stars: Star[] = [];
    let motes: Mote[] = [];
    let frame = 0;
    let lastFrame = 0;
    let visible = true;
    let pointerInside = false;
    let ripple: Ripple | null = null;
    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0 };
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const resize = () => {
      const rect = surface.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      ({ stars, motes } = createField(width, height));
      pointer.x = pointerTarget.x = width * 0.72;
      pointer.y = pointerTarget.y = height * 0.46;
    };

    const locate = (star: Star, time: number) => {
      const parallaxX = (pointer.x - width / 2) * 0.035 * star.depth;
      const parallaxY = (pointer.y - height / 2) * 0.026 * star.depth;
      const drift = 3 + 6 * star.depth;
      let x =
        star.x + Math.cos(time * 0.00012 + star.phase) * drift + parallaxX;
      let y =
        star.y +
        Math.sin(time * 0.0001 + star.phase) * drift * 0.72 +
        parallaxY;

      if (pointerInside) {
        const dx = pointer.x - x;
        const dy = pointer.y - y;
        const distance = Math.hypot(dx, dy) || 1;
        const reach = Math.max(0, 1 - distance / 260);
        x += (dx / distance) * reach * 19 * star.depth;
        y += (dy / distance) * reach * 19 * star.depth;
      }

      return { x, y };
    };

    const drawStar = (star: Star, point: Point, time: number) => {
      const distance = Math.hypot(point.x - pointer.x, point.y - pointer.y);
      const response = pointerInside ? Math.max(0, 1 - distance / 240) : 0;
      const breathe = 1 + Math.sin(time * 0.0008 + star.phase) * 0.05;
      const radius = star.radius * breathe * (1 + response * 0.28);
      const remote = star.kind === 'remote';
      const host = star.kind === 'host';
      const glow = host
        ? '224, 216, 187'
        : remote
          ? '183, 199, 211'
          : '135, 167, 193';

      context.save();
      context.globalAlpha = 0.16 + star.depth * 0.46;
      context.shadowColor = `rgba(${glow}, ${0.24 + response * 0.28})`;
      context.shadowBlur = radius * (host ? 6 : 4.4) + response * 14;

      const halo = context.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        radius * 2.8,
      );
      halo.addColorStop(0, `rgba(241, 239, 224, ${host ? 0.92 : 0.68})`);
      halo.addColorStop(0.16, `rgba(${glow}, 0.54)`);
      halo.addColorStop(0.5, `rgba(${glow}, 0.14)`);
      halo.addColorStop(1, `rgba(${glow}, 0)`);
      context.fillStyle = halo;
      context.beginPath();
      context.arc(point.x, point.y, radius * 2.8, 0, TAU);
      context.fill();

      context.shadowBlur = 0;
      context.fillStyle = `rgba(241, 238, 219, ${0.46 + star.depth * 0.42})`;
      context.beginPath();
      context.arc(point.x, point.y, Math.max(0.55, radius * 0.26), 0, TAU);
      context.fill();

      if (star.kind !== 'ambient') {
        context.strokeStyle = `rgba(${glow}, ${0.24 + response * 0.22})`;
        context.lineWidth = 0.55;
        context.beginPath();
        context.moveTo(point.x - radius * 1.8, point.y);
        context.lineTo(point.x + radius * 1.8, point.y);
        context.moveTo(point.x, point.y - radius * 1.25);
        context.lineTo(point.x, point.y + radius * 1.25);
        context.stroke();
      }
      context.restore();
    };

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);
      pointer.x += (pointerTarget.x - pointer.x) * 0.075;
      pointer.y += (pointerTarget.y - pointer.y) * 0.075;

      const pointerHalo = context.createRadialGradient(
        pointer.x,
        pointer.y,
        0,
        pointer.x,
        pointer.y,
        270,
      );
      pointerHalo.addColorStop(
        0,
        `rgba(195, 207, 218, ${pointerInside ? 0.065 : 0.016})`,
      );
      pointerHalo.addColorStop(
        0.42,
        `rgba(66, 102, 139, ${pointerInside ? 0.032 : 0.009})`,
      );
      pointerHalo.addColorStop(1, 'rgba(4, 11, 24, 0)');
      context.fillStyle = pointerHalo;
      context.fillRect(0, 0, width, height);

      for (const mote of motes) {
        const y =
          mote.y +
          Math.sin(time * 0.00012 * mote.speed + mote.phase) *
            (3 + mote.depth * 7);
        const x =
          mote.x +
          Math.cos(time * 0.00009 * mote.speed + mote.phase) *
            (4 + mote.depth * 9) +
          (pointer.x - width / 2) * 0.012 * mote.depth;
        const alpha = 0.025 + mote.depth * 0.11;
        context.fillStyle = `rgba(205, 214, 220, ${alpha})`;
        context.beginPath();
        context.arc(x, y, 0.45 + mote.depth * 1.15, 0, TAU);
        context.fill();
      }

      const points = stars.map((star) => locate(star, time));
      let connectionIndex = 0;
      for (let fromIndex = 0; fromIndex < stars.length; fromIndex += 1) {
        const fromStar = stars[fromIndex]!;
        const from = points[fromIndex]!;
        let links = 0;
        const candidates = stars
          .map((_, toIndex) => ({
            toIndex,
            distance:
              toIndex === fromIndex
                ? Number.POSITIVE_INFINITY
                : Math.hypot(
                    points[toIndex]!.x - from.x,
                    points[toIndex]!.y - from.y,
                  ),
          }))
          .sort((left, right) => left.distance - right.distance);

        for (const candidate of candidates) {
          if (candidate.toIndex <= fromIndex || links >= 2) continue;
          const toStar = stars[candidate.toIndex]!;
          const to = points[candidate.toIndex]!;
          const majorLink =
            fromStar.kind !== 'ambient' && toStar.kind !== 'ambient';
          const reach = majorLink
            ? 420
            : 148 + (fromStar.depth + toStar.depth) * 48;
          if (candidate.distance > reach) continue;

          const nearPointer = Math.min(
            Math.hypot(from.x - pointer.x, from.y - pointer.y),
            Math.hypot(to.x - pointer.x, to.y - pointer.y),
          );
          const response = pointerInside
            ? Math.max(0, 1 - nearPointer / 250)
            : 0;
          const normalX = -(to.y - from.y) / candidate.distance;
          const normalY = (to.x - from.x) / candidate.distance;
          const bend =
            Math.sin(fromStar.phase * 1.7 + toStar.phase) *
            Math.min(34, candidate.distance * 0.13);
          const control = {
            x: (from.x + to.x) / 2 + normalX * bend,
            y: (from.y + to.y) / 2 + normalY * bend,
          };

          context.strokeStyle = majorLink
            ? `rgba(211, 211, 194, ${0.09 + response * 0.24})`
            : `rgba(126, 157, 184, ${0.022 + Math.min(fromStar.depth, toStar.depth) * 0.068 + response * 0.14})`;
          context.lineWidth = majorLink
            ? 0.9 + response * 0.45
            : 0.4 + response * 0.32;
          context.beginPath();
          context.moveTo(from.x, from.y);
          context.quadraticCurveTo(control.x, control.y, to.x, to.y);
          context.stroke();

          if (majorLink || response > 0.32) {
            const progress =
              (time * (majorLink ? 0.0001 : 0.000065) +
                connectionIndex * 0.173) %
              1;
            const pulse = quadraticPoint(from, control, to, progress);
            context.save();
            context.shadowColor = 'rgba(218, 220, 208, 0.7)';
            context.shadowBlur = 9 + response * 12;
            context.fillStyle = `rgba(230, 227, 207, ${0.38 + response * 0.3})`;
            context.beginPath();
            context.arc(pulse.x, pulse.y, 0.8 + response * 0.8, 0, TAU);
            context.fill();
            context.restore();
          }

          connectionIndex += 1;
          links += 1;
        }
      }

      stars.forEach((star, index) => drawStar(star, points[index]!, time));

      if (ripple) {
        const age = time - ripple.startedAt;
        if (age < 1050) {
          const progress = age / 1050;
          context.strokeStyle = `rgba(201, 211, 218, ${(1 - progress) * 0.25})`;
          context.lineWidth = 1.2 - progress * 0.8;
          context.beginPath();
          context.arc(ripple.x, ripple.y, 18 + progress * 170, 0, TAU);
          context.stroke();
        } else {
          ripple = null;
        }
      }
    };

    const animate = (time: number) => {
      if (visible && time - lastFrame > 1000 / 50) {
        draw(time);
        lastFrame = time;
      }
      frame = requestAnimationFrame(animate);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = surface.getBoundingClientRect();
      pointerTarget.x = event.clientX - rect.left;
      pointerTarget.y = event.clientY - rect.top;
      pointerInside = true;
      surface.style.setProperty(
        '--paint-x',
        `${((pointerTarget.x / width - 0.5) * -12).toFixed(2)}px`,
      );
      surface.style.setProperty(
        '--paint-y',
        `${((pointerTarget.y / height - 0.5) * -8).toFixed(2)}px`,
      );
      if (reduceMotion.matches) draw(performance.now());
    };

    const onPointerLeave = () => {
      pointerInside = false;
      pointerTarget.x = width * 0.72;
      pointerTarget.y = height * 0.46;
      surface.style.setProperty('--paint-x', '0px');
      surface.style.setProperty('--paint-y', '0px');
    };

    const onPointerDown = (event: PointerEvent) => {
      const rect = surface.getBoundingClientRect();
      ripple = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        startedAt: performance.now(),
      };
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });

    resize();
    draw(performance.now());
    resizeObserver.observe(surface);
    visibilityObserver.observe(surface);
    surface.addEventListener('pointermove', onPointerMove, { passive: true });
    surface.addEventListener('pointerleave', onPointerLeave, { passive: true });
    surface.addEventListener('pointerdown', onPointerDown, { passive: true });
    if (!reduceMotion.matches) frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      surface.removeEventListener('pointermove', onPointerMove);
      surface.removeEventListener('pointerleave', onPointerLeave);
      surface.removeEventListener('pointerdown', onPointerDown);
      surface.style.removeProperty('--paint-x');
      surface.style.removeProperty('--paint-y');
    };
  }, []);

  return (
    <div className={styles.constellationField} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

export function HomeHero({ hero }: { hero: Hero }) {
  return (
    <section className={styles.hero} data-constellation-surface>
      <div
        className={styles.paintedBackdrop}
        style={{ backgroundImage: "url('/home-galaxy-oil-v2.jpg')" }}
        aria-hidden="true"
      />
      <ConstellationField />
      <div className={styles.heroShade} aria-hidden="true" />

      <div className={styles.heroInner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.statusDot} aria-hidden="true" />
            {hero.name}
          </p>
          <h1>
            <span>{hero.text}</span>
            <span className={styles.headlineAccent}>{hero.accent}</span>
          </h1>
          <p className={styles.tagline}>{hero.tagline}</p>
          <div className={styles.actions}>
            {hero.actions.map((action) => (
              <a
                key={action.link}
                className={
                  action.theme === 'brand'
                    ? styles.primaryAction
                    : styles.secondaryAction
                }
                href={normalizeHrefInRuntime(action.link)}
              >
                <span>{action.text}</span>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8h9M8.5 3.5 13 8l-4.5 4.5" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
