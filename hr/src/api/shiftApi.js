import api from './index';

export const fetchShifts = async () => {
  try {
    const response = await api.post('api/hrm/shift-work/work-schedule');
    return response;
  } catch (error) {
    console.error('Error fetching shifts:', error);
    throw error;
  }
};

export const fetchEmployeeInfo = async (listEmployeeID) => {
  try {
    const response = await api.post('global/api/employee-info', { listEmployeeID });
    return response.data;
  } catch (error) {
    console.error('Error fetching employee info:', error);
    throw error;
  }
};
export const fetchEmployeeData = async (listEmployeeID) => {
  try {
    const response = await api.post('global/api/employee-data', { listEmployeeID });
    return response.data;
  } catch (error) {
    console.error('Error fetching employee info:', error);
    throw error;
  }
};

export const fetchTimesheet = async (timeOfMonth, listEmployeeID) => {
  try {
    const response = await api.post('api/hrm/shift-work/timesheet', { timeOfMonth, listEmployeeID });
    return response.data;
  } catch (error) {
    console.error('Error fetching timesheet:', error);
    throw error;
  }
};

export const insertTimesheet = async (employeeID, timeSheet) => {
  try {
    const response = await api.post('api/hrm/shift-work/shift-manager/timesheet/insert', { employeeID, timeSheet });
    return response.data;
  } catch (error) {
    console.error('Error inserting timesheet:', error);
    throw error;
  }
};

export const editTimesheet = async (timeOfMonth, timeSheet) => {
  const response = await api.post('api/hrm/shift-work/shift-manager/timesheet/edit', { timeOfMonth, timeSheet });
  return response.data;
};

export const deleteTimesheet = async (employeeID, timeOfMonth, listRowID) => {
  try {
    const response = await api.post('api/hrm/shift-work/shift-manager/timesheet/delete', { employeeID, timeOfMonth, listRowID });
    return response.data;
  } catch (error) {
    console.error('Error deleting timesheet:', error);
    throw error;
  }
};

export const fillMonthShift = async (employeeID, shiftName, timeOfMonth) => {
  try {
    const response = await api.post('api/hrm/shift-work/shift-manager/timesheet/fill-1-month', { employeeID, shiftName, timeOfMonth });
    return response.data;
  } catch (error) {
    console.error('Error filling month shift:', error);
    throw error;
  }
};
export const timekeeperEdit = async (timeOfMonth, employeeID, rowID, timeCheckIn, timeCheckOut) => {
  try {
    const response = await api.post('api/hrm/shift-work/timekeeper/edit', { timeOfMonth, employeeID, rowID, timeCheckIn, timeCheckOut });
    return response.data;
  } catch (error) {
    console.error('Error filling month shift:', error);
    throw error;
  }
};