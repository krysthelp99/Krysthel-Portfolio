import { useRef, useCallback, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import SplitText from './SplitText';
import Galaxy from './Galaxy';

export default function SplashScreen({ onFinish, onBeginExit }) {
  const rootRef = useRef(null);
  const innerRef = useRef(null);
  const barRef = useRef(null);
  const taglineRef = useRef(null);
  const startedAt = useRef(Date.now());

  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const dismiss = useCallback(() => {
    onBeginExit?.();
    const root = rootRef.current;
    const inner = innerRef.current;
    if (!root) {
      onFinish();
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onFinish();
      return;
    }
    const fadeEase = 'power3.out';
    if (inner) {
      gsap.to(inner, {
        opacity: 0,
        y: -12,
        scale: 0.975,
        duration: 0.72,
        ease: fadeEase,
      });
    }
    gsap.to(root, {
      opacity: 0,
      duration: 1.1,
      delay: 0.13,
      ease: fadeEase,
      onComplete: onFinish,
    });
  }, [onFinish, onBeginExit]);

  const handleNameComplete = useCallback(() => {
    const bar = barRef.current;
    if (bar) {
      gsap.killTweensOf(bar);
      gsap.to(bar, { scaleX: 1, duration: 0.5, ease: 'power3.out' });
    }
    const minMs = 2100;
    const elapsed = Date.now() - startedAt.current;
    const rest = Math.max(0, minMs - elapsed);
    window.setTimeout(dismiss, rest + 320);
  }, [dismiss]);

  useEffect(() => {
    const bar = barRef.current;
    const tag = taglineRef.current;
    if (!bar) return undefined;

    gsap.fromTo(
      bar,
      { scaleX: 0 },
      { scaleX: 0.88, duration: 2.6, ease: 'power1.inOut' }
    );

    if (tag) {
      gsap.fromTo(
        tag,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.85, delay: 0.5, ease: 'power2.out' }
      );
    }

    return () => {
      gsap.killTweensOf(bar);
      if (tag) gsap.killTweensOf(tag);
    };
  }, []);

  return (
    <div ref={rootRef} className="splash" aria-busy="true" aria-live="polite">
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Galaxy
          mouseRepulsion
          mouseInteraction
          density={1}
          glowIntensity={0.3}
          saturation={0}
          hueShift={140}
          twinkleIntensity={0.3}
          rotationSpeed={0.1}
          repulsionStrength={2}
          autoCenterRepulsion={0}
          starSpeed={0.5}
          speed={1}
        />
        </div>
      </div>
      <div className="splash__vignette" aria-hidden="true" />
      <div ref={innerRef} className="splash__inner">
        <p className="splash__eyebrow">UX · HCI · Design</p>
        <SplitText
          text="Krysthel Lua Peterus"
          className="splash__title"
          tag="h1"
          delay={48}
          duration={1.12}
          ease="power4.out"
          splitType="chars"
          playImmediately
          from={{ opacity: 0, y: 16 }}
          to={{ opacity: 1, y: 0 }}
          textAlign="center"
          onLetterAnimationComplete={handleNameComplete}
        />
        <p ref={taglineRef} className="splash__tagline">
          Research, interface, and how people think.
        </p>
        <div className="splash__progress" aria-hidden="true">
          <div className="splash__progress-track">
            <div ref={barRef} className="splash__progress-fill" />
          </div>
        </div>
      </div>
    </div>
  );
}
