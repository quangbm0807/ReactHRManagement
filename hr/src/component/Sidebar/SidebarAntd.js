import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Select } from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    DashboardOutlined,
    TeamOutlined,
    ScheduleOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    CalendarOutlined,
    NotificationOutlined
} from '@ant-design/icons';
import './SidebarAntd.css';
const { Sider } = Layout;
const { Option } = Select;

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [language, setLanguage] = useState(0);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [openKeys, setOpenKeys] = useState(['hrm']);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLanguageChange = (value) => {
        const languageID = parseInt(value);
        setLanguage(languageID);
        localStorage.setItem('languageID', languageID);
    };

    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            onClick: () => navigate('/'),
            path: '/'
        },
        {
            key: 'menu-management',
            icon: <TeamOutlined />,
            label: 'Quản lý nhân viên',
            onClick: () => navigate('EmployeeManager'),
            path: 'EmployeeManager'
        },
        {
            key: 'hrm',
            icon: <ScheduleOutlined />,
            label: 'Hành chính nhân sự',
            children: [
                {
                    key: 'scheduleTemplate',
                    icon: <ClockCircleOutlined />,
                    label: 'Quản lý lịch làm việc',
                    onClick: () => navigate('ScheduleManager'),
                    path: 'ScheduleManager'
                },
                {
                    key: 'timeKeeper',
                    icon: <ScheduleOutlined />,
                    label: 'Quản lý chấm công',
                    onClick: () => navigate('TimeKeeper'),
                    path: 'TimeKeeper'
                },
                {
                    key: 'payrollClerk',
                    icon: <DollarOutlined />,
                    label: 'Quản lý lương',
                    onClick: () => navigate('SalaryCalculate'),
                    path: 'SalaryCalculate'
                },
                {
                    key: 'shiftManager',
                    icon: <CalendarOutlined />,
                    label: 'Quản lý phép',
                    onClick: () => navigate('/a'),
                    path: '/a'
                },
                {
                    key: 'announcement',
                    icon: <NotificationOutlined />,
                    label: 'Quản lý thông báo',
                    onClick: () => navigate('/b'),
                    path: '/b'
                }
            ]
        }
    ];

    // Function to check if a path matches the current location
    const isPathMatch = (menuPath, currentPath) => {
        if (menuPath === '/') {
            return currentPath === '/' || currentPath === '';
        }
        return currentPath.includes(menuPath);
    };

    // Function to find matching menu item
    const findMatchingMenuItem = (items, currentPath) => {
        for (const item of items) {
            if (item.path && isPathMatch(item.path, currentPath)) {
                return item;
            }
            if (item.children) {
                const matchingChild = findMatchingMenuItem(item.children, currentPath);
                if (matchingChild) {
                    return { ...matchingChild, parent: item };
                }
            }
        }
        return null;
    };

    // Update selected and open keys based on current location
    useEffect(() => {
        const currentPath = location.pathname.replace(/^\//, ''); // Remove leading slash
        const matchingItem = findMatchingMenuItem(menuItems, currentPath);

        if (matchingItem) {
            const newSelectedKeys = [matchingItem.key];
            setSelectedKeys(newSelectedKeys);

            // If the matching item has a parent, ensure its key is in openKeys
            if (matchingItem.parent) {
                setOpenKeys(prev => {
                    const newOpenKeys = [...prev];
                    if (!newOpenKeys.includes(matchingItem.parent.key)) {
                        newOpenKeys.push(matchingItem.parent.key);
                    }
                    return newOpenKeys;
                });
            }
        } else {
            // Default to dashboard if no match found
            setSelectedKeys(['dashboard']);
        }
    }, [location.pathname]);

    // Load saved language
    useEffect(() => {
        const savedLanguage = localStorage.getItem('languageID');
        if (savedLanguage !== null) {
            setLanguage(parseInt(savedLanguage));
        }
    }, []);

    // Handle submenu open/close
    const onOpenChange = (keys) => {
        setOpenKeys(keys);
    };

    return (
        <Sider
            width={300}
            collapsed={collapsed}
            onCollapse={setCollapsed}
            className="custom-sidebar"
        >
            <div className="sidebar-header">
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    className="collapse-button"
                />
                {!collapsed && (
                    <Select
                        value={language}
                        onChange={handleLanguageChange}
                        className="language-select"
                    >
                        <Option value={0}>English</Option>
                        <Option value={1}>Tiếng Việt</Option>
                        <Option value={2}>中 文 ( 台 灣 )</Option>
                    </Select>
                )}
                {!collapsed && <h4 className="sidebar-title">Owner</h4>}
            </div>

            <Menu
                mode="inline"
                selectedKeys={selectedKeys}
                openKeys={openKeys}
                onOpenChange={onOpenChange}
                className="custom-menu"
                items={menuItems}
            />
        </Sider>
    );
};

export default Sidebar;