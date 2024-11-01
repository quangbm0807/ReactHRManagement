import React from 'react';
import { Button, Upload, notification } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import API_DOMAIN from '../../../api/API_URL/API_URL';
import api from '../../../api';

const ImportPayroll = ({ thangHienTai, tinhGioCongColumns }) => {
    const processExcelFile = async (file) => {
        const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';

        if (!isExcel) {
            notification.error({
                message: 'Định dạng không hợp lệ',
                description: 'Vui lòng chọn file Excel có định dạng .xlsx hoặc .xls.',
            });
            return false;
        }

        try {
            const reader = new FileReader();
            const key = 'import-loading';
            notification.info({
                message: 'Đang xử lý file...',
                description: 'Vui lòng chờ trong giây lát.',
                key,
                duration: 0,
            });

            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length < 2) {
                    notification.error({
                        message: 'File Excel không hợp lệ',
                        description: 'File không chứa đủ dữ liệu để xử lý.',
                    });
                    notification.close(key);
                    return;
                }

                const headerRow = jsonData[0];

                // Kiểm tra cột Mã nhân viên
                const employeeIdIndex = headerRow.findIndex(cell => cell === 'Mã nhân viên');
                if (employeeIdIndex === -1) {
                    notification.error({
                        message: 'Thiếu cột bắt buộc',
                        description: 'File Excel không chứa cột "Mã nhân viên".',
                    });
                    notification.close(key);
                    return;
                }

                // Map tất cả các cột (trừ Mã nhân viên)
                const columnIndices = headerRow.reduce((acc, title, index) => {
                    if (title && title !== 'Mã nhân viên') {
                        acc[title] = index;
                    }
                    return acc;
                }, {});

                // Xử lý từng dòng dữ liệu
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    const employeeId = row[employeeIdIndex];

                    if (!employeeId) continue;

                    const payrollData = [];

                    // Thêm dữ liệu cho tất cả các cột
                    Object.entries(columnIndices).forEach(([title, index]) => {
                        const value = row[index];
                        if (value !== undefined) {
                            // Nếu là cột số, chuyển đổi sang số
                            const numValue = parseFloat(value);
                            payrollData.push([title, isNaN(numValue) ? value : numValue]);
                        }
                    });

                    const file = new File(
                        [JSON.stringify(payrollData)],
                        `payroll-data-${employeeId}.json`,
                        { type: 'application/json' }
                    );

                    const formData = new FormData();
                    formData.append('file', file);

                    try {
                        notification.info({
                            message: `Đang xử lý phiếu lương cho nhân viên ${employeeId}`,
                            key,
                            duration: 0,
                        });

                        const response = await api.post(
                            `api/administrative/payroll-clerk/set-payslip?timeOfMonth=${thangHienTai.valueOf()}&employeeID=${employeeId}`,
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data', // Đảm bảo rằng bạn gửi dữ liệu dưới dạng multipart
                                },
                            }
                        );

                        if (response.status !== 200) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                    } catch (error) {
                        notification.error({
                            message: `Lỗi cập nhật lương cho nhân viên ${employeeId}`,
                            description: error.message,
                        });
                    }
                }

                notification.success({
                    message: 'Đã hoàn tất',
                    description: 'Đã hoàn tất nhập phiếu lương.',
                    key,
                });
            };

            reader.readAsArrayBuffer(file);
            return false;
        } catch (error) {
            console.error('Excel processing error:', error);
            notification.error({
                message: 'Lỗi xử lý file',
                description: `Lỗi: ${error.message}`,
            });
            return false;
        }
    };

    return (
        <Upload
            accept=".xlsx,.xls"
            showUploadList={false}
            beforeUpload={processExcelFile}
        >
            <Button
                icon={<UploadOutlined />}
                style={{ fontSize: '16px', padding: '10px 20px' }}
            >
                Nhập phiếu lương
            </Button>
        </Upload>
    );
};

export default ImportPayroll;