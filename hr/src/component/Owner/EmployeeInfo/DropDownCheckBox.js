import React, { useState } from 'react';
import { Button, Checkbox, Divider, Input } from 'antd';

const DropDownCheckBox = ({ columns, checkedColumns, handleColumnVisibilityChange, isAllChecked, handleToggleAll }) => {
  const menu = (
    <div className='card' style={{ padding: '8px 12px', width: '300px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', alignItems: 'center' }}>
        <Button
          onClick={handleToggleAll}
          variant="outlined"
          type={isAllChecked ? 'primary' : 'default'}
          style={{ width: '50%', marginBottom: '8px' }}
        >
          {isAllChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
        </Button>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Checkbox.Group
          style={{ width: '100%' }}
          value={checkedColumns}
          onChange={handleColumnVisibilityChange}
        >
          {columns.map(col => (
            <div style={{ width: '100%', marginBottom: '8px' }} key={col.key}>
              <Checkbox value={col.key} style={{ width: '100%' }}>
                {col.key === 'lateDeduction' ? 'Trễ' : col.title}
              </Checkbox>
            </div>
          ))}
        </Checkbox.Group>
      </div>
    </div>
  );

  return (
    <div>{menu}</div>
  );
};

export default DropDownCheckBox;
