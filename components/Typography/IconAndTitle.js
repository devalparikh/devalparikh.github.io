import styled, { css } from "styled-components";

const verticallyCenter = css`
  display: flex;
  align-items: center;
`;

export const IconAndText = styled.div`
  ${verticallyCenter}
  justify-content: center;
`;

export const IconAndTitle = styled.h4`
  ${verticallyCenter}
`;
