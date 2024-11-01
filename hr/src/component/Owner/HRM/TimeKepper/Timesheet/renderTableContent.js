import React from 'react';
import { Skeleton, Row, Col, Spin, Table } from 'antd';

const renderTableContent = ({
    isRendering,
    loading,
    tableRef,
    nguonDuLieu,
    cot,
    EmptyData,
}) => {
    if (isRendering) {
        return (
            <div>
                <div style={{ padding: '16px', background: '#fafafa', marginBottom: '8px' }}>
                    <Skeleton.Input style={{ width: 200 }} active />
                </div>

                {[...Array(5)].map((_, index) => (
                    <div key={index} style={{ padding: '16px', background: '#fff', marginBottom: '8px' }}>
                        <Row gutter={16}>
                            <Col span={4}>
                                <Skeleton.Input style={{ width: '100%' }} active />
                            </Col>
                            <Col span={20}>
                                <Row gutter={8}>
                                    {[...Array(7)].map((_, cellIndex) => (
                                        <Col span={3} key={cellIndex}>
                                            <Skeleton.Input style={{ width: '100%' }} active />
                                        </Col>
                                    ))}
                                </Row>
                            </Col>
                        </Row>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <Spin
            tip="Đang tải..."
            size='large'
            spinning={loading}
            style={{ width: '100%' }}
        >
            <Table
                ref={tableRef}
                bordered
                dataSource={nguonDuLieu}
                columns={cot}
                scroll={{ x: 'max-content', y: '65vh' }}
                pagination={false}
                sticky
                className='timesheet-table'
                locale={{
                    emptyText: <EmptyData />,
                }}
            />
        </Spin>
    );
};

export default renderTableContent;
