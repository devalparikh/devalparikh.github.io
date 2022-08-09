/* -------------------------------------------------------------------------- */
/*                             External Dependency                            */
/* -------------------------------------------------------------------------- */
import React, { useContext } from "react";

/* -------------------------- Internal Dependencies ------------------------- */
import { Header } from "../Layout/style";
import Link from "../ActiveLink";
import AppContext from "../Utils/context";

/* ---------------------------- Image Dependency ---------------------------- */
import { Logo, Moon, Icon } from "../Icons";
import { IconAndText } from "../Typography/IconAndTitle";

const Navbar = () => {
  const { show, handleopen, setTheme, closeShow, theme } = useContext(
    AppContext
  );
  return (
    <>
      <Header>
        <nav className="navbar navbar-expand-lg bg-light navbar-light">
          <div className="container">
            <Link href="/" as="/">
              <a
                href="#!"
                className="navbar-brand"
                aria-label="Deval Parikh Home"
                tabIndex={show ? "-1" : undefined}
              >
                <p className="logo__text">
                  <b>Deval Parikh's Portfolio</b>
                </p>
              </a>
            </Link>

            <button
              className="navbar-toggler pr-0"
              type="button"
              onClick={handleopen}
              tabIndex={show ? "-1" : undefined}
              aria-label="Open Button Toggle"
            >
              <span className="navbar-toggler-icon" />
            </button>

            <div
              className={`collapse navbar-collapse  ${show && "show"}`}
              id="collapsibleNavbar"
            >
              <button
                className="d-block d-md-none close-nav"
                onClick={handleopen}
              >
                <Icon />
              </button>

              <ul className="navbar-nav ml-auto">
                <li className="nav-item hover__bottom">
                  <Link href="/" as="/" activeClassName="is-active">
                    <a
                      className="nav-link"
                      id="cardHover"
                      onClick={closeShow}
                      href="#!"
                      aria-label="Go To Home Page"
                      title="Home"
                    >
                      Home
                    </a>
                  </Link>
                </li>
                <li className="nav-item hover__bottom">
                  <Link href="/about" as="/about" activeClassName="is-active">
                    <a
                      className="nav-link"
                      id="cardHover"
                      onClick={closeShow}
                      href="#!"
                      aria-label="Go To About Page"
                      title="About"
                    >
                      About
                    </a>
                  </Link>
                </li>
                <li className="nav-item hover__bottom">
                  <Link
                    href="/projects"
                    as="/projects"
                    activeClassName="is-active"
                  >
                    <a
                      className="nav-link"
                      id="cardHover"
                      onClick={closeShow}
                      href="#!"
                      aria-label="Go To Projects Page"
                      title="Projects"
                    >
                      Projects
                    </a>
                  </Link>
                </li>
                <li className="nav-item hover__bottom">
                  <Link href="/resume" as="/resume" activeClassName="is-active">
                    <a
                      className="nav-link"
                      id="cardHover"
                      onClick={closeShow}
                      href="#!"
                      aria-label="Go To Resume Page"
                      title="Resume"
                    >
                      Resume
                    </a>
                  </Link>
                </li>
                {/* <li className="nav-item hover__bottom">
                  <Link href="/contact" activeClassName="is-active">
                    <a
                      className="nav-link"
                      id="cardHover"
                      onClick={closeShow}
                      href="#!"
                      aria-label="Go To Contacts Page"
                      title="Contact"
                    >
                      Contact
                    </a>
                  </Link>
                </li> */}
                <li className="nav-item">
                  <Link href="#0" as="#0">
                    <IconAndText>
                      <a
                        className="nav-link"
                        aria-label={`Turn On ${
                          theme === false ? "Light" : "Dark"
                        } Mood`}
                        onClick={setTheme}
                        href="#!"
                      >
                        <Moon /> {theme === false ? "Dark" : "Light"} Mode
                      </a>
                    </IconAndText>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </Header>
    </>
  );
};

export default Navbar;
