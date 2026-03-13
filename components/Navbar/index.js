import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
import Link from "../ActiveLink";
import AppContext from "../Utils/context";
import { Moon } from "../Icons";
import {
  NavWrapper,
  NavHeader,
  NavBrand,
  NavLinks,
  NavLinkItem,
  NavIndicator,
  NavActions,
  ThemeButton,
  MobileToggle,
  MobileMenu,
  MobileNavLink,
  MobileThemeButton,
} from "./style";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/resume", label: "Resume" },
];

const EXTERNAL_LINKS = [
  {
    href: "https://unsplash.com/@devalpp/",
    label: "Photography",
    external: true,
  },
];

const Navbar = () => {
  const { show, handleopen, setTheme, closeShow, theme } =
    useContext(AppContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const navContainerRef = useRef(null);
  const linkRefs = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const updateIndicator = useCallback((index) => {
    const element = linkRefs.current[index];
    const container = navContainerRef.current;
    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      setIndicatorStyle({
        left: elementRect.left - containerRect.left,
        width: elementRect.width,
        opacity: 1,
      });
    }
  }, []);

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
    updateIndicator(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  const allLinks = [...NAV_ITEMS, ...EXTERNAL_LINKS];

  return (
    <>
      <NavWrapper isScrolled={isScrolled}>
        <NavHeader isScrolled={isScrolled} darkTheme={theme}>
          <NavBrand>
            <Link href="/" as="/">
              <a
                href="#!"
                aria-label="Deval Parikh Home"
                tabIndex={show ? "-1" : undefined}
                onClick={closeShow}
              >
                <b>Deval Parikh</b>
              </a>
            </Link>
          </NavBrand>

          <NavLinks
            ref={navContainerRef}
            onMouseLeave={handleMouseLeave}
          >
            <NavIndicator
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
              }}
              darkTheme={theme}
            />
            {NAV_ITEMS.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                as={item.href}
                activeClassName="is-active"
              >
                <NavLinkItem
                  ref={(el) => (linkRefs.current[index] = el)}
                  href="#!"
                  onMouseEnter={() => handleMouseEnter(index)}
                  onClick={closeShow}
                  aria-label={`Go To ${item.label} Page`}
                >
                  {item.label}
                </NavLinkItem>
              </Link>
            ))}
            {EXTERNAL_LINKS.map((item, index) => (
              <NavLinkItem
                key={item.href}
                ref={(el) =>
                  (linkRefs.current[NAV_ITEMS.length + index] = el)
                }
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() =>
                  handleMouseEnter(NAV_ITEMS.length + index)
                }
                aria-label={`Go To ${item.label} Page`}
              >
                {item.label}
              </NavLinkItem>
            ))}
          </NavLinks>

          <NavActions>
            <ThemeButton
              onClick={setTheme}
              aria-label={`Turn On ${!theme ? "Dark" : "Light"} Mode`}
              darkTheme={theme}
            >
              <Moon />
            </ThemeButton>

            <MobileToggle
              onClick={handleopen}
              aria-label="Toggle menu"
              tabIndex={show ? "-1" : undefined}
            >
              {show ? (
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </MobileToggle>
          </NavActions>
        </NavHeader>
      </NavWrapper>

      {/* Spacer */}
      <div style={{ height: "80px" }} />

      {show && (
        <MobileMenu darkTheme={theme} isScrolled={isScrolled}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} as={item.href}>
              <MobileNavLink href="#!" onClick={closeShow}>
                {item.label}
              </MobileNavLink>
            </Link>
          ))}
          {EXTERNAL_LINKS.map((item) => (
            <MobileNavLink
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeShow}
            >
              {item.label}
            </MobileNavLink>
          ))}
          <MobileThemeButton onClick={setTheme} darkTheme={theme}>
            <Moon /> {!theme ? "Dark" : "Light"} Mode
          </MobileThemeButton>
        </MobileMenu>
      )}
    </>
  );
};

export default Navbar;
