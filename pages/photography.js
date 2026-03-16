import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import styled, { keyframes, css, createGlobalStyle } from "styled-components";
import fs from "fs";
import path from "path";
import Layout from "../components/Layout";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
]);

export async function getStaticProps() {
  const dir = path.join(process.cwd(), "public", "img", "photography");
  let files = [];

  try {
    files = fs.readdirSync(dir);
  } catch {
    // directory doesn't exist yet
  }

  const images = files
    .filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const heroFile = images.find(
    (f) => path.basename(f, path.extname(f)).toLowerCase() === "hero"
  );

  const photos = images
    .filter((f) => f !== heroFile)
    .map((f) => {
      const name = path.basename(f, path.extname(f));
      const alt = name.replace(/[-_]/g, " ");
      return { src: `/img/photography/${f}`, alt };
    });

  return {
    props: {
      heroImage: heroFile ? `/img/photography/${heroFile}` : null,
      photos,
    },
  };
}

/* ────────── Intersection-Observer hook ────────── */
const useReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
};

/* ────────── Mouse tilt effect on gallery items ────────── */
const useTilt = () => {
  const ref = useRef(null);

  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${
      -y * 8
    }deg) scale(1.03)`;
  }, []);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform =
      "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  return { ref, handleMove, handleLeave };
};

/* ────────── Gallery image with shutter reveal + tilt ────────── */
const GalleryImage = memo(({ src, alt, index, onOpen }) => {
  const [revealRef, visible] = useReveal(0.1);
  const [loaded, setLoaded] = useState(false);
  const { ref: tiltRef, handleMove, handleLeave } = useTilt();

  const mergedRef = useCallback(
    (node) => {
      revealRef.current = node;
      tiltRef.current = node;
    },
    [revealRef, tiltRef]
  );

  const direction =
    index % 3 === 0 ? "left" : index % 3 === 1 ? "right" : "bottom";

  return (
    <GalleryItem
      ref={mergedRef}
      visible={visible}
      index={index}
      direction={direction}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={() => onOpen(index)}
    >
      <ShutterMask loaded={loaded}>
        <img
          src={src}
          alt={alt || "photograph"}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
      </ShutterMask>
      <ImageCaption visible={visible} index={index}>
        {alt}
      </ImageCaption>
    </GalleryItem>
  );
});

/* ────────── Lightbox ────────── */
const Lightbox = ({ photos, activeIndex, onClose }) => {
  const [current, setCurrent] = useState(activeIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const isZoomed = zoom > 1;

  useEffect(() => setCurrent(activeIndex), [activeIndex]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [current]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (isZoomed) {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        } else {
          onClose();
        }
      }
      if (!isZoomed) {
        if (e.key === "ArrowRight")
          setCurrent((c) => (c + 1) % photos.length);
        if (e.key === "ArrowLeft")
          setCurrent((c) => (c - 1 + photos.length) % photos.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, photos.length, isZoomed]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleImageClick = useCallback(
    (e) => {
      if (dragging) return;
      if (!isZoomed) {
        const rect = imageRef.current?.getBoundingClientRect();
        if (rect) {
          const x = ((e.clientX - rect.left) / rect.width - 0.5) * -200;
          const y = ((e.clientY - rect.top) / rect.height - 0.5) * -200;
          setPan({ x, y });
        }
        setZoom(2.5);
      }
    },
    [isZoomed, dragging]
  );

  const handlePointerDown = useCallback(
    (e) => {
      if (!isZoomed) return;
      e.preventDefault();
      setDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      panStart.current = { ...pan };
      e.target.setPointerCapture(e.pointerId);
    },
    [isZoomed, pan]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!dragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPan({
        x: panStart.current.x + dx,
        y: panStart.current.y + dy,
      });
    },
    [dragging]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const goNext = () => setCurrent((c) => (c + 1) % photos.length);
  const goPrev = () =>
    setCurrent((c) => (c - 1 + photos.length) % photos.length);

  return (
    <LightboxOverlay onClick={onClose}>
      <LightboxContent>
        <LightboxImageWrapper
          onClick={(e) => e.stopPropagation()}
          ref={imageRef}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          $isZoomed={isZoomed}
          $dragging={dragging}
        >
          <LightboxImage
            src={photos[current].src}
            alt={photos[current].alt}
            onClick={handleImageClick}
            draggable={false}
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${
                pan.y / zoom
              }px)`,
              transition: dragging
                ? "none"
                : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </LightboxImageWrapper>
        <LightboxCaption onClick={(e) => e.stopPropagation()}>
          {photos[current].alt}
        </LightboxCaption>
        {!isZoomed && (
          <LightboxNav onClick={(e) => e.stopPropagation()}>
            <NavButton onClick={goPrev}>&larr;</NavButton>
            <LightboxCounter>
              {current + 1} / {photos.length}
            </LightboxCounter>
            <NavButton onClick={goNext}>&rarr;</NavButton>
          </LightboxNav>
        )}
        {isZoomed && (
          <ZoomBadge>{Math.round(zoom * 100)}% — Esc to reset</ZoomBadge>
        )}
        <CloseButton
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          &times;
        </CloseButton>
      </LightboxContent>
    </LightboxOverlay>
  );
};

