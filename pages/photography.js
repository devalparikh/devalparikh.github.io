import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import styled, { keyframes, css, createGlobalStyle } from "styled-components";
import fs from "fs";
import path from "path";
import exifr from "exifr";
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

  const galleryFiles = images.filter((f) => f !== heroFile);

  const photos = await Promise.all(
    galleryFiles.map(async (f) => {
      const name = path.basename(f, path.extname(f));
      const alt = name.replace(/[-_]/g, " ");
      const filePath = path.join(dir, f);

      let meta = null;
      try {
        const exif = await exifr.parse(filePath, {
          pick: [
            "Make",
            "Model",
            "FocalLength",
            "FNumber",
            "ExposureTime",
            "ISO",
            "DateTimeOriginal",
            "LensModel",
          ],
        });
        if (exif) {
          meta = {};
          if (exif.Make || exif.Model) {
            const make = (exif.Make || "").trim();
            const model = (exif.Model || "").trim();
            meta.camera = model.startsWith(make)
              ? model
              : `${make} ${model}`.trim();
          }
          if (exif.LensModel) meta.lens = exif.LensModel;
          if (exif.FocalLength) meta.focalLength = `${Math.round(exif.FocalLength)}mm`;
          if (exif.FNumber) meta.aperture = `f/${exif.FNumber}`;
          if (exif.ExposureTime) {
            meta.shutter =
              exif.ExposureTime < 1
                ? `1/${Math.round(1 / exif.ExposureTime)}s`
                : `${exif.ExposureTime}s`;
          }
          if (exif.ISO) meta.iso = `ISO ${exif.ISO}`;
          if (exif.DateTimeOriginal) {
            const d = new Date(exif.DateTimeOriginal);
            if (!isNaN(d)) {
              meta.date = d.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
            }
          }
          // Remove meta if completely empty
          if (Object.keys(meta).length === 0) meta = null;
        }
      } catch {
        // no EXIF data available
      }

      return { src: `/img/photography/${f}`, alt, meta };
    })
  );

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

  const meta = photos[current].meta;

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
        {meta && (
          <LightboxMetaBar onClick={(e) => e.stopPropagation()}>
            {meta.camera && <MetaItem><MetaLabel>Camera</MetaLabel><MetaValue>{meta.camera}</MetaValue></MetaItem>}
            {meta.lens && <MetaItem><MetaLabel>Lens</MetaLabel><MetaValue>{meta.lens}</MetaValue></MetaItem>}
            {meta.focalLength && <MetaItem><MetaLabel>Focal</MetaLabel><MetaValue>{meta.focalLength}</MetaValue></MetaItem>}
            {meta.aperture && <MetaItem><MetaLabel>Aperture</MetaLabel><MetaValue>{meta.aperture}</MetaValue></MetaItem>}
            {meta.shutter && <MetaItem><MetaLabel>Shutter</MetaLabel><MetaValue>{meta.shutter}</MetaValue></MetaItem>}
            {meta.iso && <MetaItem><MetaLabel>ISO</MetaLabel><MetaValue>{meta.iso}</MetaValue></MetaItem>}
            {meta.date && <MetaItem><MetaLabel>Date</MetaLabel><MetaValue>{meta.date}</MetaValue></MetaItem>}
          </LightboxMetaBar>
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

/* ────────── Scroll progress bar ────────── */
const useScrollProgress = () => {
  const progressRef = useRef(null);

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
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { progressRef };
};

/* ────────── Book opening scroll animation ────────── */
/*  Animates real width/height/font-size (not transform: scale)              */
/*  so text and edges stay crisp at every scroll position.                   */
const useBookAnimation = (sectionRef) => {
  const assemblyRef = useRef(null);
  const spineRef = useRef(null);
  const pageRightRef = useRef(null);
  const hintRef = useRef(null);
  const openHintRef = useRef(null);

  useEffect(() => {
    let ticking = false;

    const lerp = (a, b, t) => a + (b - a) * t;

    const update = () => {
      const section = sectionRef.current;
      const assembly = assemblyRef.current;
      if (!section || !assembly) return;

      const rect = section.getBoundingClientRect();
      const scrollSpace = rect.height - window.innerHeight;
      const raw = scrollSpace > 0 ? Math.max(0, -rect.top) / scrollSpace : 0;
      const p = Math.min(1, raw);
      const ease = 1 - Math.pow(1 - p, 2.5);

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Book natural dimensions & aspect ratio
      const bookRatio = 1.45; // h / w
      const bookW = Math.min(0.55 * vw, 400);
      const bookH = bookW * bookRatio;

      // Final size: covers the entire viewport while keeping book proportions
      // (excess is clipped by the stage's overflow: hidden)
      const finalW = Math.max(vw, vh / bookRatio);
      const finalH = finalW * bookRatio;

      // Grow uniformly — aspect ratio stays constant, feels like zooming in
      const w = lerp(bookW, finalW, ease);
      const h = lerp(bookH, finalH, ease);
      assembly.style.width = `${w}px`;
      assembly.style.height = `${h}px`;

      // 3D rotation only — NO scale()
      const rotY = -15 * (1 - ease);
      const rotX = 4 * (1 - ease);
      assembly.style.transform =
        `perspective(1200px) rotateY(${rotY}deg) rotateX(${rotX}deg)`;

      // Cover border-radius
      assembly.style.setProperty("--cover-radius", `${3 * (1 - ease)}px`);

      // Font sizes — keep proportional to current book width so text
      // feels printed on the cover and scales uniformly with it
      assembly.style.setProperty("--title-size", `${w * 0.11}px`);
      assembly.style.setProperty("--author-size", `${Math.max(8, w * 0.028)}px`);
      assembly.style.setProperty("--title-ls", `${-(w * 0.002)}px`);
      assembly.style.setProperty("--author-ls", `${w * 0.008}px`);
      assembly.style.setProperty("--title-gap", `${w * 0.03}px`);

      // Spine — shrink width (no opacity fade to prevent color blending)
      if (spineRef.current) {
        const sw = 22 * (1 - Math.min(ease * 1.8, 1));
        spineRef.current.style.width = `${sw}px`;
        spineRef.current.style.left = `${-sw}px`;
      }

      // Page edges — shrink (no opacity fade)
      if (pageRightRef.current) {
        const pw = 14 * (1 - Math.min(ease * 1.8, 1));
        pageRightRef.current.style.width = `${pw}px`;
        pageRightRef.current.style.right = `${-pw}px`;
      }

      // Shadow — applied directly on assembly to avoid misaligned separate element
      const shadowAlpha = Math.max(0, 0.8 * (1 - ease * 1.4));
      if (shadowAlpha > 0) {
        assembly.style.boxShadow = `0 35px 70px rgba(0,0,0,${(0.25 * shadowAlpha).toFixed(3)}), 0 12px 24px rgba(0,0,0,${(0.18 * shadowAlpha).toFixed(3)}), 0 4px 8px rgba(0,0,0,${(0.1 * shadowAlpha).toFixed(3)})`;
      } else {
        assembly.style.boxShadow = 'none';
      }

      // "scroll" hint — visible initially, fades fast
      if (openHintRef.current) {
        openHintRef.current.style.opacity = String(Math.max(0, 1 - p * 5));
      }

      // Down-arrow — appears when book nearly fills screen
      if (hintRef.current) {
        hintRef.current.style.opacity = String(
          p > 0.85 ? Math.min(1, (p - 0.85) / 0.15) : 0
        );
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [sectionRef]);

  return {
    assemblyRef,
    spineRef,
    pageRightRef,
    hintRef,
    openHintRef,
  };
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
  const { progressRef } = useScrollProgress();
  const [sectionRef, sectionVisible] = useReveal(0.05);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const bookSectionRef = useRef(null);
  const navAnchorRef = useRef(null);

  const {
    assemblyRef,
    spineRef,
    pageRightRef,
    hintRef,
    openHintRef,
  } = useBookAnimation(bookSectionRef);

  // Move navbar into page flow (between book hero and gallery)
  useEffect(() => {
    const header = document.querySelector("header");
    const nav = header?.parentElement;
    const spacer = nav?.nextElementSibling;
    const anchor = navAnchorRef.current;
    if (!nav || !anchor) return;

    const origParent = nav.parentElement;
    const origNext = nav.nextElementSibling;

    anchor.appendChild(nav);
    nav.style.position = "sticky";
    nav.style.top = "0";
    nav.style.left = "";
    nav.style.right = "";
    nav.style.zIndex = "1050";

    if (spacer && spacer.style.height === "80px") {
      spacer.style.display = "none";
    }

    return () => {
      if (origNext) {
        origParent.insertBefore(nav, origNext);
      } else {
        origParent.appendChild(nav);
      }
      nav.style.position = "";
      nav.style.top = "";
      nav.style.left = "";
      nav.style.right = "";
      nav.style.zIndex = "";
      if (spacer) spacer.style.display = "";
    };
  }, []);

  const titleLetters = "photography".split("");

  return (
    <Layout title="Photography" hideBackLay>
      <PhotographyGlobalStyle />
      <PageOverride>
        <ScrollProgress ref={progressRef} />

        {/* ── Book Hero ── */}
        <BookSection ref={bookSectionRef}>
          <BookStage>
            <BookAssembly ref={assemblyRef}>
              {/* Spine — left edge */}
              <BookSpineEl ref={spineRef} />
              {/* Page edges — right */}
              <BookPageRight ref={pageRightRef} />
              {/* Cover face */}
              <BookCoverFace $bg={heroImage}>
                <CoverOverlay />
                <CoverContent>
                  <CoverTitle>
                    {titleLetters.map((letter, i) => (
                      <CoverLetter key={i} index={i}>
                        {letter}
                      </CoverLetter>
                    ))}
                  </CoverTitle>
                  <CoverAuthor>Deval Parikh</CoverAuthor>
                </CoverContent>
              </BookCoverFace>
            </BookAssembly>
            <BookOpenHint ref={openHintRef}>scroll</BookOpenHint>
            <BookScrollHint ref={hintRef}>&#8595;</BookScrollHint>
          </BookStage>
        </BookSection>

        {/* ── Navbar anchor ── */}
        <NavAnchor ref={navAnchorRef} />

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

const floatUp = keyframes`
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50%      { transform: translateX(-50%) translateY(-6px); }
`;

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Styled Components                                                       */
/* ══════════════════════════════════════════════════════════════════════════ */

const PageOverride = styled.div`
  background: ${warm.cream};
  min-height: 100vh;
  color: ${warm.dark};
  position: relative;

  * {
    color: ${warm.dark};
  }
`;

const NavAnchor = styled.div`
  position: sticky;
  top: 0;
  z-index: 1050;
  background: ${warm.cream};
`;

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

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Book Hero                                                               */
/* ══════════════════════════════════════════════════════════════════════════ */

const BookSection = styled.section`
  position: relative;
  height: 250vh;
  background: #E8E0D4;
`;

const BookStage = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(210, 195, 170, 0.4) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 80%, rgba(195, 180, 160, 0.3) 0%, transparent 50%),
    #E8E0D4;
  overflow: hidden;
  z-index: 100;

  /* Paper fiber texture */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 0.32;
    mix-blend-mode: multiply;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' seed='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)'/%3E%3C/svg%3E");
    background-size: 256px 256px;
  }

  /* Subtle paper speckle */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 0.08;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='speck'%3E%3CfeTurbulence type='turbulence' baseFrequency='2.5' numOctaves='2' seed='8' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23speck)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
  }

  & > * {
    position: relative;
    z-index: 1;
  }
`;

/* The whole book assembly — width/height/transform set by JS */
const BookAssembly = styled.div`
  position: relative;
  /* Fallback before JS sets dimensions */
  width: min(55vw, 400px);
  aspect-ratio: 0.69;
  will-change: width, height, transform;
  transform-origin: center center;
  transform: perspective(1200px) rotateY(-15deg) rotateX(4deg);
`;

/* ── Book spine (left edge) ── */
const BookSpineEl = styled.div`
  position: absolute;
  left: -20px;
  top: -2px;
  bottom: -2px;
  width: 22px;
  z-index: 3;
  pointer-events: none;
  border-radius: 3px 0 0 3px;
  background: linear-gradient(
    to right,
    #1a1510 0%,
    #2e261e 20%,
    #3a3028 45%,
    #2a2219 65%,
    #1e1914 100%
  );
  /* Subtle highlight stripe for spine curvature */
  &::after {
    content: "";
    position: absolute;
    left: 30%;
    top: 0;
    bottom: 0;
    width: 25%;
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.06),
      transparent
    );
  }
