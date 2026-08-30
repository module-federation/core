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
  lastBurst: number;
}

interface AmbientParticle {
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

interface LogoPoint {
  x: number;
  y: number;
  tone: number;
}

interface LogoParticle {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  previousX: number;
  previousY: number;
  velocityX: number;
  velocityY: number;
  size: number;
  phase: number;
  depth: number;
  tone: number;
}

interface LogoLink {
  from: number;
  to: number;
  homeDistance: number;
}

const DESKTOP_CLUSTERS: ClusterSpec[] = [
  { x: 0.11, y: 0.25, count: 13, spread: 5, depth: 0.4, warmth: 0.42 },
  { x: 0.2, y: 0.51, count: 20, spread: 8, depth: 0.62, warmth: 0.68 },
  { x: 0.34, y: 0.77, count: 17, spread: 9, depth: 0.5, warmth: 0.3 },
  { x: 0.49, y: 0.27, count: 13, spread: 6, depth: 0.44, warmth: 0.51 },
];

const COMPACT_CLUSTERS: ClusterSpec[] = [
  { x: 0.14, y: 0.18, count: 11, spread: 5, depth: 0.4, warmth: 0.42 },
  { x: 0.19, y: 0.5, count: 15, spread: 7, depth: 0.58, warmth: 0.68 },
  { x: 0.45, y: 0.83, count: 13, spread: 8, depth: 0.48, warmth: 0.32 },
];

const LOGO_MASK_WIDTH = 172;
const LOGO_MASK_HEIGHT = 160;

function createRandom(seed = 947) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function sampleLogo(image: HTMLImageElement) {
  const mask = document.createElement('canvas');
  mask.width = LOGO_MASK_WIDTH;
  mask.height = LOGO_MASK_HEIGHT;
  const context = mask.getContext('2d', { willReadFrequently: true });
  if (!context) return [];

  context.clearRect(0, 0, LOGO_MASK_WIDTH, LOGO_MASK_HEIGHT);
  context.drawImage(image, 0, 0, LOGO_MASK_WIDTH, LOGO_MASK_HEIGHT);
  const pixels = context.getImageData(
    0,
    0,
    LOGO_MASK_WIDTH,
    LOGO_MASK_HEIGHT,
  ).data;
  const edgePoints: LogoPoint[] = [];
  const fillPoints: LogoPoint[] = [];

  for (let y = 2; y < LOGO_MASK_HEIGHT - 2; y += 4) {
    for (let x = 2; x < LOGO_MASK_WIDTH - 2; x += 4) {
      let bestIndex = -1;
      let bestAlpha = 0;
      let lowestAlpha = 255;
      for (let offsetY = -2; offsetY <= 2; offsetY += 1) {
        for (let offsetX = -2; offsetX <= 2; offsetX += 1) {
          const index = ((y + offsetY) * LOGO_MASK_WIDTH + x + offsetX) * 4;
          const alpha = pixels[index + 3] ?? 0;
          lowestAlpha = Math.min(lowestAlpha, alpha);
          if (alpha > bestAlpha) {
            bestAlpha = alpha;
            bestIndex = index;
          }
        }
      }
      if (bestIndex < 0 || bestAlpha < 28) continue;
      const red = pixels[bestIndex] ?? 0;
      const green = pixels[bestIndex + 1] ?? 0;
      const blue = pixels[bestIndex + 2] ?? 0;
      let colorBoundary = 0;
      const boundaryOffsets = [
        [-3, 0],
        [3, 0],
        [0, -3],
        [0, 3],
      ];
      boundaryOffsets.forEach(([offsetX = 0, offsetY = 0]) => {
        const index = ((y + offsetY) * LOGO_MASK_WIDTH + x + offsetX) * 4;
        colorBoundary = Math.max(
          colorBoundary,
          Math.abs(red - (pixels[index] ?? 0)) +
            Math.abs(green - (pixels[index + 1] ?? 0)) +
            Math.abs(blue - (pixels[index + 2] ?? 0)) +
            Math.abs(bestAlpha - (pixels[index + 3] ?? 0)),
        );
      });
      const point = {
        x: x / LOGO_MASK_WIDTH,
        y: y / LOGO_MASK_HEIGHT,
        tone: Math.max(0, Math.min(1, 0.5 + (blue - red) / 510)),
      };
      if (lowestAlpha < bestAlpha * 0.62 || colorBoundary > 86) {
        edgePoints.push(point);
      } else if ((x * 31 + y * 17) % 19 < 4) {
        fillPoints.push(point);
      }
    }
  }

  const random = createRandom(2027);
  const shuffle = (points: LogoPoint[]) => {
    for (let index = points.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [points[index], points[swapIndex]] = [points[swapIndex], points[index]];
    }
  };
  shuffle(edgePoints);
  shuffle(fillPoints);
  return [...edgePoints.slice(0, 300), ...fillPoints.slice(0, 72)];
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
    let ambientParticles: AmbientParticle[] = [];
    let logoPoints: LogoPoint[] = [];
    let logoParticles: LogoParticle[] = [];
    let logoLinks: LogoLink[] = [];
    let frame = 0;
    let lastFrame = 0;
    let visible = true;
    let pointerInside = false;
    let pointerSeen = false;
    let disposed = false;
    const pointer = {
      x: -1000,
      y: -1000,
      velocityX: 0,
      velocityY: 0,
      speed: 0,
    };
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)');

