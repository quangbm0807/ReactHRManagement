import React from 'react';
import { Modal, Form, Input, DatePicker, Space, Button } from 'antd';
import dayjs from 'dayjs';

export const EditModal = ({ visible, onCancel, onSubmit, form, editingRecord }) => (
    <Modal
        title={editingRecord ? 'Chỉnh sửa' : 'Thêm mới'}
        open={visible}
        onCancel={onCancel}
        footer={null}
    >
        <Form
            form={form}
            onFinish={onSubmit}
            layout="vertical"
        >
            <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="url"
                label="URL"
                rules={[{ required: true, message: 'Vui lòng nhập URL' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="timeBegin"
                label="Thời gian bắt đầu"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]}
            >
                <DatePicker showTime className="w-full" />
            </Form.Item>
            <Form.Item
                name="timeEnd"
                label="Thời gian kết thúc"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc' }]}
            >
                <DatePicker showTime className="w-full" />
            </Form.Item>
            <Form.Item>
                <Space className="w-full justify-end">
                    <Button onClick={onCancel}>
                        Hủy
                    </Button>
                    <Button type="primary" htmlType="submit">
                        {editingRecord ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    </Modal>
);