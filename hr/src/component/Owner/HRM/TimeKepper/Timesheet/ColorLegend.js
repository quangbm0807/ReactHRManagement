import React from 'react';
import { Dropdown, Menu, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

const ColorLegend = ({ isAddShift }) => (
    <Dropdown
        overlay={(
            <Menu>
                <Menu.Item>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#fff',
                            border: '1px solid #d9d9d9',
                            borderRadius: '4px'
                        }}></div>
                        <span>Ca làm mặc định</span>
                    </div>
                </Menu.Item>
                <Menu.Item>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#FFB74D',
                            borderRadius: '4px'
                        }}></div>
                        <span>Ca làm tăng cường</span>
                    </div>
                </Menu.Item>
                {isAddShift && (
                    <Menu.Item>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: '#81C784',
                                borderRadius: '4px'
                            }}></div>
                            <span>Ca có thưởng/hệ số</span>
                        </div>
                    </Menu.Item>
                )}
            </Menu>
        )}
    >
        <Button type="default">
            <EyeOutlined />
        </Button>
    </Dropdown>
);

export default ColorLegend;
