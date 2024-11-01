import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Modal, Button, Input, ColorPicker, TimePicker, DatePicker, notification } from 'antd';
import dayjs from 'dayjs';
import './HolidayCalendar.css';
import api from '../../../../../api';

const HolidayCalendar = () => {
    const [holidays, setHolidays] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedHoliday, setSelectedHoliday] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        color: '#27d3b1',
        timeBegin: null,
        timeEnd: null,
    });
    const [selectedYear, setSelectedYear] = useState(dayjs().year()); // Default to current year
    const [highlightedHoliday, setHighlightedHoliday] = useState(null);


    useEffect(() => {
        fetchHolidays();
    }, [selectedYear]); // Fetch holidays whenever the selected year changes


    const fetchHolidays = async () => {
        try {
            const startOfYear = dayjs(`${selectedYear}-06-06`).startOf('day').valueOf();
            const response = await api.post('/api/hrm/shift-work/holidays', { timeOfYear: startOfYear });
            if (response.data.data) {
                setHolidays(response.data.data);
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể tải danh sách ngày lễ'
            });
        }
    };

    const handleSaveHolidays = async (updatedHolidays) => {
        const sortedHolidays = [...updatedHolidays].sort((a, b) => a.timeBegin - b.timeBegin);

        try {
            const response = await api.post('/api/hrm/shift-work/shift-manager/holidays/set', {
                timeOfYear: dayjs(`${selectedYear}-06-06`).startOf('day').valueOf(),
                listHolidays: sortedHolidays
            });

            if (response.data && response.data.status === 1) {
                notification.success({
                    message: 'Thành công',
                    description: 'Cập nhật ngày lễ thành công',
                    placement: 'topRight'
                });
                fetchHolidays();
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể cập nhật ngày lễ',
                placement: 'topRight'
            });
        }
    };

    const handleDateClick = (date, holiday) => {
        setSelectedDate(date);
        setSelectedHoliday(holiday);
        setHighlightedHoliday(holiday); // Cập nhật ngày nghỉ được chọn để highlight

        if (holiday) {
            setFormData({
                name: holiday.name,
                color: holiday.color,
                timeBegin: dayjs(holiday.timeBegin),
                timeEnd: dayjs(holiday.timeEnd),
            });
        } else {
            const startOfDay = dayjs(date).startOf('day');
            setFormData({
                name: '',
                color: '#27d3b1',
                timeBegin: startOfDay.set('hour', 0).set('minute', 1),
                timeEnd: startOfDay.set('hour', 23).set('minute', 59),
            });
        }
        setIsModalOpen(true);
    };


    const handleSave = () => {
        if (!formData.name || !formData.timeBegin || !formData.timeEnd) {
            notification.warning({
                message: 'Cảnh báo',
                description: 'Vui lòng điền đầy đủ thông tin'
            });
            return;
        }

        const selectedDateStart = dayjs(selectedDate).startOf('day');
        const newHoliday = {
            name: formData.name,
            color: formData.color,
            timeBegin: selectedDateStart.hour(formData.timeBegin.hour()).minute(formData.timeBegin.minute()).valueOf(),
            timeEnd: selectedDateStart.hour(formData.timeEnd.hour()).minute(formData.timeEnd.minute()).valueOf(),
        };

        const duplicateHoliday = holidays.find(h => h.color === formData.color && h.timeBegin !== selectedHoliday?.timeBegin);

        if (duplicateHoliday) {
            const duplicateHolidayDate = dayjs(duplicateHoliday.timeBegin).format('DD/MM/YYYY');
            notification.warning({
                message: 'Màu trùng lặp',
                description: `Màu này đã được sử dụng cho ngày lễ: ${duplicateHoliday.name} (${duplicateHolidayDate})`
            });
            return;
        }

        const updatedHolidays = selectedHoliday
            ? holidays.map(h => h.timeBegin === selectedHoliday.timeBegin ? newHoliday : h)
            : [...holidays, newHoliday];

        handleSaveHolidays(updatedHolidays).then(() => {
            setIsModalOpen(false); // Close modal after successful save
            setHighlightedHoliday(null);
            fetchHolidays(); // Fetch updated holidays to refresh UI
        });
    };

    const handleDelete = () => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa ngày lễ này không?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: () => {
                const updatedHolidays = holidays.filter(h => h.timeBegin !== selectedHoliday.timeBegin);
                handleSaveHolidays(updatedHolidays).then(() => {
                    setIsModalOpen(false); // Close modal after successful delete
                    setHighlightedHoliday(null);
                    fetchHolidays(); // Fetch updated holidays to refresh UI
                });
            }
        });
    };

    const renderCalendarGrid = (monthIndex) => {
        const currentYear = selectedYear; // Use selected year instead of current year
        const firstDay = new Date(currentYear, monthIndex, 1);
        const lastDay = new Date(currentYear, monthIndex + 1, 0);
        const days = Array.from({ length: lastDay.getDate() }, (_, i) => new Date(currentYear, monthIndex, i + 1));
        const prefixDays = Array(firstDay.getDay()).fill(null);
        const allDays = [...prefixDays, ...days];

        while (allDays.length % 7 !== 0) {
            allDays.push(null);
        }

        return allDays;
    };

    const getHolidayForDate = (date) => {
        return date && holidays.find(holiday => {
            const holidayDate = new Date(holiday.timeBegin);
            return date.getDate() === holidayDate.getDate() &&
                date.getMonth() === holidayDate.getMonth() &&
                date.getFullYear() === holidayDate.getFullYear();
        });
    };

    const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

    // Tạo mảng chứa các nhóm tháng, mỗi nhóm 3 tháng
    const monthGroups = Array.from({ length: 4 }, (_, i) => monthNames.slice(i * 3, (i + 1) * 3));

    const formatDate = (date) => {
        return dayjs(date).format('DD/MM/YYYY');
    };


    return (
        <Container fluid>
            <Row style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                <Col md={9}>
                    {monthGroups.map((group, groupIndex) => (
                        <Row key={groupIndex} className="mb-4">
                            {group.map((monthName, index) => (
                                <Col md={4} key={index} className="mb-4">
                                    <Card>
                                        <Card.Header className="text-center fw-bold bg-primary text-white py-2">
                                            {monthName}
                                        </Card.Header>
                                        <Card.Body>
                                            <div className="d-grid" style={{
                                                gridTemplateColumns: 'repeat(7, 1fr)',
                                                gap: '2px',
                                            }}>
                                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                                                    <div key={day} className="text-center fw-bold small py-1">
                                                        {day}
                                                    </div>
                                                ))}
                                                {renderCalendarGrid(groupIndex * 3 + index).map((day, dayIndex) => {
                                                    const holiday = getHolidayForDate(day);
                                                    return (
                                                        <div
                                                            key={dayIndex}
                                                            onClick={() => day && handleDateClick(day, holiday)}
                                                            className={`text-center p-1 rounded-circle ${!day ? 'text-muted' : ''} 
                                                            ${day && !holiday ? 'non-holiday' : ''} ${holiday ? 'text-white' : ''}`}
                                                            style={{
                                                                backgroundColor: holiday ? holiday.color : 'transparent',
                                                                cursor: day ? 'pointer' : 'not-allowed',
                                                            }}
                                                            title={holiday ? `${holiday.name} (${dayjs(holiday.timeBegin).format('HH:mm')} - ${dayjs(holiday.timeEnd).format('HH:mm')})` : ''}
                                                        >
                                                            {day?.getDate()}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ))}
                </Col>

                <Col md={3}>
                    <Card className="sticky-top">
                        <Card.Header className="bg-primary text-white">
                            <div className="d-flex align-items-center justify-content-center mb-0">
                                <h5 className="me-2">Năm</h5>
                                <DatePicker
                                    picker="year"
                                    value={dayjs(`${selectedYear}`)}
                                    onChange={(date) => setSelectedYear(date.year())} // Update selected year
                                    style={{ width: '100%', marginBottom: '8px' }}
                                    allowClear={false}
                                />
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex flex-column gap-3" style={{ maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
                                {holidays.map((holiday, index) => (
                                    <div
                                        key={index}
                                        className={`d-flex align-items-center holiday-legend ps-3 pe-3 ${highlightedHoliday?.timeBegin === holiday.timeBegin ? 'highlight' : ''}`} // Thêm lớp highlight khi ngày nghỉ được chọn
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleDateClick(new Date(holiday.timeBegin), holiday)}
                                    >
                                        <div
                                            className="rounded me-2"
                                            style={{
                                                backgroundColor: holiday.color,
                                                width: '20px',
                                                height: '20px',
                                                border: highlightedHoliday?.timeBegin === holiday.timeBegin ? '2px solid black' : 'none' // Thêm viền đen cho ngày nghỉ được chọn
                                            }}
                                        />
                                        <div className="d-flex flex-column">
                                            <span className="fw-bold">{holiday.name}</span>
                                            <small className="text-muted">
                                                {dayjs(holiday.timeBegin).format('DD/MM/YYYY')}
                                            </small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>

                    </Card>
                </Col>
            </Row>

            {/* Modal remains unchanged */}
            <Modal
                title={
                    <div className="d-flex justify-content-between align-items-center">
                        <span>{selectedHoliday ? `${selectedHoliday.name}` : 'Thêm ngày lễ mới'}</span>
                        <span className="text-primary me-5">{selectedDate && formatDate(selectedDate)}</span>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setHighlightedHoliday(null);
                }}
                footer={[
                    selectedHoliday && (
                        <Button key="delete" danger onClick={handleDelete}>
                            Xóa
                        </Button>
                    ),
                    <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleSave}>
                        {selectedHoliday ? 'Cập nhật' : 'Thêm'}
                    </Button>,
                ]}
            >
                <div className="mb-4">
                    <label className="form-label">Tên ngày lễ</label>
                    <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nhập tên ngày lễ"
                    />
                </div>

                <div className="mb-4">
                    <label className="form-label">Màu sắc</label>
                    <ColorPicker
                        value={formData.color}
                        onChange={(color) => setFormData({ ...formData, color: color.toHexString() })}
                        presets={[{
                            label: 'Màu đề xuất',
                            colors: ['#F5222D', '#FA8C16', '#FADB14', '#52C41A', '#1890FF', '#722ED1', '#EB2F96', '#595959'],
                        }]}
                        className="w-100"
                        colorBlock={true}
                    />
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Thời gian bắt đầu</label>
                        <TimePicker
                            value={formData.timeBegin}
                            onChange={(time) => setFormData({ ...formData, timeBegin: time })}
                            format="HH:mm"
                            className="w-100"
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Thời gian kết thúc</label>
                        <TimePicker
                            value={formData.timeEnd}
                            onChange={(time) => setFormData({ ...formData, timeEnd: time })}
                            format="HH:mm"
                            className="w-100"
                        />
                    </div>
                </div>
            </Modal>
        </Container>
    );
};

export default HolidayCalendar;