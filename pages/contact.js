/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */

import React from 'react';
import styled from 'styled-components';

/* -------------------------- Internal Dependencies ------------------------- */

import Layout, { PageWrapper } from '../components/Layout';
import FooterLink from '../components/Footer';

const Contact = () => {
  return (
    <Layout title="Contact">
      <PageSection>
        <PageWrapper>
          <h1 className="intro__text">Contact.</h1>
          <article>
            <p>
              Want to get in touch? Reach out through any of the links below.
            </p>
          </article>
          <br />
          <ContactLinks>
            <a href="mailto:devalpp@gmail.com">
              <span className="link-label">Email</span>
              <span className="link-value">devalpp@gmail.com</span>
            </a>
            <a href="tel:+17327725327">
              <span className="link-label">Phone</span>
              <span className="link-value">(732) 772-5327</span>
            </a>
            <a
              href="https://www.linkedin.com/in/devalparikh1/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="link-label">LinkedIn</span>
              <span className="link-value">linkedin.com/in/devalparikh1</span>
            </a>
            <a
              href="https://github.com/devalparikh"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="link-label">GitHub</span>
              <span className="link-value">github.com/devalparikh</span>
            </a>
          </ContactLinks>
        </PageWrapper>
      </PageSection>

      <PageWrapper>
        <FooterLink goto="/" className="mt-3 mb-5">
          Go Back Home
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
  p {
    font-size: calc(var(--font-sm) + 0.9px);
    margin-top: 0.6rem;
    line-height: 2;
    font-weight: 400;
    color: var(--article-color) !important;
  }
`;

const ContactLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
  width: 60%;

  a {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.2rem 1.5rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    text-decoration: none;
    color: var(--cw);
    transition: all 0.2s ease;

    &:hover {
      background: var(--border-color);
    }
  }

  .link-label {
    font-size: calc(var(--font-sm) + 1px);
    font-weight: 600;
  }

  .link-value {
    font-size: calc(var(--font-sm) + 0.5px);
    color: var(--article-color);
  }

  @media (max-width: 989px) {
    width: 100%;
  }

  @media (max-width: 585px) {
    width: 100%;

    a {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.3rem;
    }
  }
`;

export default Contact;
