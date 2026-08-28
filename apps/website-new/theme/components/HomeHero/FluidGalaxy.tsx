import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `#version 300 es
precision highp float;

out vec2 v_uv;

void main() {
  vec2 position = vec2(
    float((gl_VertexID << 1) & 2),
    float(gl_VertexID & 2)
  );
  v_uv = position;
  gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}
`;

const FLOW_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform sampler2D u_previous;
uniform vec2 u_pointer;
uniform vec2 u_velocity;
uniform float u_aspect;
uniform float u_decay;
uniform float u_radius;
uniform float u_strength;

void main() {
  vec4 previousSample = texture(u_previous, v_uv);
  vec2 previous = (previousSample.rg * 2.0 - 1.0) * u_decay;

  vec2 delta = v_uv - u_pointer;
  delta.x *= u_aspect;
  float brush = exp(-dot(delta, delta) / max(0.0001, u_radius * u_radius));
  vec2 next = clamp(previous + u_velocity * brush * u_strength, -1.0, 1.0);
  float pressure = max(previousSample.b * u_decay, brush * length(u_velocity) * 3.0);

  outColor = vec4(next * 0.5 + 0.5, pressure, 1.0);
}
`;

const GALAXY_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform sampler2D u_image;
uniform sampler2D u_flow;
uniform vec2 u_resolution;
uniform vec2 u_imageResolution;
uniform vec2 u_pointer;
uniform float u_pointerActive;
uniform float u_time;

float hash21(vec2 point) {
  point = fract(point * vec2(123.34, 345.45));
  point += dot(point, point + 34.345);
  return fract(point.x * point.y);
}

float noise(vec2 point) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  local = local * local * (3.0 - 2.0 * local);
  float a = hash21(cell);
  float b = hash21(cell + vec2(1.0, 0.0));
  float c = hash21(cell + vec2(0.0, 1.0));
  float d = hash21(cell + vec2(1.0, 1.0));
  return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
}

float fbm(vec2 point) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotation = mat2(0.8, -0.6, 0.6, 0.8);
  for (int index = 0; index < 4; index += 1) {
    value += amplitude * noise(point);
    point = rotation * point * 2.03 + 17.13;
    amplitude *= 0.5;
  }
  return value;
}

vec2 coverUv(vec2 uv) {
  float canvasAspect = u_resolution.x / max(1.0, u_resolution.y);
  float imageAspect = u_imageResolution.x / max(1.0, u_imageResolution.y);
  if (canvasAspect > imageAspect) {
    uv.y = (uv.y - 0.5) * (imageAspect / canvasAspect) + 0.5;
  } else {
    float visibleWidth = canvasAspect / imageAspect;
    float narrowness = 1.0 - smoothstep(0.35, 0.78, visibleWidth);
    float focusX = mix(0.53, 0.63, narrowness);
    uv.x = (uv.x - 0.5) * visibleWidth + focusX;
  }
  return uv;
}

vec3 paintedSample(vec2 uv) {
  vec2 pixel = 1.0 / u_imageResolution;
  vec3 color = texture(u_image, uv).rgb * 0.34;
  color += texture(u_image, uv + vec2(pixel.x * 2.2, 0.0)).rgb * 0.12;
  color += texture(u_image, uv - vec2(pixel.x * 2.2, 0.0)).rgb * 0.12;
  color += texture(u_image, uv + vec2(0.0, pixel.y * 2.2)).rgb * 0.12;
  color += texture(u_image, uv - vec2(0.0, pixel.y * 2.2)).rgb * 0.12;
  color += texture(u_image, uv + pixel * vec2(3.1, 2.6)).rgb * 0.09;
  color += texture(u_image, uv - pixel * vec2(3.1, 2.6)).rgb * 0.09;
  return color;
}

void main() {
  vec2 uv = v_uv;
  vec4 flowSample = texture(u_flow, uv);
  vec2 flow = flowSample.rg * 2.0 - 1.0;
  float pressure = flowSample.b;

  float slowTime = u_time * 0.025;
  vec2 fieldUv = uv * vec2(u_resolution.x / u_resolution.y, 1.0);
  float broadNoise = fbm(fieldUv * 1.18 + vec2(slowTime * 0.13, -slowTime * 0.08));
  float fineNoise = noise(fieldUv * 3.1 + vec2(-slowTime * 0.16, slowTime * 0.11));
  vec2 ambient = vec2(broadNoise - 0.5, fineNoise - 0.5) * 0.007;

  vec2 pointerDelta = uv - u_pointer;
  pointerDelta.x *= u_resolution.x / u_resolution.y;
  float pointerGlow = exp(-dot(pointerDelta, pointerDelta) / 0.026) * u_pointerActive;

  vec2 displaced = uv - flow * (0.052 + pressure * 0.018) + ambient;
  vec2 imageUv = clamp(coverUv(displaced), 0.001, 0.999);
  vec3 color = paintedSample(imageUv);

  float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(vec3(luminance), color, 0.74);
  color *= vec3(0.82, 0.91, 1.02);
  color += vec3(0.22, 0.30, 0.40) * pointerGlow * (0.08 + luminance * 0.17);
  color += vec3(0.52, 0.50, 0.39) * pressure * 0.07;

  float vignette = smoothstep(0.9, 0.2, length((uv - 0.5) * vec2(0.84, 1.0)));
  color *= mix(0.48, 1.0, vignette);
  color *= 0.97 + (hash21(gl_FragCoord.xy + u_time) - 0.5) * 0.018;

  outColor = vec4(color, 1.0);
}
`;

