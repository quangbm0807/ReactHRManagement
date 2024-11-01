import dayjs from 'dayjs';

export const handleScrollToToday = (thangHienTai, isAddShift) => {
    const today = dayjs();
    if (today.month() !== thangHienTai.month() || today.year() !== thangHienTai.year()) {
        return;
    } else {
        const timeSheetTable = document.querySelector('.timesheet-table');
        const scrollContainer = timeSheetTable?.querySelector('.ant-table-body');
        const thead = timeSheetTable?.querySelector('.ant-table-thead');
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

// Check the shift status
export const kiemTraTrangThaiCa = (caLam) => {
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

// Get the button style based on shift status and type
export const layKieuNut = (caLam, caLamViec, isAddShift) => {
    let style = {
        margin: '2px',
        transition: 'all 0.3s ease'
    };

    const trangThai = kiemTraTrangThaiCa(caLam);

    if (trangThai === 'chua_den') {
        style.opacity = '0.6';
        style.backgroundColor = '#f0f0f0';
        style.color = '#666';
    }

    if ((caLam.coefficientsSalary !== 1 || caLam.bonus !== 0) && isAddShift) {
        style.backgroundColor = trangThai === 'chua_den' ? '#E8F5E9' : '#81C784';
        style.color = trangThai === 'chua_den' ? '#666' : '#1B5E20';
        style.boxShadow = trangThai === 'chua_den' ? 'none' : '0 2px 4px rgba(0,0,0,0.1)';
    }

    if (caLam.shiftName !== caLamViec) {
        style.backgroundColor = trangThai === 'chua_den' ? '#FFF3E0' : '#FFB74D';
        style.color = trangThai === 'chua_den' ? '#666' : '#E65100';
        style.boxShadow = trangThai === 'chua_den' ? 'none' : '0 2px 4px rgba(0,0,0,0.1)';
    }

    return style;
};
