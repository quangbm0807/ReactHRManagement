import React, { useState } from 'react';
import { Modal, Button, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const EmployeeSelectorModal = ({
    nhanVienHienThi,
    handleEmployeeSelectionChange,
    tatCaNhanVien
}) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const renderEmployeeSelector = () => (
        <Select
            mode="multiple"
            placeholder="Chọn nhân viên"
            value={nhanVienHienThi}
            onChange={handleEmployeeSelectionChange}
            style={{ width: '100%', maxHeight: '400px', overflowY: 'auto' }}
            options={tatCaNhanVien}
            maxTagCount="responsive"
            allowClear
            showSearch
            optionFilterProp="label"
        />
    );

    return (
        <div>
            {/* Nút mở Modal */}
            <Button icon={<UserOutlined />} onClick={handleOpenModal}>
                Chọn Nhân Viên
            </Button>

            {/* Modal chứa Select */}
            <Modal
                title="Chọn Nhân Viên"
                open={isModalVisible}
                onCancel={handleCloseModal}
                onOk={handleCloseModal}
                okText="Xác nhận"
                cancelText="Hủy"
                width={800}
            >
                {/* Render Select trong Modal */}
                {renderEmployeeSelector()}
            </Modal>
        </div>
    );
};

export default EmployeeSelectorModal;
