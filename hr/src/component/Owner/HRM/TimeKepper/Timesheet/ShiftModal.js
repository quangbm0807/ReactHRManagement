import React from 'react';
import { Modal, Button, Form, Input, Row, Col, TimePicker, Typography } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

const ShiftModal = ({
    caLamHienTai,
    hienThiModal,
    isAddShift,
    xuLyDongYModal,
    xoaCa,
    setHienThiModal,
    form,
}) => (
    <Modal
        title={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '25px' }}>
                <span>Nhân viên: {caLamHienTai?.maNhanVien} - {caLamHienTai?.tenNhanVien}</span>
                <span style={{ marginRight: '25px' }}>{caLamHienTai?.timeBegin ? dayjs(caLamHienTai.timeBegin).format('DD/MM/YYYY') : ''}</span>
            </div>
        }
        open={hienThiModal}
        onOk={xuLyDongYModal}
        onCancel={() => setHienThiModal(false)}
        width={600}
        footer={[
            <Button key="huy" onClick={() => setHienThiModal(false)}>
                Hủy
            </Button>,
            !caLamHienTai?.laCaMoi && (
                <Button key="xoa" danger onClick={xoaCa}>
                    Xóa
                </Button>
            ),
            <Button key="dongY" type="primary" onClick={xuLyDongYModal}>
                {caLamHienTai?.laCaMoi ? "Thêm" : "Lưu"}
            </Button>,
        ]}
    >
        <Form form={form} layout="vertical">
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="shiftName"
                        label={isAddShift ? "Tên ca" : ""}
                        initialValue={caLamHienTai?.shiftName}
                    >
                        {isAddShift ? (
                            <Input placeholder="Tên ca" />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Text strong style={{ marginRight: '8px' }}>Tên ca:</Text>
                                <Text>{caLamHienTai?.shiftName || 'Chưa có'}</Text>
                            </div>
                        )}
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="thoiGianBatDau"
                        label={isAddShift ? "Thời gian bắt đầu" : ""}
                        initialValue={caLamHienTai?.thoiGianBatDau}
                    >
                        {isAddShift ? (
                            <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Text strong style={{ marginRight: '8px' }}>Thời gian bắt đầu:</Text>
                                <Text>{caLamHienTai?.timeBegin ? dayjs(caLamHienTai.timeBegin).format('HH:mm') : 'Chưa có'}</Text>
                            </div>
                        )}
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="thoiGianKetThuc"
                        label={isAddShift ? "Thời gian kết thúc" : ""}
                        initialValue={caLamHienTai?.thoiGianKetThuc}
                    >
                        {isAddShift ? (
                            <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Text strong style={{ marginRight: '8px' }}>Thời gian kết thúc:</Text>
                                <Text>{caLamHienTai?.timeEnd ? dayjs(caLamHienTai.timeEnd).format('HH:mm') : 'Chưa có'}</Text>
                            </div>
                        )}
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="thoiGianBatDauSom"
                        label={isAddShift ? "Thời gian bắt đầu sớm nhất" : ""}
                        initialValue={caLamHienTai?.thoiGianBatDauSom}
                    >
                        {isAddShift ? (
                            <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Text strong style={{ marginRight: '8px' }}>Thời gian bắt đầu sớm nhất:</Text>
                                <Text>{caLamHienTai?.timeBeginEarly ? dayjs(caLamHienTai.timeBeginEarly).format('HH:mm') : 'Chưa có'}</Text>
                            </div>
                        )}
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="thoiGianKetThucMuon"
                        label={isAddShift ? "Thời gian kết thúc muộn nhất" : ""}
                        initialValue={caLamHienTai?.thoiGianKetThucMuon}
                    >
                        {isAddShift ? (
                            <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Text strong style={{ marginRight: '8px' }}>Thời gian kết thúc muộn nhất:</Text>
                                <Text>{caLamHienTai?.timeEndLate ? dayjs(caLamHienTai.timeEndLate).format('HH:mm') : 'Chưa có'}</Text>
                            </div>
                        )}
                    </Form.Item>
                </Col>
            </Row>

            {!isAddShift && (
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="thoiGianCheckIn" label="Thời gian check-in" initialValue={caLamHienTai?.thoiGianCheckIn}>
                            <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="thoiGianCheckOut" label="Thời gian check-out" initialValue={caLamHienTai?.thoiGianCheckOut}>
                            <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>
            )}

            {isAddShift && (
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="coefficientsSalary" label="Hệ số lương" initialValue={caLamHienTai?.coefficientsSalary}>
                            <Input type="number" step="0.1" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="bonus" label="Thưởng" initialValue={caLamHienTai?.bonus}>
                            <Input type="number" />
                        </Form.Item>
                    </Col>
                </Row>
            )}
        </Form>

    </Modal>
);

export default ShiftModal;
