import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Form, message, notification } from 'antd';
import axios from 'axios';
import API_DOMAIN from '../../../../../api/API_URL/API_URL';
import api from '../../../../../api';
import EmptyData from '../../../../Ultils/EmptyData/EmptyData';

const IPManagement = () => {
    const [ipData, setIpData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [currentIP, setCurrentIP] = useState(''); // Trạng thái để lưu giá trị IP hiện tại

    // Fetch the IP list
    const fetchIPList = async () => {
        setLoading(true);
        try {
            const response = await api.post('api/hrm/shift-work/timekeeper/config-checkin-ip/get', {});

            if (response.data.status === 1) {
                setIpData(response.data.data);
            } else {
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể lấy danh sách IP',
                    placement: 'topRight',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Lỗi khi lấy danh sách IP',
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    // Validate IP format
    const validateIP = (ip) => {
        const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipPattern.test(ip);
    };

    // Fetch current IP
    const fetchCurrentIP = async () => {
        try {
            const response = await axios.get(`${API_DOMAIN}my-ip`);
            const ip = response.data.data;
            if (validateIP(ip)) {
                setCurrentIP(ip); // Cập nhật trạng thái với IP hiện tại
            } else {
                notification.error({
                    message: 'Lỗi',
                    description: 'Địa chỉ IP không hợp lệ',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Lỗi khi lấy địa chỉ IP hiện tại',
            });
        }
    };

    // Open modal to add new IP
    const showModal = () => {
        form.resetFields();
        setCurrentIP(''); // Đặt lại trạng thái IP hiện tại
        setIsModalVisible(true);
    };

    // Handle adding new IP
    const handleAddIP = async (values) => {
        // Kiểm tra tính hợp lệ của địa chỉ IP từ currentIP thay vì từ values.ip
        const ipToValidate = currentIP || values.ip; // Use values.ip if currentIP is not provided
        if (!validateIP(ipToValidate)) {
            notification.error({
                message: 'Lỗi',
                description: 'Địa chỉ IP không hợp lệ',
                placement: 'topRight',
            });
            return;
        }

        try {
            const response = await api.post('api/hrm/shift-work/timekeeper/config-checkin-ip/add', {
                ip: ipToValidate, // Send the validated IP address
                title: values.description,
            });

            if (response.data.status === 1) {
                notification.success({
                    message: 'Thành công',
                    description: 'Thêm IP thành công',
                    placement: 'topRight',
                });
                setIsModalVisible(false);
                fetchIPList(); // Refresh IP list after adding
            } else {
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể thêm IP',
                    placement: 'topRight',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Lỗi khi thêm IP',
                placement: 'topRight',
            });
        }
    };


    // Handle deleting IP
    /*************  ✨ Codeium Command 🌟  *************/
    const handleDeleteIP = async (ip) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa IP ${ip}?`,
            okText: 'Có',
            okType: 'danger',
            cancelText: 'Không',
            onOk: async () => {
                try {
                    const response = await api.post('api/hrm/shift-work/timekeeper/config-checkin-ip/remove', { ip });

                    if (response.data.status === 1) {
                        notification.success({
                            message: 'Thành công',
                            description: 'Xóa IP thành công',
                            placement: 'topRight',
                        });
                        fetchIPList(); // Refresh IP list after deleting
                    } else {
                        notification.error({
                            message: 'Lỗi',
                            description: 'Không thể xóa IP',
                            placement: 'topRight',
                        });
                        message.error('Không thể xóa IP');
                    }
                } catch (error) {
                    notification.error({
                        message: 'Lỗi',
                        description: 'Lỗi khi xóa IP',
                        placement: 'topRight',
                    });
                    message.error('Lỗi khi xóa IP');
                }
            },
        });
    };
    /******  de05f6d0-a791-45b3-848c-58d2314b5629  *******/

    // Columns for the table
    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Địa chỉ IP',
            dataIndex: 'ip',
            key: 'ip',
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (text, record) => (
                <Button onClick={() => handleDeleteIP(record.ip)} danger>
                    Xóa
                </Button>
            ),
        },
    ];

    // Fetch IP data on component mount
    useEffect(() => {
        fetchIPList();
    }, []);

    return (
        <div className='m-3 mt-0'>
            <Button type="primary" onClick={showModal}>
                + Thêm IP
            </Button>

            <Table
                columns={columns}
                dataSource={ipData}
                loading={loading}
                rowKey="ip"
                pagination={false}
                style={{ marginTop: 20 }}
                locale={{
                    emptyText: <EmptyData />, // Thay đổi thông báo "No Data"
                }}
            />

            {/* Modal for adding new IP */}
            <Modal
                title="Thêm IP"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => {
                    form
                        .validateFields()
                        .then((values) => handleAddIP(values))
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="ip"
                        label="Địa chỉ IP"
                        initialValue={currentIP} // Sử dụng giá trị IP hiện tại
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ IP' }]}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Input value={currentIP} onChange={(e) => setCurrentIP(e.target.value)} style={{ flex: 1, marginRight: 10 }} />
                            <Button onClick={fetchCurrentIP} type="default" style={{ flexShrink: 0 }}>
                                Lấy IP hiện tại
                            </Button>
                        </div>
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default IPManagement;
