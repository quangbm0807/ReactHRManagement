export const menuItems = [
    {
        id: 'dashboard',
        icon: <img src={`${process.env.PUBLIC_URL}/MenuIcon/dashboard.png`} alt="Dashboard" width={24} />,
        label: 'Dashboard',
        permission: 0,
        path: '/'
    },
    {
        id: 'attendance',
        icon: <img src={`${process.env.PUBLIC_URL}/MenuIcon/checkin.png`} alt="attendance" width={24} />,
        label: 'Điểm danh',
        permission: 0,
        path: '/'
    },
    {
        id: 'announcement',
        icon: <img src={`${process.env.PUBLIC_URL}/MenuIcon/announcement.png`} width={24} alt="Announcement" />,
        label: 'Quản lý thông báo',
        permission: 0,
        path: '/Announcement'
    },
    {
        id: 'menu-management',
        icon: <img src={`${process.env.PUBLIC_URL}/MenuIcon/employees.png`} width={24} alt="Employees" />,
        label: 'Quản lý nhân viên',
        permission: 1,
        path: '/EmployeeManager'
    },
    {
        id: 'scheduleTemplate',
        icon: <img src={`${process.env.PUBLIC_URL}/MenuIcon/clock_11070799.png`} width={22} alt="Schedule" />,
        label: 'Quản lý lịch làm việc',
        permission: 2,
        path: '/ScheduleManager'
    },
    {
        id: 'timeKeeper',
        icon: <img src={`${process.env.PUBLIC_URL}/MenuIcon/scheduling.png`} width={24} alt="Time" />,
        label: 'Quản lý chấm công',
        permission: 4,
        path: '/TimeKeeper'
    },
    {
        id: 'shiftManager',
        icon: <img src={`${process.env.PUBLIC_URL}/MenuIcon/travel.png`} width={24} alt="Travel" />,
        label: 'Quản lý phép',
        permission: 8,
        path: '/LeaveManager'
    },
    {
        id: 'asset-management',
        icon: <img src={`${process.env.PUBLIC_URL}/MenuIcon/asset.png`} width={30} alt="asset" />,
        label: 'Quản lý tài sản',
        permission: 32,
        path: '/AssetManager'
    },
    {
        id: 'payrollClerk',
        icon: <img src={`${process.env.PUBLIC_URL}/MenuIcon/salary.png`} width={24} alt="Salary" />,
        label: 'Quản lý lương',
        permission: 4096,
        path: '/SalaryCalculate'
    },
];

// {
//   id: 'hrm',
//   icon: <img src={`${process.env.PUBLIC_URL}/MenuIcon/hrm.png`} width={24} alt="HRM" />,
//   label: 'Hành chính nhân sự',
//   permission: 1,
//   isDropdown: true,
//   subItems: [
//     { id: 'scheduleTemplate', icon: <img src={`${process.env.PUBLIC_URL}/MenuIcon/clock_11070799.png`} width={22} alt="Schedule" />, label: 'Quản lý lịch làm việc', permission: 1, path: '/ScheduleManager' },
//     { id: 'timeKeepper', icon: <img src={`${process.env.PUBLIC_URL}/MenuIcon/scheduling.png`} width={24} alt="Time" />, label: 'Quản lý chấm công', permission: 1, path: '/TimeKeeper' },
//     { id: 'payrollClerk', icon: <img src={`${process.env.PUBLIC_URL}/MenuIcon/salary.png`} width={24} alt="Salary" />, label: 'Quản lý lương', permission: 1, path: '/SalaryCalculate' },
//     { id: 'shiftManager', icon: <img src={`${process.env.PUBLIC_URL}/MenuIcon/travel.png`} width={24} alt="Travel" />, label: 'Quản lý phép', permission: 1, path: '/a' },
//     { id: 'announcement', icon: <img src={`${process.env.PUBLIC_URL}/MenuIcon/announcement.png`} width={24} alt="Announcement" />, label: 'Quản lý thông báo', permission: 1, path: '/Announcement' },
//   ],
// },