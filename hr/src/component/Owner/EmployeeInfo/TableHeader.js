import React from 'react';
import { Input, Space, Button, Dropdown } from 'antd';
import { SearchOutlined, ExpandOutlined, CompressOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';
import DropDownCheckBox from './DropDownCheckBox';

export const TableHeader = ({
    onSearch,
    onToggleExpand,
    isAllExpanded,
    onAddEmployee,
    columns,
    checkedColumns,
    onColumnVisibilityChange,
    isAllChecked,
    onToggleAll
}) => (
    <div className='m-3' style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <Input
            placeholder="Tìm kiếm nhân viên"
            prefix={<SearchOutlined />}
            onChange={onSearch}
            style={{ width: 300 }}
        />
        <Space>
            <>
                <Dropdown
                    overlay={(
                        <DropDownCheckBox
                            columns={columns}
                            checkedColumns={checkedColumns}
                            handleColumnVisibilityChange={onColumnVisibilityChange}
                            isAllChecked={isAllChecked}
                            handleToggleAll={onToggleAll}
                        />
                    )}
                    trigger={['click']}
                >
                    <Button>
                        Chọn cột hiển thị <DownOutlined />
                    </Button>
                </Dropdown>
            </>
            <Button
                onClick={onToggleExpand}
                icon={isAllExpanded ? <CompressOutlined /> : <ExpandOutlined />}
            >
                {isAllExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
            </Button>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onAddEmployee}
            >
                Thêm nhân viên
            </Button>
        </Space>
    </div>
);