'use client';
import { useEffect, useRef, useState } from 'react';

export function SectionNavigation({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '');
  const [top, setTop] = useState(false);
  const navigationLock = useRef(0);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < navigationLock.current) return;
        const visible = entries
          .filter((x) => x.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActive(visible.target.id);
          history.replaceState(null, '', `#${visible.target.id}`);
        }
      },
      { rootMargin: '-18% 0px -65%', threshold: [0.1, 0.5] },
    );
    items.forEach((item) => {
      const node = document.getElementById(item.id);
      if (node) observer.observe(node);
    });
    const scroll = () => {
      setTop(window.scrollY > 520);
    };
    window.addEventListener('scroll', scroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scroll);
    };
  }, [items]);
  const go = (id: string) => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setActive(id);
    navigationLock.current = Date.now() + (reduce ? 100 : 900);
    history.pushState(null, '', `#${id}`);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  return (
    <>
      <nav className="section-nav" aria-label="Secciones de esta página">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-current={active === item.id ? 'location' : undefined}
            onClick={() => {
              go(item.id);
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
      {top && (
        <button
          type="button"
          className="back-to-top"
          title="Volver al inicio de la página"
          onClick={() => {
            go(items[0]?.id ?? '');
          }}
        >
          ↑<span>Volver arriba</span>
        </button>
      )}
    </>
  );
}
