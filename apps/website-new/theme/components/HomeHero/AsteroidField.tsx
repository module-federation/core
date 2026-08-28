import { useEffect, useRef } from 'react';

interface ClusterSpec {
  x: number;
  y: number;
  count: number;
  spread: number;
  depth: number;
  warmth: number;
}

interface Cluster extends ClusterSpec {
  centerX: number;
  centerY: number;
  energy: number;
  phase: number;
  lastBurst: number;
}

interface Particle {
  clusterIndex: number;
  angle: number;
  distance: number;
  size: number;
  phase: number;
  drift: number;
  x: number;
  y: number;
  previousX: number;
  previousY: number;
  velocityX: number;
  velocityY: number;
}

const DESKTOP_CLUSTERS: ClusterSpec[] = [
  { x: 0.13, y: 0.24, count: 14, spread: 5, depth: 0.46, warmth: 0.42 },
  { x: 0.19, y: 0.5, count: 23, spread: 8, depth: 0.7, warmth: 0.68 },
  { x: 0.31, y: 0.76, count: 19, spread: 10, depth: 0.54, warmth: 0.3 },
  { x: 0.46, y: 0.31, count: 17, spread: 7, depth: 0.58, warmth: 0.5 },
  { x: 0.59, y: 0.66, count: 25, spread: 11, depth: 0.68, warmth: 0.35 },
  { x: 0.76, y: 0.28, count: 20, spread: 9, depth: 0.72, warmth: 0.74 },
  { x: 0.89, y: 0.57, count: 27, spread: 13, depth: 0.78, warmth: 0.56 },
];

const COMPACT_CLUSTERS: ClusterSpec[] = [
  { x: 0.15, y: 0.17, count: 12, spread: 5, depth: 0.45, warmth: 0.42 },
  { x: 0.72, y: 0.42, count: 18, spread: 8, depth: 0.64, warmth: 0.68 },
  { x: 0.56, y: 0.74, count: 17, spread: 9, depth: 0.56, warmth: 0.32 },
  { x: 0.88, y: 0.64, count: 20, spread: 10, depth: 0.7, warmth: 0.55 },
];

