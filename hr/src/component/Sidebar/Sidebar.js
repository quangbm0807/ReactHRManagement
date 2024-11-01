import React, { useState, useEffect, useRef } from 'react';
import { LogOut, MenuIcon, Settings, SidebarCloseIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'antd';
import './Sidebar.css'
import { menuItems } from './MenuItem';
const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('');
  const [activeParent, setActiveParent] = useState('');
  const [language, setLanguage] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({ hrm: true });
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('Owner');
  useEffect(() => {
    const isOwner = localStorage.getItem('owner') === 'true';
    const storedEmployee = JSON.parse(localStorage.getItem('employee') || '{}');
    // const employeePermission = storedEmployee?.permission || 0;
    const employeePermission = 7881299347898368;

    const filterMenuItems = () => {
      console.log('Current Permission:', employeePermission);

      if (isOwner) {
        const visibleItems = menuItems.filter(item => item.id !== 'attendance');
        return visibleItems;
      } else {
        setName(storedEmployee.fullname || storedEmployee.nickname || 'Người dùng');

        const employeePermissionBig = window.BigInt(employeePermission);

        const visibleItems = menuItems.filter(item => {
          if (item.id === 'dashboard') {
            return false;
          }

          if (item.id === 'attendance') {
            return true;
          }

          if (item.id === 'announcement') {
            const requiredPermissions = [2n, 4n, 8n, 16n];
            return requiredPermissions.some(permission =>
              (employeePermissionBig & permission) !== 0n
            );
          }

          const itemPermissionBig = window.BigInt(item.permission);
          return (employeePermissionBig & itemPermissionBig) !== 0n;
        });

        console.log('Allowed IDs for User:', visibleItems.map(item => item.id));
        return visibleItems;
      }
    };

    setFilteredMenuItems(filterMenuItems());

    setFilteredMenuItems(filterMenuItems());
  }, []);
  const handleLanguageChange = (e) => {
    const languageID = parseInt(e.target.value);
    setLanguage(languageID);
    localStorage.setItem('languageID', languageID);
  };

  const handleItemClick = (itemId, path, parentId = null) => {
    if (path) {
      navigate(path);
    }
    setActiveItem(itemId);
    if (parentId) {
      setActiveParent(parentId);
    } else {
      setActiveParent('');
    }
  };


  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleToggleDropdown = (itemId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };



  useEffect(() => {
    const savedLanguage = localStorage.getItem('languageID');
    if (savedLanguage !== null) {
      setLanguage(parseInt(savedLanguage));
    }

    const currentPath = location.pathname;
    let matchedItem = null;
    let matchedParent = null;

    const normalizePath = (path) => {
      return path.replace(/^\/+|\/+$/g, '');
    };

    const normalizedCurrentPath = normalizePath(currentPath);

    filteredMenuItems.forEach((item) => {
      if (item.path) {
        const normalizedItemPath = normalizePath(item.path);
        if (normalizedCurrentPath === normalizedItemPath) {
          matchedItem = item.id;
        }
      }
    });

    setActiveItem(matchedItem || '');
    setActiveParent(matchedParent || '');
  }, [location.pathname, filteredMenuItems]);

  return (
    <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-content mt-4">
        <Button
          type="text"
          className="sidebar-toggle"
          onClick={handleToggleCollapse}
          icon={collapsed ? <MenuIcon /> : <SidebarCloseIcon />}
        />

        <div className="d-flex flex-column align-items-center">
          <select
            className="language-select w-50"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value={0}>English</option>
            <option value={1}>Tiếng Việt</option>
            <option value={2}>中 文 ( 台 灣 )</option>
          </select>
          <div className="sidebar-header mt-2">
            <h4>{name}</h4>
          </div>
        </div>


        <ul className="sidebar-menu">
          {filteredMenuItems.map((item) => (
            <li key={item.id}>
              <div
                className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
                onClick={() => handleItemClick(item.id, item.path)}
              >
                {item.icon} {item.label}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;