import React, { createContext, useContext, useCallback } from 'react';
import useMenu, { MenuItem, UseMenuReturn } from '../hooks/useMenu';

interface MenuContextType extends UseMenuReturn {
  invalidateMenuCache: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const menuHook = useMenu();

  const invalidateMenuCache = useCallback(() => {
    menuHook.clearCache();
    menuHook.refetch();
  }, [menuHook]);

  const value: MenuContextType = {
    ...menuHook,
    invalidateMenuCache,
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenuContext = (): MenuContextType => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenuContext must be used within a MenuProvider');
  }
  return context;
};

export default MenuContext;
