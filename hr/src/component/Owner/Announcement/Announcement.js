import React, { useState, useEffect } from 'react';
import { Tabs, Form, Modal, message, notification } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { DialogTemplates } from './DialogTemplates';
import { DataTable } from './DataTable';
import { EditModal } from './EditModal';
import dayjs from 'dayjs';
import api from '../../../api';

const { confirm } = Modal;

const Announcement = () => {
    const [data, setData] = useState({
        listDialog: [],
        listAnnouncements: [],
        listDocuments: []
    });
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [currentTab, setCurrentTab] = useState('1');
    const [form] = Form.useForm();

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.post('api/administrative/get-dashboard');
            setData(response.data.data || { listDialog: [], listAnnouncements: [], listDocuments: [] });
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể tải dữ liệu. Vui lòng thử lại sau.',
                placement: 'topRight'
            });
        } finally {
            setLoading(false);
        }
    };

    const updateDashboard = async (newData) => {
        try {
            setLoading(true);
            await api.post('api/administrative/set-dashboard', { hrmHomeData: newData });
            notification.success({
                message: 'Thành công',
                description: 'Cập nhật dữ liệu thành công',
                placement: 'topRight'
            });
            fetchData();
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể cập nhật dữ liệu. Vui lòng thử lại sau.',
                placement: 'topRight'
            });
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchData();
    }, []);

    const showDeleteConfirm = (record, listType) => {
        confirm({
            title: 'Bạn có chắc chắn muốn xóa thông báo này?',
            icon: <ExclamationCircleOutlined />,
            content: 'Hành động này không thể hoàn tác',
            okType: 'danger',
            async onOk() {
                const newData = {
                    ...data,
                    [listType]: data[listType].filter(item => item !== record)
                };
                await updateDashboard(newData);
            }
        });
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            title: record.title,
            url: record.url,
            timeBegin: dayjs(record.timeBegin),
            timeEnd: dayjs(record.timeEnd)
        });
        setModalVisible(true);
    };

    const handleModalSubmit = async (values) => {
        const newItem = {
            title: values.title,
            url: values.url,
            timeBegin: values.timeBegin?.valueOf() || 0,
            timeEnd: values.timeEnd?.valueOf() || 0
        };

        let listType = currentTab === '2' ? 'listAnnouncements' : 'listDocuments';

        const newData = {
            ...data,
            [listType]: editingRecord
                ? data[listType].map(item => item === editingRecord ? newItem : item)
                : [...data[listType], newItem]
        };

        await updateDashboard(newData);
        setModalVisible(false);
        form.resetFields();
        setEditingRecord(null);
    };

    const showModalTemplate = (template) => {
        Modal[template.type === 'basic' ? 'info' : template.type]({
            title: template.title,
            content: template.content,
            width: template.size || 800
        });
    };

    const items = [
        {
            key: '1',
            label: 'Hộp thoại',
            children: <DialogTemplates
                onShowTemplate={showModalTemplate}
                data={data}
                loading={loading}
                onUpdate={updateDashboard}
            />
        },
        {
            key: '2',
            label: 'Thông báo',
            children: (
                <DataTable
                    data={data.listAnnouncements}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={(record) => showDeleteConfirm(record, 'listAnnouncements')}
                    onAdd={() => {
                        setEditingRecord(null);
                        form.resetFields();
                        setModalVisible(true);
                    }}
                />
            )
        },
        {
            key: '3',
            label: 'Tài liệu',
            children: (
                <DataTable
                    data={data.listDocuments}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={(record) => showDeleteConfirm(record, 'listDocuments')}
                    onAdd={() => {
                        setEditingRecord(null);
                        form.resetFields();
                        setModalVisible(true);
                    }}
                />
            )
        }
    ];

    return (
        <div className="card p-4">
            <Tabs
                size='large'
                items={items}
                activeKey={currentTab}
                onChange={setCurrentTab}
            />

            <EditModal
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingRecord(null);
                }}
                onSubmit={handleModalSubmit}
                form={form}
                editingRecord={editingRecord}
            />
        </div>
    );
};

export default Announcement;