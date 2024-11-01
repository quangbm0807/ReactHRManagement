import React from 'react';
import { Button, Tooltip } from 'antd';
import { EditOutlined } from '@ant-design/icons';

export const EditableCell = ({ text, onEdit, disabled = false }) => (
    <Tooltip title={text !== null && text !== undefined && text !== 0 && text !== '' ? text : ''}>
        <Button
            style={{
                margin: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: text === null || text === undefined || text === 0 || text === '' ? '50px' : '100%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textDecoration: disabled ? 'line-through' : 'none',
            }}
            danger={text === null || text === undefined || text === 0 || text === ''}
            icon={text !== null && text !== undefined && text !== 0 && text !== '' ? null : <EditOutlined />}
            onClick={onEdit}
            disabled={disabled}
        >
            <div style={{ width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>
        </Button>
    </Tooltip>
);