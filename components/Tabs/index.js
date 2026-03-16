/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import React, { useState, useRef, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';

/* -------------------------- Internal Dependecies -------------------------- */
import styled, { css } from 'styled-components';
import Tab from './Tab';
import AppContext from '../Utils/context';

/* ------------------------------ Tab PropTypes ----------------------------- */
const propTypes = {
  children: PropTypes.instanceOf(Array).isRequired,
};

const Tabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState(children[0].props.label);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const containerRef = useRef(null);
  const tabRefs = useRef([]);
  const { theme } = useContext(AppContext);

  const onClickTabItem = (tab) => {
    setActiveTab(tab);
  };

  const updateIndicator = useCallback((index) => {
    const element = tabRefs.current[index];
    const container = containerRef.current;
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

  const handleMouseLeave = () => {
    setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <>
      <Wrapper
        className="d-md-flex d-block tabs"
        role="tablist"
        ref={containerRef}
        onMouseLeave={handleMouseLeave}
      >
        <Indicator
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            opacity: indicatorStyle.opacity,
          }}
          darkTheme={theme}
        />
        {children.map((child, index) => {
          const { label, href } = child.props;

          return (
            <Tab
              ref={(el) => (tabRefs.current[index] = el)}
              activeTab={activeTab}
              key={label}
              label={label}
              href={href}
              aria-current={activeTab}
              onClick={onClickTabItem}
              onMouseEnter={() => updateIndicator(index)}
            />
          );
        })}
      </Wrapper>
      <div className="tab-content">
        {children.map((child) => {
          if (child.props.label !== activeTab) return false;
          return child.props.children;
        })}
      </div>
    </>
  );
};

const Wrapper = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 43px;
  gap: 2px;

  @media (max-width: 989px) {
    white-space: nowrap;
    overflow-x: auto;
    margin: 0 auto;
  }

  .tab-list-item {
    position: relative;
    z-index: 1;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--nav-link);
    background: transparent;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    cursor: pointer;
    transition: color 0.2s;
    white-space: nowrap;
    text-decoration: none;

    &:hover {
      color: var(--cw);
      text-decoration: none;
    }

    &.tab-list-active {
      color: var(--cw);
      font-weight: 700;
    }
  }
`;

const Indicator = styled.div`
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

export const TabItems = styled.div`
  display: block;
`;
Tabs.propTypes = propTypes;

export default Tabs;
