import React from 'react';
import { createRoot } from 'react-dom/client';
import { MetalFx } from 'metal-fx';

// Initialize chromatic AI button in navbar with smooth scroll to prompt card
export function initNavAiButton() {
  const container = document.getElementById('navAiMount');
  if (!container) return;

  const handleClick = (e) => {
    e.preventDefault();
    const target = document.getElementById('auAsk');
    if (!target) return;
    if (window.lenis && typeof window.lenis.scrollTo === 'function') {
      window.lenis.scrollTo(target, { offset: -30, duration: 1.2 });
    } else {
      const top = target.getBoundingClientRect().top + window.scrollY - 30;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
    history.replaceState(null, '', '#auAsk');
    const askCard = target.querySelector('.au-ask-card');
    if (askCard) {
      askCard.classList.remove('is-pulse');
      void askCard.offsetWidth;
      askCard.classList.add('is-pulse');
      setTimeout(() => askCard.classList.remove('is-pulse'), 2500);
    }
  };

  function NavAiStarButton() {
    return (
      <MetalFx preset="chromatic" variant="circle" strength={1} theme="light">
        <button
          type="button"
          id="navAiBtn"
          className="nav-ai-circle-btn"
          onClick={handleClick}
          aria-label="Ask your own AI if Wozku fits your event"
          title="Ask your own AI if Wozku fits your event"
        >
          <svg className="nav-ai-star-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C12.4 6.8 15.2 9.6 20 10C15.2 10.4 12.4 13.2 12 18C11.6 13.2 8.8 10.4 4 10C8.8 9.6 11.6 6.8 12 2Z" />
            <path d="M18.5 2C18.7 4 19.8 5.1 21.8 5.3C19.8 5.5 18.7 6.6 18.5 8.6C18.3 6.6 17.2 5.5 15.2 5.3C17.2 5.1 18.3 4 18.5 2Z" opacity="0.85" />
          </svg>
        </button>
      </MetalFx>
    );
  }

  const root = createRoot(container);
  root.render(<NavAiStarButton />);
}
