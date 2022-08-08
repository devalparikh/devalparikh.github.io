/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

/* -------------------------- Internal Dependencies ------------------------- */

import Layout, { PageWrapper } from '../components/Layout';
import FooterLink from '../components/Footer';

const Resume = () => {
  const previewData = 'https://devalparikh.me/DevalParikhResume.pdf';

  // const previewData = `${resumeData.substr(
  //   0,
  //   resumeData.lastIndexOf('/') + 1
  // )}view?embed`;

  return (
    <Layout title="Resume">
      <PageWrapper>
        <PageSection>
          <article>
            <h1 className="intro__text">Resume</h1>
            <p>
              <b>
                <a
                  href={`https://devalparikh.me/DevalParikhResume.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Go to Resume Page"
                >
                  open
                </a>
              </b>{' '}
              or{' '}
              <b>
                <a
                  href={`https://devalparikh.me/DevalParikhResume.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Go to Resume Page"
                >
                  download
                </a>
              </b>{' '}
              the resume{' '}
            </p>
          </article>
          <br />
          <iframe
            src={previewData}
            allowFullScreen
            width="740"
            height="780"
            title="Deval Parikh Resumé"
          />
        </PageSection>
        <br />
        <br />
        {/* <FooterLink goto="/contact" className="mt-3 mb-5">
          Are you convinced to contact me now ?
        </FooterLink> */}
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
  p {
    font-size: calc(var(--font-sm) + 0.9px);
    margin-top: 0.6rem;
    line-height: 2;
    font-weight: 400;
    color: var(--article-color) !important;
  }
  iframe {
    width: 100%;
    filter: invert(var(--invert)) grayscale(calc(var(--invert) - 0.15));
    border: none;
    height: 44.5rem;
    @media (min-width: 768px) {
      width: 82.8% !important;
      height: 70.4rem !important;
    }
  }
`;
export default Resume;
