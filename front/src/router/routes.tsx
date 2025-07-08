import { lazy } from 'react';
const Index = lazy(() => import('../pages/Index'));
const MenuManagement = lazy(() => import('../pages/MenuManagement'));

const routes = [
    // dashboard
    {
        path: '/',
        element: <Index />,
        layout: 'default',
    },
    // menu management
    {
        path: '/admin/menus',
        element: <MenuManagement />,
        layout: 'default',
    },

];

export { routes };
