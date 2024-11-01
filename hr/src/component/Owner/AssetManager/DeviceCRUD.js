import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Button, Modal, DatePicker, Space, InputNumber } from 'antd';
import dayjs from 'dayjs';
import EmptyData from '../../Ultils/EmptyData/EmptyData';

const DeviceCrud = () => {
    const [devices, setDevices] = useState([]);
    const [editingDevice, setEditingDevice] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Mở modal và khởi tạo dữ liệu form khi thêm/sửa
    const showModal = (device = null) => {
        setEditingDevice(device);
        setIsModalVisible(true);
        form.setFieldsValue({
            ...device,
            timeWarranty: device?.timeWarranty ? dayjs(device.timeWarranty) : null,
            employeeUsing: device?.employeeUsing ? dayjs(device.employeeUsing) : null,
            timeGet: device?.timeGet ? dayjs(device.timeGet) : null,
            timeReturn: device?.timeReturn ? dayjs(device.timeReturn) : null,
        });
    };

    // Đóng modal
    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    // Thêm/sửa thiết bị
    const handleOk = () => {
        form.validateFields().then(values => {
            const formattedValues = {
                ...values,
                timeWarranty: values.timeWarranty ? values.timeWarranty.valueOf() : 0,
                employeeUsing: values.employeeUsing ? values.employeeUsing.valueOf() : 0,
                timeGet: values.timeGet ? values.timeGet.valueOf() : 0,
                timeReturn: values.timeReturn ? values.timeReturn.valueOf() : 0,
            };

            if (editingDevice) {
                // Sửa thiết bị
                setDevices(devices.map(device => device.deviceID === editingDevice.deviceID ? { ...editingDevice, ...formattedValues } : device));
            } else {
                // Thêm thiết bị
                setDevices([...devices, { ...formattedValues, deviceID: devices.length + 1 }]);
            }

            handleCancel();
        });
    };

    // Xoá thiết bị
    const handleDelete = (deviceID) => {
        setDevices(devices.filter(device => device.deviceID !== deviceID));
    };

    const columns = [
        { title: 'Device ID', dataIndex: 'deviceID', key: 'deviceID' },
        { title: 'Status', dataIndex: 'status', key: 'status' },
        { title: 'Employee Buyer', dataIndex: 'employeeBuyer', key: 'employeeBuyer' },
        { title: 'Employee Keeper', dataIndex: 'employeeKeeper', key: 'employeeKeeper' },
        { title: 'Price', dataIndex: 'price', key: 'price' },
        {
            title: 'Time Warranty',
            dataIndex: 'timeWarranty',
            key: 'timeWarranty',
            render: timestamp => (timestamp ? dayjs(timestamp).format('YYYY-MM-DD') : '')
        },
        {
            title: 'Employee Using',
            dataIndex: 'employeeUsing',
            key: 'employeeUsing',
            render: timestamp => (timestamp ? dayjs(timestamp).format('YYYY-MM-DD') : '')
        },
        {
            title: 'Time Get',
            dataIndex: 'timeGet',
            key: 'timeGet',
            render: timestamp => (timestamp ? dayjs(timestamp).format('YYYY-MM-DD') : '')
        },
        {
            title: 'Time Return',
            dataIndex: 'timeReturn',
            key: 'timeReturn',
            render: timestamp => (timestamp ? dayjs(timestamp).format('YYYY-MM-DD') : '')
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <Space size="middle">
                    <Button onClick={() => showModal(record)}>Edit</Button>
                    <Button danger onClick={() => handleDelete(record.deviceID)}>Delete</Button>
                </Space>
            ),
        },
    ];

    return (
        <div className='card'>
            <div style={{ textAlign: 'right' }}>
                <Button type="primary" onClick={() => showModal()} style={{ width: 'fit-content' }}>Add Device</Button>
            </div>
            <Table
                size='large'
                dataSource={devices}
                columns={columns}
                rowKey="deviceID"
                locale={{
                    emptyText: <EmptyData />,
                }}
            />

            <Modal
                title={editingDevice ? 'Edit Device' : 'Add Device'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please input the status!' }]}
                        style={{ width: '100%' }}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="employeeBuyer" label="Employee Buyer" rules={[{ required: true, message: 'Please input the employee buyer!' }]}
                        style={{ width: '100%' }}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="employeeKeeper" label="Employee Keeper" rules={[{ required: true, message: 'Please input the employee keeper!' }]}
                        style={{ width: '100%' }}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="price" label="Price" rules={[{ required: true, message: 'Please input the price!' }]}
                        style={{ width: '100%' }}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="timeWarranty" label="Time Warranty" style={{ width: '100%' }}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="employeeUsing" label="Employee Using" style={{ width: '100%' }}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="timeGet" label="Time Get" style={{ width: '100%' }}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="timeReturn" label="Time Return" style={{ width: '100%' }}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DeviceCrud;