`;

/* ── Page edges (right side) ── */
const BookPageRight = styled.div`
  position: absolute;
  right: -14px;
  top: 3px;
  bottom: 3px;
  width: 14px;
  z-index: 1;
  pointer-events: none;
  border-radius: 0 2px 2px 0;
  background:
    linear-gradient(to right, rgba(0, 0, 0, 0.06), transparent 40%, transparent),
    repeating-linear-gradient(
      to bottom,
      #f0ebe3 0px,
      #f0ebe3 1.5px,
      #e5dfd6 1.5px,
      #e5dfd6 3px
    );
  border-left: 1px solid rgba(0, 0, 0, 0.08);
`;

/* ── Book cover face ── */
const BookCoverFace = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: var(--cover-radius, 3px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ $bg }) =>
    $bg ? `url("${$bg}") center center / cover no-repeat` : warm.dark};
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
`;

const CoverOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
`;

const CoverContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

/* ── Cover title with debossed effect ── */
const CoverTitle = styled.h1`
  position: relative;
  z-index: 2;
  font-family: "Sora", "Outfit", sans-serif;
  font-weight: 700;
  font-size: var(--title-size, 3rem);
  letter-spacing: var(--title-ls, -0.5px);
  line-height: 0.9;
  text-transform: lowercase;
  text-align: center;
  display: flex;
  perspective: 400px;
  font-kerning: none;

  /* Debossed dark lettering */
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
    font-kerning: none;
    color: transparent;
    -webkit-text-stroke: 0;
    text-shadow:
      0 2px 1px rgba(255, 255, 255, 0.35),
      0 -1px 1px rgba(0, 0, 0, 0.25),
      1px 2px 3px rgba(255, 255, 255, 0.18),
      0 0 12px rgba(40, 30, 20, 0.1);
  }

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
    font-kerning: none;
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

