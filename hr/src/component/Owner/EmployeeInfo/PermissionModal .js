import React from 'react';
import { Modal, Form, Checkbox, notification, Row, Col } from 'antd';
import { addEmployeePermission, removeEmployeePermission } from '../../../api/employeeApi';

const PermissionModal = ({ visible, onCancel, onOk, employee }) => {
  const [form] = Form.useForm();

  const permissionMapping = {
    1: "Quản lý thông tin nhân viên",
    2: "Quản lý ca làm",
    4: "Quản lý chấm công",
    8: "Quản lý phép",
    4096: "Quản lý lương",
    32: "Quản lý tài sản",
    64: "Quản lý chuyên cần",
    262144: "Quản lý phản hồi khách hàng",
    524288: "Hỗ trợ tin nhắn",
    1048576: "Phục vụ",
    2097152: "Chỉnh sửa order",
    4194304: "In hóa đơn",
    8388608: "Thu ngân",
    33554432: "Quản lý kho",
    67108864: "Bếp",
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const { employeeID } = employee;

      let newPermissionValue = 0;
      Object.entries(values).forEach(([key, value]) => {
        if (value) {
          newPermissionValue += parseInt(key);
        }
      });

      await removeEmployeePermission(employeeID, 0);
      await addEmployeePermission(employeeID, newPermissionValue);

      notification.success({
        message: 'Cập nhật thành công',
        description: 'Quyền của nhân viên đã được cập nhật thành công.',
        placement: 'topRight',
        duration: 1
      });

      onOk();
    } catch (error) {
      console.error('Error updating permissions:', error);
      notification.error({
        message: 'Lỗi cập nhật',
        description: 'Không thể cập nhật quyền của nhân viên. Vui lòng thử lại.',
        placement: 'topRight',
      });
    }
  };

  React.useEffect(() => {
    if (visible && employee) {
      const currentPermissions = {};
      Object.keys(permissionMapping).forEach(key => {
        const keyValue = parseInt(key, 10);
        currentPermissions[key] = (employee.permission & keyValue) === keyValue;
      });
      form.setFieldsValue(currentPermissions);
    }
  }, [visible, employee, form]);

  return (
    <Modal
      title="Chỉnh sửa quyền"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Row gutter={[16, 16]}>
          {Object.entries(permissionMapping).map(([value, label]) => (
            <Col span={12} key={value}>
              <Form.Item name={value} valuePropName="checked">
                <Checkbox>{label}</Checkbox>
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </Modal>
  );
};

export default PermissionModal;
