import React, { useState } from 'react';
import { Button, Modal, Form, Input, Select, DatePicker, Card, Row, Col, Popconfirm, Upload, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import NotificationIcon from './NotificationIcon';
import RichTextEditor from './RichTextEditor';

const { TextArea } = Input;

const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

export const DialogTemplates = ({ onShowTemplate, data, loading, onUpdate }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [form] = Form.useForm();

    const typeOptions = [
        { label: 'Thông báo cơ bản', value: 0, color: '#1890ff', modalType: 'info', icon: 'info' },
        { label: 'Thông báo thành công', value: 1, color: '#52c41a', modalType: 'success', icon: 'success' },
        { label: 'Cảnh báo', value: 2, color: '#faad14', modalType: 'warning', icon: 'warning' },
        { label: 'Lỗi', value: 3, color: '#f5222d', modalType: 'error', icon: 'error' }
    ];

    const handleSubmit = async (values) => {
        const newTemplate = {
            ...values,
            timeBegin: values.timeBegin?.valueOf() || 0,
            timeEnd: values.timeEnd?.valueOf() || 0,
        };

        let newListDialog;
        if (editingTemplate) {
            newListDialog = data.listDialog.map(item =>
                item === editingTemplate ? newTemplate : item
            );
        } else {
            newListDialog = [...data.listDialog, newTemplate];
        }

        await onUpdate({ ...data, listDialog: newListDialog });
        setModalVisible(false);
        form.resetFields();
        setEditingTemplate(null);
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        form.setFieldsValue({
            ...template,
            timeBegin: template.timeBegin ? dayjs(template.timeBegin) : null,
            timeEnd: template.timeEnd ? dayjs(template.timeEnd) : null,
        });
        setModalVisible(true);
    };

    const handleDelete = async (template) => {
        const newListDialog = data.listDialog.filter(item => item !== template);
        await onUpdate({ ...data, listDialog: newListDialog });
    };

    const getModalTypeFromIcon = (imgIcon) => {
        // Nếu imgIcon là số từ 0-3
        const parsedIcon = parseInt(imgIcon, 10);
        if (!isNaN(parsedIcon) && parsedIcon >= 0 && parsedIcon <= 3) {
            return typeOptions[parsedIcon].modalType;
        }
        // Mặc định trả về info nếu là base64 hoặc giá trị khác
        return false;
    };

    const renderModalIcon = (imgIcon) => {
        const parsedIcon = parseInt(imgIcon, 10);
        if (!isNaN(parsedIcon) && parsedIcon >= 0 && parsedIcon <= 3) {
            // Trả về icon tương ứng với loại modal
            return <div className={`ant-modal-${typeOptions[parsedIcon].modalType}-icon`} />;
        }
        // Nếu là base64, hiển thị ảnh
        if (imgIcon?.startsWith('data:image')) {
            return <img src={imgIcon} alt="Icon" style={{ width: '32px', height: '32px', marginRight: '8px' }} />;
        }
        return null;
    };
    const formatContent = (content) => {
        if (!content) return '';
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
    };
    const handlePreview = (template) => {
        const modalType = getModalTypeFromIcon(template.imgIcon);
        if (modalType) {
            Modal[modalType]({
                title: (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {renderModalIcon(template.imgIcon)}
                        <span>{template.title}</span>
                    </div>
                ),
                content: (
                    <div className="space-y-4">
                        <div className="whitespace-pre-line text-base">
                            {formatContent(template.content)}
                        </div>
                        {template.url && (
                            <div className="mt-4">
                                <a
                                    href={template.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    {template.url}
                                </a>
                            </div>
                        )}
                    </div>
                ),
                width: 600
            });
        } else {
            // Sử dụng Modal component thông thường cho modal tùy chỉnh
            Modal.info({
                icon: null, // Bỏ icon mặc định
                title: (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {renderModalIcon(template.imgIcon)}
                        <span>{template.title}</span>
                    </div>
                ),
                content: (
                    <div className="space-y-4">
                        <div className="whitespace-pre-line text-base">
                            {formatContent(template.content)}
                        </div>
                        {template.url && (
                            <div className="mt-4">
                                <a
                                    href={template.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    {template.url}
                                </a>
                            </div>
                        )}
                    </div>
                ),
                width: 600,
                onOk: () => {
                    if (template.url) {
                        window.open(template.url, '_blank');
                    }
                }
            });
        }
    };


    const handleIconUpload = async ({ file }) => {
        if (file) {
            const base64 = await getBase64(file);
            form.setFieldsValue({ imgIcon: base64 });
        }
    };

    const renderIcon = (imgIcon) => {
        // Nếu là một trong các giá trị 0,1,2,3
        if (!isNaN(parseInt(imgIcon)) && parseInt(imgIcon) >= 0 && parseInt(imgIcon) <= 3) {
            return <NotificationIcon type={imgIcon} />;
        }
        // Nếu là base64 image
        if (imgIcon?.startsWith('data:image')) {
            return <img src={imgIcon} alt="Custom icon" className="w-8 h-8" />;
        }
        return null;
    }

    const getViewText = (count) => {
        return count === 0 ? "Luôn luôn hiển thị khi đăng nhập" : `Hiển thị ${count} lần`;
    };

    return (
        <div className="space-y-4">
            {/* Preview Templates Section */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Hộp thoại sẵn có</h3>
                <Row gutter={[16, 16]}>
                    {typeOptions.map(type => (
                        <Col span={6} key={type.value}>
                            <Button
                                size="large"
                                block
                                onClick={() => onShowTemplate({
                                    title: type.label,
                                    content: `Đây là ${type.label.toLowerCase()}`,
                                    type: type.modalType,
                                    imgIcon: type.value.toString()
                                })}
                                style={{
                                    backgroundColor: type.color,
                                    color: 'white',
                                    border: 'none',
                                    height: '60px'
                                }}
                            >
                                {type.label}
                            </Button>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Custom Templates Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Hộp thoại hiện tại</h3>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingTemplate(null);
                            form.resetFields();
                            setModalVisible(true);
                        }}
                    >
                        Thêm hộp thoại mới
                    </Button>
                </div>

                <Row gutter={[16, 16]}>
                    {data.listDialog.map((template, index) => (
                        <Col span={8} key={index}>
                            <Card
                                hoverable
                                className="h-100 full flex flex-col overflow-hidden"
                                style={{ height: '240px' }}
                                actions={[
                                    <Button
                                        icon={<EyeOutlined />}
                                        onClick={() => handlePreview(template)}
                                    />,
                                    <Button
                                        icon={<EditOutlined />}
                                        onClick={() => handleEdit(template)}
                                    />,
                                    <Popconfirm
                                        title="Bạn có chắc chắn muốn xóa mẫu này?"
                                        onConfirm={() => handleDelete(template)}
                                    >
                                        <Button
                                            icon={<DeleteOutlined />}
                                            danger
                                        />
                                    </Popconfirm>
                                ]}
                            >
                                <Card.Meta
                                    avatar={renderIcon(template.imgIcon)}
                                    title={template.title}
                                    description={
                                        <div className="overflow-hidden" style={{ maxHeight: '160px' }}>
                                            {formatContent(template.content)}
                                            {template.url && (
                                                <p style={{ fontSize: '12px', color: '#8c8c8c' }}>URL: {template.url}</p>
                                            )}
                                            <p style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                                {getViewText(template.countView)}
                                            </p>
                                        </div>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Edit/Add Modal */}
            <Modal
                title={editingTemplate ? "Chỉnh sửa hộp thoại" : "Thêm hộp thoại mới"}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingTemplate(null);
                }}
                onOk={() => form.submit()}
                width={720}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        type: 0,
                        countView: 0
                    }}
                >
                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="Nội dung"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                    >
                        <RichTextEditor
                            value={form.getFieldValue('content') || ''}
                            onChange={(value) => form.setFieldsValue({ content: value })}
                        />
                    </Form.Item>

                    <Form.Item
                        name="url"
                        label="URL"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="countView"
                        label="Số lần hiển thị"
                        rules={[{ required: true }]}
                    >
                        <InputNumber
                            min={0}
                            className="w-100"
                            formatter={value => value === 0 ? "Luôn luôn hiển thị khi đăng nhập" : getViewText(value)}
                            parser={value => {
                                if (value === "Luôn luôn hiển thị khi đăng nhập") return 0;
                                const match = value.match(/\d+/);
                                return match ? parseInt(match[0]) : 0;
                            }}
                        />
                    </Form.Item>


                    <Form.Item name="imgIcon" label="Icon">
                        <div className="space-y-4">
                            {/* Component Select */}
                            <Select
                                options={typeOptions.map(type => ({
                                    label: type.label,
                                    value: type.value.toString()
                                }))}
                                onChange={(value) => {
                                    form.setFieldsValue({ imgIcon: value });
                                }}
                                placeholder="Chọn một icon"
                            />

                            {/* Component Upload */}
                            <Upload
                                customRequest={handleIconUpload}
                                showUploadList={false}
                                onChange={(info) => {
                                    if (info.file.status === 'done') {
                                        form.setFieldsValue({ imgIcon: info.file.response.url });
                                    }
                                }}
                            >
                                <Button icon={<UploadOutlined />}>Tải lên icon tùy chỉnh</Button>
                            </Upload>

                            {/* Hiển thị icon đã chọn hoặc đã tải lên */}
                            {form.getFieldValue('imgIcon') && (
                                <div className="mt-2">
                                    {renderIcon(form.getFieldValue('imgIcon'))}
                                </div>
                            )}
                        </div>
                    </Form.Item>


                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="timeBegin"
                                label="Thời gian bắt đầu"
                            >
                                <DatePicker
                                    showTime
                                    className="w-full"
                                    placeholder="Chọn thời gian bắt đầu"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="timeEnd"
                                label="Thời gian kết thúc"
                            >
                                <DatePicker
                                    showTime
                                    className="w-full"
                                    placeholder="Chọn thời gian kết thúc"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};