const CoverLetter = styled.span`
  display: inline-block;
  opacity: 0;
  animation: ${letterDrop} 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: ${({ index }) => 0.1 + index * 0.05}s;
  color: inherit !important;
  -webkit-text-fill-color: inherit;
  filter: drop-shadow(0 1px 2px rgba(30, 25, 20, 0.18));
  will-change: transform;
`;

const CoverAuthor = styled.span`
  position: relative;
  z-index: 2;
  font-family: "Sora", "Outfit", sans-serif;
  font-weight: 700;
  font-size: var(--author-size, 0.5rem);
  letter-spacing: var(--author-ls, 2px);
  text-transform: uppercase;
  margin-top: var(--title-gap, 12px);
  opacity: 0;
  animation: ${fadeIn} 1s 0.8s ease both;
  font-kerning: none;

  color: transparent !important;
  background: linear-gradient(
    170deg,
    #4a403a 0%,
    #5c514a 25%,
    #3e3530 50%,
    #544a44 75%,
    #463d38 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 1px 2px rgba(30, 25, 20, 0.18));

  &::before {
    content: "Deval Parikh";
    position: absolute;
    inset: 0;
    z-index: -1;
    font-family: inherit;
    font-weight: inherit;
    font-size: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    display: flex;
    justify-content: center;
    font-kerning: none;
    color: transparent;
    -webkit-text-stroke: 0;
    text-shadow:
      0 2px 1px rgba(255, 255, 255, 0.35),
      0 -1px 1px rgba(0, 0, 0, 0.25),
      1px 2px 3px rgba(255, 255, 255, 0.18),
      0 0 12px rgba(40, 30, 20, 0.1);
  }

  &::after {
    content: "Deval Parikh";
    position: absolute;
    inset: 0;
    z-index: 1;
    font-family: inherit;
    font-weight: inherit;
    font-size: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    display: flex;
    justify-content: center;
    font-kerning: none;
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

/* ── Hints ── */
const BookOpenHint = styled.div`
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  font-family: "Outfit", sans-serif;
  font-weight: 300;
  font-size: 0.7rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: ${warm.mid} !important;
  animation: ${floatUp} 2.5s 1.2s ease-in-out infinite,
    ${fadeIn} 0.8s 1s ease both;
  white-space: nowrap;
