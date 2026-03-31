import { useState, useCallback, useRef, useEffect } from 'react';

export default function ImageCarousel({ images, altPrefix = 'Slide' }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const len = images.length;

  const go = useCallback(
    (delta) => {
      if (len === 0) return;
      setIndex((i) => (i + delta + len) % len);
    },
    [len]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx > 56) go(-1);
    else if (dx < -56) go(1);
  };

  if (len === 0) return null;

  const pct = len ? (index * 100) / len : 0;
  const slideFlex = `${100 / len}%`;

  return (
    <div
      className="carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${altPrefix} gallery`}
    >
      <div
        className="carousel__viewport"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="carousel__track"
          style={{
            width: `${len * 100}%`,
            transform: `translate3d(-${pct}%, 0, 0)`,
          }}
        >
          {images.map((src, i) => (
            <div
              key={src}
              className="carousel__slide"
              style={{ flex: `0 0 ${slideFlex}` }}
            >
              <div className="carousel__slide-inner">
                <img
                  className="carousel__img"
                  src={src}
                  alt={`${altPrefix} ${i + 1} of ${len}`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="carousel__shine" aria-hidden="true" />
      </div>

      <div className="carousel__chrome">
        <button
          type="button"
          className="carousel__btn carousel__btn--prev"
          onClick={() => go(-1)}
          aria-label="Previous slide"
        >
          <i className="fa-solid fa-chevron-left" aria-hidden />
        </button>

        <div className="carousel__dots" role="tablist" aria-label="Slides">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              className={`carousel__dot${i === index ? ' is-active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>

        <span className="carousel__counter" aria-live="polite">
          {index + 1}
          <span className="carousel__counter-sep">/</span>
          {len}
        </span>

        <button
          type="button"
          className="carousel__btn carousel__btn--next"
          onClick={() => go(1)}
          aria-label="Next slide"
        >
          <i className="fa-solid fa-chevron-right" aria-hidden />
        </button>
      </div>
    </div>
  );
}
