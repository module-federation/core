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

interface Cell {
  x: number;
  y: number;
  depth: number;
  radius: number;
  phase: number;
  label?: string;
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
const CELL_LABELS = ['commerce-shell', 'catalog', 'checkout', 'account'];

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

  const cells: Cell[] = anchors.map((point, index) => ({
    ...point,
    depth: index === 0 ? 1 : 0.82 + random() * 0.12,
    radius: index === 0 ? (compact ? 11 : 15) : 7 + random() * 3,
    phase: random() * TAU,
    label: CELL_LABELS[index],
    kind: index === 0 ? 'host' : 'remote',
  }));

  const count = compact ? 34 : width < 1000 ? 46 : 62;
  for (let index = cells.length; index < count; index += 1) {
    const clustered = random() > 0.2;
    const angle = random() * TAU;
    const distance = Math.pow(random(), 0.72) * Math.min(width, height) * 0.52;
    const x = clustered
      ? focusX + Math.cos(angle) * distance * 1.25
      : random() * width;
    const y = clustered
      ? focusY + Math.sin(angle) * distance
      : random() * height;
    const depth = 0.25 + random() * 0.72;
    cells.push({
      x,
      y,
      depth,
      radius: 1.4 + depth * 4.7 + random() * 2.1,
      phase: random() * TAU,
      kind: 'ambient',
    });
  }

  const motes: Mote[] = Array.from({ length: compact ? 44 : 76 }, () => ({
    x: random() * width,
    y: random() * height,
    depth: 0.18 + random() * 0.82,
    phase: random() * TAU,
    speed: 0.35 + random() * 0.85,
  }));

  return { cells, motes };
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

function NeuralField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const surface = canvas?.closest<HTMLElement>('[data-neural-surface]');
    const context = canvas?.getContext('2d');
    if (!canvas || !surface || !context) return;

