import React from 'react';
import { Button, Dropdown, Menu } from 'antd';
import { ArrowDownCircle } from 'lucide-react';

export const StatusDropdown = ({ status, onStatusChange }) => {
    const menu = (
        <Menu onClick={({ key }) => onStatusChange(parseInt(key))}>
            <Menu.Item
                key="1"
                style={{ backgroundColor: status === 1 ? '#d6f5d6' : 'inherit' }}
            >
                Hoạt động
            </Menu.Item>
            <Menu.Item
                key="0"
                style={{ backgroundColor: status === 0 ? '#ffc9bd' : 'inherit' }}
            >
                Không hoạt động
            </Menu.Item>
        </Menu>
    );

    return (
        <Dropdown overlay={menu} trigger={['click']}>
            <Button
                size="small"
                style={{
                    backgroundColor: status === 1 ? '#d6f5d6' : '#ffc9bd',
                }}
                icon={<ArrowDownCircle size={16} />}
            />
        </Dropdown>
    );
};