    const getAmbientHome = (particle: AmbientParticle, time: number) => {
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
      const compact = width < 720;
      const specs = compact ? COMPACT_CLUSTERS : DESKTOP_CLUSTERS;
      clusters = specs.map((spec) => ({
        ...spec,
        centerX: spec.x * width,
        centerY: spec.y * height,
        energy: 0,
        lastBurst: -1000,
      }));
      ambientParticles = [];

      clusters.forEach((cluster, clusterIndex) => {
        for (let index = 0; index < cluster.count; index += 1) {
          const angle = random() * Math.PI * 2;
          const distance = Math.pow(random(), 1.55) * cluster.spread;
          const x = cluster.centerX + Math.cos(angle) * distance;
          const y = cluster.centerY + Math.sin(angle) * distance * 0.74;
          ambientParticles.push({
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

      const logoHeight = compact
        ? Math.min(150, width * 0.42, height * 0.2)
        : Math.min(320, width * 0.24, height * 0.42);
      const logoWidth = logoHeight * (43 / 40);
      const logoCenterX = width * (compact ? 0.7 : 0.765);
      const logoCenterY = height * (compact ? 0.72 : 0.48);
      const activePoints = compact
        ? logoPoints.filter((_, index) => index % 2 === 0)
        : logoPoints;
      logoParticles = activePoints.map((point) => {
        const homeX = logoCenterX + (point.x - 0.5) * logoWidth;
        const homeY = logoCenterY + (point.y - 0.5) * logoHeight;
        return {
          homeX,
          homeY,
          x: homeX,
          y: homeY,
          previousX: homeX,
          previousY: homeY,
          velocityX: 0,
          velocityY: 0,
          size: 0.48 + random() * 1.12,
          phase: random() * Math.PI * 2,
          depth: 0.38 + random() * 0.62,
          tone: point.tone * 0.55 + random() * 0.45,
        };
      });
      logoLinks = [];
      const linkedPairs = new Set<string>();
      const linkRadius = Math.max(9, logoHeight * 0.045);
      logoParticles.forEach((particle, from) => {
        const nearest = logoParticles
          .map((candidate, to) => ({
            to,
            distance: Math.hypot(
              candidate.homeX - particle.homeX,
              candidate.homeY - particle.homeY,
            ),
          }))
          .filter(
            ({ to, distance }) =>
              to !== from && distance > 2 && distance < linkRadius,
          )
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 2);
        nearest.forEach(({ to, distance }) => {
          const pair = from < to ? `${from}:${to}` : `${to}:${from}`;
          if (linkedPairs.has(pair)) return;
          linkedPairs.add(pair);
          logoLinks.push({ from, to, homeDistance: distance });
        });
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

      for (const particle of ambientParticles) {
        if (particle.clusterIndex !== clusterIndex) continue;
        const angle = particle.angle + Math.sin(particle.phase * 2.7) * 0.48;
        const force = 0.9 + particle.size * 0.72 + cursorForce;
        particle.velocityX +=
          Math.cos(angle) * force + pointer.velocityX * 0.035;
        particle.velocityY +=
          Math.sin(angle) * force * 0.82 + pointer.velocityY * 0.035;
      }
    };

    const updateAmbientParticles = (time: number) => {
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
        if (pointerInside && distance < 19 + cluster.spread * 1.1) {
          disturbCluster(clusterIndex, time);
        }
      });

      for (const particle of ambientParticles) {
        const cluster = clusters[particle.clusterIndex];
        if (!cluster) continue;
        const home = getAmbientHome(particle, time);
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

    const updateLogoParticles = (time: number) => {
      for (const particle of logoParticles) {
        const homeX =
          particle.homeX + Math.sin(time * 0.00034 + particle.phase) * 0.72;
        const homeY =
          particle.homeY + Math.cos(time * 0.00028 + particle.phase) * 0.58;
        particle.previousX = particle.x;
        particle.previousY = particle.y;

        if (pointerInside) {
          const deltaX = particle.x - pointer.x;
          const deltaY = particle.y - pointer.y;
          const distance = Math.hypot(deltaX, deltaY) || 1;
          const influence = Math.max(0, 1 - distance / 118);
          if (influence > 0) {
            const speedForce = Math.min(1.8, pointer.speed * 0.03);
            const collision = Math.max(0, 1 - distance / 34);
            const force =
              influence * influence * (0.26 + speedForce) + collision * 1.45;
            const swirl = influence * 0.085 * (particle.tone > 0.5 ? 1 : -1);
            particle.velocityX +=
              (deltaX / distance) * force - (deltaY / distance) * swirl;
            particle.velocityY +=
              (deltaY / distance) * force + (deltaX / distance) * swirl;
            if (collision > 0.2) {
              particle.velocityX += pointer.velocityX * 0.028 * collision;
              particle.velocityY += pointer.velocityY * 0.028 * collision;
            }
          }
        }

        particle.velocityX += (homeX - particle.x) * 0.042;
        particle.velocityY += (homeY - particle.y) * 0.042;
        particle.velocityX *= 0.89;
        particle.velocityY *= 0.89;
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
      }
    };

    const update = (time: number) => {
      pointer.velocityX *= 0.82;
      pointer.velocityY *= 0.82;
      pointer.speed *= 0.86;
      updateAmbientParticles(time);
      updateLogoParticles(time);
    };

    const drawAmbientParticles = (time: number) => {
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
      for (const particle of ambientParticles) {
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
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
    };

    const drawLogoParticles = (time: number) => {
      for (const link of logoLinks) {
        const from = logoParticles[link.from];
        const to = logoParticles[link.to];
        if (!from || !to) continue;
        const midpointX = (from.x + to.x) * 0.5;
        const midpointY = (from.y + to.y) * 0.5;
        const pointerDistance = Math.hypot(
          midpointX - pointer.x,
          midpointY - pointer.y,
        );
        const response = pointerInside
          ? Math.max(0, 1 - pointerDistance / 150)
          : 0;
        const stretch = Math.hypot(from.x - to.x, from.y - to.y);
        const integrity = Math.max(
          0,
          1 - Math.abs(stretch - link.homeDistance) / link.homeDistance,
        );
        context.strokeStyle = `rgba(151, 188, 215, ${((0.14 + response * 0.09) * integrity).toFixed(3)})`;
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.stroke();
      }

      context.lineWidth = 0.5;
      for (const particle of logoParticles) {
        const distance = Math.hypot(
          particle.x - pointer.x,
          particle.y - pointer.y,
        );
        const response = pointerInside ? Math.max(0, 1 - distance / 150) : 0;
        const speed = Math.hypot(particle.velocityX, particle.velocityY);
        const flicker = 0.84 + Math.sin(time * 0.0012 + particle.phase) * 0.16;
        const alpha = (0.38 + particle.depth * 0.36 + response * 0.3) * flicker;
        const red = Math.round(172 + particle.tone * 32);
        const green = Math.round(194 + particle.tone * 24);
        const blue = Math.round(222 + particle.tone * 18);

        if (speed > 0.18 && response > 0.12) {
          context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${(alpha * 0.18).toFixed(3)})`;
          context.beginPath();
          context.moveTo(particle.previousX, particle.previousY);
          context.lineTo(particle.x, particle.y);
          context.stroke();
        }

        context.save();
        context.shadowColor = `rgba(${red}, ${green}, ${blue}, ${(alpha * 0.76).toFixed(3)})`;
        context.shadowBlur = 3 + response * 7;
        context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha.toFixed(3)})`;
        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          particle.size * (1 + response * 0.22),
          0,
          Math.PI * 2,
        );
        context.fill();
        context.restore();
      }
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      drawAmbientParticles(time);
      drawLogoParticles(time);
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
      const surfaceX = event.clientX - surfaceRect.left;
      const surfaceY = event.clientY - surfaceRect.top;
      const normalizedX = surfaceX / width - 0.5;
      const normalizedY = surfaceY / height - 0.5;
      const localX = event.clientX - copyRect.left;
      const localY = event.clientY - copyRect.top;
      const nearCopy =
        localX > -70 &&
        localX < copyRect.width + 70 &&
        localY > -70 &&
        localY < copyRect.height + 70;
      const copyX = Math.max(
        -0.5,
        Math.min(0.5, localX / copyRect.width - 0.5),
      );
      const copyY = Math.max(
        -0.5,
        Math.min(0.5, localY / copyRect.height - 0.5),
      );

      surface.style.setProperty(
        '--surface-pointer-x',
        `${surfaceX.toFixed(1)}px`,
      );
      surface.style.setProperty(
        '--surface-pointer-y',
        `${surfaceY.toFixed(1)}px`,
      );
      const logoCenterX = width * (width < 720 ? 0.7 : 0.765);
      const logoCenterY = height * (width < 720 ? 0.72 : 0.48);
      const logoDistance = Math.hypot(
        surfaceX - logoCenterX,
        surfaceY - logoCenterY,
      );
      const logoDisruption = Math.max(0, 1 - logoDistance / 190);
      surface.style.setProperty(
        '--logo-guide-opacity',
        `${(0.3 * (1 - logoDisruption * 0.94)).toFixed(3)}`,
      );
      surface.style.setProperty(
        '--copy-shift-x',
        `${(normalizedX * -8).toFixed(2)}px`,
      );
      surface.style.setProperty(
        '--copy-shift-y',
        `${(normalizedY * -5).toFixed(2)}px`,
      );
      surface.style.setProperty('--copy-focus-x', `${localX.toFixed(1)}px`);
      surface.style.setProperty('--copy-focus-y', `${localY.toFixed(1)}px`);
      surface.style.setProperty('--copy-focus-opacity', nearCopy ? '1' : '0');
      copy.dataset.pointerActive = nearCopy ? 'true' : 'false';
      surface.style.setProperty(
        '--copy-line-one-x',
        nearCopy ? `${(copyX * 10).toFixed(2)}px` : '0px',
      );
      surface.style.setProperty(
        '--copy-line-one-y',
        nearCopy ? `${(copyY * 6).toFixed(2)}px` : '0px',
      );
      surface.style.setProperty(
        '--copy-line-two-x',
        nearCopy ? `${(copyX * 18).toFixed(2)}px` : '0px',
      );
      surface.style.setProperty(
        '--copy-line-two-y',
        nearCopy ? `${(copyY * 10).toFixed(2)}px` : '0px',
      );
      surface.style.setProperty('--copy-glow-blur', nearCopy ? '34px' : '16px');
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
      surface.style.setProperty('--copy-line-one-x', '0px');
      surface.style.setProperty('--copy-line-one-y', '0px');
      surface.style.setProperty('--copy-line-two-x', '0px');
      surface.style.setProperty('--copy-line-two-y', '0px');
      surface.style.setProperty('--copy-glow-blur', '16px');
      surface.style.setProperty('--logo-guide-opacity', '0.3');
      delete copy.dataset.pointerActive;
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

    const logoImage = new Image();
    logoImage.decoding = 'async';
    logoImage.onload = () => {
      if (disposed) return;
      logoPoints = sampleLogo(logoImage);
      buildField();
      draw(performance.now());
    };
    logoImage.src = '/svg.svg';

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      surface.removeEventListener('pointermove', onPointerMove);
      surface.removeEventListener('pointerleave', onPointerLeave);
      surface.style.removeProperty('--surface-pointer-x');
      surface.style.removeProperty('--surface-pointer-y');
      surface.style.removeProperty('--copy-shift-x');
      surface.style.removeProperty('--copy-shift-y');
      surface.style.removeProperty('--copy-focus-x');
      surface.style.removeProperty('--copy-focus-y');
      surface.style.removeProperty('--copy-focus-opacity');
      surface.style.removeProperty('--copy-line-one-x');
      surface.style.removeProperty('--copy-line-one-y');
      surface.style.removeProperty('--copy-line-two-x');
      surface.style.removeProperty('--copy-line-two-y');
      surface.style.removeProperty('--copy-glow-blur');
      surface.style.removeProperty('--logo-guide-opacity');
      delete copy.dataset.pointerActive;
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