/* ────────── RAF-based scroll hook (no React re-renders) ────────── */
const useScrollRefs = () => {
  const progressRef = useRef(null);
  const lettersRef = useRef([]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? scrollY / docHeight : 0;

        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${progress})`;
        }

        lettersRef.current.forEach((el, i) => {
          if (el) {
            el.style.transform = `translateY(${
              scrollY * (0.02 + i * 0.008)
            }px)`;
          }
        });

        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { progressRef, lettersRef };
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Palette                                                                 */
/* ══════════════════════════════════════════════════════════════════════════ */
const warm = {
  cream: "#EDE8E0",
  sand: "#D9D2C7",
  dark: "#1a1a1a",
  mid: "#6b6560",
  light: "#f5f2ed",
  accent: "#c4a882",
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Page Component                                                          */
/* ══════════════════════════════════════════════════════════════════════════ */
const PhotographyGlobalStyle = createGlobalStyle`
  body, main {
    background: ${warm.cream} !important;
  }
  nav, nav *, header, header * {
    color: ${warm.dark} !important;
  }
  nav svg, header svg {
    fill: ${warm.dark} !important;
  }
`;

const Photography = ({ heroImage, photos }) => {
  const { progressRef, lettersRef } = useScrollRefs();
  const [sectionRef, sectionVisible] = useReveal(0.05);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const titleLetters = "photography".split("");

  return (
    <Layout title="Photography" hideBackLay>
      <PhotographyGlobalStyle />
      <PageOverride>
        {/* Scroll progress */}
        <ScrollProgress ref={progressRef} />

        {/* ── Hero ── */}
        <HeroSection>
          <HeroTitle>
            {titleLetters.map((letter, i) => (
              <HeroLetter
                key={i}
                ref={(el) => {
                  lettersRef.current[i] = el;
                }}
                index={i}
              >
                {letter}
              </HeroLetter>
            ))}
          </HeroTitle>

          <HeroLine />

          {heroImage && (
            <HeroImageContainer>
              <HeroImageInner>
                <img src={heroImage} alt="Featured photograph" />
              </HeroImageInner>
              <HeroImageBorder />
            </HeroImageContainer>
          )}
        </HeroSection>

        {/* ── Gallery ── */}
        <GallerySection ref={sectionRef} visible={sectionVisible}>
          <GalleryIntro visible={sectionVisible}>
            <GalleryNumber>
              {String(photos.length).padStart(2, "0")}
            </GalleryNumber>
            <h2>photos</h2>
            <GalleryDivider visible={sectionVisible} />
          </GalleryIntro>

          {photos.length > 0 ? (
            <MasonryGrid>
              {photos.map((photo, i) => (
                <GalleryImage
                  key={photo.src}
                  src={photo.src}
                  alt={photo.alt}
                  index={i}
                  onOpen={setLightboxIndex}
                />
              ))}
            </MasonryGrid>
          ) : (
            <EmptyState>
              <p>photos coming soon</p>
              <small>
                add images to <code>public/img/photography/</code>
              </small>
            </EmptyState>
          )}
        </GallerySection>
      </PageOverride>

      {/* Lightbox */}
      {lightboxIndex !== null && photos.length > 0 && (
        <Lightbox
          photos={photos}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </Layout>
  );
};

export default Photography;

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Animations                                                              */
/* ══════════════════════════════════════════════════════════════════════════ */

const letterDrop = keyframes`
  0%   { opacity: 0; transform: translateY(-60px) rotateX(90deg); }
  60%  { opacity: 1; }
  80%  { transform: translateY(4px) rotateX(-5deg); }
  100% { opacity: 1; transform: translateY(0) rotateX(0deg); }
`;

const lineExpand = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideFromLeft = keyframes`
  from { opacity: 0; transform: translateX(-40px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const slideFromRight = keyframes`
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const slideFromBottom = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shutterOpen = keyframes`
  from { clip-path: inset(0 0 100% 0); }
  to   { clip-path: inset(0 0 0% 0); }
`;

const numberCount = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const lightboxIn = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
`;

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Styled Components                                                       */
/* ══════════════════════════════════════════════════════════════════════════ */

const PageOverride = styled.div`
  background: ${warm.cream};
  min-height: 100vh;
  overflow: hidden;
  color: ${warm.dark};
  position: relative;

  * {
    color: ${warm.dark};
  }
`;

/* ── Scroll progress ── */
const ScrollProgress = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: ${warm.accent};
  transform-origin: left;
  transform: scaleX(0);
  z-index: 999;
  will-change: transform;
`;

/* ── Hero ── */
const HeroSection = styled.section`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1.25rem 4rem;
  min-height: 100vh;

  @media (min-width: 768px) {
    padding: 3rem 2.5rem 5rem;
  }
`;

const HeroTitle = styled.h1`
  position: relative;
  z-index: 2;
  font-family: "Sora", "Outfit", sans-serif;
  font-weight: 700;
  font-size: clamp(3.5rem, 14vw, 11rem);
  letter-spacing: -2px;
  line-height: 0.9;
  text-transform: lowercase;
  text-align: center;
  display: flex;
  perspective: 400px;

  /* Debossed dark lettering — premium cloth-bound book cover */
  color: transparent !important;
  background: linear-gradient(
    170deg,
    #1e1916 0%,
    #302824 25%,
    #151210 50%,
    #2c2420 75%,
    #1a1613 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;

  /* Inset / deboss shadow — pressed into the page */
  &::before {
    content: "photography";
    position: absolute;
    inset: 0;
    z-index: -1;
    font-family: inherit;
    font-weight: inherit;
    font-size: inherit;
    letter-spacing: inherit;
    line-height: inherit;
    text-transform: inherit;
    display: flex;
    color: transparent;
    -webkit-text-stroke: 0;
    text-shadow:
      0 2px 1px rgba(255, 255, 255, 0.35),
      0 -1px 1px rgba(0, 0, 0, 0.25),
      1px 2px 3px rgba(255, 255, 255, 0.18),
      0 0 12px rgba(40, 30, 20, 0.1);
  }

  /* Subtle sheen — like light catching embossed cloth */
  &::after {
    content: "photography";
    position: absolute;
    inset: 0;
    z-index: 1;
    font-family: inherit;
    font-weight: inherit;
    font-size: inherit;
    letter-spacing: inherit;
    line-height: inherit;
    text-transform: inherit;
    display: flex;
    background: linear-gradient(
      115deg,
      transparent 0%,
      transparent 40%,
      rgba(255, 255, 255, 0.14) 48%,
      rgba(255, 255, 255, 0.05) 52%,
      transparent 60%,
      transparent 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    pointer-events: none;
  }
`;

const HeroLetter = styled.span`
  display: inline-block;
  opacity: 0;
  animation: ${letterDrop} 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: ${({ index }) => 0.1 + index * 0.05}s;
  color: inherit !important;
  -webkit-text-fill-color: inherit;
  filter: drop-shadow(0 1px 2px rgba(30, 25, 20, 0.18));
  will-change: transform;
`;

const HeroLine = styled.div`
  width: 60px;
  height: 2px;
  background: ${warm.accent};
  margin: 1.5rem 0 1rem;
  transform: scaleX(0);
  animation: ${lineExpand} 0.8s 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
`;



const HeroImageContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1000px;
  opacity: 0;
  animation: ${fadeIn} 1.2s 0.6s ease both;
`;

const HeroImageInner = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 16px;

  @media (min-width: 768px) {
    border-radius: 24px;
  }

  img {
    width: 100%;
    height: auto;
    display: block;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    filter: saturate(0.85) contrast(1.05);
    transition: filter 0.6s ease;

    @media (min-width: 768px) {
      aspect-ratio: 16 / 10;
    }

    &:hover {
      filter: saturate(1) contrast(1);
    }
  }
`;

const HeroImageBorder = styled.div`
  position: absolute;
  inset: -8px;
  border: 1px solid ${warm.sand};
  border-radius: 20px;
  pointer-events: none;
  opacity: 0;
  animation: ${fadeIn} 1s 1.4s ease both;

  @media (min-width: 768px) {
    inset: -12px;
    border-radius: 32px;
  }
`;

/* ── Gallery section ── */
const GallerySection = styled.section`
  position: relative;
  padding: 5rem 1.5rem 4rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (min-width: 768px) {
    padding: 6rem 3rem 5rem;
  }
`;

const GalleryIntro = styled.div`
  text-align: center;
  margin-bottom: 5rem;

  h2 {
    font-family: "Sora", "Outfit", sans-serif;
    font-weight: 700;
    font-size: clamp(2rem, 5vw, 3.5rem);
    color: ${warm.dark} !important;
    letter-spacing: -0.5px;
    margin-bottom: 0;
    opacity: 0;
    ${({ visible }) =>
      visible &&
      css`
        animation: ${fadeIn} 0.8s 0.2s ease both;
      `}
  }
`;

const GalleryNumber = styled.div`
  font-family: "Outfit", monospace;
  font-weight: 200;
  font-size: clamp(4rem, 10vw, 8rem);
  color: ${warm.sand} !important;
  line-height: 1;
  margin-bottom: -0.3em;
  opacity: 0;
  animation: ${numberCount} 0.8s 0.1s ease both;
`;

const GalleryDivider = styled.div`
  width: 40px;
  height: 1px;
  background: ${warm.accent};
  margin: 1.5rem auto 0;
  transform: scaleX(0);
  ${({ visible }) =>
    visible &&
    css`
      animation: ${lineExpand} 0.6s 0.5s ease both;
    `}
`;

/* ── Masonry grid ── */
const MasonryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    gap: 2rem;
  }
`;

const revealAnimation = {
  left: slideFromLeft,
  right: slideFromRight,
  bottom: slideFromBottom,
};

const GalleryItem = styled.div`
  border-radius: 12px;
  overflow: visible;
  opacity: 0;
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  ${({ visible, index, direction }) =>
    visible &&
    css`
      animation: ${revealAnimation[direction] || slideFromBottom} 0.6s
        ${Math.min(index * 0.08, 0.4)}s cubic-bezier(0.16, 1, 0.3, 1)
        forwards;
    `}

  &:hover {
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    z-index: 2;
  }
`;

const ShutterMask = styled.div`
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  background: ${warm.sand};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 12px;
    filter: saturate(0.8) contrast(1.05);
    transition: filter 0.4s ease,
      transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    ${({ loaded }) =>
      loaded
        ? css`
            animation: ${shutterOpen} 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          `
        : css`
            opacity: 0;
          `}
  }

  &:hover img {
    filter: saturate(1) contrast(1);
    transform: scale(1.05);
  }
`;

const ImageCaption = styled.span`
  display: block;
  font-family: "Outfit", sans-serif;
  font-weight: 300;
  font-size: 0.7rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${warm.mid} !important;
  padding: 0.75rem 0.25rem 0;
  opacity: 0;
  ${({ visible, index }) =>
    visible &&
    css`
      animation: ${fadeIn} 0.4s ${Math.min(0.2 + index * 0.08, 0.5)}s ease
        both;
    `}
`;

/* ── Empty state ── */
const EmptyState = styled.div`
  text-align: center;
  padding: 6rem 2rem;
  border: 1px solid ${warm.sand};
  border-radius: 16px;
  animation: ${fadeIn} 1s both;

  p {
    font-family: "Outfit", sans-serif;
    font-weight: 500;
    font-size: 1.5rem;
    color: ${warm.mid} !important;
    margin-bottom: 1rem;
  }

  small {
    font-family: "Outfit", sans-serif;
    color: ${warm.accent} !important;
    font-size: 0.85rem;
  }

  code {
    background: ${warm.sand};
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 0.8rem;
  }
`;

/* ── Lightbox ── */
const LightboxOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(20, 18, 16, 0.97);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.15s ease;
  cursor: zoom-out;
`;

const LightboxContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: default;
  animation: ${lightboxIn} 0.15s ease-out;
  padding: 1rem;
`;

const LightboxImageWrapper = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  max-width: 90vw;
  max-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $isZoomed, $dragging }) =>
    $dragging ? "grabbing" : $isZoomed ? "grab" : "zoom-in"};
  touch-action: none;
  user-select: none;
`;

const LightboxImage = styled.img`
  max-width: 90vw;
  max-height: calc(100vh - 160px);
  object-fit: contain;
  border-radius: 8px;
  filter: saturate(0.9) contrast(1.02);
  transform-origin: center center;
  pointer-events: auto;
`;

const LightboxCaption = styled.p`
  font-family: "Outfit", sans-serif;
  font-weight: 300;
  font-size: 0.8rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: ${warm.sand} !important;
  margin-top: 1rem;
  flex-shrink: 0;
`;

const LightboxNav = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: 0.75rem;
  flex-shrink: 0;
`;

const NavButton = styled.button`
  background: none;
  border: 1px solid ${warm.mid};
  color: ${warm.cream} !important;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: ${warm.accent};
    border-color: ${warm.accent};
    color: ${warm.dark} !important;
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

const LightboxCounter = styled.span`
  font-family: "Outfit", monospace;
  font-weight: 300;
  font-size: 0.85rem;
  letter-spacing: 2px;
  color: ${warm.mid} !important;
`;

const ZoomBadge = styled.div`
  font-family: "Outfit", sans-serif;
  font-weight: 300;
  font-size: 0.7rem;
  letter-spacing: 1px;
  color: ${warm.mid} !important;
  margin-top: 0.5rem;
  opacity: 0.7;
  flex-shrink: 0;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: ${warm.sand} !important;
  font-size: 2rem;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  transition: color 0.3s ease;
  z-index: 1;

  &:hover {
    color: ${warm.cream} !important;
  }
`;