`;

const BookScrollHint = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  color: rgba(255, 255, 255, 0.6) !important;
  font-size: 1.5rem;
  opacity: 0;
  pointer-events: none;

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateX(-50%) translateY(0);
    }
    40% {
      transform: translateX(-50%) translateY(-10px);
    }
    60% {
      transform: translateX(-50%) translateY(-5px);
    }
  }
  animation: bounce 2s infinite;
`;

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Gallery                                                                 */
/* ══════════════════════════════════════════════════════════════════════════ */

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
  background: ${warm.sand};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
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

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Lightbox                                                                */
/* ══════════════════════════════════════════════════════════════════════════ */

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
  filter: saturate(0.9) contrast(1.02);
  transform-origin: center center;
  pointer-events: auto;
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

const LightboxMetaBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  flex-wrap: wrap;

  @media (max-width: 640px) {
    gap: 1rem;
    padding: 0.6rem 1rem;
  }
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const MetaLabel = styled.span`
  font-family: "Outfit", sans-serif;
  font-weight: 400;
  font-size: 0.55rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${warm.mid} !important;
`;

const MetaValue = styled.span`
  font-family: "Outfit", sans-serif;
  font-weight: 300;
  font-size: 0.75rem;
  letter-spacing: 1px;
  color: ${warm.sand} !important;
  white-space: nowrap;
`;
