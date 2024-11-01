import React, { useState } from 'react';
import { Tabs } from 'antd';
import ScheduleTemplate from './ScheduleTable/ScheduleTable';
import ScheduleTimesheet from './Timesheet/Timesheet';
import HolidayCalendar from './Holidays/HolidayCalendar';

const ScheduleManager = () => {
    const [activeTab, setActiveTab] = useState("1");

    const onChange = (key) => {
        setActiveTab(key);
    };

    // Sử dụng items thay cho TabPane
    const items = [
        {
            label: <span>Mẫu thời khóa biểu</span>,
            key: "1",
            children: <ScheduleTemplate />
        },
        {
            label: <span>Ngày nghỉ</span>,
            key: "2",
            children: <HolidayCalendar />
        },
        {
            label: <span>Lịch làm việc</span>,
            key: "3",
            children: <ScheduleTimesheet isAddShift={true} />
        }
    ];

    return (
        <div className='card'>
            <Tabs
                style={{ marginLeft: '16px' }}
                size='large'
                tabBarStyle={{ textAlign: 'left' }}
                activeKey={activeTab}
                onChange={onChange}
                items={items}
            />
        </div>
    );
};

export default ScheduleManager;