    let width = 1;
    let height = 1;
    let cells: Cell[] = [];
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
      ({ cells, motes } = createField(width, height));
      pointer.x = pointerTarget.x = width * 0.72;
      pointer.y = pointerTarget.y = height * 0.46;
    };

    const locate = (cell: Cell, time: number) => {
      const parallaxX = (pointer.x - width / 2) * 0.035 * cell.depth;
      const parallaxY = (pointer.y - height / 2) * 0.026 * cell.depth;
      const drift = 5 + 9 * cell.depth;
      let x =
        cell.x + Math.cos(time * 0.00018 + cell.phase) * drift + parallaxX;
      let y =
        cell.y +
        Math.sin(time * 0.00014 + cell.phase) * drift * 0.72 +
        parallaxY;

      if (pointerInside) {
        const dx = pointer.x - x;
        const dy = pointer.y - y;
        const distance = Math.hypot(dx, dy) || 1;
        const reach = Math.max(0, 1 - distance / 260);
        x += (dx / distance) * reach * 24 * cell.depth;
        y += (dy / distance) * reach * 24 * cell.depth;
      }

      return { x, y };
    };

    const drawCell = (cell: Cell, point: Point, time: number) => {
      const distance = Math.hypot(point.x - pointer.x, point.y - pointer.y);
      const response = pointerInside ? Math.max(0, 1 - distance / 240) : 0;
      const breathe = 1 + Math.sin(time * 0.0011 + cell.phase) * 0.08;
      const radius = cell.radius * breathe * (1 + response * 0.34);
      const remote = cell.kind === 'remote';
      const host = cell.kind === 'host';
      const glow = host
        ? '88, 232, 234'
        : remote
          ? '140, 126, 255'
          : '121, 221, 226';

      context.save();
      context.globalAlpha = 0.38 + cell.depth * 0.54;
      context.shadowColor = `rgba(${glow}, ${0.34 + response * 0.42})`;
      context.shadowBlur = radius * (host ? 4.6 : 3.2) + response * 24;

      const membrane = context.createRadialGradient(
        point.x - radius * 0.3,
        point.y - radius * 0.36,
        radius * 0.08,
        point.x,
        point.y,
        radius * 1.8,
      );
      membrane.addColorStop(0, `rgba(230, 255, 251, ${host ? 0.94 : 0.7})`);
      membrane.addColorStop(0.18, `rgba(${glow}, 0.58)`);
      membrane.addColorStop(0.54, `rgba(${glow}, 0.16)`);
      membrane.addColorStop(1, `rgba(${glow}, 0)`);
      context.fillStyle = membrane;
      context.beginPath();
      context.arc(point.x, point.y, radius * 1.8, 0, TAU);
      context.fill();

      context.shadowBlur = 0;
      context.strokeStyle = `rgba(${glow}, ${0.28 + cell.depth * 0.35 + response * 0.28})`;
      context.lineWidth = Math.max(0.55, cell.depth * 1.15);
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, TAU);
      context.stroke();

      context.fillStyle = `rgba(225, 255, 252, ${0.5 + cell.depth * 0.42})`;
      context.beginPath();
      context.arc(
        point.x - radius * 0.17,
        point.y - radius * 0.14,
        Math.max(0.8, radius * 0.24),
        0,
        TAU,
      );
      context.fill();
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
        `rgba(80, 223, 229, ${pointerInside ? 0.11 : 0.035})`,
      );
      pointerHalo.addColorStop(
        0.42,
        `rgba(36, 139, 168, ${pointerInside ? 0.055 : 0.018})`,
      );
      pointerHalo.addColorStop(1, 'rgba(7, 44, 63, 0)');
      context.fillStyle = pointerHalo;
      context.fillRect(0, 0, width, height);

      for (const mote of motes) {
        const y =
          (mote.y - time * 0.003 * mote.speed + height * 2) % (height + 80);
        const x =
          mote.x +
          Math.sin(time * 0.00025 * mote.speed + mote.phase) *
            (6 + mote.depth * 12) +
          (pointer.x - width / 2) * 0.012 * mote.depth;
        const alpha = 0.04 + mote.depth * 0.18;
        context.fillStyle = `rgba(190, 245, 244, ${alpha})`;
        context.beginPath();
        context.arc(x, y, 0.45 + mote.depth * 1.15, 0, TAU);
        context.fill();
      }

      const points = cells.map((cell) => locate(cell, time));
      let connectionIndex = 0;
      for (let fromIndex = 0; fromIndex < cells.length; fromIndex += 1) {
        const fromCell = cells[fromIndex]!;
        const from = points[fromIndex]!;
        let links = 0;
        const candidates = cells
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
          if (candidate.toIndex <= fromIndex || links >= 3) continue;
          const toCell = cells[candidate.toIndex]!;
          const to = points[candidate.toIndex]!;
          const majorLink =
            fromCell.kind !== 'ambient' && toCell.kind !== 'ambient';
          const reach = majorLink
            ? 420
            : 148 + (fromCell.depth + toCell.depth) * 48;
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
            Math.sin(fromCell.phase * 1.7 + toCell.phase) *
            Math.min(34, candidate.distance * 0.13);
          const control = {
            x: (from.x + to.x) / 2 + normalX * bend,
            y: (from.y + to.y) / 2 + normalY * bend,
          };

          context.strokeStyle = majorLink
            ? `rgba(130, 237, 238, ${0.16 + response * 0.48})`
            : `rgba(105, 207, 215, ${0.035 + Math.min(fromCell.depth, toCell.depth) * 0.12 + response * 0.28})`;
          context.lineWidth = majorLink
            ? 1.15 + response * 0.7
            : 0.45 + response * 0.55;
          context.beginPath();
          context.moveTo(from.x, from.y);
          context.quadraticCurveTo(control.x, control.y, to.x, to.y);
          context.stroke();

          if (majorLink || response > 0.18) {
            const progress =
              (time * (majorLink ? 0.0001 : 0.000065) +
                connectionIndex * 0.173) %
              1;
            const pulse = quadraticPoint(from, control, to, progress);
            context.save();
            context.shadowColor = 'rgba(185, 255, 252, 0.9)';
            context.shadowBlur = 10 + response * 16;
            context.fillStyle = `rgba(210, 255, 253, ${0.58 + response * 0.38})`;
            context.beginPath();
            context.arc(pulse.x, pulse.y, 1.1 + response * 1.2, 0, TAU);
            context.fill();
            context.restore();
          }

          connectionIndex += 1;
          links += 1;
        }
      }

      cells.forEach((cell, index) => drawCell(cell, points[index]!, time));

      if (width > 760) {
        context.font = '500 10px "Roboto Mono", monospace';
        context.textBaseline = 'middle';
        cells.slice(0, CELL_LABELS.length).forEach((cell, index) => {
          const point = points[index]!;
          context.fillStyle =
            cell.kind === 'host'
              ? 'rgba(220, 255, 252, 0.82)'
              : 'rgba(183, 218, 224, 0.58)';
          context.fillText(
            cell.label ?? '',
            point.x + cell.radius + 12,
            point.y,
          );
        });
      }

      if (ripple) {
        const age = time - ripple.startedAt;
        if (age < 1050) {
          const progress = age / 1050;
          context.strokeStyle = `rgba(120, 242, 240, ${(1 - progress) * 0.42})`;
          context.lineWidth = 1.5 - progress;
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
      if (reduceMotion.matches) draw(performance.now());
    };

    const onPointerLeave = () => {
      pointerInside = false;
      pointerTarget.x = width * 0.72;
      pointerTarget.y = height * 0.46;
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
    };
  }, []);

  return (
    <div className={styles.neuralField} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

export function HomeHero({ hero }: { hero: Hero }) {
  return (
    <section className={styles.hero} data-neural-surface>
      <div className={styles.oceanLight} aria-hidden="true" />
      <div className={styles.waterGrain} aria-hidden="true" />
      <NeuralField />
      <div className={styles.heroShade} aria-hidden="true" />

      <div className={styles.heroInner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.statusDot} aria-hidden="true" />
            {hero.name}
            <span className={styles.previewTag}>runtime mesh</span>
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
          <div className={styles.runtimeState} aria-label="Live runtime state">
            <span className={styles.runtimePulse} aria-hidden="true" />
            <span>1 host</span>
            <i aria-hidden="true" />
            <span>4 remotes</span>
            <i aria-hidden="true" />
            <span>shared scope healthy</span>
          </div>
        </div>
      </div>

      <div className={styles.fieldCaption} aria-hidden="true">
        <span>Live topology</span>
        <strong>runtime / connected</strong>
      </div>
      <p className={styles.interactionHint} aria-hidden="true">
        Move to disturb the field
      </p>
    </section>
  );
}
