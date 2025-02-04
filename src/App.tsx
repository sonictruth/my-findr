import SettingsIcon from '@mui/icons-material/Settings';
import MapIcon from '@mui/icons-material/Map';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { Outlet } from 'react-router';
import {
  type Navigation,
  type Branding,
} from '@toolpad/core/AppProvider';


const BRANDING: Branding = {
  logo: <img width={40} src='./favicon.png' alt='Logo' />,
  title: 'myFindr',
};

const NAVIGATION: Navigation = [
  {
    segment: 'map',
    title: 'Map',
    icon: <MapIcon />,
  },
  {
    segment: 'settings',
    title: 'Settings',
    icon: <SettingsIcon />,
  },
];

export default function App() {
  return (
    <ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING}>
      <Outlet />
    </ReactRouterAppProvider>
  );
}
