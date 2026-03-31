import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import SplitText from './components/SplitText';
import SplashScreen from './components/SplashScreen';
import ProjectDetailModal from './components/ProjectDetailModal';
import ColorBends from './components/ColorBends';
import { FSKPM_FIGMA_PROTO, TROMBOL_FIGMA_PROTO } from './config/figmaLinks';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [contentRevealed, setContentRevealed] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [detailProject, setDetailProject] = useState(null);
  const mainRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Scroll Reveal Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.1 }
    );

    const revealElements = document.querySelectorAll('.reveal-fade, .reveal-slide-up');
    revealElements.forEach((el) => observer.observe(el));

    // Active Section Observer for Dock
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    ['home', 'about', 'skills', 'projects', 'contact'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });

    // Mockup frame parallax
    const handleMouseMove = (e, frame) => {
      const r = frame.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      frame.style.transform = `perspective(1200px) rotateY(${x * 10}deg) rotateX(${-y * 7}deg)`;
    };

    const handleMouseLeave = (frame) => {
      frame.style.transition = 'transform 0.5s ease-out';
      frame.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg)';
      setTimeout(() => { frame.style.transition = ''; }, 500);
    };

    const frames = document.querySelectorAll('.mockup-frame');
    frames.forEach(frame => {
      frame.addEventListener('mousemove', (e) => handleMouseMove(e, frame));
      frame.addEventListener('mouseleave', () => handleMouseLeave(frame));
    });

    return () => {
      lenis.destroy();
      observer.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  return (
    <div ref={mainRef}>
      {showSplash && (
        <SplashScreen
          onBeginExit={() => setContentRevealed(true)}
          onFinish={() => setShowSplash(false)}
        />
      )}

      <ProjectDetailModal
        project={detailProject}
        onClose={() => setDetailProject(null)}
      />

      <div
        className={`app-shell app-shell--react${contentRevealed ? ' app-shell--visible' : ''}`}
      >
      {/* DOCK NAVBAR */}
      <div className="dock-container">
        <nav className="dock">
          <a href="#home" className={`dock-item ${activeSection === 'home' ? 'active' : ''}`} title="Home">
            <i className="fa-solid fa-house"></i>
          </a>
          <a href="#about" className={`dock-item ${activeSection === 'about' ? 'active' : ''}`} title="About">
            <i className="fa-solid fa-user"></i>
          </a>
          <a href="#skills" className={`dock-item ${activeSection === 'skills' ? 'active' : ''}`} title="Skills">
            <i className="fa-solid fa-terminal"></i>
          </a>
          <a href="#projects" className={`dock-item ${activeSection === 'projects' ? 'active' : ''}`} title="Work">
            <i className="fa-solid fa-folder-open"></i>
          </a>
          <a href="#contact" className={`dock-item ${activeSection === 'contact' ? 'active' : ''}`} title="Contact">
            <i className="fa-solid fa-envelope"></i>
          </a>
          <div className="dock-divider" aria-hidden="true" />
          <a
            href={`${import.meta.env.BASE_URL}files/waa_resume.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="dock-item"
            title="Résumé (PDF)"
            download="waa_resume.pdf"
          >
            <i className="fa-solid fa-file-pdf"></i>
          </a>
        </nav>
      </div>

      <main>
        {/* HERO SECTION */}
        <section className="hero" id="home">
          <div className="hero__aurora-wrapper">
             <ColorBends 
                colors={["#00e5ff", "#007bff", "#5500ff"]} 
                speed={0.15} 
                scale={1.2}
                warpStrength={1.5}
                parallax={0.3}
             />
          </div>
          <div className="hero__overlay"></div>

          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <p className="hero__label">UX · HCI · Cognitive science</p>

            <h1 className="hero__headline">
              <SplitText
                text="Krysthel Lua Peterus"
                tag="span"
                className="block"
                delay={40}
                duration={1.2}
                splitType="chars"
              />
              <br />
              <SplitText
                text="Design rooted in how people think."
                tag="span"
                className="hero__headline-accent"
                delay={50}
                duration={1.5}
                splitType="chars"
                from={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
                to={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              />
            </h1>

            <div className="hero__typing-wrapper">
              <p className="hero__tagline">
                Research-led interfaces. Experiences that feel obvious.
              </p>
            </div>

            <div className="hero__actions">
              <a href="#projects" className="btn btn--primary">Explore the work</a>
              <a href="#about" className="btn btn--ghost">Learn more <i className="fa-solid fa-arrow-right btn-icon"></i></a>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="about" id="about">
          <div className="container">
            <p className="eyebrow reveal-fade">About</p>
            <div className="about__grid">
              <figure className="about__photo">
                <img
                  src={`${import.meta.env.BASE_URL}waa.png`}
                  alt="Krysthel Lua Peterus"
                  width={560}
                  height={700}
                  loading="eager"
                  decoding="async"
                />
              </figure>
              <div className="about__copy">
                <div className="about__intro reveal-slide-up">
                  <h2 className="section-headline">
                    Cognitive science.<br />Thoughtful design.
                  </h2>
                </div>
                <div className="about__body reveal-slide-up">
                  <p>Cognitive Science graduate, focused on <strong>Human–Computer Interaction</strong>. User research and data inform every decision—so the product stays clear, fast, and human.</p>
                  <div className="about__actions">
                    <a
                      href={`${import.meta.env.BASE_URL}files/waa_resume.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--primary"
                      download="waa_resume.pdf"
                    >
                      <i className="fa-solid fa-arrow-down"></i> Download résumé
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SKILLS SECTION */}
        <section className="skills" id="skills">
          <div className="container">
            <p className="eyebrow reveal-fade">Capabilities</p>
            <h2 className="section-headline reveal-slide-up">Tools that keep<br />the work precise.</h2>
            <div className="skills__grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
              {[
                { icon: 'fa-figma', name: 'Figma', desc: 'Systems, UI, prototypes.' },
                { icon: 'fa-python', name: 'Python', desc: 'Analysis, scripting, research.' },
                { icon: 'fa-android', name: 'Mobile', desc: 'Android Studio & Flutter.' },
                { icon: 'fa-html5', name: 'Web', desc: 'React, HTML, CSS.' }
              ].map((skill, i) => (
                <div key={i} className="skill-card reveal-slide-up" style={{ transitionDelay: `${i * 0.1}s` }}>
                  <div className="skill-card__icon"><i className={`fa-brands ${skill.icon}`}></i></div>
                  <h3>{skill.name}</h3>
                  <p>{skill.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section className="projects" id="projects">
          <div className="container">
            <p className="eyebrow reveal-fade">Work</p>
            <h2 className="section-headline reveal-slide-up">A few things<br />worth seeing.</h2>
            
            <div className="project reveal-slide-up" style={{ marginTop: '5rem' }}>
              <div className="project__inner container">
                <div className="project__meta">
                  <span className="project__index">01</span>
                  <h3 className="project__title">MyFSKPM App</h3>
                  <p className="project__desc">One app for coursework, calendars, and faculty—so students spend less time searching and more time learning.</p>
                  <div className="project__actions">
                    <button
                      type="button"
                      className="btn btn--outline"
                      onClick={() => setDetailProject('fskpm')}
                    >
                      See project detail
                    </button>
                    <a
                      href={FSKPM_FIGMA_PROTO}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--outline"
                    >
                      View Figma prototype
                      <i className="fa-solid fa-arrow-up-right-from-square btn-icon" aria-hidden />
                    </a>
                  </div>
                </div>
                <div className="project__visual">
                  <div className="mockup-frame">
                    <img src={`${import.meta.env.BASE_URL}fskpm.png`} alt="MyFSKPM" />
                  </div>
                </div>
              </div>
            </div>

            <div className="project reveal-slide-up" style={{ marginTop: '5rem' }}>
              <div className="project__inner container project__inner--rev">
                <div className="project__meta">
                  <span className="project__index">02</span>
                  <h3 className="project__title">Kampung Trombol App</h3>
                  <p className="project__desc">Discovery and booking for Paradise Beach—dual apps for guests and admins, with a Gemini-powered assistant.</p>
                  <div className="project__actions">
                    <button
                      type="button"
                      className="btn btn--outline"
                      onClick={() => setDetailProject('trombol')}
                    >
                      See project detail
                    </button>
                    <a
                      href={TROMBOL_FIGMA_PROTO}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--outline"
                    >
                      View Figma prototype
                      <i className="fa-solid fa-arrow-up-right-from-square btn-icon" aria-hidden />
                    </a>
                  </div>
                </div>
                <div className="project__visual">
                  <div className="mockup-frame mockup-frame--teal">
                    <img src={`${import.meta.env.BASE_URL}para.png`} alt="Kampung Trombol" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="contact" id="contact">
          <div className="container">
            <div className="contact__card reveal-slide-up">
              <p className="eyebrow">Contact</p>
              <h2 className="contact__headline">Say hello.</h2>
              <div className="contact__actions">
                <a href="mailto:contact@krysthel.com" className="btn btn--primary">Email</a>
                <a href="#" className="btn btn--ghost">LinkedIn</a>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="container footer__inner">
            <span className="footer__logo">Krysthel Lua Peterus</span>
            <p className="footer__copy">© 2026 Krysthel Lua Peterus</p>
          </div>
        </footer>
      </main>
      </div>
    </div>
  );
}

export default App;
