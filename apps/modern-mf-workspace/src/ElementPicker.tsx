import React, { useEffect, useState } from 'react';
import type { ElementSelectionRegistry } from './runtime/selection';

interface Props {
  registry: ElementSelectionRegistry;
  surface: React.RefObject<HTMLDivElement>;
  onFinish(): void;
}

/** Capture before remote React roots: selecting an action must never execute it. */
export function ElementPicker({ registry, surface, onFinish }: Props) {
  const [hovered, setHovered] = useState('');
  const [box, setBox] = useState<DOMRect | null>(null);
  const [error, setError] = useState('');
  const [, invalidate] = useState(0);
  useEffect(
    () => registry.subscribe(() => invalidate((v) => v + 1)),
    [registry],
  );
  const handles = registry.list();
  const current = handles.find((handle) => handle.referenceId === hovered);
  const choose = (referenceId: string) => {
    try {
      registry.select(referenceId);
      onFinish();
    } catch {
      setError('这个元素已更新，请重新选择。');
      setHovered('');
    }
  };
  useEffect(() => {
    const root = surface.current;
    if (!root) return;
    const target = (event: Event) => {
      const node = event.target;
      return node instanceof Element && root.contains(node) ? node : null;
    };
    const move = (event: PointerEvent) => {
      const node = target(event);
      setHovered(node ? (registry.findTarget(node)?.referenceId ?? '') : '');
    };
    const blockPointer = (event: Event) => {
      if (!target(event)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const click = (event: MouseEvent) => {
      const node = target(event);
      if (!node) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const handle = registry.findTarget(node);
      if (handle) choose(handle.referenceId);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onFinish();
      } else if (
        target(event) &&
        (event.key === 'Enter' || event.key === ' ')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const handle = registry.findTarget(event.target as Element);
        if (handle) choose(handle.referenceId);
      }
    };
    document.addEventListener('pointermove', move, true);
    document.addEventListener('pointerdown', blockPointer, true);
    document.addEventListener('click', click, true);
    document.addEventListener('keydown', key, true);
    return () => {
      document.removeEventListener('pointermove', move, true);
      document.removeEventListener('pointerdown', blockPointer, true);
      document.removeEventListener('click', click, true);
      document.removeEventListener('keydown', key, true);
    };
  }, [registry, surface, onFinish]);
  useEffect(() => {
    if (!current) {
      setBox(null);
      return;
    }
    const update = () => {
      const bounds = current.element.getBoundingClientRect();
      const viewport = surface.current?.getBoundingClientRect();
      if (!viewport) return setBox(null);
      const left = Math.max(bounds.left, viewport.left, 0);
      const top = Math.max(bounds.top, viewport.top, 0);
      setBox(
        new DOMRect(
          left,
          top,
          Math.max(
            0,
            Math.min(bounds.right, viewport.right, window.innerWidth) - left,
          ),
          Math.max(
            0,
            Math.min(bounds.bottom, viewport.bottom, window.innerHeight) - top,
          ),
        ),
      );
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    const observer = new ResizeObserver(update);
    observer.observe(current.element);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, [current?.referenceId]);
  return (
    <>
      <div
        className="element-picker-bar"
        role="region"
        aria-label="选择页面元素"
      >
        <div role="status">
          <strong>选择要讨论的内容</strong>
          <span>{error || '点击商品卡片或按钮，只会引用，不会执行操作。'}</span>
        </div>
        <select
          aria-label="按名称选择页面元素"
          value=""
          onChange={(event) => {
            if (event.target.value) choose(event.target.value);
          }}
        >
          <option value="">按名称选择 · {handles.length} 个元素</option>
          {handles.map((handle) => (
            <option key={handle.referenceId} value={handle.referenceId}>
              {handle.label} · {handle.context.mountId}
            </option>
          ))}
        </select>
        <button onClick={onFinish}>
          取消 <kbd>Esc</kbd>
        </button>
      </div>
      {current && box && box.width > 0 && box.height > 0 && (
        <div
          className="element-picker-outline"
          aria-hidden="true"
          style={{
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
          }}
        >
          <span className={box.top < 80 ? 'label-inside' : ''}>
            {current.kind === 'action'
              ? '按钮'
              : current.kind === 'product'
                ? '商品'
                : '区域'}
            <b>{current.label}</b>
          </span>
        </div>
      )}
    </>
  );
}
