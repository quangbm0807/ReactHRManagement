import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Modal, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import axios from 'axios';

const AvatarUpload = ({ employeeID, tokenEmployee, onAvatarChange }) => {
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [fileList, setFileList] = useState([]);

    const API_URL = 'http://fandbsoft.com:999';

    const handleError = useCallback((error, customMessage) => {
        console.error(customMessage, error);
        message.error('Đã xảy ra lỗi. Vui lòng thử lại.');
    }, []);

    useEffect(() => {
        const fetchAvatar = async () => {
            if (employeeID) {
                try {
                    const avatarUrl = `${API_URL}/global/employee/avatar?employeeID=${employeeID}`;
                    setPreviewImage(avatarUrl);
                    setFileList([{
                        uid: '-1',
                        name: 'avatar.png',
                        status: 'done',
                        url: avatarUrl,
                    }]);
                } catch (error) {
                    handleError(error, 'Lỗi khi tải ảnh đại diện:');
                }
            }
        };

        fetchAvatar();
    }, [employeeID, handleError]);

    const handlePreviewImage = useCallback((file) => {
        if (file instanceof File) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else if (file.url) {
            setPreviewImage(file.url);
        }
    }, []);

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/webp';
        if (!isJpgOrPng) {
            message.error('Chỉ có thể tải lên file JPG/PNG!');
            return false;
        }

        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            message.error('Kích thước ảnh phải nhỏ hơn 10MB!');
            return false;
        }

        return true;
    };

    const handleUpload = useCallback(({ fileList: newFileList }) => {
        if (newFileList.length > 0) {
            const file = newFileList[0].originFileObj || newFileList[0];
            if (file.size / 1024 / 1024 > 10) {
                message.error('Hình ảnh phải nhỏ hơn 10MB');
                return;
            }
            setFileList(newFileList);
            handlePreviewImage(file);
        }
    }, [handlePreviewImage]);

    const uploadAvatar = useCallback(async (file) => {
        try {
            const messageKey = 'uploading';
            message.loading({ content: 'Đang tải lên...', key: messageKey });

            const fileExtension = file.type === 'image/jpeg' ? 'jpeg' : file.type === 'image/png' ? 'png' : file.type === 'image/gif' ? 'gif' : file.type === 'image/webp' ? 'webp' : '';
            const formData = file;
            const uploadUrl = `${API_URL}/api/employee/upload-avatar?employeeID=${employeeID}&fileExtension=${fileExtension}`;

            const response = await axios.post(uploadUrl, formData, {
                headers: {
                    'token-employee': tokenEmployee
                }
            });

            if (response.data.status === 1) {
                message.success({ content: 'Tải ảnh thành công', key: messageKey });
                const newAvatarUrl = `${API_URL}/global/employee/avatar?employeeID=${employeeID}`;
                setPreviewImage(newAvatarUrl);
                setFileList([{
                    uid: '-1',
                    name: 'avatar.png',
                    status: 'done',
                    url: newAvatarUrl,
                }]);

                if (onAvatarChange) {
                    onAvatarChange(response.data.avatarID);
                }
            } else {
                message.error({ content: 'Tải ảnh thất bại', key: messageKey });
            }
        } catch (error) {
            handleError(error, 'Lỗi khi tải ảnh lên:');
        }
    }, [employeeID, tokenEmployee, onAvatarChange, handleError]);

    const customRequest = async ({ file, onSuccess, onError }) => {
        try {
            await uploadAvatar(file);
            onSuccess();
        } catch (error) {
            onError(error);
        }
    };

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
    };

    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleRemove = () => {
        setPreviewOpen(false);
        setPreviewImage('');
        setFileList([]);
    };

    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Tải lên</div>
        </div>
    );

    return (
        <div className="avatar-upload-container">
            <ImgCrop
                rotationSlider
                aspect={1}
                quality={1}
                modalTitle="Chỉnh sửa ảnh"
                modalOk="Xác nhận"
                modalCancel="Hủy"
            >
                <Upload

                    listType="picture-card"
                    className="avatar-uploader"
                    fileList={fileList}
                    onChange={handleUpload}
                    onRemove={handleRemove}
                    onPreview={handlePreview}
                    customRequest={customRequest}
                    beforeUpload={beforeUpload}
                    maxCount={1}
                    showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                >
                    {fileList.length === 0 && uploadButton}
                </Upload>
            </ImgCrop>
            <Modal
                open={previewOpen}
                footer={null}
                onCancel={() => setPreviewOpen(false)}
            >
                <img
                    alt="Ảnh đại diện"
                    style={{ width: '100%' }}
                    src={previewImage}
                />
            </Modal>
        </div>
    );
};

export default AvatarUpload;