import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Table, Button, DatePicker, Row, Col, Spin, Skeleton, Switch, notification, } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchTimesheet, fetchEmployeeInfo } from '../../../api/shiftApi';
import 'dayjs/locale/vi';
import ColumnVisibilityDropdown from './ColumnVisibilityDropdown';
import ExportExcel from './ExportExcel';
import ImportPayroll from './ImportPayroll';
import PayrollModal from './PayrollModal';
import { EyeIcon } from 'lucide-react';
import './antd-table-cell.css';
import EmptyData from '../../Ultils/EmptyData/EmptyData';
import EmployeeSelectorModal from '../HRM/TimeKepper/Timesheet/EmployeeSelectorModal';
dayjs.locale('vi');

const ScheduleTimesheet = ({ isAddShift }) => {
  const [danhSachNhanVien, setDanhSachNhanVien] = useState({});
  const [duLieuChamCong, setDuLieuChamCong] = useState([]);
  const [thangHienTai, setThangHienTai] = useState(dayjs());
  const [tatCaNhanVien, setTatCaNhanVien] = useState([]);
  const [nhanVienHienThi, setNhanVienHienThi] = useState([]);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef(null);
  const [isRendering, setIsRendering] = useState(true);
  const [showIcons, setShowIcons] = useState(true);
  const [stickyCols, setStickyCols] = useState(['tongCong']);
  const [visibleColumns, setVisibleColumns] = useState(['gioLam', 'buoiLam', 'gioTre', 'buoiTre', 'gioOT', 'buoiOT', 'luongGio', 'luongOT', 'truTre']);
  const [payrollModal, setPayrollModal] = useState({
    visible: false,
    employeeId: null
  });
  const layTatCaNhanVien = async () => {
    try {
      const duLieu = await fetchEmployeeInfo([]);
      const danhSachNV = duLieu.data.map(nv => ({
        value: nv.employeeID.toString(),
        label: `${nv.employeeID} - ${nv.fullname || nv.nickname || nv.username}`
      }));
      setTatCaNhanVien(danhSachNV);
    } catch (loi) {
      console.error('Lỗi khi lấy danh sách nhân viên:', loi);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể lấy danh sách nhân viên',
        placement: 'topRight',
      });
    }
  };

  useEffect(() => {
    const savedEmployees = localStorage.getItem('selectedEmployees');
    if (savedEmployees) {
      setNhanVienHienThi(JSON.parse(savedEmployees));
    }
    layTatCaNhanVien();
  }, []);
  useEffect(() => {
    layDuLieuChamCong();
    handleScrollToToday();
  }, [thangHienTai]);
  useEffect(() => {
    khoiTaoDanhSachNhanVien();
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRendering(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [thangHienTai]);


  const khoiTaoDanhSachNhanVien = async () => {
    setLoading(true);
    try {
      // Get selected employees from localStorage
      const savedEmployees = localStorage.getItem('selectedEmployees');
      const employeeList = savedEmployees ? JSON.parse(savedEmployees).map(Number) : [];

      const duLieu = await fetchEmployeeInfo(employeeList);
      const thongTinNhanVien = duLieu.data.reduce((acc, nv) => {
        acc[nv.employeeID] = {
          maNhanVien: nv.employeeID,
          bietDanh: nv.fullname || nv.nickname || nv.username,
          caLamViec: nv.shiftWork
        };
        return acc;
      }, {});
      setDanhSachNhanVien(thongTinNhanVien);

      // If no employees are selected, set all employees as default
      if (!savedEmployees || employeeList.length === 0) {
        const allEmployees = Object.keys(thongTinNhanVien).map(String);
        setNhanVienHienThi(allEmployees);
        localStorage.setItem('selectedEmployees', JSON.stringify(allEmployees));
      }
    } catch (loi) {
      console.error('Lỗi khi lấy thông tin nhân viên:', loi);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể lấy thông tin nhân viên',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };
  const layDuLieuChamCong = async () => {
    setLoading(true);
    try {
      const savedEmployees = localStorage.getItem('selectedEmployees');
      const employeeList = savedEmployees ? JSON.parse(savedEmployees).map(Number) : [];
      const duLieu = await fetchTimesheet(thangHienTai.valueOf(), employeeList);
      setDuLieuChamCong(duLieu.data);
    } catch (loi) {
      console.error('Lỗi khi lấy dữ liệu chấm công:', loi);
    } finally {
      setLoading(false);
    }
  };


  const xuLyThayDoiThang = (ngay) => {
    setThangHienTai(ngay);
  };

  const getButtonStyle = (caLam) => {
    const thoiGianBatDau = dayjs(caLam.timeBegin);
    const thoiGianKetThuc = dayjs(caLam.timeEnd);
    const hienTai = dayjs();

    const baseStyle = {
      margin: '2px',
      height: '44px',
      width: '44px',
    };

    if (showIcons) {
      // Sử dụng màu tương phản tốt cho text khi hiển thị icon
      if (hienTai.isBefore(thoiGianBatDau)) {
        return { ...baseStyle, color: '#666666', fontSize: '20px' }; // Giữ nguyên màu xám
      }

      if (!caLam.timeCheckIn && !caLam.timeCheckOut) {
        return { ...baseStyle, color: '#DC2626', fontSize: '20px' }; // Đỏ đậm
      }
      if (!caLam.timeCheckIn || !caLam.timeCheckOut) {
        return { ...baseStyle, color: '#D6249F', fontSize: '20px' }; // Hồng đậm
      }

      const timeCheckIn = dayjs(caLam.timeCheckIn - 60 * 1000);
      const timeCheckOut = dayjs(caLam.timeCheckOut);

      if (timeCheckIn.isBefore(thoiGianBatDau) && timeCheckOut.isAfter(thoiGianKetThuc)) {
        return { ...baseStyle, color: '#16A34A', fontSize: '20px' }; // Xanh lá đậm
      }

      if (timeCheckIn.isAfter(thoiGianBatDau) || timeCheckOut.isBefore(thoiGianKetThuc)) {
        return { ...baseStyle, color: '#CA8A04', fontSize: '20px' }; // Vàng đậm
      }

      return { ...baseStyle, color: '#16A34A', fontSize: '20px' }; // Xanh lá đậm
    } else {
      // Giữ nguyên màu nền gốc nhưng điều chỉnh độ trong suốt
      if (hienTai.isBefore(thoiGianBatDau)) {
        return { ...baseStyle, backgroundColor: '#f0f0f0', color: '#666' };
      }

      if (!caLam.timeCheckIn && !caLam.timeCheckOut) {
        return { ...baseStyle, backgroundColor: '#DC2626', color: 'white' }; // Đỏ đậm
      }
      if (!caLam.timeCheckIn || !caLam.timeCheckOut) {
        return { ...baseStyle, backgroundColor: '#D6249F', color: 'white' }; // Hồng đậm
      }

      const timeCheckIn = dayjs(caLam.timeCheckIn - 60 * 1000);
      const timeCheckOut = dayjs(caLam.timeCheckOut);

      if (timeCheckIn.isBefore(thoiGianBatDau) && timeCheckOut.isAfter(thoiGianKetThuc)) {
        return { ...baseStyle, backgroundColor: '#16A34A', color: 'white' }; // Xanh lá đậm
      }

      if (timeCheckIn.isAfter(thoiGianBatDau) || timeCheckOut.isBefore(thoiGianKetThuc)) {
        return { ...baseStyle, backgroundColor: '#CA8A04', color: 'white' }; // Vàng đậm
      }

      return { ...baseStyle, backgroundColor: '#16A34A', color: 'white' }; // Xanh lá đậm
    }
  };

  const renderButtonContent = (caLam) => {
    if (showIcons) {
      const iconStyle = {
        fontSize: '24px',
        filter: 'drop-shadow(0px 0px 1px rgba(0,0,0,0.2))',
        opacity: 0.3,
      };

      if (caLam.timeCheckIn == -1 && caLam.timeCheckOut == -1) {
        return <span style={{ ...iconStyle, color: 'red' }}>✈️</span>;
      }
      if (!caLam.timeCheckIn && !caLam.timeCheckOut) {
        return <span style={{ ...iconStyle, color: 'red' }}>✖️</span>;
      }
      if (!caLam.timeCheckIn || !caLam.timeCheckOut) {
        return <span style={{ ...iconStyle, color: '#D6249F', opacity: 1 }}>🚩</span>;
      }
      const timeCheckIn = dayjs(caLam.timeCheckIn - 60 * 1000);
      const timeCheckOut = dayjs(caLam.timeCheckOut);
      if (timeCheckIn > dayjs(caLam.timeBegin) || timeCheckOut < dayjs(caLam.timeEnd)) {
        return <span style={{ ...iconStyle, color: '#CA8A04' }}>⚠️</span>;
      }
      return <span style={{ ...iconStyle, color: '#16A34A' }}>✔️</span>;
    }
    return (
      <div>
        {caLam.timeCheckIn === -1 && caLam.timeCheckOut === -1 ? (
          <div>nghỉ phép</div>
        ) : caLam.timeCheckIn || caLam.timeCheckOut ? (
          <>
            <div style={{ paddingTop: '4px' }}>
              {caLam.timeCheckIn === 0 ? '?' : dayjs(caLam.timeCheckIn).format('HH:mm')}
            </div>
            <div style={{ paddingBottom: '4px' }}>
              {caLam.timeCheckOut === 0 ? '?' : dayjs(caLam.timeCheckOut).format('HH:mm')}
            </div>
          </>
        ) : (!caLam.timeCheckIn && !caLam.timeCheckOut && new Date() > caLam.timeBegin) ? (
          <>
            <div>Vắng</div>
          </>
        ) : new Date() < caLam.timeBegin ? (
          <>
            <div style={{ paddingTop: '4px' }}>{dayjs(caLam.timeBegin).format('HH:mm')}</div>
            <div style={{ paddingBottom: '4px' }}>{dayjs(caLam.timeEnd).format('HH:mm')}</div>
          </>
        ) : (
          caLam.timeCheckOut === 0 && new Date() > caLam.timeEnd ? (
            <div>Vắng</div>
          ) : (
            <div>Văng</div>
          )
        )}
      </div>
    );
  };
  const calculateWorkHours = (shifts, shiftName) => {
    return shifts
      .filter(shift => shift.shiftName === shiftName && shift.timeCheckIn && shift.timeCheckOut)
      .reduce((total, shift) => total + (shift.timeCheckOut - shift.timeCheckIn) * shift.coefficientsSalary / 3600000, 0);
  };

  const calculateWorkDays = (shifts) => {
    const uniqueDays = new Set(shifts
      .filter(shift => shift.timeCheckIn && shift.timeCheckOut)
      .map(shift => dayjs(shift.timeBegin).format('YYYY-MM-DD')));
    return uniqueDays.size;
  };

  const calculateLateHours = (shifts) => {
    let totalLateHours = 0;
    shifts
      .filter(shift => shift.timeCheckIn && shift.timeBegin)
      .forEach(shift => {
        const lateTime = Math.max(0, (shift.timeCheckIn - shift.timeBegin) / 3600000);
        totalLateHours += lateTime;
      });
    return totalLateHours;
  };

  const calculateOTHours = (shifts, shiftName) => {
    return shifts
      .filter(shift => shift.shiftName !== shiftName && shift.timeCheckIn && shift.timeCheckOut)
      .reduce((total, shift) => total + (shift.timeCheckOut - shift.timeCheckIn) / 3600000, 0);
  };

  const calculateHourlyRate = (employee, shifts) => {
    if (employee.salaryType === 1) return employee.salaryValue;
    if (employee.salaryType === 2) {
      const totalScheduledHours = shifts.reduce((total, shift) => total + (shift.timeEnd - shift.timeBegin) / 3600000, 0);
      return employee.salaryValue / totalScheduledHours;
    }
    return 0;
  };

  const tinhGioCongColumns = [
    {
      title: 'Giờ làm',
      dataIndex: 'gioLam',
      key: 'gioLam',
      width: 100,
      fixed: stickyCols.includes('gioLam') ? 'right' : false,
      render: (value) => value.toFixed(2),
    },
    {
      title: 'Buổi làm',
      dataIndex: 'buoiLam',
      key: 'buoiLam',
      width: 100,
      fixed: stickyCols.includes('buoiLam') ? 'right' : false,
    },
    {
      title: 'Giờ trễ',
      dataIndex: 'gioTre',
      key: 'gioTre',
      width: 100,
      fixed: stickyCols.includes('gioTre') ? 'right' : false,
      render: (value) => value.toFixed(2),
    },
    {
      title: 'Buổi trễ',
      dataIndex: 'buoiTre',
      key: 'buoiTre',
      width: 100,
      fixed: stickyCols.includes('buoiTre') ? 'right' : false,
    },
    {
      title: 'Giờ OT',
      dataIndex: 'gioOT',
      key: 'gioOT',
      width: 100,
      fixed: stickyCols.includes('gioOT') ? 'right' : false,
      render: (value) => value.toFixed(2),
    },
    {
      title: 'Buổi OT',
      dataIndex: 'buoiOT',
      key: 'buoiOT',
      width: 100,
      fixed: stickyCols.includes('buoiOT') ? 'right' : false,
    },
    {
      title: 'Lương giờ',
      dataIndex: 'luongGio',
      key: 'luongGio',
      width: 100,
      fixed: stickyCols.includes('luongGio') ? 'right' : false,
      render: (value) => value.toFixed(2),
    },
    {
      title: 'Lương OT',
      dataIndex: 'luongOT',
      key: 'luongOT',
      width: 100,
      fixed: stickyCols.includes('luongOT') ? 'right' : false,
      render: (value) => value.toFixed(2),
    },
    {
      title: 'Trừ trễ',
      dataIndex: 'truTre',
      key: 'truTre',
      width: 100,
      fixed: stickyCols.includes('truTre') ? 'right' : false,
      render: (value) => value.toFixed(2),
    },
  ];
  const cot = useMemo(() => {
    const baseColumns = [
      {
        title: <div style={{ fontSize: 20, textAlign: 'center' }}>Thông tin nhân viên</div>,
        fixed: 'left',
        children: [
          {
            title: 'Mã NV',
            dataIndex: 'maNhanVien',
            key: 'maNhanVien',
            width: 80,
            render: (text) => (
              <div style={{ textAlign: 'center' }}>
                {text}
              </div>
            )
          },
          {
            title: 'Phiếu lương',
            key: 'bangLuong',
            width: 100,
            render: (_, record) => (
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPayrollModal({
                      visible: true,
                      employeeId: record.maNhanVien,
                      employeeName: record.tenNhanVien
                    });
                  }}
                  icon={<EyeIcon className="h-5 w-5" />}
                />
              </div>
            )
          },
          {
            title: 'Tên NV',
            dataIndex: 'tenNhanVien',
            key: 'tenNhanVien',
            fixed: 'left',
            width: 120,
            filters: Object.entries(danhSachNhanVien).map(([maNhanVien, thongTin]) => ({
              text: thongTin.bietDanh,
              value: thongTin.bietDanh,
            })),
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value, record) => record.tenNhanVien.includes(value),
            render: (text) => (
              <div style={{ textAlign: 'center' }}>
                {text}
              </div>
            )
          }
        ]
      },
      {
        title: <div style={{ fontSize: 30, textAlign: 'center' }}>Ngày trong tháng</div>,
        children: Array.from({ length: thangHienTai.daysInMonth() }, (_, index) => {
          const ngay = thangHienTai.date(index + 1);
          const dateStr = ngay.format('YYYY-MM-DD');
          return {
            title: (
              <div style={{ textAlign: 'center' }} data-date={dateStr}>
                {ngay.format('DD')}
                <br />
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][ngay.day()]}
              </div>
            ),
            dataIndex: dateStr,
            key: dateStr,
            width: 50,
            onHeaderCell: () => ({
              'data-date': dateStr
            }),
            render: (ca, record) => (
              <div style={{ textAlign: 'center' }} data-date={dateStr}>
                {ca && ca.map((caLam) => (
                  <div key={caLam.rowID} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <div style={{
                        ...getButtonStyle(caLam),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '5px'
                      }}>
                        {renderButtonContent(caLam)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ),
          };
        }),
      },
    ];

    if (visibleColumns.length > 0) {
      baseColumns.push({
        title: <div style={{ fontSize: 30, textAlign: 'center' }}>Tính giờ công</div>,
        fixed: 'right',
        children: tinhGioCongColumns.filter(col => visibleColumns.includes(col.key)),
      });
    }

    baseColumns.push({
      title: <span style={{ fontSize: 30, textAlign: 'center' }}>Tổng cộng</span>,
      dataIndex: 'tongCong',
      key: 'tongCong',
      fixed: 'right',
      width: 120,
      render: (value) => (
        <div style={{ textAlign: 'center' }}>
          {value.toFixed(2)}
        </div>
      ),
    });

    return baseColumns;
  }, [thangHienTai, isAddShift, danhSachNhanVien, showIcons, stickyCols, visibleColumns]);
  const handleEmployeeSelectionChange = (selectedValues) => {
    setNhanVienHienThi(selectedValues);
    localStorage.setItem('selectedEmployees', JSON.stringify(selectedValues));
    khoiTaoDanhSachNhanVien();
    layDuLieuChamCong();
  };

  const handleScrollToToday = () => {
    const today = dayjs();
    if (today.month() !== thangHienTai.month() || today.year() !== thangHienTai.year()) {
      return; // không làm gì nếu không phải tháng hiện tại
    } else {
      const timeSheetTable = document.querySelector('.timesheet-table');

      const scrollContainer = isAddShift
        ? timeSheetTable?.querySelector('.ant-table-body')
        : timeSheetTable?.querySelector('.ant-table-body');
      const thead = isAddShift
        ? timeSheetTable?.querySelector('.ant-table-thead')
        : timeSheetTable?.querySelector('.ant-table-thead');
      const todayCell = thead?.querySelector(`[data-date="${today.format('YYYY-MM-DD')}"]`);

      if (scrollContainer && todayCell) {
        const daysInMonth = today.daysInMonth();
        const containerWidth = todayCell.offsetWidth * daysInMonth;

        const targetScroll = containerWidth - todayCell.offsetWidth * (daysInMonth - today.date() + 2);

        scrollContainer.scrollTo({
          left: targetScroll,
          behavior: 'smooth'
        });

        todayCell.style.backgroundColor = 'rgba(255, 193, 7, 0.6)';
        todayCell.style.transition = 'background-color 2s ease';
        setTimeout(() => {
          todayCell.style.backgroundColor = '';
        }, 2000);

        const allCells = timeSheetTable.querySelectorAll(`.ant-table-cell:has(div[data-date="${today.format('YYYY-MM-DD')}"])`);

        allCells.forEach(cell => {
          cell.style.backgroundColor = 'rgba(255, 193, 7, 0.6)';
          cell.style.transition = 'background-color 2s ease';
          setTimeout(() => {
            cell.style.backgroundColor = '';
          }, 2000);
        });
      }
    }
  };
  const nguonDuLieu = useMemo(() => Object.entries(danhSachNhanVien)
    .filter(([maNhanVien]) => nhanVienHienThi.includes(maNhanVien))
    .map(([maNhanVien, thongTin]) => {
      const caLamNhanVien = duLieuChamCong.filter(caLam => caLam.employeeID === parseInt(maNhanVien));
      const gioLam = calculateWorkHours(caLamNhanVien, thongTin.caLamViec);
      const buoiLam = calculateWorkDays(caLamNhanVien);
      const gioTre = calculateLateHours(caLamNhanVien);
      const gioOT = calculateOTHours(caLamNhanVien, thongTin.caLamViec);
      const luongGio = calculateHourlyRate(thongTin, caLamNhanVien);
      const luongOT = luongGio * gioOT;
      const truTre = gioTre * luongGio;
      const tongBonus = caLamNhanVien.reduce((total, shift) => total + (shift.bonus || 0), 0);

      const tongCong = (luongGio * gioLam) + tongBonus + luongOT + (thongTin.lateDeduction ? 0 : truTre);

      const duLieuHang = {
        key: maNhanVien,
        maNhanVien: parseInt(maNhanVien),
        tenNhanVien: thongTin.bietDanh,
        caLamViec: thongTin.caLamViec,
        gioLam,
        buoiLam,
        gioTre,
        buoiTre: caLamNhanVien.filter(shift => shift.timeCheckIn > shift.timeBegin).length,
        gioOT,
        buoiOT: caLamNhanVien.filter(shift => shift.shiftName !== thongTin.caLamViec).length,
        luongGio,
        luongOT,
        truTre,
        tongCong,
      };

      Array.from({ length: thangHienTai.daysInMonth() }, (_, index) => {
        const ngay = thangHienTai.date(index + 1);
        const khoaNgay = ngay.format('YYYY-MM-DD');
        duLieuHang[khoaNgay] = caLamNhanVien.filter(caLam =>
          dayjs(caLam.timeBegin).format('YYYY-MM-DD') === khoaNgay
        );
      });

      return duLieuHang;
    }), [danhSachNhanVien, duLieuChamCong, thangHienTai, nhanVienHienThi]);

  const renderTableContent = () => {
    if (isRendering || loading) {
      return (
        <div>
          {/* Header skeleton */}
          <div style={{ padding: '16px', background: '#fafafa', marginBottom: '8px' }}>
            <Skeleton.Input style={{ width: 200 }} active />
          </div>

          {/* Table rows skeleton */}
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
      <Table
        ref={tableRef}
        bordered={true}
        dataSource={nguonDuLieu}
        columns={cot}
        scroll={{ x: 'max-content', y: '65vh' }}
        pagination={false}
        sticky
        className='timesheet-table'
        locale={{
          emptyText: <EmptyData />, // Thay đổi thông báo "No Data"
        }}
      />
    );
  };
  return (
    <Spin spinning={loading} style={{}}>
      <div className='card' style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              onClick={handleScrollToToday}
              style={{ fontSize: '16px', padding: '10px 20px' }}
              icon={<CalendarOutlined />}
            >
              Hôm nay
            </Button>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Switch
                checked={showIcons}
                onChange={(e) => setShowIcons(e)}
                checkedChildren="Kí hiệu"
                unCheckedChildren="Chữ số"
                size='large'
              />
            </div>
            <EmployeeSelectorModal
              nhanVienHienThi={nhanVienHienThi}
              handleEmployeeSelectionChange={handleEmployeeSelectionChange}
              tatCaNhanVien={tatCaNhanVien}
            />
            <ColumnVisibilityDropdown
              columns={tinhGioCongColumns}
              checkedColumns={visibleColumns}
              onColumnChange={setVisibleColumns}
              stickyColumns={stickyCols}
              onStickyChange={setStickyCols}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <ImportPayroll
              thangHienTai={thangHienTai}
            />
            <ExportExcel
              data={nguonDuLieu}
              visibleColumns={visibleColumns}
              tinhGioCongColumns={tinhGioCongColumns}
              thangHienTai={thangHienTai}
            />
            <DatePicker
              allowClear={false}
              picker="month"
              value={thangHienTai}
              onChange={(ngay) => {
                xuLyThayDoiThang(ngay);
              }}
              style={{ width: '200px', fontSize: '16px' }}
            />
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
          {renderTableContent()}
        </div>
        <PayrollModal
          visible={payrollModal.visible}
          employeeId={payrollModal.employeeId}
          employeeName={payrollModal.employeeName}
          month={thangHienTai}
          onClose={() => setPayrollModal({ visible: false, employeeId: null, employeeName: null })}
        />
      </div>
    </Spin>
  );
};

export default ScheduleTimesheet;