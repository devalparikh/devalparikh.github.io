import styled, { css } from "styled-components";

export const NavWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1050;
  transition: all 0.3s ease-out;
  ${(props) =>
    props.isScrolled
      ? css`
          padding: 0;
        `
      : css`
          padding: 16px 16px 0;
          @media (min-width: 768px) {
            padding: 16px 32px 0;
          }
        `}
`;

export const NavHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 56px;
  width: 100%;
  transition: all 0.3s ease-out;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

  ${(props) =>
    props.darkTheme
      ? css`
          background-color: rgba(2, 10, 19, 0.75);
        `
      : css`
          background-color: rgba(255, 253, 252, 0.75);
        `}

  ${(props) =>
    props.isScrolled
      ? css`
          border-radius: 0;
        `
      : css`
          border-radius: 16px;
        `}

  @media (min-width: 640px) {
    padding: 0 24px;
  }
  @media (min-width: 768px) {
    padding: 0 40px;
  }
`;

export const NavBrand = styled.div`
  flex: 1;
  a {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: var(--cw);
    text-decoration: none;
    padding: 8px 12px;
    border-radius: 8px;
    transition: background-color 0.2s;
    &:hover {
      background-color: var(--button-index);
    }
    @media (min-width: 640px) {
      font-size: 1.35rem;
    }
  }
`;

export const NavLinks = styled.div`
  display: none;
  position: relative;
  align-items: center;
  gap: 2px;

  @media (min-width: 992px) {
    display: flex;
  }
`;

export const NavIndicator = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 8px;
  pointer-events: none;
  transition: left 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    width 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.15s ease;

  ${(props) =>
    props.darkTheme
      ? css`
          background-color: rgba(255, 255, 255, 0.08);
        `
      : css`
          background-color: rgba(0, 0, 0, 0.05);
        `}
`;

export const NavLinkItem = styled.a`
  position: relative;
  z-index: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--nav-link);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  transition: color 0.2s;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: var(--cw);
    text-decoration: none;
  }

  &.is-active {
    color: var(--cw);
    font-weight: 700;
  }
`;

export const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

export const ThemeButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  background: transparent;

  @media (min-width: 992px) {
    display: flex;
  }

  svg {
    width: 18px;
    height: 18px;
    fill: var(--cw);
  }

  &:hover {
    ${(props) =>
      props.darkTheme
        ? css`
            background-color: rgba(255, 255, 255, 0.08);
          `
        : css`
            background-color: rgba(0, 0, 0, 0.05);
          `}
  }
`;

export const MobileToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  color: var(--cw);

  @media (min-width: 992px) {
    display: none;
  }

  svg {
    stroke: var(--cw);
    fill: none;
  }
`;

export const MobileMenu = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  z-index: 1040;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.2s ease-out;

  ${(props) =>
    props.darkTheme
      ? css`
          background-color: rgba(2, 10, 19, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.06);
        `
      : css`
          background-color: rgba(255, 253, 252, 0.95);
          border: 1px solid rgba(0, 0, 0, 0.06);
        `}

  ${(props) =>
    props.isScrolled
      ? css`
          top: 56px;
          margin: 0;
          border-radius: 0;
          border-left: none;
          border-right: none;
        `
      : css`
          top: 80px;
          margin: 0 16px;
          border-radius: 16px;
          @media (min-width: 768px) {
            margin: 0 32px;
          }
        `}

  @media (min-width: 992px) {
    display: none;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const MobileNavLink = styled.a`
  display: block;
  padding: 12px 16px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--nav-link);
  text-decoration: none;
  border-radius: 8px;
  transition: color 0.2s, background-color 0.2s;
  cursor: pointer;

  &:hover {
    color: var(--cw);
    background-color: var(--button-index);
    text-decoration: none;
  }
`;

export const MobileThemeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--nav-link);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
  font-family: "Blorado", sans-serif;

  svg {
    width: 18px;
    height: 18px;
    fill: var(--cw);
  }

  &:hover {
    color: var(--cw);
    background-color: var(--button-index);
  }
`;
