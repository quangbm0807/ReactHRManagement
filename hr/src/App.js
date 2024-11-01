import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Sidebar from './component/Sidebar/Sidebar';
import Dashboard from './component/Owner/Dashboard/Dashboard';
import EmployeeTable from './component/Owner/EmployeeInfo/EmployeeInfo';
import 'react-bootstrap/dist/react-bootstrap.min.js';
import ScheduleManager from './component/Owner/HRM/TimeKepper/ScheduleManager';
import ScheduleTemplate from './component/Owner/HRM/TimeKepper/ScheduleTable/ScheduleTable';
import ScheduleTimesheet from './component/Owner/HRM/TimeKepper/Timesheet/Timesheet';
import TimeKeeper from './component/Owner/HRM/TimeKepper/TimeKeeper';
import 'antd/dist/reset.css'; // Import reset.css
import SalaryCalculate from './component/Owner/SalaryCalculate/SalaryCalculate';
import Announcement from './component/Owner/Announcement/Announcement';
import ComingSoon from './component/Owner/CommingSoon/ComingSoon';
import DeviceCrud from './component/Owner/AssetManager/DeviceCRUD';
import EmployeeAttendance from './component/Employee/component/EmployeeAttendance/EmployeeAttendance';
import NotificationManager from './component/Owner/Announcement/NotificationManager';

const App = () => {
  // Get the value of isOwner from localStorage and parse it as a boolean
  const isOwner = localStorage.getItem('owner') === 'true';

  return (
    <HashRouter>
      <div className="app-container">
        <Sidebar />
        {!isOwner && <NotificationManager />}
        <div id='contentBody'>
          <Routes>
            {/* Conditionally set the root route based on isOwner */}
            <Route path="/" element={isOwner ? <Dashboard /> : <EmployeeAttendance />} />
            <Route path="EmployeeManager" element={<EmployeeTable />} />
            <Route path="ScheduleManager" element={<ScheduleManager />} />
            <Route path="scheduleTemplate" element={<ScheduleTemplate />} />
            <Route path="timesheet" element={<ScheduleTimesheet />} />
            <Route path="TimeKeeper" element={<TimeKeeper />} />
            <Route path="SalaryCalculate" element={<SalaryCalculate />} />
            <Route path="Announcement" element={<Announcement />} />
            <Route path="AssetManager" element={<ComingSoon />} />
            <Route path="LeaveManager" element={<ComingSoon />} />
            <Route path="DeviceCrud" element={<DeviceCrud />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
