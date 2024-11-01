import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
// import Sidebar from './component/Sidebar/Sidebar';
import Sidebar from './component/Sidebar/SidebarAntd';
import Dashboard from './component/Dashboard/Dashboard';
import EmployeeTable from './component/EmployeeInfo/EmployeeInfo';
import 'react-bootstrap/dist/react-bootstrap.min.js';
import ScheduleManager from './component/HRM/TimeKepper/ScheduleManager';
import ScheduleTemplate from './component/HRM/TimeKepper/ScheduleTable/ScheduleTable';
import ScheduleTimesheet from './component/HRM/TimeKepper/Timesheet/Timesheet';
import TimeKeeper from './component/HRM/TimeKepper/TimeKeeper';
import 'antd/dist/reset.css'; // Import reset.css
import SalaryCalculate from './component/SalaryCalculate/SalaryCalculate';
import { Layout } from 'antd';
import './App.css';
const App = () => {
    return (
        <HashRouter>
            <Layout style={{ minHeight: '100vh' }}>
                <Sidebar />
                <Layout>
                    <Layout.Content style={{ margin: '24px 16px', }}>
                        <Routes>
                            <Route path="EmployeeManager" element={<EmployeeTable />} />
                            <Route path="ScheduleManager" element={<ScheduleManager />} />
                            <Route path="/" element={<Dashboard />} />
                            <Route path="scheduleTemplate" element={<ScheduleTemplate />} />
                            <Route path="timesheet" element={<ScheduleTimesheet />} />
                            <Route path="TimeKeeper" element={<TimeKeeper />} />
                            <Route path="SalaryCalculate" element={<SalaryCalculate />} />
                        </Routes>
                    </Layout.Content>
                </Layout>
            </Layout>
        </HashRouter>
    );
};

export default App;
