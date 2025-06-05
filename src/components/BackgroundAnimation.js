// src/components/BackgroundAnimation.js
import React, { useEffect, useRef } from 'react';

const COLORS = [
  // Original colors
  '#00f3ff', // neon-blue
  '#ff00ff', // neon-pink
  '#39ff14', // neon-green
  '#ff7f00', // neon-orange
  '#ffff00', // neon-yellow
  '#ff073a', // neon-red
  '#b200ff', // neon-purple
  '#00ffee', // neon-cyan
  '#aaff00', // neon-lime
  '#00ffaa', // neon-teal
  '#ff007f', // neon-rose
  
  // New neon colors
  '#8a2be2', // neon-violet
  '#ff6b47', // neon-coral
  '#00ff9f', // neon-mint
  '#ffd700', // neon-gold
  '#4b0082', // neon-indigo
  '#ff1493', // neon-magenta
  '#40e0d0', // neon-turquoise
  '#e6e6fa', // neon-lavender
  '#7fff00', // neon-chartreuse
  '#dc143c', // neon-crimson
  '#00ffff', // neon-aqua
  '#ff69b4', // neon-salmon
  '#7df9ff', // neon-electric-blue
  '#ff1493', // neon-hot-pink
  '#00ff7f', // neon-spring-green
];

const BackgroundAnimation = () => {
  const bgRef = useRef(null);

  useEffect(() => {
    const bgAnimation = bgRef.current;

    const createBlobs = () => {
      // clear old blobs
      while (bgAnimation.firstChild) {
        bgAnimation.removeChild(bgAnimation.firstChild);
      }

      // create new blobs - increased from 20 to 30 for more variety
      for (let i = 0; i < 30; i++) {
        const span = document.createElement('span');

        // pick two different neon colors
        const c1 = COLORS[Math.floor(Math.random() * COLORS.length)];
        let c2;
        do {
          c2 = COLORS[Math.floor(Math.random() * COLORS.length)];
        } while (c2 === c1);

        span.style.background = `linear-gradient(45deg, ${c1}, ${c2})`;

        // random size - increased range for more variety
        const size = Math.random() * 40 + 8; // 8–48px
        span.style.width = `${size}px`;
        span.style.height = `${size}px`;

        // random start position
        span.style.left = `${Math.random() * 100}vw`;
        span.style.top = `${Math.random() * 100}vh`;

        // random animation timing
        span.style.animationDuration = `${Math.random() * 10 + 10}s`; // 10–20s
        span.style.animationDelay = `${Math.random() * 5}s`;         // 0–5s

        // set currentColor for box-shadow glow
        span.style.color = c2;

        bgAnimation.appendChild(span);
      }
    };

    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      bgAnimation.style.display = isMobile ? 'none' : 'block';
    };

    createBlobs();
    handleResize(); // hide on mobile if needed
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div className="bg-animation" ref={bgRef}></div>;
};

export default BackgroundAnimation;