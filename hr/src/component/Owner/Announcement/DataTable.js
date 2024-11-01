import React from 'react';
import { Table, Button, Space, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import EmptyData from '../../Ultils/EmptyData/EmptyData';

export const DataTable = ({ data, loading, onEdit, onDelete, onAdd }) => {
    const columns = [
        {
            title: <span style={{ fontSize: '16px' }}>STT</span>,
            key: 'index',
            width: 10,
            render: (_, __, index) => index + 1,
            align: 'center'
        },
        {
            title: <span style={{ fontSize: '16px' }}>Tiêu đề</span>,
            dataIndex: 'title',
            width: 100,
            render: (value) => <Tooltip placement="topLeft" title={value}>
                {value.length > 50 ? `${value.slice(0, 50)}...` : value}
            </Tooltip>,
            sorter: (a, b) => a.title.localeCompare(b.title),
            align: 'center'
        },
        {
            title: <span style={{ fontSize: '16px' }}>URL</span>,
            dataIndex: 'url',
            width: 70,
            render: (value) => <a href={value} target="_blank" rel="noopener noreferrer">
                <Tooltip placement="topLeft" title={value}>
                    {value.length > 30 ? `${value.slice(0, 30)}...` : value}
                </Tooltip>
            </a>,
            align: 'center'
        },


        {
            title: <span style={{ fontSize: '16px' }}>Thời gian bắt đầu</span>,
            dataIndex: 'timeBegin',
            width: 60,
            render: (value) => dayjs(value).format('DD/MM/YYYY HH:mm'),
            sorter: (a, b) => a.timeBegin - b.timeBegin,
            align: 'center'
        },
        {
            title: <span style={{ fontSize: '16px' }}>Thời gian kết thúc</span>,
            dataIndex: 'timeEnd',
            width: 60,
            render: (value) => dayjs(value).format('DD/MM/YYYY HH:mm'),
            sorter: (a, b) => a.timeEnd - b.timeEnd,
            align: 'center'
        },
        {
            title: <span style={{ fontSize: '16px' }}>Thao tác</span>,
            key: 'action',
            width: 60,
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => onEdit(record)}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => onDelete(record)}
                    />
                </Space>
            ),
            align: 'center'
        }
    ];

    return (
        <div className="space-y-4">
            <Table
                size='large'
                columns={columns}
                dataSource={data}
                rowKey="title"
                loading={loading}
                pagination={false}
                locale={{
                    emptyText: <EmptyData />,
                }}
            />
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onAdd}
                className="mt-4 float-end"
            >
                Thêm mới
            </Button>
        </div>
    );
};