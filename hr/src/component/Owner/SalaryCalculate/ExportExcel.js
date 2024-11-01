import React from 'react';
import { Button } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

const ExportExcel = ({ data, visibleColumns, tinhGioCongColumns, thangHienTai }) => {
    const handleExport = async () => {

        const workbook = new ExcelJS.Workbook();
        const worksheet1 = workbook.addWorksheet('Thông tin nhân viên');

        // Define main column groups for the second sheet
        const secondSheetHeaders = [
            { header: 'Mã nhân viên', key: 'maNhanVien', width: 15 },
            { header: 'Tên nhân viên', key: 'tenNhanVien', width: 25 },
            ...tinhGioCongColumns
                .filter(col => visibleColumns.includes(col.key))
                .map(col => ({
                    header: col.title,
                    key: col.key,
                    width: 15
                })),
            { header: 'Tổng cộng', key: 'tongCong', width: 15 }
        ];

        // Add headers to the second sheet
        worksheet1.columns = secondSheetHeaders;

        // Add data rows to the second sheet
        data.forEach(record => {
            const rowData = {
                maNhanVien: record.maNhanVien,
                tenNhanVien: record.tenNhanVien
            };

            // Add tinhGioCong data
            tinhGioCongColumns
                .filter(col => visibleColumns.includes(col.key))
                .forEach(col => {
                    const value = typeof record[col.key] === 'number' ? record[col.key] : parseFloat(record[col.key]).toFixed(2);
                    rowData[col.key] = !isNaN(value) ? value : record[col.key];
                });

            // Add total
            const totalValue = typeof record.tongCong === 'number' ? record.tongCong : parseFloat(record.tongCong).toFixed(2);
            rowData['tongCong'] = !isNaN(totalValue) ? totalValue : record.tongCong;

            worksheet1.addRow(rowData);
        });

        // Center-align the headers and data in sheet 2
        worksheet1.getRow(1).font = { bold: true };
        worksheet1.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

        worksheet1.eachRow({ includeEmpty: true }, (row) => {
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            });
        });
        const worksheet2 = workbook.addWorksheet('Báo cáo chấm công');

        // Calculate the number of days in the month
        const daysInMonth = thangHienTai.daysInMonth();

        // Define main column groups
        const mainHeaders = [
            { header: 'Thông tin nhân viên', colspan: 2 },
            { header: 'Ngày trong tháng', colspan: daysInMonth },
            { header: 'Tính giờ công', colspan: visibleColumns.length },
            { header: 'Tổng cộng', colspan: 1 }
        ];

        // Add main headers (Row 1)
        const row1 = worksheet2.addRow([]);
        let currentCol = 1;
        mainHeaders.forEach(header => {
            worksheet2.mergeCells(1, currentCol, 1, currentCol + header.colspan - 1);
            const cell = row1.getCell(currentCol);
            cell.value = header.header;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.font = { bold: true, size: 14 };
            currentCol += header.colspan;
        });

        // Define subheaders (Row 2)
        const subHeaders = [
            'Mã nhân viên',
            'Tên nhân viên'
        ];

        // Add day numbers and weekdays
        Array.from({ length: daysInMonth }, (_, index) => {
            const day = thangHienTai.date(index + 1);
            const weekday = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day.day()];
            subHeaders.push(`${day.format('DD')}\n${weekday}`);
        });

        // Add tinhGioCongColumns headers
        tinhGioCongColumns
            .filter(col => visibleColumns.includes(col.key))
            .forEach(col => {
                subHeaders.push(col.title);
            });

        // Add Tổng cộng header
        subHeaders.push('Tổng cộng');

        // Add subheaders row
        worksheet2.addRow(subHeaders);

        // Add data rows
        data.forEach(record => {
            const rowData = [
                record.maNhanVien,
                record.tenNhanVien
            ];

            // Add attendance data for each day
            Array.from({ length: daysInMonth }, (_, index) => {
                const day = thangHienTai.date(index + 1);
                const dateKey = day.format('YYYY-MM-DD');
                const shifts = record[dateKey] || [];

                // Combine all shifts for the day into a single string
                const shiftInfo = shifts.map(shift => {
                    const checkIn = shift.timeCheckIn ? dayjs(shift.timeCheckIn).format('HH:mm') : '?';
                    const checkOut = shift.timeCheckOut ? dayjs(shift.timeCheckOut).format('HH:mm') : '?';
                    return `${checkIn}-${checkOut}`;
                }).join('\n');

                rowData.push(shiftInfo || '');
            });

            // Add tinhGioCong data
            tinhGioCongColumns
                .filter(col => visibleColumns.includes(col.key))
                .forEach(col => {
                    // Ensure numerical data is formatted as a number in Excel
                    const value = typeof record[col.key] === 'number' ? record[col.key] : parseFloat(record[col.key]).toFixed(2);
                    rowData.push(!isNaN(value) ? value : record[col.key]);
                });

            // Add total
            const totalValue = typeof record.tongCong === 'number' ? record.tongCong : parseFloat(record.tongCong).toFixed(2);
            rowData.push(!isNaN(totalValue) ? totalValue : record.tongCong);

            worksheet2.addRow(rowData);
        });

        // Style the worksheet
        worksheet2.getRow(1).height = 30;
        worksheet2.getRow(2).height = 40;
        worksheet2.getRow(2).font = { bold: true };
        worksheet2.getRow(2).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

        // Set column widths
        worksheet2.getColumn(1).width = 15; // Mã nhân viên
        worksheet2.getColumn(2).width = 25; // Tên nhân viên
        // Set width for day columns
        for (let i = 3; i < 3 + daysInMonth; i++) {
            worksheet2.getColumn(i).width = 12;
        }
        // Set width for tinhGioCong columns and total
        for (let i = 3 + daysInMonth; i <= worksheet2.columnCount; i++) {
            worksheet2.getColumn(i).width = 15;
        }

        // Apply borders to all cells
        worksheet2.eachRow({ includeEmpty: true }, (row) => {
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            });
        });

        // Generate and save file
        const buffer = await workbook.xlsx.writeBuffer();
        const monthString = thangHienTai.format('MM-YYYY');
        saveAs(new Blob([buffer]), `bao-cao-cham-cong-${monthString}.xlsx`);
    };

    return (
        <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={handleExport}
            style={{ fontSize: '16px', padding: '10px 20px' }}
        >
            Xuất Excel
        </Button>
    );
};

export default ExportExcel;