interface RenderTarget {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create WebGL shader.');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? 'Unknown shader error.';
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, fragmentSource: string) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error('Unable to create WebGL program.');
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? 'Unknown link error.';
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}

function createRenderTarget(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
): RenderTarget {
  const texture = gl.createTexture();
  const framebuffer = gl.createFramebuffer();
  if (!texture || !framebuffer) {
    throw new Error('Unable to create WebGL render target.');
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA8,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  );
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0,
  );
  gl.clearColor(0.5, 0.5, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return { texture, framebuffer };
}

function getUniform(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  key: string,
) {
  const location = gl.getUniformLocation(program, key);
  if (location === null) throw new Error(`Missing WebGL uniform: ${key}`);
  return location;
}

export function FluidGalaxy({ imageUrl }: { imageUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const surface = canvas?.closest<HTMLElement>('[data-galaxy-surface]');
    if (!canvas || !surface) return;

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      premultipliedAlpha: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    let disposed = false;
    let frame = 0;
    let lastFrame = 0;
    let visible = true;
    let width = 1;
    let height = 1;
    let flowWidth = 1;
    let flowHeight = 1;
    let flowTargets: [RenderTarget, RenderTarget] | null = null;
    let currentTarget = 0;
    let imageTexture: WebGLTexture | null = null;
    let imageWidth = 1;
    let imageHeight = 1;
    let imageReady = false;
    let pointerSeen = false;
    let pointerActive = 0;
    let targetPointerActive = 0;
    const pointer = { x: 0.72, y: 0.54 };
    const pointerTarget = { x: 0.72, y: 0.54 };
    const velocity = { x: 0, y: 0 };
    const velocityTarget = { x: 0, y: 0 };
    const lastPointer = { x: pointerTarget.x, y: pointerTarget.y };
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)');

    let flowProgram: WebGLProgram;
    let galaxyProgram: WebGLProgram;
    let vertexArray: WebGLVertexArrayObject | null;
    try {
      flowProgram = createProgram(gl, FLOW_FRAGMENT_SHADER);
      galaxyProgram = createProgram(gl, GALAXY_FRAGMENT_SHADER);
      vertexArray = gl.createVertexArray();
      gl.bindVertexArray(vertexArray);
    } catch (error) {
      console.warn('The interactive galaxy could not be initialized.', error);
      return;
    }

    const flowUniforms = {
      previous: getUniform(gl, flowProgram, 'u_previous'),
      pointer: getUniform(gl, flowProgram, 'u_pointer'),
      velocity: getUniform(gl, flowProgram, 'u_velocity'),
      aspect: getUniform(gl, flowProgram, 'u_aspect'),
      decay: getUniform(gl, flowProgram, 'u_decay'),
      radius: getUniform(gl, flowProgram, 'u_radius'),
      strength: getUniform(gl, flowProgram, 'u_strength'),
    };
    const galaxyUniforms = {
      image: getUniform(gl, galaxyProgram, 'u_image'),
      flow: getUniform(gl, galaxyProgram, 'u_flow'),
      resolution: getUniform(gl, galaxyProgram, 'u_resolution'),
      imageResolution: getUniform(gl, galaxyProgram, 'u_imageResolution'),
      pointer: getUniform(gl, galaxyProgram, 'u_pointer'),
      pointerActive: getUniform(gl, galaxyProgram, 'u_pointerActive'),
      time: getUniform(gl, galaxyProgram, 'u_time'),
    };

    const destroyTargets = () => {
      if (!flowTargets) return;
      for (const target of flowTargets) {
        gl.deleteTexture(target.texture);
        gl.deleteFramebuffer(target.framebuffer);
      }
      flowTargets = null;
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
      flowWidth = Math.max(2, Math.round(canvas.width / 4));
      flowHeight = Math.max(2, Math.round(canvas.height / 4));
      destroyTargets();
      flowTargets = [
        createRenderTarget(gl, flowWidth, flowHeight),
        createRenderTarget(gl, flowWidth, flowHeight),
      ];
      currentTarget = 0;
    };

    const draw = (time: number) => {
      if (!imageReady || !imageTexture || !flowTargets) return;

      pointer.x += (pointerTarget.x - pointer.x) * 0.1;
      pointer.y += (pointerTarget.y - pointer.y) * 0.1;
      velocity.x += (velocityTarget.x - velocity.x) * 0.2;
      velocity.y += (velocityTarget.y - velocity.y) * 0.2;
      velocityTarget.x *= 0.76;
      velocityTarget.y *= 0.76;
      pointerActive += (targetPointerActive - pointerActive) * 0.08;

      const read = flowTargets[currentTarget];
      const write = flowTargets[1 - currentTarget];
      gl.useProgram(flowProgram);
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);
      gl.viewport(0, 0, flowWidth, flowHeight);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, read.texture);
      gl.uniform1i(flowUniforms.previous, 0);
      gl.uniform2f(flowUniforms.pointer, pointer.x, pointer.y);
      gl.uniform2f(flowUniforms.velocity, velocity.x, velocity.y);
      gl.uniform1f(flowUniforms.aspect, width / height);
      gl.uniform1f(flowUniforms.decay, 0.925);
      gl.uniform1f(flowUniforms.radius, 0.09);
      gl.uniform1f(flowUniforms.strength, 1.8);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      currentTarget = 1 - currentTarget;

      gl.useProgram(galaxyProgram);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.uniform1i(galaxyUniforms.image, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, write.texture);
      gl.uniform1i(galaxyUniforms.flow, 1);
      gl.uniform2f(galaxyUniforms.resolution, canvas.width, canvas.height);
      gl.uniform2f(galaxyUniforms.imageResolution, imageWidth, imageHeight);
      gl.uniform2f(galaxyUniforms.pointer, pointer.x, pointer.y);
      gl.uniform1f(galaxyUniforms.pointerActive, pointerActive);
      gl.uniform1f(galaxyUniforms.time, time * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.dataset.ready = 'true';
    };

    const animate = (time: number) => {
      if (visible && time - lastFrame >= 1000 / 30) {
        draw(time);
        lastFrame = time;
      }
      frame = requestAnimationFrame(animate);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = surface.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / width));
      const y = Math.max(
        0,
        Math.min(1, 1 - (event.clientY - rect.top) / height),
      );
      pointerTarget.x = x;
      pointerTarget.y = y;
      if (pointerSeen) {
        velocityTarget.x += (x - lastPointer.x) * 2.2;
        velocityTarget.y += (y - lastPointer.y) * 2.2;
      }
      pointerSeen = true;
      lastPointer.x = x;
      lastPointer.y = y;
      targetPointerActive = 1;
      if (reducedMotion.matches) {
        pointer.x = x;
        pointer.y = y;
        draw(performance.now());
      }
    };

    const onPointerLeave = () => {
      pointerSeen = false;
      targetPointerActive = 0;
      velocityTarget.x = 0;
      velocityTarget.y = 0;
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reducedMotion.matches) draw(performance.now());
    });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });
    resize();
    resizeObserver.observe(surface);
    visibilityObserver.observe(surface);

    if (!coarsePointer.matches && !reducedMotion.matches) {
      surface.addEventListener('pointermove', onPointerMove, { passive: true });
      surface.addEventListener('pointerleave', onPointerLeave, {
        passive: true,
      });
    }

    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      if (disposed) return;
      imageWidth = image.naturalWidth;
      imageHeight = image.naturalHeight;
      imageTexture = gl.createTexture();
      if (!imageTexture) return;
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
      imageReady = true;
      draw(performance.now());
      if (!reducedMotion.matches) frame = requestAnimationFrame(animate);
    };
    image.src = imageUrl;

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      surface.removeEventListener('pointermove', onPointerMove);
      surface.removeEventListener('pointerleave', onPointerLeave);
      destroyTargets();
      if (imageTexture) gl.deleteTexture(imageTexture);
      gl.deleteProgram(flowProgram);
      gl.deleteProgram(galaxyProgram);
      if (vertexArray) gl.deleteVertexArray(vertexArray);
    };
  }, [imageUrl]);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}

