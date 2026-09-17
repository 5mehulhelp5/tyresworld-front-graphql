"use client";

import { useEffect } from "react";

/**
 * Robust, zero-layout-shift behavior for CMS Page Builder carousels
 * (e.g. the testimonial slider on car-tyre-service and service pages).
 */
export default function CmsCarousel() {
  useEffect(() => {
    const carousels = document.querySelectorAll<HTMLElement>(".cms-content .carousel");
    const cleanups: (() => void)[] = [];

    carousels.forEach((carousel) => {
      const items = Array.from(carousel.querySelectorAll<HTMLElement>(".carousel-item"));
      const indicators = Array.from(
        carousel.querySelectorAll<HTMLButtonElement>("[data-bs-slide-to]"),
      );
      if (!items.length) return;

      const activate = (index: number) => {
        items.forEach((item, i) => {
          item.classList.toggle("active", i === index);
        });
        indicators.forEach((btn) => {
          const target = Number(btn.getAttribute("data-bs-slide-to"));
          btn.classList.toggle("active", target === index);
        });
      };

      let current = Math.max(
        0,
        items.findIndex((item) => item.classList.contains("active")),
      );

      const nextSlide = (e?: Event) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        current = (current + 1) % items.length;
        activate(current);
      };

      const prevSlide = (e?: Event) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        current = (current - 1 + items.length) % items.length;
        activate(current);
      };

      const clickHandlers: { btn: HTMLElement; handler: (e: MouseEvent) => void }[] = [];

      // Wire existing indicators
      indicators.forEach((btn) => {
        const handler = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          current = Number(btn.getAttribute("data-bs-slide-to")) || 0;
          activate(current);
        };
        btn.addEventListener("click", handler);
        clickHandlers.push({ btn, handler });
      });

      // Wire existing controls if present
      const prevControls = Array.from(
        carousel.querySelectorAll<HTMLElement>("[data-bs-slide='prev'], .carousel-control-prev"),
      );
      const nextControls = Array.from(
        carousel.querySelectorAll<HTMLElement>("[data-bs-slide='next'], .carousel-control-next"),
      );

      prevControls.forEach((btn) => {
        btn.addEventListener("click", prevSlide);
        clickHandlers.push({ btn, handler: prevSlide });
      });
      nextControls.forEach((btn) => {
        btn.addEventListener("click", nextSlide);
        clickHandlers.push({ btn, handler: nextSlide });
      });

      // If no arrow buttons exist and there are multiple slides, inject sleek prev/next buttons
      if (items.length > 1 && !prevControls.length && !nextControls.length) {
        const arrowWrapper = document.createElement("div");
        arrowWrapper.className = "cms-carousel-arrows";
        arrowWrapper.innerHTML = `
          <button type="button" class="cms-carousel-btn cms-carousel-prev" aria-label="Previous slide">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button type="button" class="cms-carousel-btn cms-carousel-next" aria-label="Next slide">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        `;

        carousel.appendChild(arrowWrapper);
        const prevBtn = arrowWrapper.querySelector<HTMLButtonElement>(".cms-carousel-prev");
        const nextBtn = arrowWrapper.querySelector<HTMLButtonElement>(".cms-carousel-next");

        if (prevBtn) {
          prevBtn.addEventListener("click", prevSlide);
          clickHandlers.push({ btn: prevBtn, handler: prevSlide });
        }
        if (nextBtn) {
          nextBtn.addEventListener("click", nextSlide);
          clickHandlers.push({ btn: nextBtn, handler: nextSlide });
        }

        cleanups.push(() => {
          arrowWrapper.remove();
        });
      }

      const interval = Number(carousel.getAttribute("data-bs-interval")) || 6000;
      let timer = window.setInterval(nextSlide, interval);

      const pauseAuto = () => window.clearInterval(timer);
      const resumeAuto = () => {
        window.clearInterval(timer);
        timer = window.setInterval(nextSlide, interval);
      };

      carousel.addEventListener("mouseenter", pauseAuto);
      carousel.addEventListener("mouseleave", resumeAuto);

      cleanups.push(() => {
        window.clearInterval(timer);
        carousel.removeEventListener("mouseenter", pauseAuto);
        carousel.removeEventListener("mouseleave", resumeAuto);
        clickHandlers.forEach(({ btn, handler }) => btn.removeEventListener("click", handler));
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
