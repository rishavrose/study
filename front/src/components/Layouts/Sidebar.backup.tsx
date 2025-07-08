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
import { convertMenuItemsToFrontendFormat, FrontendMenuItem } from '../../utils/menuConverter';

// Menu Icons
import IconMenuDashboard from '../Icon/Menu/IconMenuDashboard';
import IconMenuChat from '../Icon/Menu/IconMenuChat';
import IconMenuMailbox from '../Icon/Menu/IconMenuMailbox';
import IconMenuTodo from '../Icon/Menu/IconMenuTodo';
import IconMenuNotes from '../Icon/Menu/IconMenuNotes';
import IconMenuScrumboard from '../Icon/Menu/IconMenuScrumboard';
import IconMenuContacts from '../Icon/Menu/IconMenuContacts';
import IconMenuInvoice from '../Icon/Menu/IconMenuInvoice';
import IconMenuCalendar from '../Icon/Menu/IconMenuCalendar';
import IconMenuComponents from '../Icon/Menu/IconMenuComponents';
import IconMenuElements from '../Icon/Menu/IconMenuElements';
import IconMenuCharts from '../Icon/Menu/IconMenuCharts';
import IconMenuWidgets from '../Icon/Menu/IconMenuWidgets';
import IconMenuFontIcons from '../Icon/Menu/IconMenuFontIcons';
import IconMenuDragAndDrop from '../Icon/Menu/IconMenuDragAndDrop';
import IconMenuTables from '../Icon/Menu/IconMenuTables';
import IconMenuDatatables from '../Icon/Menu/IconMenuDatatables';
import IconMenuForms from '../Icon/Menu/IconMenuForms';
import IconMenuUsers from '../Icon/Menu/IconMenuUsers';
import IconMenuPages from '../Icon/Menu/IconMenuPages';
import IconMenuAuthentication from '../Icon/Menu/IconMenuAuthentication';
import IconMenuDocumentation from '../Icon/Menu/IconMenuDocumentation';

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
        return staticMenuItems;
    }, [apiMenus, menuLoading, menuError, t]);

    // Fallback static menu structure (used when dynamic menu is not available)
    const staticMenuItems: FrontendMenuItem[] = [
        {
            key: 'dashboard',
            icon: <IconMenuDashboard className="group-hover:!text-primary shrink-0" />,
            label: t('dashboard'),
            subMenu: [
                { to: '/', label: t('sales') },
                { to: '/analytics', label: t('analytics') },
                { to: '/finance', label: t('finance') },
                { to: '/crypto', label: t('crypto') },
            ],
        },
        {
            type: 'section',
            label: t('apps'),
        },
        {
            key: 'apps',
            label: t('apps'),
            children: [
                {
                    to: '/apps/chat',
                    icon: <IconMenuChat className="group-hover:!text-primary shrink-0" />,
                    label: t('chat'),
                },
                {
                    to: '/apps/mailbox',
                    icon: <IconMenuMailbox className="group-hover:!text-primary shrink-0" />,
                    label: t('mailbox'),
                },
                {
                    to: '/apps/todolist',
                    icon: <IconMenuTodo className="group-hover:!text-primary shrink-0" />,
                    label: t('todo_list'),
                },
                {
                    to: '/apps/notes',
                    icon: <IconMenuNotes className="group-hover:!text-primary shrink-0" />,
                    label: t('notes'),
                },
                {
                    to: '/apps/scrumboard',
                    icon: <IconMenuScrumboard className="group-hover:!text-primary shrink-0" />,
                    label: t('scrumboard'),
                },
                {
                    to: '/apps/contacts',
                    icon: <IconMenuContacts className="group-hover:!text-primary shrink-0" />,
                    label: t('contacts'),
                },
                {
                    key: 'invoice',
                    icon: <IconMenuInvoice className="group-hover:!text-primary shrink-0" />,
                    label: t('invoice'),
                    subMenu: [
                        { to: '/apps/invoice/list', label: t('list') },
                        { to: '/apps/invoice/preview', label: t('preview') },
                        { to: '/apps/invoice/add', label: t('add') },
                        { to: '/apps/invoice/edit', label: t('edit') },
                    ],
                },
                {
                    to: '/apps/calendar',
                    icon: <IconMenuCalendar className="group-hover:!text-primary shrink-0" />,
                    label: t('calendar'),
                },
            ],
        },
        {
            type: 'section',
            label: t('user_interface'),
        },
        {
            key: 'component',
            icon: <IconMenuComponents className="group-hover:!text-primary shrink-0" />,
            label: t('components'),
            subMenu: [
                { to: '/components/tabs', label: t('tabs') },
                { to: '/components/accordions', label: t('accordions') },
                { to: '/components/modals', label: t('modals') },
                { to: '/components/cards', label: t('cards') },
                { to: '/components/carousel', label: t('carousel') },
                { to: '/components/countdown', label: t('countdown') },
                { to: '/components/counter', label: t('counter') },
                { to: '/components/sweetalert', label: t('sweet_alerts') },
                { to: '/components/timeline', label: t('timeline') },
                { to: '/components/notifications', label: t('notifications') },
                { to: '/components/media-object', label: t('media_object') },
                { to: '/components/list-group', label: t('list_group') },
                { to: '/components/pricing-table', label: t('pricing_tables') },
                { to: '/components/lightbox', label: t('lightbox') },
            ],
        },
        {
            key: 'element',
            icon: <IconMenuElements className="group-hover:!text-primary shrink-0" />,
            label: t('elements'),
            subMenu: [
                { to: '/elements/alerts', label: t('alerts') },
                { to: '/elements/avatar', label: t('avatar') },
                { to: '/elements/badges', label: t('badges') },
                { to: '/elements/breadcrumbs', label: t('breadcrumbs') },
                { to: '/elements/buttons', label: t('buttons') },
                { to: '/elements/buttons-group', label: t('button_groups') },
                { to: '/elements/color-library', label: t('color_library') },
                { to: '/elements/dropdown', label: t('dropdown') },
                { to: '/elements/infobox', label: t('infobox') },
                { to: '/elements/jumbotron', label: t('jumbotron') },
                { to: '/elements/loader', label: t('loader') },
                { to: '/elements/pagination', label: t('pagination') },
                { to: '/elements/popovers', label: t('popovers') },
                { to: '/elements/progress-bar', label: t('progress_bar') },
                { to: '/elements/search', label: t('search') },
                { to: '/elements/tooltips', label: t('tooltips') },
                { to: '/elements/treeview', label: t('treeview') },
                { to: '/elements/typography', label: t('typography') },
            ],
        },
        {
            to: '/charts',
            icon: <IconMenuCharts className="group-hover:!text-primary shrink-0" />,
            label: t('charts'),
        },
        {
            to: '/widgets',
            icon: <IconMenuWidgets className="group-hover:!text-primary shrink-0" />,
            label: t('widgets'),
        },
        {
            to: '/font-icons',
            icon: <IconMenuFontIcons className="group-hover:!text-primary shrink-0" />,
            label: t('font_icons'),
        },
        {
            to: '/dragndrop',
            icon: <IconMenuDragAndDrop className="group-hover:!text-primary shrink-0" />,
            label: t('drag_and_drop'),
        },
        {
            type: 'section',
            label: t('tables_and_forms'),
        },
        {
            to: '/tables',
            icon: <IconMenuTables className="group-hover:!text-primary shrink-0" />,
            label: t('tables'),
        },
        {
            key: 'datalabel',
            icon: <IconMenuDatatables className="group-hover:!text-primary shrink-0" />,
            label: t('datatables'),
            subMenu: [
                { to: '/datatables/basic', label: t('basic') },
                { to: '/datatables/advanced', label: t('advanced') },
                { to: '/datatables/skin', label: t('skin') },
                { to: '/datatables/order-sorting', label: t('order_sorting') },
                { to: '/datatables/multi-column', label: t('multi_column') },
                { to: '/datatables/multiple-tables', label: t('multiple_tables') },
                { to: '/datatables/alt-pagination', label: t('alt_pagination') },
                { to: '/datatables/checkbox', label: t('checkbox') },
                { to: '/datatables/range-search', label: t('range_search') },
                { to: '/datatables/export', label: t('export') },
                { to: '/datatables/column-chooser', label: t('column_chooser') },
            ],
        },
        {
            key: 'forms',
            icon: <IconMenuForms className="group-hover:!text-primary shrink-0" />,
            label: t('forms'),
            subMenu: [
                { to: '/forms/basic', label: t('basic') },
                { to: '/forms/input-group', label: t('input_group') },
                { to: '/forms/layouts', label: t('layouts') },
                { to: '/forms/validation', label: t('validation') },
                { to: '/forms/input-mask', label: t('input_mask') },
                { to: '/forms/select2', label: t('select2') },
                { to: '/forms/touchspin', label: t('touchspin') },
                { to: '/forms/checkbox-radio', label: t('checkbox_and_radio') },
                { to: '/forms/switches', label: t('switches') },
                { to: '/forms/wizards', label: t('wizards') },
                { to: '/forms/file-upload', label: t('file_upload') },
                { to: '/forms/quill-editor', label: t('quill_editor') },
                { to: '/forms/markdown-editor', label: t('markdown_editor') },
                { to: '/forms/date-picker', label: t('date_and_range_picker') },
                { to: '/forms/clipboard', label: t('clipboard') },
            ],
        },
        {
            type: 'section',
            label: t('user_and_pages'),
        },
        {
            key: 'users',
            icon: <IconMenuUsers className="group-hover:!text-primary shrink-0" />,
            label: t('users'),
            subMenu: [
                { to: '/users/profile', label: t('profile') },
                { to: '/users/user-account-settings', label: t('account_settings') },
            ],
        },
        {
            key: 'page',
            icon: <IconMenuPages className="group-hover:!text-primary shrink-0" />,
            label: t('pages'),
            subMenu: [
                { to: '/pages/knowledge-base', label: t('knowledge_base') },
                { to: '/pages/contact-us-boxed', label: t('contact_us_boxed'), target: '_blank' },
                { to: '/pages/contact-us-cover', label: t('contact_us_cover'), target: '_blank' },
                { to: '/pages/faq', label: t('faq') },
                { to: '/pages/coming-soon-boxed', label: t('coming_soon_boxed'), target: '_blank' },
                { to: '/pages/coming-soon-cover', label: t('coming_soon_cover'), target: '_blank' },
                {
                    key: 'error',
                    label: t('error'),
                    isError: true,
                    subMenu: [
                        { to: '/pages/error404', label: t('404'), target: '_blank', isExternal: true },
                        { to: '/pages/error500', label: t('500'), target: '_blank', isExternal: true },
                        { to: '/pages/error503', label: t('503'), target: '_blank', isExternal: true },
                    ],
                },
                { to: '/pages/maintenence', label: t('maintenence'), target: '_blank' },
            ],
        },
        {
            key: 'auth',
            icon: <IconMenuAuthentication className="group-hover:!text-primary shrink-0" />,
            label: t('authentication'),
            subMenu: [
                { to: '/auth/boxed-signin', label: t('login_boxed'), target: '_blank' },
                { to: '/auth/boxed-signup', label: t('register_boxed'), target: '_blank' },
                { to: '/auth/boxed-lockscreen', label: t('unlock_boxed'), target: '_blank' },
                { to: '/auth/boxed-password-reset', label: t('recover_id_boxed'), target: '_blank' },
                { to: '/auth/cover-login', label: t('login_cover'), target: '_blank' },
                { to: '/auth/cover-register', label: t('register_cover'), target: '_blank' },
                { to: '/auth/cover-lockscreen', label: t('unlock_cover'), target: '_blank' },
                { to: '/auth/cover-password-reset', label: t('recover_id_cover'), target: '_blank' },
            ],
        },
        {
            type: 'section',
            label: t('supports'),
        },
        {
            to: 'https://vristo.sbthemes.com',
            icon: <IconMenuDocumentation className="group-hover:!text-primary shrink-0" />,
            label: t('documentation'),
            target: '_blank',
            isExternal: true,
        },
    ];

    // Recursive menu renderer
    const renderMenu = (items: any[], parentKey = '') =>
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
                            onClick={() => toggleMenu(item.key)}
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
                        <NavLink to={item.to} target={item.target} className="group">
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
                            {renderMenu(menuItems)}
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
