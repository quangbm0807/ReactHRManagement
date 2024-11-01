import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Select, InputNumber, Input, Form, message, Checkbox, AutoComplete, Dropdown, Divider, notification, Tooltip } from 'antd';
import { EditOutlined, PlusOutlined, SearchOutlined, ExpandOutlined, CompressOutlined, DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  fetchEmployees as apiFetchEmployees,
  updateEmployeeStatus,
  updateEmployeeSalary,
  updateEmployeeDeduction,
  updateEmployeeShiftwork,
  updateEmployeeBirth,
  updateEmployeePhone,
  updateEmployeeEmail,
  updateEmployeePosition,
  updateEmployeeStartDay,
  addEmployee,
  updateEmployeeFullname,
} from '../../../api/employeeApi';
import MobileDatePicker from 'react-mobile-datepicker';
import PermissionModal from './PermissionModal ';
import { fetchShifts } from '../../../api/shiftApi';
import { StatusDropdown } from './StatusDropdown';
import { TableHeader } from './TableHeader';
import EmptyData from '../../Ultils/EmptyData/EmptyData';

const { Option } = Select;

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [addEmployeeModalVisible, setAddEmployeeModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingField, setEditingField] = useState('');
  const [form] = Form.useForm();
  const [addEmployeeForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [shiftOptions, setShiftOptions] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [positionOptions, setPositionOptions] = useState([]);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState(null);
  const [checkedColumns, setCheckedColumns] = useState(visibleColumns);
  useEffect(() => {
    fetchEmployees();
    fetchSchedules();
  }, []);

  useEffect(() => {
    setVisibleColumns(columns.map(col => col.key));
    setCheckedColumns(columns.map(col => col.key));
  }, []);
  useEffect(() => {
    if (employees.length > 0) {
      const uniquePositions = [...new Set(employees.map(emp => emp.position))].filter(Boolean);
      setPositionOptions(uniquePositions.map(pos => ({ value: pos })));
    }
  }, [employees]);
  const toggleExpandAll = () => {
    if (expandedRows.length === employees.length) {
      setExpandedRows([]);
    } else {
      setExpandedRows(employees.map(emp => emp.employeeID));
    }
  };

  const handleColumnVisibilityChange = (checkedValues) => {
    setCheckedColumns(checkedValues);
    setVisibleColumns(checkedValues.length > 0 ? checkedValues : columns.map(col => col.key));
  };


  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetchShifts();
      if (response && Array.isArray(response.data.data)) {
        setShiftOptions(response.data.data.map(shift => ({
          value: shift.shiftName,
          label: shift.shiftName
        })));
      } else {
        console.error('Data is not an array:', response.data);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setLoading(false);
    }
  }

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await apiFetchEmployees();
      if (response && Array.isArray(response.data)) {
        setEmployees(response.data);
      } else {
        console.error('Data is not an array:', response.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record, field) => {
    setEditingEmployee(record);
    setEditingField(field);
    setModalVisible(true);
    form.setFieldsValue({
      ...record,
      startTime: record.startTime ? dayjs(record.startTime) : null,
      birth: record.birth ? dayjs(record.birth) : null,
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const { employeeID } = editingEmployee;

      let updateFunction;
      let updateValue;

      switch (editingField) {
        case 'startTime':
          updateFunction = updateEmployeeStartDay;
          updateValue = values.startTime ? values.startTime.getTime() : null;
          break;
        case 'salaryValue':
          updateFunction = updateEmployeeSalary;
          updateValue = { newSalary: values.salaryValue, salaryType: values.salaryType };
          break;
        case 'shiftWork':
          updateFunction = updateEmployeeShiftwork;
          updateValue = values.shiftWork;
          break;
        case 'birth':
          updateFunction = updateEmployeeBirth;
          updateValue = values.birth ? values.birth.getTime() : null;
          break;
        case 'phonenumber':
          updateFunction = updateEmployeePhone;
          updateValue = values.phonenumber;
          break;
        case 'email':
          updateFunction = updateEmployeeEmail;
          updateValue = values.email;
          break;
        case 'fullname':
          updateFunction = updateEmployeeFullname;
          updateValue = values.fullname;
          break;
        case 'position':
          updateFunction = updateEmployeePosition;
          updateValue = values.position;
          break;
        default:
          throw new Error('Invalid field');
      }

      if (updateValue !== null && updateValue !== undefined) {
        await updateFunction(employeeID, updateValue);
        notification.success({
          message: 'Cập nhật thành công',
          description: 'Thông tin nhân viên đã được cập nhật thành công.',
          placement: 'topRight',
          duration: 2
        });
        setModalVisible(false);
        fetchEmployees();
      } else {
        notification.error({
          message: 'Lỗi giá trị',
          description: 'Giá trị không hợp lệ. Vui lòng kiểm tra lại.',
          placement: 'topRight',
        });
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật nhân viên:', error);
      notification.error({
        message: 'Không thể cập nhật',
        description: 'Đã xảy ra lỗi trong quá trình cập nhật nhân viên. Vui lòng thử lại.',
        placement: 'topRight',
      });
    }
  };

  const handleShiftWorkChange = async (record, value) => {
    try {
      await updateEmployeeShiftwork(record.employeeID, value);
      notification.success({
        message: 'Cập nhật thành công',
        description: 'Thông tin nhân viên đã được cập nhật thành công.',
        placement: 'topRight',
        duration: 2
      });
      fetchEmployees();
    } catch (error) {
      console.error('Error updating employee shift work:', error);
      message.error('Không thể cập nhật ca làm việc');
    }
  };
  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleAddEmployee = async () => {
    try {
      const values = await addEmployeeForm.validateFields();
      const response = await addEmployee(values.username, values.password);
      if (response.status === 1) {
        notification.success({
          message: 'Thành công',
          description: 'Thêm nhân viên thành công',
          duration: 2
        });
        fetchEmployees();
      } else if (response.status !== 1 && response.message === 'Existed') {
        notification.error({
          message: 'Thất bại',
          description: 'Nhân viên đã tồn tại',
          duration: 3
        });
      } else {
        notification.error({
          message: 'Thất bại',
          description: 'Lỗi thêm nhân viên',
          duration: 3
        });
      }
      setAddEmployeeModalVisible(false);
    } catch (error) {
      console.error('Error adding employee:', error);
      message.error('Failed to add employee');
    }
  };

  const renderEditModal = () => {
    if (!editingEmployee) return null;
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleModalOk();
      }
    };
    let modalContent;
    switch (editingField) {
      case 'startTime':
      case 'birth':
        const fieldDate = form.getFieldValue(editingField);
        modalContent = (
          <Form.Item name={editingField} label={editingField === 'startTime' ? "Ngày vào làm" : "Ngày sinh"}>
            <div>
              <Input
                onKeyDown={handleKeyPress}
                value={fieldDate ? dayjs(fieldDate).format('DD/MM/YYYY') : ''}
                placeholder={`Chọn ${editingField === 'startTime' ? "ngày vào làm" : "ngày sinh"}`}
                readOnly
                onClick={() => {
                  setTempDate(fieldDate ? new Date(fieldDate) : new Date());
                  setDatePickerVisible(true);
                }}
              />
              {datePickerVisible && (
                <MobileDatePicker
                  value={tempDate}
                  isOpen={datePickerVisible}
                  onSelect={(date) => {
                    form.setFieldsValue({ [editingField]: date });
                    setDatePickerVisible(false);
                  }}
                  onCancel={() => setDatePickerVisible(false)}
                  confirmText="Xác nhận"
                  cancelText="Hủy"
                />
              )}
            </div>
          </Form.Item>
        );
        break;
      case 'salaryValue':
        modalContent = (
          <>
            <Form.Item name="salaryType" label="Loại lương" initialValue={1}>
              <Select>
                <Option value={0}>Chưa có</Option>
                <Option value={1}>Lương theo giờ</Option>
                <Option value={2}>Lương theo tháng</Option>
              </Select>
            </Form.Item>
            <Form.Item name="salaryValue" label="Giá trị" initialValue={0}>
              <InputNumber onKeyDown={handleKeyPress} />
            </Form.Item>
          </>
        );
        break;
      case 'phonenumber':
        modalContent = (
          <Form.Item name="phonenumber" label="Điện thoại">
            <InputNumber onKeyDown={handleKeyPress} style={{ width: '100%' }} />
          </Form.Item>
        );
        break;
      case 'email':
        modalContent = (
          <Form.Item name="email" label="Email">
            <Input onKeyDown={handleKeyPress} />
          </Form.Item>
        );
        break;
      case 'fullname':
        modalContent = (
          <Form.Item name="fullname" label="fullname">
            <Input onKeyDown={handleKeyPress} />
          </Form.Item>
        );
        break;
      case 'position':
        modalContent = (
          <Form.Item name="position" label="Chức vụ">
            <AutoComplete
              options={positionOptions}
              filterOption={(inputValue, option) =>
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
              onKeyDown={handleKeyPress}
            />
          </Form.Item>
        );
        break;
      default:
        modalContent = null;
    }

    return (
      <Modal
        title={`Chỉnh sửa ${editingField}`}
        visible={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            [editingField]: editingEmployee[editingField] ? new Date(editingEmployee[editingField]) : null
          }}
        >
          {modalContent}
        </Form>
      </Modal>
    );
  };

  const renderAddEmployeeModal = () => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleAddEmployee(); // Gọi hàm xử lý khi nhấn Enter
      }
    };
    return (
      <Modal
        title="Thêm nhân viên mới"
        open={addEmployeeModalVisible}
        onOk={handleAddEmployee}
        onFinish={() => addEmployeeForm.resetFields()}
      >
        <Form form={addEmployeeForm} layout="vertical">
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
            <Input.Password onKeyDown={handleKeyPress} />
          </Form.Item>
        </Form>
      </Modal>
    );
  };


  const getPermissionText = (permission) => {
    const permissionMapping = {
      2: "Quản lý ca làm",
      4: "Quản lý chấm công",
      8: "Quản lý lương",
      16: "Tài liệu chấm công",
      32: "Thông báo chấm công",
      64: "Quản lý chuyên cần"
    };

    const selectedPermissions = [];

    Object.keys(permissionMapping).forEach(key => {
      const keyValue = parseInt(key, 10);
      if ((permission & keyValue) === keyValue) {
        selectedPermissions.push(permissionMapping[keyValue]);
      }
    });

    return selectedPermissions.length > 0 ? selectedPermissions.join(', ') : "Chưa có";
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  const filteredEmployees = employees.filter(employee => employee != null && (
    employee.username?.toLowerCase().includes(searchText) ||
    employee.employeeID?.toString().toLowerCase().includes(searchText)
  ));


  const renderButtonCell = (text, record, field, additionalProps = {}) => {
    const isEmpty = text === null || text === undefined || text === 0 || text === '';
    const buttonWidth = isEmpty ? 'auto' : '100%';

    return (
      <Tooltip title={!isEmpty ? text : ''}>
        <Button
          {...additionalProps}
          style={{
            margin: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: buttonWidth,
            textDecoration: record.status === 0 ? 'line-through' : 'none',
            padding: '4px 8px',
            ...additionalProps.style
          }}
          danger={isEmpty}
          onClick={() => handleEdit(record, field)}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden'
            }}
          >
            {isEmpty ? (
              <EditOutlined style={{ marginRight: 0, padding: 0 }} />
            ) : (
              <div style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>
                {text}
              </div>
            )}
          </div>
        </Button>
      </Tooltip>
    );
  };



  const handleStatusChange = async (record, value) => {
    try {
      await updateEmployeeStatus(record.employeeID, value);
      notification.success({
        message: 'Cập nhật thành công',
        description: 'Thông tin nhân viên đã được cập nhật thành công.',
        placement: 'topRight',
        duration: 2
      });
      fetchEmployees();
    } catch (error) {
      console.error('Error updating employee status:', error);
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const handleLateDeductionChange = async (record, value) => {
    try {
      await updateEmployeeDeduction(record.employeeID, value);
      notification.success({
        message: 'Cập nhật thành công',
        description: 'Thông tin nhân viên đã được cập nhật thành công.',
        placement: 'topRight',
        duration: 2
      });
      fetchEmployees();
    } catch (error) {
      console.error('Error updating employee late deduction:', error);
      message.error('Không thể cập nhật cài đặt trừ lương');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'employeeID',
      key: 'employeeID',
      sorter: (a, b) => a.employeeID - b.employeeID,
      width: '50%',
      align: 'center',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ textDecoration: record.status === 0 ? 'line-through' : 'none' }}>
            {text}
          </span>
          <StatusDropdown
            status={record.status}
            onStatusChange={(value) => handleStatusChange(record, value)}
          />
        </div>
      )
    },
    {
      title: 'Tài khoản',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => {
        const aValue = a.username ?? '';
        const bValue = b.username ?? '';
        return aValue.localeCompare(bValue);
      },
      width: 'calc(100%)',
      align: 'center',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ textDecoration: record.status === 0 ? 'line-through' : 'none' }}>
            {text}
          </span>
        </div>
      )
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullname',
      key: 'fullname',
      render: (fullname, record) => renderButtonCell(fullname, record, 'fullname'),
      sorter: (a, b) => {
        const aValue = a.fullname ?? '';
        const bValue = b.fullname ?? '';
        return aValue.localeCompare(bValue);
      },
      width: 'calc(100%)',
      align: 'center'
    },
    {
      title: 'Ngày vào làm',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (startTime, record) => renderButtonCell(startTime ? dayjs(startTime).format('DD/MM/YYYY') : null, record, 'startTime'),
      sorter: (a, b) => a.startTime - b.startTime,
      width: 'calc(100%)',
      align: 'center'
    },
    {
      title: 'Lương',
      dataIndex: 'salaryValue',
      key: 'salaryValue',
      render: (salaryValue, record) => renderButtonCell(salaryValue ? salaryValue.toFixed(3) : salaryValue, record, 'salaryValue'),
      sorter: (a, b) => a.salaryValue - b.salaryValue,
      width: 'calc(100%)',
      align: 'center'
    },
    {
      title: () => (
        <Tooltip title="Trừ lương khi trễ">
          <div className="text-center w-full">Trễ</div>
        </Tooltip>
      ),
      dataIndex: 'lateDeduction',
      key: 'lateDeduction',
      render: (lateDeduction, record) => (
        <Tooltip title={lateDeduction ? 'Trừ lương' : 'Không trừ lương'}>
          <Checkbox
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            checked={lateDeduction}
            onChange={e => handleLateDeductionChange(record, e.target.checked)}
          />
        </Tooltip>
      ),
      width: 'calc(50%)',
      align: 'center'
    },
    {
      title: 'Ca',
      dataIndex: 'shiftWork',
      key: 'shiftWork',
      render: (shiftWork, record) => (
        <Select
          value={shiftWork}
          style={{ width: '100%' }}
          onChange={value => handleShiftWorkChange(record, value)}
        >
          {shiftOptions.map((shift) => (
            <Option key={shift.value} value={shift.value}>{shift.label}</Option>
          ))}
        </Select>
      ),
      sorter: (a, b) => {
        const aValue = a.username ?? '';
        const bValue = b.username ?? '';
        return aValue.localeCompare(bValue);
      },
      width: 'calc(100%)',
      align: 'center'
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'birth',
      key: 'birth',
      render: (birth, record) => renderButtonCell(birth ? dayjs(birth).format('DD/MM/YYYY') : null, record, 'birth'),
      sorter: (a, b) => a.birth - b.birth,
      width: 'calc(100%)',
      align: 'center'
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phonenumber',
      key: 'phonenumber',
      render: (phonenumber, record) => (
        renderButtonCell(
          (phonenumber || '').toString().slice(0, 11),
          record,
          'phonenumber',
          {
            style: {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }
        )
      ),
      sorter: (a, b) => {
        const aValue = a.username ?? '';
        const bValue = b.username ?? '';
        return aValue.localeCompare(bValue);
      },
      width: 'calc(100%)',
      align: 'center'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email, record) => renderButtonCell(email, record, 'email'),
      sorter: (a, b) => {
        const aValue = a.username ?? '';
        const bValue = b.username ?? '';
        return aValue.localeCompare(bValue);
      },
      width: 'calc(100%)',
      align: 'center'
    },
    {
      title: 'Chức vụ',
      dataIndex: 'position',
      key: 'position',
      render: (position, record) => renderButtonCell(position, record, 'position'),
      sorter: (a, b) => {
        const aValue = a.username ?? '';
        const bValue = b.username ?? '';
        return aValue.localeCompare(bValue);
      },
      width: 'calc(100%)',
      align: 'center'
    },
  ].filter(col => col.key !== 'status');


  const isAllChecked = checkedColumns.length === columns.length;
  const handleToggleAll = () => {
    if (isAllChecked) {
      setCheckedColumns([]); // Bỏ chọn tất cả
      setVisibleColumns([]);
    } else {
      const allColumns = columns.map(col => col.key); // Chọn tất cả
      setCheckedColumns(allColumns);
      setVisibleColumns(allColumns);
    }
  };
  const visibleColumnsData = columns.filter(col => visibleColumns.includes(col.key));

  return (
    <div className='card'>
      <div className='m-3' style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <TableHeader
          onSearch={handleSearch}
          onToggleExpand={toggleExpandAll}
          isAllExpanded={expandedRows.length === employees.length}
          onAddEmployee={() => setAddEmployeeModalVisible(true)}
          columns={columns}
          checkedColumns={checkedColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          isAllChecked={isAllChecked}
          onToggleAll={handleToggleAll}
        />
      </div>
      <div className='card-body'>
        <Table
          bordered
          size="large"
          style={{ overflowY: 'hidden' }}
          scroll={{ y: '80vh' }}
          tableLayout="fixed"
          columns={visibleColumnsData}
          dataSource={filteredEmployees}
          loading={loading}
          rowKey="employeeID"
          locale={{
            emptyText: <EmptyData />, // Thay đổi thông báo "No Data"
          }}
          expandable={{
            expandedRowRender: record => (
              <div className="float-end">
                <span style={{ marginRight: 10 }}>Quyền: {getPermissionText(record.permission)}</span>
                <Button onClick={() => {
                  setEditingEmployee(record);
                  setPermissionModalVisible(true);
                }}>
                  Chỉnh sửa quyền
                </Button>
              </div>
            ),
            expandedRowKeys: expandedRows,
            onExpandedRowsChange: setExpandedRows,
          }}
          pagination={{
            defaultPageSize: 20,
          }}
        />
      </div>
      <PermissionModal
        visible={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        onOk={() => {
          setPermissionModalVisible(false);
          fetchEmployees();
        }}
        employee={editingEmployee}
      />
      {renderEditModal()}
      {renderAddEmployeeModal()}
    </div>
  );
};

export default EmployeeTable;