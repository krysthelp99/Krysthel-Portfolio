/* ============================================================
   TextType — Vanilla JS port of the React TextType component
   Typing effect with cursor, variable speed, looping, and
   delete-then-retype animation.
   ============================================================ */

'use strict';

class TextType {
  constructor(el, options = {}) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    if (!this.el) return;

    /* ── Options ──────────────────────────────────────────── */
    const o = Object.assign({
      texts:              ['Hello, World!'],
      typingSpeed:        60,
      deletingSpeed:      35,
      pauseDuration:      2200,
      initialDelay:       0,
      loop:               true,
      showCursor:         true,
      cursorCharacter:    '|',
      cursorBlinkDuration: 0.5,
      variableSpeed:      null,   // { min: 40, max: 100 }
      startOnVisible:     false,
      onSentenceComplete: null,
    }, options);

    this.texts            = Array.isArray(o.texts) ? o.texts : [o.texts];
    this.typingSpeed      = o.typingSpeed;
    this.deletingSpeed    = o.deletingSpeed;
    this.pauseDuration    = o.pauseDuration;
    this.initialDelay     = o.initialDelay;
    this.loop             = o.loop;
    this.showCursor       = o.showCursor;
    this.cursorCharacter  = o.cursorCharacter;
    this.cursorBlinkDuration = o.cursorBlinkDuration;
    this.variableSpeed    = o.variableSpeed;
    this.startOnVisible   = o.startOnVisible;
    this.onSentenceComplete = o.onSentenceComplete;

    /* ── State ────────────────────────────────────────────── */
    this.currentTextIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting       = false;
    this.timeout          = null;
    this.started          = false;

    /* ── Build DOM ────────────────────────────────────────── */
    this._buildDOM();

    /* ── Start ────────────────────────────────────────────── */
    if (this.startOnVisible) {
      this._observeVisibility();
    } else {
      this._start();
    }
  }

  /* ── DOM construction ───────────────────────────────────── */
  _buildDOM() {
    this.el.innerHTML = '';
    this.el.classList.add('text-type');

    this.contentEl = document.createElement('span');
    this.contentEl.className = 'text-type__content';
    this.el.appendChild(this.contentEl);

    if (this.showCursor) {
      this.cursorEl = document.createElement('span');
      this.cursorEl.className = 'text-type__cursor';
      this.cursorEl.textContent = this.cursorCharacter;
      this.el.appendChild(this.cursorEl);

      // GSAP blink
      if (typeof gsap !== 'undefined') {
        gsap.to(this.cursorEl, {
          opacity: 0,
          duration: this.cursorBlinkDuration,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut',
        });
      }
    }
  }

  /* ── Intersection Observer ──────────────────────────────── */
  _observeVisibility() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.started) {
          this._start();
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(this.el);
  }

  /* ── Start typing ───────────────────────────────────────── */
  _start() {
    this.started = true;
    this.timeout = setTimeout(() => this._tick(), this.initialDelay);
  }

  /* ── Speed helper ───────────────────────────────────────── */
  _getSpeed() {
    if (this.isDeleting) return this.deletingSpeed;
    if (this.variableSpeed) {
      const { min, max } = this.variableSpeed;
      return Math.random() * (max - min) + min;
    }
    return this.typingSpeed;
  }

  /* ── Main tick loop ─────────────────────────────────────── */
  _tick() {
    const currentText = this.texts[this.currentTextIndex];

    if (this.isDeleting) {
      /* ── Deleting ──────────────────────────────────────── */
      this.currentCharIndex--;
      this.contentEl.textContent = currentText.substring(0, this.currentCharIndex);

      if (this.currentCharIndex <= 0) {
        this.isDeleting = false;

        if (this.onSentenceComplete) {
          this.onSentenceComplete(currentText, this.currentTextIndex);
        }

        this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;

        // If not looping and we've shown all texts, stop
        if (!this.loop && this.currentTextIndex === 0) return;

        this.timeout = setTimeout(() => this._tick(), 400);
        return;
      }
    } else {
      /* ── Typing ────────────────────────────────────────── */
      this.currentCharIndex++;
      this.contentEl.textContent = currentText.substring(0, this.currentCharIndex);

      if (this.currentCharIndex >= currentText.length) {
        // Finished typing — pause then delete
        if (!this.loop && this.texts.length === 1) return;

        this.timeout = setTimeout(() => {
          this.isDeleting = true;
          this._tick();
        }, this.pauseDuration);
        return;
      }
    }

    this.timeout = setTimeout(() => this._tick(), this._getSpeed());
  }

  /* ── Cleanup ────────────────────────────────────────────── */
  destroy() {
    clearTimeout(this.timeout);
    if (this.cursorEl && typeof gsap !== 'undefined') {
      gsap.killTweensOf(this.cursorEl);
    }
  }
}

// Export for global use
window.TextType = TextType;
