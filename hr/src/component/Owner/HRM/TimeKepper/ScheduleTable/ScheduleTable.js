import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, notification, TimePicker } from 'antd';
import dayjs from 'dayjs';
import { EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import api from '../../../../../api';
import EmptyData from '../../../../Ultils/EmptyData/EmptyData';

const { confirm } = Modal;

const ScheduleTemplate = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingShift, setEditingShift] = useState(null);
  const [form] = Form.useForm();


  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchScheduleData = async () => {
    try {
      const response = await api.post(`api/hrm/shift-work/work-schedule`);
      if (response.data.status === 1) {
        return response.data.data || [];
      } else {
        throw new Error('Failed to fetch schedule data');
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải dữ liệu lịch làm việc',

      });
      return null;
    }
  };

  const updateSchedule = async (scheduleData) => {
    try {
      const response = await api.post('/api/hrm/shift-work/shift-manager/work-schedule/edit', scheduleData);

      if (response.data && response.data.status === 1) {
        return true;
      } else {
        throw new Error(`Failed to update schedule: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  };

  const fetchSchedule = async () => {
    const data = await fetchScheduleData();
    if (data) {
      setScheduleData(data);
    }
  };

  const msToTime = (ms) => {
    return dayjs().startOf('day').add(ms, 'millisecond');
  };

  const timeToMs = (time) => {
    return time ? time.diff(dayjs().startOf('day'), 'millisecond') : null;
  };

  const columns = [
    {
      title: <div style={{ textAlign: 'center' }}>Ca Làm Việc</div>,
      dataIndex: 'shiftName',
      key: 'shiftName',
      render: (text, record, index) => (
        <div style={{ textAlign: 'center' }}>
          <span>{text}</span><br />
          <span>Check-in: -{(record.maxEarly / 3600000).toFixed(2)} giờ</span><br />
          <span>Check-out: +{(record.maxLate / 3600000).toFixed(2)} giờ</span><br />
          <Button size="large" icon={<EditOutlined />} onClick={() => openEditShiftModal(index)}>Chỉnh sửa</Button>
        </div>
      ),
    },
    ...['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'].map((day, index) => ({
      title: <div style={{ textAlign: 'center' }}>{day}</div>,
      dataIndex: `list${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]}`,
      key: `list${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]}`,
      render: (slots, record, shiftIndex) => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          {slots && slots.map((slot, slotIndex) => (
            <div key={slotIndex}>
              <Button
                size='large'
                className='m-1'
                color="primary"
                variant="outlined"
                onClick={() => openEditModal(shiftIndex, `list${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]}`, slotIndex)}
              >
                {msToTime(slot.timeBegin).format('HH:mm')} - {msToTime(slot.timeEnd).format('HH:mm')}
              </Button>
            </div>
          ))}
          <div>
            <Button
              className='m-1'
              type="dashed"
              onClick={() => openAddSlotModal(shiftIndex, `list${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]}`)}
            >
              ➕
            </Button>
          </div>
        </div>
      ),
    })),
  ];

  const openEditShiftModal = (shiftIndex) => {
    const shift = scheduleData[shiftIndex];
    setEditingShift({ ...shift, index: shiftIndex });
    setModalType('editShift');
    form.setFieldsValue({
      shiftName: shift.shiftName,
      maxEarly: (shift.maxEarly / 3600000).toFixed(2),
      maxLate: (shift.maxLate / 3600000).toFixed(2),
    });
    setIsModalVisible(true);
  };

  const openEditModal = (shiftIndex, dayKey, slotIndex) => {
    const shift = scheduleData[shiftIndex];
    const slot = shift[dayKey][slotIndex];
    setEditingShift({ shiftIndex, dayKey, slotIndex });
    setModalType('editSlot');
    form.setFieldsValue({
      timeBegin: msToTime(slot.timeBegin),
      timeEnd: msToTime(slot.timeEnd),
      coefficientsSalary: slot.coefficientsSalary,
      bonus: slot.bonus,
    });
    setIsModalVisible(true);
  };

  const openAddSlotModal = (shiftIndex, dayKey) => {
    setEditingShift({ shiftIndex, dayKey, slotIndex: -1 });
    setModalType('addSlot');
    form.resetFields();
    form.setFieldsValue({
      coefficientsSalary: 1,
      bonus: 0,
    });
    setIsModalVisible(true);
  };

  const showDeleteConfirm = (type) => {
    confirm({
      title: type === 'shift' ? 'Xác nhận xóa ca làm việc?' : 'Xác nhận xóa khung giờ?',
      icon: <ExclamationCircleOutlined />,
      content: type === 'shift'
        ? 'Bạn có chắc chắn muốn xóa ca làm việc này? Hành động này không thể hoàn tác.'
        : 'Bạn có chắc chắn muốn xóa khung giờ này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        return type === 'shift' ? handleDeleteShift() : handleDeleteSlot();
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (modalType === 'editShift' || modalType === 'newShift') {
        const updatedShift = {
          shiftName: values.shiftName,
          maxEarly: values.maxEarly * 3600000,
          maxLate: values.maxLate * 3600000,
        };

        if (modalType === 'editShift') {
          await updateSchedule({
            index: editingShift.index,
            workSchedule: { ...editingShift, ...updatedShift },
          });
          notification.success({
            message: 'Thành công',
            description: 'Cập nhật ca làm việc thành công',

          });
        } else {
          await addNewShift(updatedShift);
          notification.success({
            message: 'Thành công',
            description: 'Thêm ca làm việc mới thành công',

          });
        }
      } else if (modalType === 'editSlot' || modalType === 'addSlot') {
        const { shiftIndex, dayKey, slotIndex } = editingShift;
        const updatedSlot = {
          timeBegin: timeToMs(values.timeBegin),
          timeEnd: timeToMs(values.timeEnd),
          coefficientsSalary: values.coefficientsSalary,
          bonus: values.bonus || 0,
        };

        const updatedShift = { ...scheduleData[shiftIndex] };
        if (modalType === 'addSlot') {
          updatedShift[dayKey] = [...(updatedShift[dayKey] || []), updatedSlot];
        } else {
          updatedShift[dayKey][slotIndex] = updatedSlot;
        }

        updatedShift[dayKey].sort((a, b) => a.timeBegin - b.timeBegin);

        await updateSchedule({
          index: shiftIndex,
          workSchedule: updatedShift,
        });

        notification.success({
          message: 'Thành công',
          description: modalType === 'addSlot' ? 'Thêm khung giờ mới thành công' : 'Cập nhật khung giờ thành công',

        });
      }

      setIsModalVisible(false);
      fetchSchedule();
    } catch (error) {
      console.error('Error:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể thực hiện thao tác. Vui lòng thử lại',

      });
    }
  };

  const handleDeleteSlot = async () => {
    try {
      const { shiftIndex, dayKey, slotIndex } = editingShift;
      const updatedShift = { ...scheduleData[shiftIndex] };
      updatedShift[dayKey].splice(slotIndex, 1);

      await updateSchedule({
        index: shiftIndex,
        workSchedule: updatedShift,
      });

      setIsModalVisible(false);
      fetchSchedule();
      notification.success({
        message: 'Thành công',
        description: 'Xóa khung giờ thành công',

      });
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể xóa khung giờ',

      });
    }
  };

  const handleDeleteShift = async () => {
    try {
      await api.post('/api/hrm/shift-work/shift-manager/work-schedule/remove', {
        index: editingShift.index
      });

      setIsModalVisible(false);
      fetchSchedule();

      notification.success({
        message: 'Thành công',
        description: 'Xóa ca làm việc thành công',
        placement: 'topRight'
      });
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể xóa ca làm việc',
        placement: 'topRight'
      });
    }
  };

  const handleNewShift = () => {
    setModalType('newShift');
    form.resetFields();
    setIsModalVisible(true);
  };

  const addNewShift = async (shiftData) => {
    try {
      await api.post('/api/hrm/shift-work/shift-manager/work-schedule/insert', {
        workSchedule: {
          ...shiftData,
          listMonday: null,
          listTuesday: null,
          listWednesday: null,
          listThursday: null,
          listFriday: null,
          listSaturday: null,
          listSunday: null
        }
      });
    } catch (error) {
      console.error('Error adding new shift:', error);
      throw error;
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'editShift':
        return 'Chỉnh sửa ca làm việc';
      case 'newShift':
        return 'Thêm ca làm việc mới';
      case 'editSlot':
        return 'Chỉnh sửa khung giờ';
      case 'addSlot':
        return 'Thêm khung giờ mới';
      default:
        return '';
    }
  };

  return (
    <div>
      <Table
        size='large'
        bordered
        pagination={false}
        dataSource={scheduleData}
        columns={columns}
        rowKey={(record, index) => index}
        scroll={{ y: '65vh' }}
        locale={{
          emptyText: <EmptyData />, // Thay đổi thông báo "No Data"
        }}
      />
      <Button
        type="primary"
        size="large"
        ghost
        className='mt-2 p-3'
        style={{ width: 'fit-content', alignSelf: 'flex-start', marginBottom: '8px' }}
        onClick={handleNewShift}
      >
        Thêm ca mới
      </Button>

      <Modal
        title={getModalTitle()}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          (modalType === 'editSlot' || modalType === 'editShift') && (
            <Button
              key="delete"
              danger
              onClick={() => showDeleteConfirm(modalType === 'editShift' ? 'shift' : 'slot')}
            >
              {modalType === 'editShift' ? 'Xóa ca làm việc' : 'Xóa khung giờ'}
            </Button>
          ),
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleModalOk}>
            {modalType === 'addSlot' || modalType === 'newShift' ? 'Thêm mới' : 'Cập nhật'}
          </Button>,
        ].filter(Boolean)}
        centered
      >
        <Form form={form} layout="vertical" style={{ textAlign: 'center' }}>
          {(modalType === 'editShift' || modalType === 'newShift') ? (
            <>
              <Form.Item
                name="shiftName"
                label="Tên ca làm việc"
                rules={[{ required: true, message: 'Vui lòng nhập tên ca làm việc' }]}
              >
                <Input style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="maxEarly"
                label="Giờ checkin sớm"
                rules={[{
                  required: true,
                  message: 'Vui lòng nhập giờ checkin sớm'
                }]}
              >
                <InputNumber
                  step={0.5}
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="Nhập số giờ cho phép checkin sớm"
                />
              </Form.Item>
              <Form.Item
                name="maxLate"
                label="Giờ checkout trễ"
                rules={[{
                  required: true,
                  message: 'Vui lòng nhập giờ checkout trễ'
                }]}
              >
                <InputNumber
                  step={0.5}
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="Nhập số giờ cho phép checkout trễ"
                />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="timeBegin"
                label="Thời gian bắt đầu"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn thời gian bắt đầu'
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const endTime = getFieldValue('timeEnd');
                      if (!value || !endTime || value.isBefore(endTime)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Thời gian bắt đầu phải trước thời gian kết thúc'));
                    },
                  }),
                ]}
              >
                <TimePicker
                  format="HH:mm"
                  style={{ width: '100%' }}
                  placeholder="Chọn thời gian bắt đầu"
                />
              </Form.Item>
              <Form.Item
                name="timeEnd"
                label="Thời gian kết thúc"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn thời gian kết thúc'
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const startTime = getFieldValue('timeBegin');
                      if (!value || !startTime || value.isAfter(startTime)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Thời gian kết thúc phải sau thời gian bắt đầu'));
                    },
                  }),
                ]}
              >
                <TimePicker
                  format="HH:mm"
                  style={{ width: '100%' }}
                  placeholder="Chọn thời gian kết thúc"
                />
              </Form.Item>
              <Form.Item
                name="coefficientsSalary"
                label="Hệ số lương"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập hệ số lương'
                  },
                  {
                    type: 'number',
                    min: 0,
                    message: 'Hệ số lương phải lớn hơn 0'
                  }
                ]}
              >
                <InputNumber
                  step={0.1}
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="Nhập hệ số lương"
                />
              </Form.Item>
              <Form.Item
                name="bonus"
                label="Thưởng"
                rules={[
                  {
                    type: 'number',
                    min: 0,
                    message: 'Thưởng không thể là số âm'
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="Nhập số tiền thưởng (nếu có)"
                />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default ScheduleTemplate;