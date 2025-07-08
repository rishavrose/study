import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toggleSidebar } from '../../store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '../../store';
import IconCaretsDown from '../Icon/IconCaretsDown';
import IconCaretDown from '../Icon/IconCaretDown';
import IconMinus from '../Icon/IconMinus';
import useMenu from '../../hooks/useMenu';
import { convertMenuItemsToFrontendFormat, getFallbackMenu, FrontendMenuItem } from '../../utils/menuConverter';

const Sidebar = () => {
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const location = useLocation();
    const dispatch = useDispatch();
    const { t } = useTranslation();

    // Use dynamic menu hook
    const { menus: apiMenus, loading: menuLoading, error: menuError } = useMenu();

    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    // Get menu items - use API data if available, fallback to static menu
    const menuItems: FrontendMenuItem[] = React.useMemo(() => {
        if (!menuLoading && !menuError && apiMenus.length > 0) {
            return convertMenuItemsToFrontendFormat(apiMenus, t);
        }
        return getFallbackMenu(t);
    }, [apiMenus, menuLoading, menuError, t]);

    // Recursive menu renderer
    const renderMenu = (items: FrontendMenuItem[], parentKey = '') =>
        items.map((item, idx) => {
            if (item.type === 'section') {
                return (
                    <h2 key={item.label} className="py-3 px-7 flex items-center uppercase font-extrabold bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] -mx-4 mb-1">
                        <IconMinus className="w-4 h-5 flex-none hidden" />
                        <span>{item.label}</span>
                    </h2>
                );
            }
            if (item.children) {
                // For grouped children (like apps)
                return (
                    <li className="nav-item" key={item.key || idx}>
                        <ul>
                            {renderMenu(item.children, item.key)}
                        </ul>
                    </li>
                );
            }
            if (item.subMenu) {
                // For menu with subMenu
                const isOpen = currentMenu === item.key;
                return (
                    <li className="menu nav-item" key={item.key}>
                        <button
                            type="button"
                            className={`${isOpen ? 'active' : ''} nav-link group w-full`}
                            onClick={() => toggleMenu(item.key!)}
                        >
                            <div className="flex items-center">
                                {item.icon}
                                <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{item.label}</span>
                            </div>
                            <div className={!isOpen ? 'rtl:rotate-90 -rotate-90' : ''}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <AnimateHeight duration={300} height={isOpen ? 'auto' : 0}>
                            <ul className="sub-menu text-gray-500">
                                {item.subMenu.map((sub: any, subIdx: number) => {
                                    if (sub.isError) {
                                        // Special error submenu
                                        return (
                                            <li className="menu nav-item" key={sub.key}>
                                                <button
                                                    type="button"
                                                    className={`${errorSubMenu ? 'open' : ''} w-full before:bg-gray-300 before:w-[5px] before:h-[5px] before:rounded ltr:before:mr-2 rtl:before:ml-2 dark:text-[#888ea8] hover:bg-gray-100 dark:hover:bg-gray-900`}
                                                    onClick={() => setErrorSubMenu(!errorSubMenu)}
                                                >
                                                    {sub.label}
                                                    <div className={`${errorSubMenu ? 'rtl:rotate-90 -rotate-90' : ''} ltr:ml-auto rtl:mr-auto`}>
                                                        <IconCaretsDown fill={true} className="w-4 h-4" />
                                                    </div>
                                                </button>
                                                <AnimateHeight duration={300} height={errorSubMenu ? 'auto' : 0}>
                                                    <ul className="sub-menu text-gray-500">
                                                        {sub.subMenu.map((err: any, errIdx: number) => (
                                                            <li key={errIdx}>
                                                                <a href={err.to} target={err.target || '_self'} rel={err.isExternal ? 'noopener noreferrer' : undefined}>
                                                                    {err.label}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </AnimateHeight>
                                            </li>
                                        );
                                    }
                                    return (
                                        <li key={subIdx}>
                                            {sub.isExternal ? (
                                                <a href={sub.to} target={sub.target || '_self'} rel="noopener noreferrer">
                                                    {sub.label}
                                                </a>
                                            ) : (
                                                <NavLink to={sub.to} target={sub.target}>
                                                    {sub.label}
                                                </NavLink>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </AnimateHeight>
                    </li>
                );
            }
            // Simple link
            return (
                <li className="menu nav-item" key={item.key || item.to || idx}>
                    {item.isExternal ? (
                        <a href={item.to} target={item.target || '_self'} rel="noopener noreferrer" className="nav-link group">
                            <div className="flex items-center">
                                {item.icon}
                                <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{item.label}</span>
                            </div>
                        </a>
                    ) : (
                        <NavLink to={item.to!} target={item.target} className="group">
                            <div className="flex items-center">
                                {item.icon}
                                <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{item.label}</span>
                            </div>
                        </NavLink>
                    )}
                </li>
            );
        });

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed min-h-screen h-full top-0 bottom-0 w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] z-50 transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="bg-white dark:bg-black h-full">
                    <div className="flex justify-between items-center px-4 py-3">
                        <NavLink to="/" className="main-logo flex items-center shrink-0">
                            <img className="w-8 ml-[5px] flex-none" src="/assets/images/logo.svg" alt="logo" />
                            <span className="text-2xl ltr:ml-1.5 rtl:mr-1.5 font-semibold align-middle lg:inline dark:text-white-light">{t('VRISTO')}</span>
                        </NavLink>
                        <button
                            type="button"
                            className="collapse-icon w-8 h-8 rounded-full flex items-center hover:bg-gray-500/10 dark:hover:bg-dark-light/10 dark:text-white-light transition duration-300 rtl:rotate-180"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>
                    <PerfectScrollbar className="h-[calc(100vh-80px)] relative">
                        <ul className="relative font-semibold space-y-0.5 p-4 py-0">
                            {menuLoading ? (
                                <li className="text-center py-4">
                                    <span className="text-gray-500">Loading menu...</span>
                                </li>
                            ) : menuError ? (
                                <li className="text-center py-4">
                                    <span className="text-red-500">Error loading menu</span>
                                    <div className="text-xs text-gray-400 mt-1">Using fallback menu</div>
                                </li>
                            ) : null}
                            {renderMenu(menuItems)}
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
