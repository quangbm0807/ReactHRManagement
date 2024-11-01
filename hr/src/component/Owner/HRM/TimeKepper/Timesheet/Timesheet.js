import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Modal, Form, DatePicker, notification, ConfigProvider, Badge, } from 'antd';
import { ExclamationCircleOutlined, CalendarOutlined, } from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchEmployeeInfo, fetchTimesheet, fetchShifts, insertTimesheet, editTimesheet, deleteTimesheet, fillMonthShift, timekeeperEdit } from '../../../../../api/shiftApi';
import 'dayjs/locale/vi';
import locale from 'antd/es/locale/vi_VN';
import EmptyData from '../../../../Ultils/EmptyData/EmptyData';
import { renderDefaultShiftConfirmModal, renderGanCaModal } from './modals';
import ShiftModal from './ShiftModal';
import ColorLegend from './ColorLegend';
import renderTableContent from './renderTableContent';
import EmployeeSelectorModal from './EmployeeSelectorModal';
dayjs.locale('vi');



const ScheduleTimesheet = ({ isAddShift }) => {
  const [danhSachNhanVien, setDanhSachNhanVien] = useState({});
  const [duLieuChamCong, setDuLieuChamCong] = useState([]);
  const [thangHienTai, setThangHienTai] = useState(dayjs());
  const [hienThiModal, setHienThiModal] = useState(false);
  const [caLamHienTai, setCaLamHienTai] = useState(null);
  const [hienThiModalGanCa, setHienThiModalGanCa] = useState(false);
  const [danhSachCaLam, setDanhSachCaLam] = useState([]);
  const [form] = Form.useForm();
  const [formGanCa] = Form.useForm();
  const [nhanVienHienThi, setNhanVienHienThi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tatCaNhanVien, setTatCaNhanVien] = useState([]);
  const tableRef = useRef(null);
  const [isRendering, setIsRendering] = useState(true);
  const [showDefaultShiftModal, setShowDefaultShiftModal] = useState(false);

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
    // Lấy danh sách nhân viên đã chọn từ localStorage
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
    layDanhSachCaLam();
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

  const handleEmployeeSelectionChange = (selectedValues) => {
    setNhanVienHienThi(selectedValues);
    localStorage.setItem('selectedEmployees', JSON.stringify(selectedValues));
    khoiTaoDanhSachNhanVien();
    layDuLieuChamCong();
  };

  const handleAssignDefaultShift = async () => {
    try {
      setHienThiModalGanCa(false);
      setShowDefaultShiftModal(true);
    } catch (error) {
      console.error('Lỗi khi gán ca mặc định:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Đã xảy ra lỗi khi gán ca mặc định',
        placement: 'topRight',
      });
    }
  };

  const handleConfirmDefaultShift = async () => {
    setLoading(true);
    try {
      const promises = Object.entries(danhSachNhanVien).map(async ([maNhanVien, thongTin]) => {
        if (thongTin.caLamViec) {
          return await fillMonthShift(maNhanVien, thongTin.caLamViec, thangHienTai.valueOf());
        }
        return Promise.resolve();
      });

      await Promise.all(promises);

      notification.success({
        message: 'Thành công',
        description: 'Đã gán ca mặc định cho tất cả nhân viên',
        placement: 'topRight',
      });
      setShowDefaultShiftModal(false);
      layDuLieuChamCong();
    } catch (error) {
      console.error('Lỗi khi gán ca mặc định:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Đã xảy ra lỗi khi gán ca mặc định',
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
  const layDanhSachCaLam = async () => {
    setLoading(true);
    try {
      const duLieu = await fetchShifts();
      setDanhSachCaLam(duLieu.data.data ? duLieu.data.data : []);
    } catch (loi) {
      console.error('Lỗi khi lấy danh sách ca làm:', loi);
    } finally {
      setLoading(false);
    }
  };

  const xuLyThayDoiThang = (ngay) => {
    setThangHienTai(ngay);
  };

  const hienThiModals = (ca, tenNhanVien, maNhanVien) => {
    const laCaMoi = ca.rowID === -1;
    setCaLamHienTai({ ...ca, tenNhanVien, maNhanVien, laCaMoi });
    form.setFieldsValue({
      ...ca,
      tenNhanVien,
      maNhanVien,
      ngayCa: ca.timeBegin ? dayjs(ca.timeBegin) : null,
      thoiGianBatDau: ca.timeBegin ? dayjs(ca.timeBegin) : null,
      thoiGianKetThuc: ca.timeEnd ? dayjs(ca.timeEnd) : null,
      thoiGianBatDauSom: ca.timeBeginEarly ? dayjs(ca.timeBeginEarly) : null,
      thoiGianKetThucMuon: ca.timeEndLate ? dayjs(ca.timeEndLate) : null,
      thoiGianCheckIn: ca.timeCheckIn ? dayjs(ca.timeCheckIn) : null,
      thoiGianCheckOut: ca.timeCheckOut ? dayjs(ca.timeCheckOut) : null,
    });
    setHienThiModal(true);
  }

  const xuLyDongYModal = async () => {
    try {
      const giaTri = await form.validateFields();
      const duLieuCa = {
        ...giaTri,
        employeeID: caLamHienTai.employeeID,
        rowID: caLamHienTai.rowID,
        timeBegin: giaTri.thoiGianBatDau.valueOf(),
        timeEnd: giaTri.thoiGianKetThuc.valueOf(),
        timeBeginEarly: giaTri.thoiGianBatDauSom.valueOf(),
        timeEndLate: giaTri.thoiGianKetThucMuon.valueOf(),
        thoiGianCheckIn: giaTri.thoiGianCheckIn,
        thoiGianCheckOut: giaTri.thoiGianCheckOut,
      };

      if (caLamHienTai.laCaMoi) {
        await themCa(duLieuCa);
      } else {
        await suaCa(duLieuCa);
      }

      setHienThiModal(false);
      layDuLieuChamCong();
    } catch (loi) {
      console.error('Xác thực thất bại:', loi);
      notification.error({
        message: 'Lỗi xác thực',
        description: 'Vui lòng kiểm tra lại thông tin và thử lại.',
        placement: 'topRight',
      });
    }
  };

  const themCa = async (duLieuCa) => {
    setLoading(true);
    try {
      const ketQua = await insertTimesheet(duLieuCa.employeeID, duLieuCa);
      if (ketQua.status !== 1) {
        throw new Error('Thêm ca thất bại');
      }
      notification.success({
        message: 'Thành công',
        description: 'Đã thêm ca thành công',
        placement: 'topRight',
      });
    } catch (loi) {
      console.error('Lỗi khi thêm ca:', loi);
      notification.error({
        message: 'Lỗi',
        description: 'Đã xảy ra lỗi khi thêm ca',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const suaCa = async (duLieuCa) => {
    setLoading(true);
    try {
      let ketQua;
      if (isAddShift) {
        ketQua = await editTimesheet(thangHienTai.valueOf(), duLieuCa);
      } else {
        const { timeBegin, employeeID, rowID, thoiGianCheckIn, thoiGianCheckOut } = duLieuCa;
        const ngayCa = dayjs(timeBegin);

        // Kết hợp ngày của ca làm việc với giờ từ TimePicker
        const timeCheckIn = thoiGianCheckIn ? ngayCa.hour(thoiGianCheckIn.hour()).minute(thoiGianCheckIn.minute()).valueOf() : null;
        const timeCheckOut = thoiGianCheckOut ? ngayCa.hour(thoiGianCheckOut.hour()).minute(thoiGianCheckOut.minute()).valueOf() : null;

        ketQua = await timekeeperEdit(timeBegin, employeeID, rowID, timeCheckIn, timeCheckOut);
      }
      notification.success({
        message: 'Thành công',
        description: 'Đã cập nhật ca thành công',
        placement: 'topRight',
      });
    } catch (loi) {
      notification.error({
        message: 'Lỗi',
        description: 'Đã xảy ra lỗi khi cập nhật ca',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };


  const xoaCa = async () => {
    if (!caLamHienTai || caLamHienTai.laCaMoi) return;

    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa ca này không?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Có',
      okType: 'danger',
      cancelText: 'Không',
      onOk: async () => {
        setLoading(true);
        try {
          const ketQua = await deleteTimesheet(caLamHienTai.employeeID, thangHienTai.valueOf(), [caLamHienTai.rowID]);
          if (ketQua.status === 1) {
            notification.success({
              message: 'Thành công',
              description: 'Đã xóa ca thành công',
              placement: 'topRight',
            });
            setHienThiModal(false);
            layDuLieuChamCong();
          } else {
            throw new Error('Xóa ca thất bại');
          }
        } catch (loi) {
          console.error('Lỗi khi xóa ca:', loi);
          notification.error({
            message: 'Lỗi',
            description: 'Đã xảy ra lỗi khi xóa ca',
            placement: 'topRight',
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };
  const xuLyDongYModalGanCa = async () => {
    try {
      const giaTri = await formGanCa.validateFields();
      setLoading(true);
      const ketQua = await fillMonthShift(giaTri.maNhanVien, giaTri.tenCa, thangHienTai.valueOf());
      if (ketQua.status === 1) {
        notification.success({
          message: 'Thành công',
          description: 'Đã gán ca làm việc thành công',
          placement: 'topRight',
        });
        setHienThiModalGanCa(false);
        layDuLieuChamCong();
      } else {
        throw new Error('Gán ca làm việc thất bại');
      }
    } catch (loi) {
      console.error('Lỗi khi gán ca làm việc:', loi);
      notification.error({
        message: 'Lỗi',
        description: 'Đã xảy ra lỗi khi gán ca làm việc',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderLeftBadge = (caLam) => {
    if (caLam.coefficientsSalary !== 1) {
      return `💲x${caLam.coefficientsSalary}`;
    }
    return null;
  };

  const renderRightBadge = (caLam) => {
    if (caLam.bonus) {
      return `💰+${caLam.bonus}`;
    }
    return null;
  };
  const cot = useMemo(() => [
    {
      title: (
        <>
          <div style={{ textAlign: 'center', fontSize: '16px' }}>Nhân viên</div>
        </>
      ),
      dataIndex: 'tenNhanVien',
      key: 'tenNhanVien',
      fixed: 'left',
      width: 180,
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          {`${record.maNhanVien} - ${record.tenNhanVien}`}
        </div>
      ),
    },

    ...Array.from({ length: thangHienTai.daysInMonth() }, (_, index) => {
      const ngay = thangHienTai.date(index + 1);
      const dateStr = ngay.format('YYYY-MM-DD');
      return {
        title: (
          <div
            style={{ textAlign: 'center' }}
            data-date={dateStr}
          >
            {ngay.format('DD/MM')}
            <br />
            {['CN', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][ngay.day()]}
          </div>
        ),
        dataIndex: dateStr,
        key: dateStr,
        width: 200,
        onHeaderCell: () => ({
          'data-date': dateStr
        }),
        render: (ca, record) => (
          <div
            style={{ textAlign: 'center' }}
            data-date={dateStr}
          >
            {ca && ca.map((caLam) => (
              <div key={caLam.rowID} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  {
                    isAddShift ? (
                      <Badge count={renderLeftBadge(caLam)} offset={[-120, 0]} style={{ backgroundColor: '#1890ff' }}>
                        <Badge count={renderRightBadge(caLam)} offset={[0, 0]} style={{ backgroundColor: '#52c41a' }}>
                          <Button
                            size="large"
                            onClick={() => hienThiModals(caLam, record.tenNhanVien, record.maNhanVien)}
                            style={layKieuNut(caLam, record.caLamViec)}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <span>
                                {`${dayjs(caLam.timeBegin).format('HH:mm')} - ${dayjs(caLam.timeEnd).format('HH:mm')}`}
                              </span>
                            </div>
                          </Button>
                        </Badge>
                      </Badge>
                    ) : (
                      <Button
                        size="large"
                        onClick={() => hienThiModals(caLam, record.tenNhanVien, record.maNhanVien)}
                        style={layKieuNut(caLam, record.caLamViec)}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span>
                            {caLam.timeCheckIn === -1 && caLam.timeCheckOut === -1 ? (
                              "Nghỉ phép"
                            ) : caLam.timeCheckIn === 0 && caLam.timeCheckOut === 0 ? (
                              dayjs(caLam.timeBegin).isAfter(dayjs()) ? (
                                `${dayjs(caLam.timeBegin).format('HH:mm')} - ${dayjs(caLam.timeEnd).format('HH:mm')}`
                              ) : (
                                "Vắng"
                              )
                            ) : caLam.timeCheckIn === 0 ? (
                              `? - ${dayjs(caLam.timeCheckOut).format('HH:mm')}`
                            ) : caLam.timeCheckOut === 0 ? (
                              `${dayjs(caLam.timeCheckIn).format('HH:mm')} - ?`
                            ) : (
                              `${dayjs(caLam.timeCheckIn).format('HH:mm')} - ${dayjs(caLam.timeCheckOut).format('HH:mm')}`
                            )}
                          </span>
                        </div>
                      </Button>
                    )
                  }

                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {
                isAddShift && thangHienTai.month() >= dayjs().month() && (
                  <Button
                    type='dashed'
                    size="medium"
                    onClick={() => hienThiModals({
                      employeeID: record.maNhanVien,
                      rowID: -1,
                      shiftName: '',
                      timeBegin: null,
                      timeEnd: null,
                      timeBeginEarly: null,
                      timeEndLate: null,
                      timeCheckIn: null,
                      timeCheckOut: null,
                      coefficientsSalary: 1,
                      bonus: 0
                    }, record.tenNhanVien, record.maNhanVien)}
                    style={{ margin: '2px' }}
                  >
                    ➕
                  </Button>
                )
              }

            </div>
          </div>
        ),
      };
    }),
  ], [thangHienTai, isAddShift, danhSachNhanVien]);
  const handleScrollToToday = () => {
    const today = dayjs();
    if (today.month() !== thangHienTai.month() || today.year() !== thangHienTai.year()) {
      return;
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

        const targetScroll = containerWidth - todayCell.offsetWidth * (daysInMonth - today.date() + 1);

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

  const kiemTraTrangThaiCa = (caLam) => {
    const now = dayjs();
    const thoiGianBatDau = dayjs(caLam.timeBegin);
    const thoiGianKetThuc = dayjs(caLam.timeEnd);

    if (now.isBefore(thoiGianBatDau)) {
      return 'chua_den';
    } else if (now.isAfter(thoiGianKetThuc)) {
      return 'da_ket_thuc';
    } else {
      return 'dang_dien_ra';
    }
  };

  const layKieuNut = (caLam, caLamViec) => {
    let style = {
      margin: '2px',
      transition: 'all 0.3s ease'
    };

    const trangThai = kiemTraTrangThaiCa(caLam);

    // Ca chưa đến
    if (trangThai === 'chua_den') {
      style.opacity = '0.6';
      style.backgroundColor = '#f0f0f0';
      style.color = '#666';
    }

    // Ca có hệ số lương hoặc thưởng
    if ((caLam.coefficientsSalary !== 1 || caLam.bonus !== 0) && isAddShift) {
      style.backgroundColor = trangThai === 'chua_den' ? '#E8F5E9' : '#81C784'; // Màu xanh lá nhạt hơn
      style.color = trangThai === 'chua_den' ? '#666' : '#1B5E20';
      style.boxShadow = trangThai === 'chua_den' ? 'none' : '0 2px 4px rgba(0,0,0,0.1)';
    }

    // Ca làm khác với ca mặc định
    if (caLam.shiftName !== caLamViec) {
      style.backgroundColor = trangThai === 'chua_den' ? '#FFF3E0' : '#FFB74D'; // Màu cam nhạt
      style.color = trangThai === 'chua_den' ? '#666' : '#E65100';
      style.boxShadow = trangThai === 'chua_den' ? 'none' : '0 2px 4px rgba(0,0,0,0.1)';
    }

    return style;
  };


  const nguonDuLieu = useMemo(() => {
    return Object.entries(danhSachNhanVien)
      .filter(([maNhanVien]) => nhanVienHienThi.includes(maNhanVien))
      .map(([maNhanVien, thongTin]) => {
        const caLamNhanVien = duLieuChamCong.filter(caLam => caLam.employeeID === parseInt(maNhanVien));
        const duLieuHang = {
          key: maNhanVien,
          maNhanVien: parseInt(maNhanVien),
          tenNhanVien: thongTin.bietDanh,
          caLamViec: thongTin.caLamViec
        };

        Array.from({ length: thangHienTai.daysInMonth() }, (_, index) => {
          const ngay = thangHienTai.date(index + 1);
          const khoaNgay = ngay.format('YYYY-MM-DD');
          duLieuHang[khoaNgay] = caLamNhanVien.filter(caLam =>
            dayjs(caLam.timeBegin).format('YYYY-MM-DD') === khoaNgay
          );
        });

        return duLieuHang;
      });
  }, [danhSachNhanVien, duLieuChamCong, thangHienTai, nhanVienHienThi]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Button
            onClick={handleScrollToToday}
            style={{ fontSize: '16px', padding: '10px 20px' }}
            icon={<CalendarOutlined />}
          >
            Hôm nay
          </Button>
          <EmployeeSelectorModal
            nhanVienHienThi={nhanVienHienThi}
            handleEmployeeSelectionChange={handleEmployeeSelectionChange}
            tatCaNhanVien={tatCaNhanVien}
          />
          <ConfigProvider locale={locale}>
            {isAddShift && <Button
              type="primary"
              onClick={() => setHienThiModalGanCa(true)}
              style={{ fontSize: '16px', padding: '10px 20px' }}
            >
              Gán ca làm việc
            </Button>}
          </ConfigProvider>
          <ColorLegend isAddShift={isAddShift} />
        </div>
        <DatePicker
          allowClear={false}
          picker="month"
          value={thangHienTai}
          onChange={(ngay) => {
            xuLyThayDoiThang(ngay);
          }}
          style={{ width: 'auto', fontSize: '16px' }}
        />
      </div>
      <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
        {renderTableContent({
          isRendering,
          loading,
          tableRef,
          nguonDuLieu,
          cot,
          EmptyData,
        })}
      </div>

      <ShiftModal
        caLamHienTai={caLamHienTai}
        hienThiModal={hienThiModal}
        isAddShift={isAddShift}
        xuLyDongYModal={xuLyDongYModal}
        xoaCa={xoaCa}
        setHienThiModal={setHienThiModal}
        form={form}
      />

      {renderDefaultShiftConfirmModal({
        showDefaultShiftModal,
        handleConfirmDefaultShift,
        setShowDefaultShiftModal,
        danhSachNhanVien,
      })}
      {renderGanCaModal({
        hienThiModalGanCa,
        xuLyDongYModalGanCa,
        setHienThiModalGanCa,
        handleAssignDefaultShift,
        formGanCa,
        danhSachNhanVien,
        danhSachCaLam,
      })}
    </div >
  );
};

export default ScheduleTimesheet;