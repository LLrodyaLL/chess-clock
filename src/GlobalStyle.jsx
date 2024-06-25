import { createGlobalStyle } from 'styled-components';
import { salutejs_sber__dark } from '@salutejs/plasma-tokens/themes';
import {
    text, // Цвет текста
    background, // Цвет подложки
    gradient, // Градиент
} from '@salutejs/plasma-tokens';
import styled from 'styled-components';

const ThemeStyle = createGlobalStyle(salutejs_sber__dark);

const DocStyles = createGlobalStyle`
  html {
    color: ${text};
    background-color: ${background};
    background-image: ${gradient};
    min-height: 100vh;
    font-size: 1em;
    overflow-x: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  body, #root {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 0;
  }
`;

export const TimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

export const TimerDisplay = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
`;

export const TimerButton = styled.button`
  background: ${text};
  color: ${background};
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: ${gradient};
  }
`;

export const GlobalStyle = () => (
    <>
        <DocStyles />
        <ThemeStyle />
    </>
);
