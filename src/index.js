import { DeviceThemeProvider, SSRProvider } from '@salutejs/plasma-ui';
import { GlobalStyle } from './GlobalStyle';
import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(
     <DeviceThemeProvider>
        <SSRProvider>
            <App />
            <GlobalStyle />
        </SSRProvider>
     </DeviceThemeProvider>,
    document.getElementById('root'),
);
