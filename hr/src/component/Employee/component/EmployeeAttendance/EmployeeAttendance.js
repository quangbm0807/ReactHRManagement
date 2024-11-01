import React, { useState, useEffect, useRef } from 'react';
import { Layout, Tabs, Button, Form, Input, Table, Modal, Radio, message, Upload, DatePicker, Col, Row, notification } from 'antd';
import { LoadingOutlined, PlusOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import './EmployeeAttendance.css';
import AvatarUpload from './AvatarUpload';
import API_DOMAIN from '../../../../api/API_URL/API_URL';
import api from '../../../../api';
import EmptyData from '../../../Ultils/EmptyData/EmptyData';
const { TabPane } = Tabs;
const EmployeeAttendance = () => {
    const [employee, setEmployee] = useState(null);
    const [workHistoryData, setWorkHistoryData] = useState([]);
    const [currentAction, setCurrentAction] = useState('');
    const [overlappingShifts, setOverlappingShifts] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [highlightToday, setHighlightToday] = useState(false);
    const tokenEmployee = localStorage.getItem("key-employee");
    const [activeTab, setActiveTab] = useState('1'); // Add this new state
    const tableRef = useRef(null);

    dayjs.locale('vi');

    useEffect(() => {
        fillEmployeeForm();
        if (employee?.avatarID) {
            setImageUrl(`${API_DOMAIN}global/employee/avatar?employeeID=${employee.employeeID}`);
        }
    }, [employee?.avatarID]);

    const fetchWorkHistory = async () => {
        setLoading(true);
        try {
            const response = await api.post('api/hrm/shift-work/my-timesheet', {
                timeOfMonth: selectedMonth.valueOf()
            });

            if (response.data.status === 1) {
                const processedData = processWorkSchedule(response.data.data.sort((a, b) => a.timeBegin - b.timeBegin));
                setWorkHistoryData(processedData);
            }
        } catch (error) {
            console.error('Lỗi:', error);
            message.error('Đã xảy ra lỗi khi lấy lịch sử làm việc');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchWorkHistory();
    }, [selectedMonth, tokenEmployee]);



    const fillEmployeeForm = () => {
        const storedEmployee = JSON.parse(localStorage.getItem("employee"));
        if (storedEmployee !== null && typeof storedEmployee === 'object') {
            setEmployee(storedEmployee);
        } else {
            console.error("Không tìm thấy dữ liệu nhân viên trong localStorage.");
        }
    };


    const getStatusText = (status) => {
        return status === 1 ? "Hoạt động" : status === 2 ? "Tạm vắng" : "Chưa xác định";
    };

    const formatDate = (timestamp) => {
        if (!timestamp || timestamp === 0) return '';
        return dayjs(parseInt(timestamp)).format('DD-MM');
    };

    const formatSalary = (salary, type) => {
        if (salary !== undefined && salary !== null) {
            let formattedSalary = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: salary % 1 === 0 ? 0 : 3,
                maximumFractionDigits: salary % 1 === 0 ? 0 : 3,
            }).format(salary);

            return type === 1 ? `${formattedSalary}/giờ` : `${formattedSalary}/tháng`;
        } else {
            return 'Không có';
        }
    };

    const handleCheckInOut = async (action) => {
        setCurrentAction(action);
        try {
            const response = await api.post(`api/hrm/shift-work/${action}`, {});

            if (response.data.status === 1) {
                fetchWorkHistory();
                notification.success({
                    key: 'checkin',
                    message: 'Thành công',
                    description: `${action === 'checkin' ? 'Check-In' : 'Check-Out'} thành công!`
                });

                // Switch to history tab
                setActiveTab('2');

                // Wait for the tab switch and data to load, then scroll to today
                setTimeout(() => {
                    scrollToToday();
                }, 500);
            } else {
                console.error('Lỗi:', response.data.data);
                notification.error({
                    message: 'Lỗi',
                    description: response.data.data || 'Đã xảy ra lỗi'
                });
            }
        } catch (error) {
            console.error('Lỗi:', error);
        }
    };




    const handleShiftSelection = async (rowID) => {
        const endpoint = currentAction === 'checkin' ? 'api/hrm/shift-work/checkin-at-shift' : 'api/hrm/shift-work/checkout-at-shift';
        try {
            const response = await axios.post(
                API_DOMAIN + endpoint,
                { rowID: parseInt(rowID) },
                { headers: { 'Content-Type': 'application/json', 'token-employee': tokenEmployee } }
            );
            if (response.data.status === 1) {
                notification.success({
                    message: 'Thành công',
                    description: `${currentAction === 'checkin' ? 'Check-In' : 'Check-Out'} thành công!`
                });

                // Switch to history tab and scroll to today
                setActiveTab('2');
                setTimeout(() => {
                    scrollToToday();
                }, 500);
            } else {
                console.error('Lỗi:', response.data.data);
                notification.error({
                    message: 'Lỗi',
                    description: response.data.data || 'Đã xảy ra lỗi'
                });
            }
            setIsModalVisible(false);
        } catch (error) {
            console.error('Lỗi:', error);
            notification.error({
                message: 'Lỗi',
                description: 'Đã xảy ra lỗi khi thực hiện thao tác'
            });
        }
    };



    const scrollToToday = () => {
        const today = dayjs().format('DD-MM');
        const table = document.querySelector('.attendance-table');
        const tableBody = table?.querySelector('.ant-table-content');
        const tableHead = table?.querySelector('.ant-table-thead');
        const tableCells = tableHead?.querySelectorAll('.ant-table-cell');
        const todayCell = Array.from(tableCells).find(cell =>
            cell.classList.contains('today-column') && cell.innerText.includes(today)
        );

        const todayCellIndex = Array.from(tableCells).indexOf(todayCell);

        if (todayCell && tableBody) {
            const cellWidth = todayCell.offsetWidth;
            const scrollLeft = cellWidth * (todayCellIndex - 2);
            tableBody.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });

            setHighlightToday(true);
            setTimeout(() => setHighlightToday(false), 2000);
        }
    };


    const processWorkSchedule = (data) => {
        const shiftsByDate = {};
        const allShiftNames = new Set();
        const today = dayjs().format('DD-MM');

        // Process data to organize shifts
        data.forEach(shift => {
            const date = dayjs(shift.timeBegin);
            const dateKey = date.format('DD-MM');
            if (!shiftsByDate[dateKey]) {
                shiftsByDate[dateKey] = {};
            }
            if (!shiftsByDate[dateKey][shift.shiftName]) {
                shiftsByDate[dateKey][shift.shiftName] = [];
            }
            shiftsByDate[dateKey][shift.shiftName].push(shift);
            allShiftNames.add(shift.shiftName);
        });

        // Create columns with enhanced styling
        const columns = [
            {
                title: 'Ca làm việc',
                dataIndex: 'shiftName',
                key: 'shiftName',
                fixed: 'left',
                width: 100,
            },
            ...Object.keys(shiftsByDate).map(dateKey => ({
                title: (
                    <div
                        data-date={dateKey}
                        className={`date-column ${dateKey === today && highlightToday ? 'highlight-column' : ''}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '8px',
                            backgroundColor: dateKey === today ? '#add8e6' : 'transparent',
                            transition: 'background-color 0.3s ease'
                        }}
                    >
                        <span>{`${dateKey} (Thứ ${parseInt(dayjs(dateKey, 'DD-MM').format('d')) + 1})`}</span>

                        {dateKey === today && (
                            <CalendarOutlined style={{ color: '#1890ff' }} />
                        )}
                    </div>
                ),
                dataIndex: dateKey,
                key: dateKey,
                render: (shifts) => renderShifts(shifts, dateKey),
                width: 200,
                className: dateKey === today ? 'today-column' : '',
            })),
        ];

        // Create data source
        const dataSource = Array.from(allShiftNames).map(shiftName => {
            const row = { shiftName };
            Object.keys(shiftsByDate).forEach(dateKey => {
                row[dateKey] = shiftsByDate[dateKey][shiftName] || [];
            });
            return row;
        });

        return { columns, dataSource };
    };
    const renderShifts = (shifts, dateKey) => {
        if (!shifts || shifts.length === 0) {
            return <div style={getCellStyle('empty', dateKey)}>Không có ca làm</div>;
        }

        return shifts.map((shift, index) => {
            const cellStyle = getCellStyle(shift, dateKey);
            return (
                <div className='p-5' key={index} style={{ ...cellStyle, borderBottom: index < shifts.length - 1 ? '1px solid #ddd' : 'none', padding: '12px' }}>
                    <div>Thời gian: {formatTime(shift.timeBegin)} - {formatTime(shift.timeEnd)}</div>
                    <div>Hệ số lương: {shift.coefficientsSalary}</div>
                    <div>Thưởng: {shift.bonus}</div>
                    <div>Check-In: {shift.timeCheckIn ? formatTime(shift.timeCheckIn) : 'Vắng mặt'}</div>
                    <div>Check-Out: {shift.timeCheckOut ? formatTime(shift.timeCheckOut) : 'Vắng mặt'}</div>
                </div>
            );
        });
    };

    const getCellStyle = (shift, dateKey) => {
        const currentDate = dayjs().format('DD-MM');
        const cellDate = dateKey;

        if (dayjs(cellDate, 'DD-MM').isAfter(dayjs(currentDate, 'DD-MM'))) {
            return { backgroundColor: '#ddd', width: '300px' }; // Xám cho ngày trong tương lai
        }

        if (shift === 'empty') {
            return { backgroundColor: '#ffcccb', width: '300px' }; // Đỏ nhạt cho không có ca làm
        }

        if (!shift.timeCheckIn && !shift.timeCheckOut) {
            return { backgroundColor: '#ff0000', width: '300px' }; // Đỏ cho không Check-In và ra
        }

        if (!shift.timeCheckIn || !shift.timeCheckOut) {
            return { backgroundColor: '#ffc0cb', width: '300px' }; // Hồng cho thiếu Check-In hoặc ra
        }

        const isEarlyCheckIn = dayjs(shift.timeCheckIn).subtract(1, 'minute').isBefore(dayjs(shift.timeBegin));
        const isLateCheckOut = dayjs(shift.timeCheckOut).isAfter(dayjs(shift.timeEnd));
        const isLateCheckIn = dayjs(shift.timeCheckIn).subtract(1, 'minute').isAfter(dayjs(shift.timeBegin));
        const isEarlyCheckOut = dayjs(shift.timeCheckOut).isBefore(dayjs(shift.timeEnd));

        if (isEarlyCheckIn && isLateCheckOut) {
            return { backgroundColor: '#90EE90', width: '300px' }; // Xanh lá cây nhạt cho Check-In sớm và ra muộn
        }

        if (isLateCheckIn || isEarlyCheckOut) {
            return { backgroundColor: '#FFFFE0', width: '300px' }; // Vàng nhạt cho Check-In muộn hoặc ra sớm
        }

        return { width: '300px' }; // Kiểu mặc định
    };

    const formatTime = (timestamp) => {
        if (timestamp === 0) return '';
        return dayjs(timestamp).format('HH:mm');
    };

    const updateNameAvatar = async () => {
        try {
            const response = await axios.post(
                `${API_DOMAIN}api/employee/update-nickname`,
                { nickname: employee.nickname },
                { headers: { 'Content-Type': 'application/json', 'token-employee': tokenEmployee } }
            );
            if (response.data.status === 1) {
                notification.success({
                    message: 'Thành công',
                    description: 'Cập nhật thông tin nhân viên thành công'
                });
                let updatedEmployee = { ...employee, nickname: employee.nickname };
                localStorage.setItem("employee", JSON.stringify(updatedEmployee));
                setEmployee(updatedEmployee);
            } else {
                console.error('Lỗi cập nhật thông tin nhân viên:', response.data.message);
                notification.error({
                    message: 'Lỗi',
                    description: 'Lỗi cập nhật thông tin nhân viên'
                });
            }
        } catch (error) {
            console.error('Lỗi:', error);
            notification.error({
                message: 'Lỗi',
                description: 'Đã xảy ra lỗi khi cập nhật thông tin nhân viên'
            });
        }
    };


    const updateAvatar = async (info) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            setLoading(false);
            notification.success({
                message: 'Thành công',
                description: `Tải lên tệp ${info.file.name} thành công`
            });
            let updatedEmployee = { ...employee, avatarID: info.file.response.avatarID };
            localStorage.setItem("employee", JSON.stringify(updatedEmployee));
            setEmployee(updatedEmployee);
            setImageUrl(`${API_DOMAIN}/global/employee/avatar?employeeID=${updatedEmployee.employeeID}&timestamp=${new Date().getTime()}`);
        } else if (info.file.status === 'error') {
            setLoading(false);
            notification.error({
                message: 'Lỗi',
                description: `Tải lên tệp ${info.file.name} thất bại`
            });
        }
    };
    const handleMonthChange = (date) => {
        setSelectedMonth(date);
    };
    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Tải lên</div>
        </div>
    );
    return (
        <div className="card">
            <div className="m-3">
                <h1 className="page-title">Thông tin nhân viên</h1>
                <Row gutter={[16, 16]} className="action-buttons">
                    <Col xs={24} md={12}>
                        <Button
                            type="primary"
                            block
                            size="large"
                            onClick={() => handleCheckInOut('checkin')}
                            className="checkin-button"
                        >
                            Check-In
                        </Button>
                    </Col>
                    <Col xs={24} md={12}>
                        <Button
                            type="primary"
                            block
                            size="large"
                            onClick={() => handleCheckInOut('checkout')}
                            className="checkout-button"
                        >
                            Check-Out
                        </Button>
                    </Col>
                </Row>

                <Tabs
                    size='large'
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    className="custom-tabs"
                >
                    <TabPane tab="Thông tin cá nhân" key="1">
                        <div className="tab-inner-content">
                            <Row gutter={[24, 24]}>
                                <Col xs={24} md={12}>
                                    <Form layout="vertical">
                                        <Form.Item label="Mã nhân viên">
                                            <Input value={employee?.employeeID} disabled />
                                        </Form.Item>
                                        <Form.Item label="Trạng thái">
                                            <Input value={getStatusText(employee?.status)} disabled />
                                        </Form.Item>
                                        <Form.Item label="Ngày vào làm">
                                            <Input value={dayjs(employee?.startTime).format('DD/MM/YYYY')} disabled />
                                        </Form.Item>
                                        <Form.Item label="Lương">
                                            <Input value={formatSalary(employee?.salaryValue, employee?.salaryType)} disabled />
                                        </Form.Item>
                                    </Form>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form layout="vertical">
                                        <Form.Item label="Số điện thoại">
                                            <Input value={employee?.phonenumber ? '0' + employee.phonenumber : ''} disabled />
                                        </Form.Item>
                                        <Form.Item label="Ngày sinh">
                                            <Input value={formatDate(employee?.birth)} disabled />
                                        </Form.Item>
                                        <Form.Item label="Email">
                                            <Input value={employee?.email} disabled />
                                        </Form.Item>
                                        <Form.Item label="Biệt danh">
                                            <Input
                                                value={employee?.nickname}
                                                onChange={(e) => setEmployee({ ...employee, nickname: e.target.value })}
                                            />
                                        </Form.Item>
                                        <Form.Item label="Ảnh đại diện">
                                            <AvatarUpload
                                                employeeID={employee?.employeeID}
                                                tokenEmployee={tokenEmployee}
                                            />
                                        </Form.Item>
                                        <Form.Item>
                                            <Button onClick={updateNameAvatar}>Cập nhật</Button>
                                        </Form.Item>
                                    </Form>
                                </Col>
                            </Row>
                        </div>
                    </TabPane>
                    <TabPane tab="Lịch sử làm việc" key="2">
                        <div className="tab-inner-content">
                            <Row gutter={[16, 16]} className="history-controls">
                                <Col xs={24} sm={8} md={6}>
                                    <DatePicker.MonthPicker
                                        value={selectedMonth}
                                        onChange={handleMonthChange}
                                        size="large"
                                        className="month-picker"
                                    />
                                </Col>
                                <Col xs={12} sm={8} md={6}>
                                    <Button
                                        onClick={scrollToToday}
                                        type="default"
                                        size="large"
                                        icon={<CalendarOutlined />}
                                        block
                                    >
                                        Hôm nay
                                    </Button>
                                </Col>
                            </Row>
                            <div className="legend-container">
                                <div className="legend-item">
                                    <span className="legend-color" style={{ backgroundColor: '#90EE90' }}></span>
                                    <span>Check-In sớm và Check-Out muộn</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color" style={{ backgroundColor: '#FFFFE0' }}></span>
                                    <span>Check-In muộn hoặc Check-Out sớm</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color" style={{ backgroundColor: '#ffc0cb' }}></span>
                                    <span>Thiếu Check-In hoặc Check-Out</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color" style={{ backgroundColor: '#ff0000' }}></span>
                                    <span>Không Check-In và Check-Out</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color" style={{ backgroundColor: '#ddd' }}></span>
                                    <span>Ngày trong tương lai</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color" style={{ backgroundColor: '#add8e6' }}></span>
                                    <span>Ngày hôm nay</span>
                                </div>
                            </div>

                            <div className="table-container" ref={tableRef}>
                                {workHistoryData.columns && (
                                    <Table
                                        columns={workHistoryData.columns}
                                        dataSource={workHistoryData.dataSource}
                                        scroll={{ x: 'max-content' }}
                                        pagination={false}
                                        bordered
                                        className="attendance-table"
                                        locale={{
                                            emptyText: <EmptyData />, // Thay đổi thông báo "No Data"
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </TabPane>
                </Tabs>

                <Modal
                    title="Ca làm việc chồng chéo"
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                    className="shift-modal"
                >
                    <Radio.Group onChange={(e) => handleShiftSelection(e.target.value)}>
                        {overlappingShifts.map((shift, index) => (
                            <Radio key={shift.rowID} value={shift.rowID}>
                                Ca {index + 1}: {formatTime(shift.timeBegin)} - {formatTime(shift.timeEnd)}
                            </Radio>
                        ))}
                    </Radio.Group>
                </Modal>
            </div>

        </div>
    );
};

export default EmployeeAttendance;