function createRandom(seed = 947) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export function AsteroidField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const surface = canvas?.closest<HTMLElement>('[data-galaxy-surface]');
    const copy = surface?.querySelector<HTMLElement>('[data-hero-copy]');
    const context = canvas?.getContext('2d');
    if (!canvas || !surface || !copy || !context) return;

    let width = 1;
    let height = 1;
    let clusters: Cluster[] = [];
    let particles: Particle[] = [];
    let frame = 0;
    let lastFrame = 0;
    let visible = true;
    let pointerInside = false;
    let pointerSeen = false;
    const pointer = {
      x: -1000,
      y: -1000,
      velocityX: 0,
      velocityY: 0,
      speed: 0,
    };
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)');

    const getHome = (particle: Particle, time: number) => {
      const cluster = clusters[particle.clusterIndex];
      if (!cluster) return { x: particle.x, y: particle.y };
      const orbit =
        particle.angle +
        time * 0.00004 * particle.drift * (1 + cluster.energy * 3.2);
      const breathing = 1 + Math.sin(time * 0.00055 + particle.phase) * 0.055;
      return {
        x: cluster.centerX + Math.cos(orbit) * particle.distance * breathing,
        y:
          cluster.centerY +
          Math.sin(orbit) * particle.distance * breathing * 0.74,
      };
    };

    const buildField = () => {
      const random = createRandom(Math.round(width * 0.7 + height * 1.3));
      const specs = width < 720 ? COMPACT_CLUSTERS : DESKTOP_CLUSTERS;
      clusters = specs.map((spec, index) => ({
        ...spec,
        centerX: spec.x * width,
        centerY: spec.y * height,
        energy: 0,
        phase: random() * Math.PI * 2 + index,
        lastBurst: -1000,
      }));
      particles = [];

      clusters.forEach((cluster, clusterIndex) => {
        for (let index = 0; index < cluster.count; index += 1) {
          const angle = random() * Math.PI * 2;
          const distance = Math.pow(random(), 1.55) * cluster.spread;
          const x = cluster.centerX + Math.cos(angle) * distance;
          const y = cluster.centerY + Math.sin(angle) * distance * 0.74;
          particles.push({
            clusterIndex,
            angle,
            distance,
            size: 0.35 + random() * (0.72 + cluster.depth * 0.68),
            phase: random() * Math.PI * 2,
            drift: (random() > 0.5 ? 1 : -1) * (0.45 + random() * 0.75),
            x,
            y,
            previousX: x,
            previousY: y,
            velocityX: 0,
            velocityY: 0,
          });
        }
      });
    };

    const resize = () => {
      const rect = surface.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildField();
    };

    const disturbCluster = (clusterIndex: number, time: number) => {
      const cluster = clusters[clusterIndex];
      if (!cluster || time - cluster.lastBurst < 520) return;
      cluster.lastBurst = time;
      cluster.energy = 1;
      const cursorForce = Math.min(2.2, pointer.speed * 0.035);

      for (const particle of particles) {
        if (particle.clusterIndex !== clusterIndex) continue;
        const angle = particle.angle + Math.sin(particle.phase * 2.7) * 0.48;
        const force = 0.9 + particle.size * 0.72 + cursorForce;
        particle.velocityX +=
          Math.cos(angle) * force + pointer.velocityX * 0.035;
        particle.velocityY +=
          Math.sin(angle) * force * 0.82 + pointer.velocityY * 0.035;
      }
    };

    const update = (time: number) => {
      pointer.velocityX *= 0.82;
      pointer.velocityY *= 0.82;
      pointer.speed *= 0.86;

      clusters.forEach((cluster, clusterIndex) => {
        const distance = Math.hypot(
          pointer.x - cluster.centerX,
          pointer.y - cluster.centerY,
        );
        const targetEnergy = pointerInside
          ? Math.max(0, 1 - distance / 150)
          : 0;
        cluster.energy +=
          (targetEnergy - cluster.energy) *
          (targetEnergy > cluster.energy ? 0.2 : 0.04);

        const hitRadius = 19 + cluster.spread * 1.1;
        if (pointerInside && distance < hitRadius) {
          disturbCluster(clusterIndex, time);
        }
      });

      for (const particle of particles) {
        const cluster = clusters[particle.clusterIndex];
        if (!cluster) continue;
        const home = getHome(particle, time);
        particle.previousX = particle.x;
        particle.previousY = particle.y;

        if (pointerInside) {
          const deltaX = particle.x - pointer.x;
          const deltaY = particle.y - pointer.y;
          const distance = Math.hypot(deltaX, deltaY) || 1;
          const influence = Math.max(0, 1 - distance / 132);
          if (influence > 0) {
            const force =
              influence *
              influence *
              (0.2 + Math.min(1.15, pointer.speed * 0.022));
            const swirl = influence * 0.035 * Math.sign(particle.drift);
            particle.velocityX +=
              (deltaX / distance) * force - (deltaY / distance) * swirl;
            particle.velocityY +=
              (deltaY / distance) * force + (deltaX / distance) * swirl;
          }
        }

        const spring = 0.047 - cluster.energy * 0.022;
        particle.velocityX += (home.x - particle.x) * spring;
        particle.velocityY += (home.y - particle.y) * spring;
        particle.velocityX *= 0.88;
        particle.velocityY *= 0.88;
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
      }
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);

      for (const cluster of clusters) {
        const haloRadius = 8 + cluster.spread * 0.8 + cluster.energy * 14;
        const halo = context.createRadialGradient(
          cluster.centerX,
          cluster.centerY,
          0,
          cluster.centerX,
          cluster.centerY,
          haloRadius,
        );
        const coreAlpha =
          (0.12 + cluster.depth * 0.11) * (1 - cluster.energy * 0.44);
        halo.addColorStop(0, `rgba(224, 221, 204, ${coreAlpha.toFixed(3)})`);
        halo.addColorStop(
          0.28,
          `rgba(159, 184, 207, ${(coreAlpha * 0.5).toFixed(3)})`,
        );
        halo.addColorStop(1, 'rgba(70, 102, 142, 0)');
        context.fillStyle = halo;
        context.beginPath();
        context.arc(
          cluster.centerX,
          cluster.centerY,
          haloRadius,
          0,
          Math.PI * 2,
        );
        context.fill();
      }

      context.lineWidth = 0.45;
      for (const particle of particles) {
        const cluster = clusters[particle.clusterIndex];
        if (!cluster) continue;
        const speed = Math.hypot(particle.velocityX, particle.velocityY);
        const flicker = 0.88 + Math.sin(time * 0.0011 + particle.phase) * 0.12;
        const alpha =
          (0.17 + cluster.depth * 0.22 + cluster.energy * 0.44) * flicker;
        const warm = cluster.warmth + Math.sin(particle.phase) * 0.14;
        const red = Math.round(170 + warm * 62);
        const green = Math.round(190 + warm * 35);
        const blue = Math.round(214 - warm * 33);

        if (cluster.energy > 0.28 && speed > 0.15) {
          context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${(alpha * 0.12).toFixed(3)})`;
          context.beginPath();
          context.moveTo(particle.previousX, particle.previousY);
          context.lineTo(particle.x, particle.y);
          context.stroke();
        }

        context.save();
        context.shadowColor = `rgba(${red}, ${green}, ${blue}, ${(alpha * 0.65).toFixed(3)})`;
        context.shadowBlur = 2.5 + cluster.energy * 5;
        context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha.toFixed(3)})`;
        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          particle.size * (1 + cluster.energy * 0.18),
          0,
          Math.PI * 2,
        );
        context.fill();
        context.restore();
      }
    };

    const animate = (time: number) => {
      if (visible && time - lastFrame >= 1000 / 30) {
        update(time);
        draw(time);
        lastFrame = time;
      }
      frame = requestAnimationFrame(animate);
    };

    const setCopyResponse = (event: PointerEvent) => {
      const surfaceRect = surface.getBoundingClientRect();
      const copyRect = copy.getBoundingClientRect();
      const normalizedX = (event.clientX - surfaceRect.left) / width - 0.5;
      const normalizedY = (event.clientY - surfaceRect.top) / height - 0.5;
      const localX = event.clientX - copyRect.left;
      const localY = event.clientY - copyRect.top;
      const nearCopy =
        localX > -90 &&
        localX < copyRect.width + 90 &&
        localY > -90 &&
        localY < copyRect.height + 90;

      surface.style.setProperty(
        '--copy-shift-x',
        `${(normalizedX * -5).toFixed(2)}px`,
      );
      surface.style.setProperty(
        '--copy-shift-y',
        `${(normalizedY * -3.5).toFixed(2)}px`,
      );
      surface.style.setProperty('--copy-focus-x', `${localX.toFixed(1)}px`);
      surface.style.setProperty('--copy-focus-y', `${localY.toFixed(1)}px`);
      surface.style.setProperty(
        '--copy-focus-opacity',
        nearCopy ? '0.72' : '0',
      );
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = surface.getBoundingClientRect();
      const nextX = event.clientX - rect.left;
      const nextY = event.clientY - rect.top;
      if (pointerSeen) {
        pointer.velocityX += nextX - pointer.x;
        pointer.velocityY += nextY - pointer.y;
        pointer.speed = Math.hypot(pointer.velocityX, pointer.velocityY);
      }
      pointer.x = nextX;
      pointer.y = nextY;
      pointerSeen = true;
      pointerInside = true;
      setCopyResponse(event);
    };

    const onPointerLeave = () => {
      pointerInside = false;
      pointerSeen = false;
      surface.style.setProperty('--copy-shift-x', '0px');
      surface.style.setProperty('--copy-shift-y', '0px');
      surface.style.setProperty('--copy-focus-opacity', '0');
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
    if (!reducedMotion.matches && !coarsePointer.matches) {
      surface.addEventListener('pointermove', onPointerMove, { passive: true });
      surface.addEventListener('pointerleave', onPointerLeave, {
        passive: true,
      });
      frame = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      surface.removeEventListener('pointermove', onPointerMove);
      surface.removeEventListener('pointerleave', onPointerLeave);
      surface.style.removeProperty('--copy-shift-x');
      surface.style.removeProperty('--copy-shift-y');
      surface.style.removeProperty('--copy-focus-x');
      surface.style.removeProperty('--copy-focus-y');
      surface.style.removeProperty('--copy-focus-opacity');
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
