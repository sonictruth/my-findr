import { Outlet } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

export default function Layout() {
  return (
    <DashboardLayout sx={{height:'100% !important'}} defaultSidebarCollapsed={true}>
      <Outlet />
    </DashboardLayout>
  );
}