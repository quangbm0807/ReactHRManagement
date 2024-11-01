// modals.js
import React from 'react';
import { Modal, Table, Typography, Button, Form, Select } from 'antd';

const { Text } = Typography;
const { Option } = Select;

export const renderDefaultShiftConfirmModal = ({
    showDefaultShiftModal,
    handleConfirmDefaultShift,
    setShowDefaultShiftModal,
    danhSachNhanVien,
}) => (
    <Modal
        title="Xác nhận gán ca mặc định"
        open={showDefaultShiftModal}
        onOk={handleConfirmDefaultShift}
        onCancel={() => setShowDefaultShiftModal(false)}
        width={700}
    >
        <Table
            dataSource={Object.entries(danhSachNhanVien).map(([maNhanVien, thongTin]) => ({
                key: maNhanVien,
                maNhanVien: maNhanVien,
                tenNhanVien: thongTin.bietDanh,
                caLamViec: thongTin.caLamViec || 'Chưa có ca mặc định',
            }))}
            columns={[
                {
                    title: 'Mã nhân viên',
                    dataIndex: 'maNhanVien',
                    key: 'maNhanVien',
                },
                {
                    title: 'Tên nhân viên',
                    dataIndex: 'tenNhanVien',
                    key: 'tenNhanVien',
                },
                {
                    title: 'Ca mặc định',
                    dataIndex: 'caLamViec',
                    key: 'caLamViec',
                    render: (text) => (
                        <Text type={text === 'Chưa có ca mặc định' ? 'warning' : 'success'}>
                            {text}
                        </Text>
                    ),
                },
            ]}
            pagination={false}
            scroll={{ y: 400 }}
        />
    </Modal>
);

export const renderGanCaModal = ({
    hienThiModalGanCa,
    xuLyDongYModalGanCa,
    setHienThiModalGanCa,
    handleAssignDefaultShift,
    formGanCa,
    danhSachNhanVien,
    danhSachCaLam,
}) => (
    <Modal
        title="Gán ca làm việc"
        open={hienThiModalGanCa}
        onOk={xuLyDongYModalGanCa}
        onCancel={() => setHienThiModalGanCa(false)}
        width={500}
        footer={[
            <Button key="cancel" onClick={() => setHienThiModalGanCa(false)}>
                Hủy
            </Button>,
            <Button key="default" type="default" onClick={handleAssignDefaultShift}>
                Gán ca mặc định
            </Button>,
            <Button key="submit" type="primary" onClick={xuLyDongYModalGanCa}>
                Gán ca
            </Button>,
        ]}
    >
        <Form form={formGanCa} layout="vertical">
            <Form.Item name="maNhanVien" label="Nhân viên">
                <Select>
                    {Object.entries(danhSachNhanVien).map(([maNhanVien, thongTin]) => (
                        <Option key={maNhanVien} value={maNhanVien}>
                            {`${maNhanVien} - ${thongTin.bietDanh}`}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item name="tenCa" label="Ca làm việc">
                <Select>
                    {danhSachCaLam.map((ca) => (
                        <Option key={ca.shiftName} value={ca.shiftName}>
                            {ca.shiftName}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
        </Form>
    </Modal>
);
