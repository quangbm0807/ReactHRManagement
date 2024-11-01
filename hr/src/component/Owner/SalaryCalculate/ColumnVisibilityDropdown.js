import React, { useState } from 'react';
import { Button, Checkbox, Popover, Space, Divider } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

const ColumnVisibilityDropdown = ({
    columns,
    checkedColumns,
    onColumnChange,
    stickyColumns,
    onStickyChange
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Lọc các cột dựa trên từ khóa tìm kiếm
    const filteredColumns = columns.filter(col =>
        col.title?.props?.children?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof col.title === 'string' && col.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Kiểm tra xem tất cả các cột có được chọn không
    const isAllChecked = columns.every(col => checkedColumns.includes(col.key));

    // Xử lý chọn/bỏ chọn tất cả
    const handleToggleAll = () => {
        if (isAllChecked) {
            onColumnChange([]);
            onStickyChange([]);
        } else {
            onColumnChange(columns.map(col => col.key));
        }
    };

    // Nội dung của popover
    const content = (
        <div style={{ width: 250 }}>

            <Checkbox
                checked={isAllChecked}
                onChange={handleToggleAll}
                style={{ marginBottom: 8 }}
            >
                {isAllChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </Checkbox>

            <Divider style={{ margin: '8px 0' }} />

            <Space direction="vertical" style={{ width: '100%' }}>
                {filteredColumns.map(col => (
                    <div key={col.key} style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Checkbox
                            checked={checkedColumns.includes(col.key)}
                            onChange={e => {
                                if (e.target.checked) {
                                    onColumnChange([...checkedColumns, col.key]);
                                } else {
                                    onColumnChange(checkedColumns.filter(key => key !== col.key));
                                    // Nếu cột bị ẩn, cũng xóa khỏi danh sách cột cố định
                                    if (stickyColumns.includes(col.key)) {
                                        onStickyChange(stickyColumns.filter(key => key !== col.key));
                                    }
                                }
                            }}
                        >
                            {typeof col.title === 'string' ? col.title : col.title?.props?.children}
                        </Checkbox>

                        {checkedColumns.includes(col.key) && (
                            <Checkbox
                                checked={stickyColumns.includes(col.key)}
                                onChange={e => {
                                    if (e.target.checked) {
                                        onStickyChange([...stickyColumns, col.key]);
                                    } else {
                                        onStickyChange(stickyColumns.filter(key => key !== col.key));
                                    }
                                }}
                            >
                                Cố định
                            </Checkbox>
                        )}
                    </div>
                ))}
            </Space>
        </div>
    );

    return (
        <Popover
            content={content}
            trigger="click"
            placement="bottomRight"
            title={`Hiển thị cột (${checkedColumns.length}/${columns.length})`}
        >
            <Button icon={<EyeOutlined />}>
            </Button>
        </Popover>
    );
};

export default ColumnVisibilityDropdown;