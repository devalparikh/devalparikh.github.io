/* eslint-disable jsx-a11y/accessible-emoji */

/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import React from 'react';
import styled from 'styled-components';

/* -------------------------- Internal Dependencies ------------------------- */
import Layout, { PageWrapper } from '../components/Layout';
import FooterLink from '../components/Footer';

/* ---------------------------- Image Dependency ---------------------------- */
import { Date } from '../components/Icons';

const About = () => {
  return (
    <Layout title="About Me">
      <PageSection>
        <PageWrapper
          className="mb-5"
          aria-label="You are now in my musical playlist section"
        >
          <article>
            <h4 className="intro__text">My Experience</h4>
            <ul className="timeline">
              <li>
                <div>
                  <div>
                    <div className="experience__section">
                      <p className="company__text">Capital One</p>
                      <p className="float-right" tabIndex="-1">
                        <Date /> <b>2021-2022</b>
                      </p>
                    </div>
                    <p className="position__text">Software Engineer II</p>
                  </div>

                  <p>
                    Building identity APIs and OAuth microservices. <br />
                    <b>Tech:</b> Java Spring, OAuth/OIDC, AWS,
                    Architecture/System Design
                  </p>
                </div>
              </li>
              <li>
                <div>
                  <div>
                    <div className="experience__section">
                      <p className="company__text">Capital One</p>
                      <p className="float-right" tabIndex="-1">
                        <Date /> <b>2021 - 2022</b>
                      </p>
                    </div>
                    <p className="position__text">Software Engineer I</p>
                  </div>

                  <p>
                    Developed features for the customer-facing credit card
                    application platform.
                    <br />
                    <b>Tech:</b> React, Redux, JavaScript, Node.js, AWS
                  </p>
                </div>
              </li>
              <li>
                <div>
                  <div>
                    <div className="experience__section">
                      <p className="company__text">Capital One</p>
                      <p className="float-right" tabIndex="-1">
                        <Date /> <b>2020</b>
                      </p>
                    </div>
                    <p className="position__text">
                      Software Engineering Intern
                    </p>
                  </div>

                  <p>
                    Full stack and distributed systems development on the
                    Consumer Identity Team. Developed and designed an end to
                    end, multi-tier, full stack application that automates
                    onboarding clients to the multi-factor authorization
                    security pipeline used by capitalone.com web and mobile,
                    improving the process duration by 1,500%. <br />
                    <b>Tech:</b> Python, REST APIs, TypeScript, JavaScript,
                    Angular, Groovy, Jenkins, Amazon Web Services, and Git
                  </p>
                </div>
              </li>
              <li>
                <div>
                  <div className="experience__section">
                    <p className="company__text">
                      Reinventing Geospatial, Inc (RGi)
                    </p>
                    <p className="float-right" tabIndex="-1">
                      <Date /> <b>2019</b>
                    </p>
                  </div>
                  <p className="position__text">Software Engineering Intern</p>
                </div>

                <p>
                  Full stack development on the Geospatial Performance Enhancing
                  Proxy team. Improved and developed API services for map data
                  caching and front end features for map components, logs, and
                  dashboards. <br />
                  <b>Tech:</b> JavaScript, React, Redux, Python, Django, REST
                  APIs, SQL, and Git.
                </p>
              </li>
            </ul>
          </article>
        </PageWrapper>
      </PageSection>

      <PageWrapper>
        <FooterLink goto="/projects" className="mt-3 mb-5">
          Lets Continue To Projects
        </FooterLink>
        <br />
      </PageWrapper>
    </Layout>
  );
};

const PageSection = styled.div`
  .intro__text {
    font-size: var(--font-x-lg);
    font-weight: 900;
    margin: 4rem 0rem 1.5rem;
    position: relative;
  }

  .experience__section {
    display: flex;
    justify-content: space-between;
  }

  .company__text {
    font-weight: 600;
  }

  .position__text {
    font-weight: 300;
  }

  h4 {
    font-size: calc(var(--font-md) + 1.5px);
  }

  p {
    font-size: calc(var(--font-sm) + 0.9px);
    font-weight: 400;
    color: var(--article-color) !important;
    &.float-right {
      font-size: calc(var(--font-sm) + 0.9px);
    }
  }
  p svg {
    margin-top: -0.4rem;
    width: 13px;
  }

  ul.timeline {
    list-style-type: none;
    position: relative;
    &:before {
      content: ' ';
      background: var(--timeline);
      display: inline-block;
      position: absolute;
      left: 0px;
      width: 1px;
      top: 4px;
      height: 100%;
      z-index: 400;
    }
    li {
      margin: 3rem 0;
      padding-left: 20px;
      &:before {
        content: ' ';
        background: var(--mark);
        display: inline-block;
        position: absolute;
        border-radius: 50%;
        border: 2px solid var(--cw);
        left: -7px;
        width: 15px;
        height: 15px;
        margin-top: 3px;
        z-index: 400;
      }
    }
  }
  @media (max-width: 585px) {
    ul.timeline li p {
      display: block;
      float: none !important;
      margin-top: 5px;
    }
  }
  @media (max-width: 989px) {
    ul.timeline li p {
      display: block;
      float: none !important;
      margin-top: 5px;
    }
  }
  @media (max-width: 220px) {
    ul.timeline li p {
      display: block;
      float: none !important;
      margin-top: 5px;
    }
  }
`;

export default About;
