import api from './index';



// Lấy danh sách nhân viên
export const fetchEmployees = async () => {
  try {
    const response = await api.post('api/administrative/employee/query');
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

// Thêm quyền cho nhân viên
export const addEmployeePermission = async (employeeId, value) => {
  try {
    const response = await api.post('api/administrative/master/permission-add', {
      employeeID: employeeId,
      value: value
    });
    return response.data;
  } catch (error) {
    console.error('Error adding employee permission:', error);
    throw error;
  }
};

// Xoá quyền của nhân viên
export const removeEmployeePermission = async (employeeId, value) => {
  try {
    const response = await api.post('/api/administrative/master/permission-remove', {
      employeeID: employeeId,
      value: value
    });
    return response.data;
  } catch (error) {
    console.error('Error removing employee permission:', error);
    throw error;
  }
};

// Cập nhật lương nhân viên
export const updateEmployeeSalary = async (employeeId, newSalary) => {
  try {
    const response = await api.post('/api/administrative/master/salary-set', {
      employeeID: employeeId,
      salaryType: newSalary.salaryType,
      salaryValue: newSalary.newSalary
    });
    return response.data;
  } catch (error) {
    console.error('Error updating employee salary:', error);
    throw error;
  }
};

// Cập nhật khoản trừ lương của nhân viên
export const updateEmployeeDeduction = async (employeeId, salary) => {
  try {
    const response = await api.post('/api/administrative/master/late-deduction-set', {
      employeeID: employeeId,
      lateDeduction: salary
    });
    return response.data;
  } catch (error) {
    console.error('Error updating employee deduction:', error);
    throw error;
  }
};

// Cập nhật vị trí nhân viên
export const updateEmployeePosition = async (employeeId, position) => {
  try {
    const response = await api.post('/api/administrative/master/position-set', {
      employeeID: employeeId,
      position: position
    });
    return response.data;
  } catch (error) {
    console.error('Error updating employee position:', error);
    throw error;
  }
};
// Cập nhật fullname nhân viên
export const updateEmployeeFullname = async (employeeId, fullname) => {
  try {
    const response = await api.post('/api/administrative/master/fullname-set', {
      employeeID: employeeId,
      fullname: fullname
    });
    return response.data;
  } catch (error) {
    console.error('Error updating employee fullname:', error);
    throw error;
  }
};

// Cập nhật email của nhân viên
export const updateEmployeeEmail = async (employeeId, email) => {
  try {
    const response = await api.post('api/administrative/master/email', {
      employeeID: employeeId,
      email: email
    });
    return response.data;
  } catch (error) {
    console.error('Error updating employee email:', error);
    throw error;
  }
};

// Cập nhật ca làm việc của nhân viên
export const updateEmployeeShiftwork = async (employeeId, shiftWork) => {
  try {
    const response = await api.post('/api/administrative/master/shift-work-set', {
      employeeID: employeeId,
      shiftWork: shiftWork
    });
    return response.data;
  } catch (error) {
    console.error('Error updating employee shift work:', error);
    throw error;
  }
};

// Thêm nhân viên mới
export const addEmployee = async (username, password) => {
  try {
    const response = await api.post('api/administrative/employee/create', {
      username: username,
      password: password
    });
    return response.data;
  } catch (error) {
    console.error('Error adding employee:', error);
    throw error;
  }
};

// Cập nhật mật khẩu của nhân viên
export const updateEmployeePassword = async (username, newPassword) => {
  try {
    const response = await api.post('api/administrative/master/password-set', {
      username: username,
      password: newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error updating employee password:', error);
    throw error;
  }
};

// Cập nhật trạng thái nhân viên
export const updateEmployeeStatus = async (employeeId, newStatus) => {
  try {
    const response = await api.post('/api/administrative/master/status-set', {
      employeeID: employeeId,
      status: parseInt(newStatus)
    });
    return response.data;
  } catch (error) {
    console.error('Error updating employee status:', error);
    throw error;
  }
};

// Cập nhật số điện thoại của nhân viên
export const updateEmployeePhone = async (employeeId, newPhone) => {
  try {
    const response = await api.post('/api/administrative/master/phone', {
      employeeID: employeeId,
      phone: parseInt(newPhone)
    });
    return response.data;
  } catch (error) {
    console.error('Error updating employee phone:', error);
    throw error;
  }
};

// Cập nhật ngày sinh của nhân viên
export const updateEmployeeBirth = async (employeeId, birth) => {
  try {
    const response = await api.post('api/administrative/master/birthday', {
      employeeID: employeeId,
      birth: birth
    });
    return response.data;
  } catch (error) {
    console.error('Error updating employee birth date:', error);
    throw error;
  }
};

// Cập nhật ngày bắt đầu làm việc của nhân viên
export const updateEmployeeStartDay = async (employeeId, day) => {
  try {
    const response = await api.post('/api/administrative/master/starttime-set', {
      employeeID: employeeId,
      startTime: day
    });
    return response.data;
  } catch (error) {
    console.error('Error updating employee start day:', error);
    throw error;
  }
};
