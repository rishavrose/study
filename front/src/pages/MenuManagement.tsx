import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMenuContext } from '../contexts/MenuContext';
import { useNotification } from '../contexts/NotificationContext';

interface Menu {
  id: string;
  key: string;
  label: string;
  to?: string;
  icon?: string;
  type: 'menu' | 'submenu' | 'section';
  order: number;
  isActive: boolean;
  isExternal?: boolean;
  target?: string;
  parent_id?: string;
  children?: Menu[];
  roles?: any[];
  permissions?: any[];
}

interface MenuFormData {
  key: string;
  label: string;
  to?: string;
  icon?: string;
  type: 'menu' | 'submenu' | 'section';
  order: number;
  isActive: boolean;
  isExternal?: boolean;
  target?: string;
  parent_id?: string;
}

const MenuManagement = () => {
  const { t } = useTranslation();
  const { invalidateMenuCache } = useMenuContext();
  const { addNotification } = useNotification();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [formData, setFormData] = useState<MenuFormData>({
    key: '',
    label: '',
    to: '',
    icon: '',
    type: 'menu',
    order: 0,
    isActive: true,
    isExternal: false,
    target: '_self',
    parent_id: '',
  });

  const fetchMenus = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      console.log(`Token: ${token}, API URL: ${import.meta.env.VITE_API_URL}`); // Debugging line to check token and API URL

      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/menus`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMenus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menus');
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultMenus = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/menus/seed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      addNotification({
        type: 'success',
        message: result.message || 'Default menus seeded successfully',
      });
      fetchMenus(); // Refresh the list
      invalidateMenuCache(); // Invalidate sidebar cache
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to seed menus';
      setError(errorMessage);
      addNotification({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  const handleCreateMenu = () => {
    setEditingMenu(null);
    setFormData({
      key: '',
      label: '',
      to: '',
      icon: '',
      type: 'menu',
      order: 0,
      isActive: true,
      isExternal: false,
      target: '_self',
      parent_id: '',
    });
    setShowModal(true);
  };

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      key: menu.key,
      label: menu.label,
      to: menu.to || '',
      icon: menu.icon || '',
      type: menu.type,
      order: menu.order,
      isActive: menu.isActive,
      isExternal: menu.isExternal || false,
      target: menu.target || '_self',
      parent_id: menu.parent_id || '',
    });
    setShowModal(true);
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/menus/${menuId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      addNotification({
        type: 'success',
        message: 'Menu item deleted successfully',
      });
      fetchMenus(); // Refresh the list
      invalidateMenuCache(); // Invalidate sidebar cache
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete menu';
      setError(errorMessage);
      addNotification({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const url = editingMenu
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/menus/${editingMenu.id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/menus`;

      const method = editingMenu ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          parent_id: formData.parent_id || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      addNotification({
        type: 'success',
        message: editingMenu ? 'Menu updated successfully' : 'Menu created successfully',
      });
      setShowModal(false);
      setEditingMenu(null);
      fetchMenus(); // Refresh the list
      invalidateMenuCache(); // Invalidate sidebar cache
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save menu';
      setError(errorMessage);
      addNotification({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const renderMenuTree = (menuItems: Menu[], level = 0) => {
    return menuItems.map((menu) => (
      <div key={menu.id} style={{ marginLeft: level * 20 }} className="border-b border-gray-200 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-medium">{menu.label}</span>
            <span className="text-sm text-gray-500">({menu.key})</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{menu.type}</span>
            {menu.to && <span className="text-xs text-green-600">{menu.to}</span>}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded ${menu.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {menu.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className="text-xs text-gray-500">Order: {menu.order}</span>
            <button
              onClick={() => handleEditMenu(menu)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteMenu(menu.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
        {menu.children && menu.children.length > 0 && (
          <div className="mt-2">
            {renderMenuTree(menu.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
              <div className="space-x-4">
                <button
                  onClick={handleCreateMenu}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  Add New Menu
                </button>
                <button
                  onClick={seedDefaultMenus}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  Seed Default Menus
                </button>
                <button
                  onClick={fetchMenus}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                Error: {error}
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Current Menu Structure</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                {menus.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No menus found. Click "Seed Default Menus" to create the initial menu structure.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {renderMenuTree(menus)}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Instructions:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use "Seed Default Menus" to create the initial menu structure</li>
                <li>• Menu items are dynamically loaded based on user roles and permissions</li>
                <li>• Frontend sidebar will automatically use the dynamic menu data</li>
                <li>• Menu hierarchy supports unlimited nesting levels</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingMenu ? 'Edit Menu' : 'Create New Menu'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key *
                </label>
                <input
                  type="text"
                  name="key"
                  value={formData.key}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label *
                </label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="menu">Menu</option>
                  <option value="submenu">Submenu</option>
                  <option value="section">Section</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL/Path
                </label>
                <input
                  type="text"
                  name="to"
                  value={formData.to}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  placeholder="e.g., IconDashboard"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Menu
                </label>
                <select
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None (Top Level)</option>
                  {menus.map(menu => (
                    <option key={menu.id} value={menu.id}>
                      {menu.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Active
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isExternal"
                    checked={formData.isExternal}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  External Link
                </label>
              </div>

              {formData.isExternal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target
                  </label>
                  <select
                    name="target"
                    value={formData.target}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="_self">Same Window</option>
                    <option value="_blank">New Window</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editingMenu ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
