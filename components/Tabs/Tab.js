/* -------------------------------------------------------------------------- */
/*                            External Dependecies                            */
/* -------------------------------------------------------------------------- */
import React from 'react';
import PropTypes from 'prop-types';

/* ------------------------------ Tab PropTypes ----------------------------- */
const propTypes = {
  activeTab: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  onMouseEnter: PropTypes.func,
  href: PropTypes.string,
};

const Tab = React.forwardRef(
  ({ activeTab, label, onClick, onMouseEnter, href, ...rest }, ref) => {
    const className = `tab-list-item ${
      activeTab === label ? 'tab-list-active' : ''
    }`;

    if (href) {
      return (
        <a
          ref={ref}
          className={className}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${label}`}
          onMouseEnter={onMouseEnter}
          {...rest}
        >
          {label}
        </a>
      );
    }
    return (
      <button
        ref={ref}
        className={className}
        type="button"
        onClick={() => onClick(label)}
        aria-label={`Open ${label}`}
        onMouseEnter={onMouseEnter}
        {...rest}
      >
        {label}
      </button>
    );
  }
);

Tab.displayName = 'Tab';
Tab.propTypes = propTypes;
export default Tab;
