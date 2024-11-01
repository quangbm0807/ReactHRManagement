import React, { useState, useEffect } from 'react';
import { Modal, Table, Spin, message } from 'antd';
import api from '../../../api';
import EmptyData from '../../Ultils/EmptyData/EmptyData';

const PayrollModal = ({ visible, onClose, employeeId, employeeName, month }) => {
    const [loading, setLoading] = useState(false);
    const [payrollData, setPayrollData] = useState([]);

    const parseMultipartResponse = (text) => {
        try {
            const startMarker = 'Content-Type: application/json';
            const endMarker = '------WebKitFormBoundary';

            const startIndex = text.indexOf(startMarker);
            if (startIndex === -1) {
                throw new Error('Could not find start of JSON content');
            }

            const contentStart = startIndex + startMarker.length;
            const endIndex = text.indexOf(endMarker, contentStart);
            const jsonContent = text.substring(contentStart, endIndex !== -1 ? endIndex : undefined).trim();

            // Clean up the content and parse it
            const cleanJson = jsonContent
                .replace(/\[[\r\n\s]+\[/g, '[[')  // Clean up nested array formatting
                .replace(/\][\r\n\s]+\]/g, ']]')   // Clean up nested array formatting
                .replace(/\r\n/g, '')              // Remove newlines
                .trim();                           // Remove extra whitespace
            return JSON.parse(cleanJson);
        } catch (error) {
            console.error('Error parsing response:', error, '\nResponse text:', text);
            throw error;
        }
    };

    const fetchPayrollData = async () => {
        setLoading(true);
        try {
            const response = await api.post(
                'api/administrative/payroll-clerk/get-payslip',
                {
                    timeOfMonth: month.valueOf(),
                    employeeID: employeeId
                },
                {
                    headers: {
                    },
                }
            );
            // Giả sử bạn có một hàm parseMultipartResponse tương tự
            const data = parseMultipartResponse(response.data); // Sử dụng response.data từ axios

            // Chuyển đổi mảng các mảng thành mảng các đối tượng
            const formattedData = data.map(([key, value]) => ({
                key,
                value: typeof value === 'number' ? value.toFixed(2) : value
            }));

            setPayrollData(formattedData);
        } catch (error) {
            console.error('Error fetching payroll data:', error);
            message.error('Không thể tải dữ liệu bảng lương: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible && employeeId) {
            fetchPayrollData();
        } else {
            setPayrollData([]); // Clear data when modal is closed
        }
    }, [visible, employeeId, month]);

    const columns = [
        {
            title: 'Mục',
            dataIndex: 'key',
            key: 'key',
            render: (text) => {
                const labelMap = {
                    'gioLam': 'Giờ làm',
                    'buoiLam': 'Buổi làm',
                    'gioTre': 'Giờ trễ',
                    'buoiTre': 'Buổi trễ',
                    'gioOT': 'Giờ OT',
                    'buoiOT': 'Buổi OT',
                    'luongGio': 'Lương giờ',
                    'luongOT': 'Lương OT',
                    'truTre': 'Trừ trễ',
                    'tongCong': 'Tổng cộng'
                };
                return labelMap[text] || text;
            },
            align: 'center'
        },
        {
            title: 'Giá trị',
            dataIndex: 'value',
            key: 'value',
            align: 'center',
            render: (value) => {
                // Format large numbers with commas
                if (typeof value === 'string' && !isNaN(value)) {
                    return Number(value).toLocaleString('vi-VN');
                }
                return value;
            }
        }
    ];
    return (
        <Modal
            title={<span style={{ display: 'flex', justifyContent: 'space-between' }}>{`Bảng lương tháng ${month.format('MM/YYYY')}`} <span style={{ marginLeft: 'auto', marginRight: '15px' }}>{`Nhân viên ${employeeName}`}</span></span>}
            open={visible}
            onCancel={onClose}
            footer={null}
        >
            <Spin spinning={loading}>
                {payrollData.length > 0 ? (
                    <Table
                        dataSource={payrollData}
                        columns={columns}
                        pagination={false}
                        bordered
                        locale={{
                            emptyText: <EmptyData />, // Thay đổi thông báo "No Data"
                        }}
                    />
                ) : !loading && (
                    <EmptyData />
                )}
            </Spin>
        </Modal>
    );
};

export default PayrollModal;