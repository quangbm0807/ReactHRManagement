import React from 'react';
import { Inbox, Plus } from 'lucide-react';
import './EmptyData.css';
const EmptyState = () => {
    return (
        <div className="empty-container">
            <div className="icon-container">
                <Inbox className="main-icon" />
                <div className="plus-icon-wrapper">
                    <Plus className="plus-icon" />
                </div>
            </div>

            <div className="content">
                <h3 className="title">Không có dữ liệu</h3>
                <p className="description">
                    Vui lòng thêm dữ liệu mới để hiển thị
                </p>
            </div>
        </div>
    );
};

export default EmptyState;