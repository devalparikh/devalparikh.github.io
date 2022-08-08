/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */

import React, { useContext } from "react";
import styled from "styled-components";

/* -------------------------- Internal Dependencies ------------------------- */

import Layout, { PageWrapper } from "../components/Layout";
import FooterLink from "../components/Footer";
import Tabs, { TabItems } from "../components/Tabs";
import MansoryLayout from "../components/Mansory";
import MansoryItem from "../components/Mansory/mansory-item";
import { ProjectsContext } from "../components/Utils/context";

const Projects = () => {
  const projectsData = useContext(ProjectsContext);
  return (
    <Layout title="Project">
      <PageSection>
        <PageWrapper>
          <h1 className="intro__text">Projects</h1> <br />
          <Tabs>
            <TabItems label="All">
              <MansoryLayout>
                {projectsData.map((item, index) => (
                  <MansoryItem key={index} index={index} item={item} />
                ))}
              </MansoryLayout>
            </TabItems>
            <TabItems label="Projects">
              <MansoryLayout>
                {projectsData.map(
                  (item, index) =>
                    item.type.includes("project") && (
                      <MansoryItem key={index} index={index} item={item} />
                    )
                )}
              </MansoryLayout>
            </TabItems>
            <TabItems label="Full Stack">
              <MansoryLayout>
                {projectsData.map(
                  (item, index) =>
                    item.type.includes("fullstack") && (
                      <MansoryItem key={index} index={index} item={item} />
                    )
                )}
              </MansoryLayout>
            </TabItems>
            <TabItems label="Machine Learning">
              <MansoryLayout>
                {projectsData.map(
                  (item, index) =>
                    item.type.includes("ml") && (
                      <MansoryItem key={index} index={index} item={item} />
                    )
                )}
              </MansoryLayout>
            </TabItems>
            <TabItems
              label="Photography"
              href="https://unsplash.com/@devalpp/"
            />
          </Tabs>
        </PageWrapper>
      </PageSection>

      <PageWrapper>
        <FooterLink goto="/resume" className="mt-3 mb-5">
          Let's Go To My Resume.
        </FooterLink>
        <br />
      </PageWrapper>
    </Layout>
  );
};
export const PageSection = styled.div`
  .intro__text {
    font-size: var(--font-x-lg);
    font-weight: 900;
    margin: 4rem 0rem 1.5rem;
    position: relative;
  }
  button {
    font-size: calc(var(--font-sm) + 1.5px);
    background: var(--mark);
    border: none;
    border-radius: 5px;
    padding: 0px 9px;
  }
`;

export default Projects;
