import React, { useState } from 'react';
import { Tabs } from 'antd';
import ScheduleTimesheet from './Timesheet/Timesheet';
import IPManagement from './TimeKeeperConfiugration/IPConfiguration';
import QuanLyDiaDiem from './TimeKeeperConfiugration/LocationPicker';

const TimeKeeper = () => {
    const [activeTab, setActiveTab] = useState('1');

    const onChange = (key) => {
        setActiveTab(key);
    };

    const items = [
        {
            label: <span>🗓 Bảng chấm công </span>,
            key: '1',
            children: <ScheduleTimesheet isAddShift={false} />
        },
        {
            label: <span>🌐 Cấu hình IP </span>,
            key: '2',
            children: <IPManagement />
        },
        {
            label: <span>📍 Cấu hình vị trí </span>,
            key: '3',
            children: <QuanLyDiaDiem />
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

export default TimeKeeper;