interface GridPoint {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
}

export function ElasticGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const surface = canvas?.closest<HTMLElement>('[data-galaxy-surface]');
    const context = canvas?.getContext('2d');
    if (!canvas || !surface || !context) return;

    let width = 1;
    let height = 1;
    let columns = 0;
    let rows = 0;
    let points: GridPoint[] = [];
    let frame = 0;
    let lastFrame = 0;
    let running = false;
    let pointerInside = false;
    const pointer = { x: -1000, y: -1000 };
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)');

    const pointAt = (column: number, row: number) =>
      points[row * columns + column];

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.lineWidth = 0.55;
      context.strokeStyle = 'rgba(151, 177, 204, 0.075)';

      for (let row = 0; row < rows; row += 1) {
        context.beginPath();
        for (let column = 0; column < columns; column += 1) {
          const point = pointAt(column, row);
          if (!point) continue;
          if (column === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        }
        context.stroke();
      }

      for (let column = 0; column < columns; column += 1) {
        context.beginPath();
        for (let row = 0; row < rows; row += 1) {
          const point = pointAt(column, row);
          if (!point) continue;
          if (row === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        }
        context.stroke();
      }

      context.fillStyle = 'rgba(198, 211, 219, 0.16)';
      for (const point of points) {
        context.beginPath();
        context.arc(point.x, point.y, 0.8, 0, Math.PI * 2);
        context.fill();
      }
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

      const spacing = width < 720 ? 72 : 90;
      columns = Math.ceil(width / spacing) + 2;
      rows = Math.ceil(height / spacing) + 2;
      points = [];
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const baseX = (column - 0.5) * spacing;
          const baseY = (row - 0.5) * spacing;
          points.push({
            baseX,
            baseY,
            x: baseX,
            y: baseY,
            velocityX: 0,
            velocityY: 0,
          });
        }
      }
      draw();
    };

    const animate = (time: number) => {
      if (time - lastFrame < 1000 / 30) {
        frame = requestAnimationFrame(animate);
        return;
      }
      lastFrame = time;
      let moving = false;
      for (const point of points) {
        if (pointerInside) {
          const deltaX = point.x - pointer.x;
          const deltaY = point.y - pointer.y;
          const distance = Math.hypot(deltaX, deltaY) || 1;
          const influence = Math.max(0, 1 - distance / 140);
          if (influence > 0) {
            const force = influence * influence * 2.1;
            point.velocityX += (deltaX / distance) * force;
            point.velocityY += (deltaY / distance) * force;
          }
        }

        point.velocityX += (point.baseX - point.x) * 0.05;
        point.velocityY += (point.baseY - point.y) * 0.05;
        point.velocityX *= 0.85;
        point.velocityY *= 0.85;
        point.x += point.velocityX;
        point.y += point.velocityY;
        moving ||=
          Math.abs(point.velocityX) > 0.01 ||
          Math.abs(point.velocityY) > 0.01 ||
          Math.abs(point.x - point.baseX) > 0.01 ||
          Math.abs(point.y - point.baseY) > 0.01;
      }
      draw();

      if (pointerInside || moving) {
        frame = requestAnimationFrame(animate);
      } else {
        running = false;
      }
    };

    const start = () => {
      if (running || reducedMotion.matches) return;
      running = true;
      frame = requestAnimationFrame(animate);
    };
    const onPointerMove = (event: PointerEvent) => {
      const rect = surface.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointerInside = true;
      start();
    };
    const onPointerLeave = () => {
      pointerInside = false;
      start();
    };

    const resizeObserver = new ResizeObserver(resize);
    resize();
    resizeObserver.observe(surface);
    if (!reducedMotion.matches && !coarsePointer.matches) {
      surface.addEventListener('pointermove', onPointerMove, { passive: true });
      surface.addEventListener('pointerleave', onPointerLeave, {
        passive: true,
      });
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      surface.removeEventListener('pointermove', onPointerMove);
      surface.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
