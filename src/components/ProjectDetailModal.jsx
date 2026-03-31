import { useEffect } from 'react';
import ImageCarousel from './ImageCarousel';
import { FSKPM_SLIDE_URLS } from '../data/fskpmSlides';
import { TROMBOL_SLIDE_URLS } from '../data/trombolSlides';
import { FSKPM_FIGMA_PROTO, TROMBOL_FIGMA_PROTO } from '../config/figmaLinks';

const COPY = {
  fskpm: {
    title: 'MyFSKPM App',
    body: 'One app for coursework, calendars, and faculty—so students spend less time searching and more time learning. Validated with usability testing and a full HCI design cycle, including cooperative evaluation and an AI assistant (“Mr. FSKPM”).',
  },
  trombol: {
    title: 'Kampung Trombol App',
    body: 'Cross-platform app for Paradise Beach: guest discovery and booking, plus an admin CMS on Firebase, with a Gemini-powered assistant (“Drake”).',
  },
};

export default function ProjectDetailModal({ project, onClose }) {
  useEffect(() => {
    if (!project) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [project, onClose]);

  if (!project) return null;

  const c = COPY[project];

  return (
    <div
      className="project-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      data-lenis-prevent
    >
      <button
        type="button"
        className="project-modal__scrim"
        aria-label="Close project details"
        onClick={onClose}
      />
      <div className="project-modal__panel">
        <button
          type="button"
          className="project-modal__close"
          aria-label="Close"
          onClick={onClose}
        >
          <i className="fa-solid fa-xmark" aria-hidden />
        </button>
        <h2 id="project-modal-title" className="project-modal__title">
          {c.title}
        </h2>
        <p className="project-modal__body">{c.body}</p>

        {project === 'fskpm' && (
          <div className="project-modal__carousel-wrap">
            <ImageCarousel images={FSKPM_SLIDE_URLS} altPrefix="MyFSKPM screen" />
          </div>
        )}

        {project === 'fskpm' && (
          <div className="project-modal__footer">
            <a
              href={FSKPM_FIGMA_PROTO}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary"
            >
              Open Figma prototype
              <i className="fa-solid fa-arrow-up-right-from-square btn-icon" aria-hidden />
            </a>
          </div>
        )}

        {project === 'trombol' && (
          <div className="project-modal__carousel-wrap">
            <ImageCarousel
              images={TROMBOL_SLIDE_URLS}
              altPrefix="Kampung Trombol screen"
            />
          </div>
        )}

        {project === 'trombol' && (
          <div className="project-modal__footer">
            <a
              href={TROMBOL_FIGMA_PROTO}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary"
            >
              Open Figma prototype
              <i className="fa-solid fa-arrow-up-right-from-square btn-icon" aria-hidden />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
