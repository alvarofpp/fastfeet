import styled from 'styled-components';
import { darken } from 'polished';

export const Container = styled.div`
  position: relative;

  button {
    border: 0;
    background: none;

    svg {
      color: #c6c6c6;
      transition: color 200ms;
    }

    &:hover {
      svg {
        color: ${darken(0.3, '#C6C6C6')};
      }
    }
  }
`;

export const ActionList = styled.div`
  position: absolute;
  width: 150px;
  left: calc(50% - 75px);
  top: calc(100% + 5px);
  background: #fff;
  border-radius: 4px;
  padding: 15px 5px;
  box-shadow: 0px 0px 2px #00000026;
  display: ${(props) => (props.visible ? 'block' : 'none')};
  padding: 20px 10px;

  &::before {
    content: '▲';
    position: absolute;
    left: calc(50% - 5px);
    top: -10px;
    width: 10px;
    height: 10px;
    font-size: 10px;
    text-shadow: 0px -1px 3px #00000057;
    color: #fff;
  }

  a,
  a:visited {
    color: #999999;
  }

  a {
    display: flex;
    flex-direction: row;
    font-size: 16px;
    align-items: center;
    padding: 6px 0;
    text-decoration: none;

    svg {
      margin-right: 8px;
    }

    &:hover {
      text-decoration: underline;
    }

    & + a {
      border-top: 1px solid #e6e6e6;
    }
  }
`;
