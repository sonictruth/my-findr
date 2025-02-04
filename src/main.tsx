import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import theme from './theme.ts';
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom';

import Layout from './Layout.tsx';
import App from './App.tsx';
import Settings from './Settings.tsx';
import Map from './Map.tsx';
import './main.css';

import { SnackbarProvider } from 'notistack';

const router = createHashRouter([
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          {
            index: true,
            element: <Navigate to='/map' replace />,
          },
          {
            index: true,
            path: '/map',
            Component: Map,
          },
          {
            path: '/settings/:savedSettings?',
            Component: Settings,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        autoHideDuration={800}
        transitionDuration={{ enter: 200, exit: 50 }}
      >
        <RouterProvider router={router} />
      </SnackbarProvider>
    </ThemeProvider>
  </StrictMode>
);
