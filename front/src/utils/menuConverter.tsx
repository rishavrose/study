import { MenuItem } from '../hooks/useMenu';
import IconMenuDashboard from '../components/Icon/Menu/IconMenuDashboard';
import IconMenuChat from '../components/Icon/Menu/IconMenuChat';
import IconMenuMailbox from '../components/Icon/Menu/IconMenuMailbox';
import IconMenuTodo from '../components/Icon/Menu/IconMenuTodo';
import IconMenuNotes from '../components/Icon/Menu/IconMenuNotes';
import IconMenuScrumboard from '../components/Icon/Menu/IconMenuScrumboard';
import IconMenuContacts from '../components/Icon/Menu/IconMenuContacts';
import IconMenuInvoice from '../components/Icon/Menu/IconMenuInvoice';
import IconMenuCalendar from '../components/Icon/Menu/IconMenuCalendar';
import IconMenuComponents from '../components/Icon/Menu/IconMenuComponents';
import IconMenuElements from '../components/Icon/Menu/IconMenuElements';
import IconMenuCharts from '../components/Icon/Menu/IconMenuCharts';
import IconMenuWidgets from '../components/Icon/Menu/IconMenuWidgets';
import IconMenuFontIcons from '../components/Icon/Menu/IconMenuFontIcons';
import IconMenuDragAndDrop from '../components/Icon/Menu/IconMenuDragAndDrop';
import IconMenuTables from '../components/Icon/Menu/IconMenuTables';
import IconMenuDatatables from '../components/Icon/Menu/IconMenuDatatables';
import IconMenuForms from '../components/Icon/Menu/IconMenuForms';
import IconMenuUsers from '../components/Icon/Menu/IconMenuUsers';
import IconMenuPages from '../components/Icon/Menu/IconMenuPages';
import IconMenuAuthentication from '../components/Icon/Menu/IconMenuAuthentication';
import IconMenuDocumentation from '../components/Icon/Menu/IconMenuDocumentation';

// Icon mapping
const iconMap: Record<string, any> = {
  IconMenuDashboard,
  IconMenuChat,
  IconMenuMailbox,
  IconMenuTodo,
  IconMenuNotes,
  IconMenuScrumboard,
  IconMenuContacts,
  IconMenuInvoice,
  IconMenuCalendar,
  IconMenuComponents,
  IconMenuElements,
  IconMenuCharts,
  IconMenuWidgets,
  IconMenuFontIcons,
  IconMenuDragAndDrop,
  IconMenuTables,
  IconMenuDatatables,
  IconMenuForms,
  IconMenuUsers,
  IconMenuPages,
  IconMenuAuthentication,
  IconMenuDocumentation,
};

export interface FrontendMenuItem {
  key?: string;
  to?: string;
  icon?: any;
  label: string;
  target?: string;
  type?: 'section';
  subMenu?: FrontendMenuItem[];
  children?: FrontendMenuItem[];
  isExternal?: boolean;
  isError?: boolean;
}

export const convertMenuItemsToFrontendFormat = (
  menuItems: MenuItem[],
  t: (key: string) => string
): FrontendMenuItem[] => {
  return menuItems
    .sort((a, b) => a.order - b.order)
    .map((item) => convertMenuItem(item, t))
    .filter(Boolean) as FrontendMenuItem[];
};

const convertMenuItem = (item: MenuItem, t: (key: string) => string): FrontendMenuItem | null => {
  if (!item.isActive) {
    return null;
  }

  // Handle section type
  if (item.type === 'section') {
    return {
      type: 'section',
      label: t(item.key) || item.label,
    };
  }

  const converted: FrontendMenuItem = {
    key: item.key,
    label: t(item.key) || item.label,
  };

  // Add icon if available
  if (item.icon && iconMap[item.icon]) {
    const IconComponent = iconMap[item.icon];
    converted.icon = <IconComponent className="group-hover:!text-primary shrink-0" />;
  }

  // Add route if available
  if (item.to) {
    converted.to = item.to;
  }

  // Add target if specified
  if (item.target) {
    converted.target = item.target;
  }

  // Add external link flag
  if (item.isExternal) {
    converted.isExternal = item.isExternal;
  }

  // Handle children (convert to subMenu or children based on structure)
  if (item.children && item.children.length > 0) {
    const convertedChildren = item.children
      .sort((a, b) => a.order - b.order)
      .map((child) => convertMenuItem(child, t))
      .filter(Boolean) as FrontendMenuItem[];

    if (convertedChildren.length > 0) {
      // Check if this is a grouped menu (like apps) or a submenu
      const hasOnlyMenuItems = convertedChildren.every(child => child.to || child.subMenu);

      if (hasOnlyMenuItems && !item.to) {
        // This is a grouped menu like "apps"
        converted.children = convertedChildren;
      } else {
        // This is a regular submenu
        converted.subMenu = convertedChildren;
      }
    }
  }

  return converted;
};

// Fallback static menu for development/testing
export const getFallbackMenu = (t: (key: string) => string): FrontendMenuItem[] => [
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
];
