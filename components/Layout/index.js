/* -------------------------------------------------------------------------- */
/*                            External Dependecies                            */
/* -------------------------------------------------------------------------- */
import React, { useContext, useEffect } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { ScoutBar } from "scoutbar";

/* -------------------------- Internal Dependencies ------------------------- */
import Navbar from "../Navbar";
import AppContext from "../Utils/context";
import { initGA, logPageView } from "../Utils/analytics";
import Cursor from "../Cursor";
import SkipToMain from "../A11y/skip-to-main";

/* ---------------------------- Style Dependency ---------------------------- */
import { BackLay, BodyStyling, Main } from "./style";
import { actions } from "./data";

/* ---------------------------- Layout PropTypes ---------------------------- */
const propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.element]),
  title: PropTypes.string,
};

const Layout = ({ children, title = "Home" }) => {
  const { theme, loadTheme, show, setTheme } = useContext(AppContext);

  const logPage = () => {
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
    logPageView();
  };

  useEffect(() => {
    logPage();
    loadTheme();
  }, [loadTheme, logPage]);

  return (
    <Main>
      <BodyStyling theme={theme} />
      <Helmet>
        <title>{`${title} | Deval Parikh`}</title>
        <meta
          name="msapplication-TileColor"
          content={`${theme ? "#000000" : "#FFFFFF"}`}
        />
        <meta name="theme-color" content={`${theme ? "#000000" : "#FFFFFF"}`} />
      </Helmet>
      <SkipToMain content="main-content" />
      <Navbar />
      <BackLay title={title}>
        <h1 aria-hidden="true">
          {title === "Home" ? "Hello, There." : title.concat(".")}
        </h1>
      </BackLay>
      {/* <Cursor /> */}
      <ScoutBar actions={actions(setTheme)} brandColor="var(--cw)" />
      {!show && <>{children}</>}
    </Main>
  );
};

Layout.propTypes = propTypes;

export const PageWrapper = ({ children, className = "", ...rest }) => {
  return (
    <section {...rest} id="main-content" tabIndex="-1">
      <div className={`container  ${className}`}>
        <div className="row align-items-center justify-content-center">
          <div className="col-md-10">{children}</div>
        </div>
      </div>
    </section>
  );
};

PageWrapper.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.element]),
  className: PropTypes.string,
};

export default Layout;
