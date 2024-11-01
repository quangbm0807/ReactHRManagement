import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import NotificationIcon from './NotificationIcon';

const NotificationManager = () => {
    const [notifications, setNotifications] = useState([]);
    const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    // const allNotifications = [
    //     ...formatNotifications(listDialog, 'dialog'),
    //     ...formatNotifications(listAnnouncements, 'announcement'),
    //     ...formatNotifications(listDocuments, 'document')
    // ];
    useEffect(() => {
        const loadAndFilterNotifications = () => {
            const storedData = localStorage.getItem('notification') === 'undefined' ? {} : JSON.parse(localStorage.getItem('notification') || 'null') || {};
            const { listDialog = [], listAnnouncements = [], listDocuments = [] } = storedData;
            const viewCounts = JSON.parse(localStorage.getItem('notificationViewCounts') || '{}');
            const currentTime = new Date().getTime();

            const formatNotifications = (items, type = 'dialog') => {
                return items.filter(item => {
                    const isTimeValid = (!item.timeBegin || item.timeBegin <= currentTime) &&
                        (!item.timeEnd || item.timeEnd >= currentTime);

                    const viewCount = viewCounts[item.title] || 0;
                    const countView = item.countView ?? 0;
                    const hasRemainingViews = countView === 0 || viewCount < countView;

                    return isTimeValid && hasRemainingViews;
                }).map(item => ({
                    ...item,
                    type,
                    modalType: type === 'dialog' ? getModalTypeFromIcon(item.imgIcon) : 'info'
                }));
            };

            const allNotifications = [
                ...formatNotifications(listDialog, 'dialog')
            ];

            setNotifications(allNotifications);

            // Chỉ hiển thị notification đầu tiên nếu có
            if (allNotifications.length > 0) {
                setCurrentNotificationIndex(0);
                setTimeout(() => {
                    setIsModalVisible(true);
                }, 0);
            }
        };

        loadAndFilterNotifications();
    }, []);

    useEffect(() => {
        if (notifications.length > 0 && currentNotificationIndex < notifications.length && isModalVisible) {
            showNotification(notifications[currentNotificationIndex]);
        }
    }, [currentNotificationIndex, isModalVisible, notifications]);
    // Sửa lại hàm handleModalClose để chuyển sang notification tiếp theo
    const handleModalClose = () => {
        // Cập nhật view count cho notification hiện tại
        const currentNotification = notifications[currentNotificationIndex];
        const viewCounts = JSON.parse(localStorage.getItem('notificationViewCounts') || '{}');
        viewCounts[currentNotification.title] = (viewCounts[currentNotification.title] || 0) + 1;
        localStorage.setItem('notificationViewCounts', JSON.stringify(viewCounts));

        setIsModalVisible(false);

        // Chờ modal hiện tại đóng hoàn toàn
        setTimeout(() => {
            // Kiểm tra xem còn notification tiếp theo không
            if (currentNotificationIndex < notifications.length - 1) {
                setCurrentNotificationIndex(prev => prev + 1);
                setIsModalVisible(true);
            }
        }, 300);
    };


    const getModalTypeFromIcon = (imgIcon) => {
        const typeMap = {
            '0': 'info',
            '1': 'success',
            '2': 'warning',
            '3': 'error'
        };
        return typeMap[imgIcon] || 'info';
    };

    const renderModalIcon = (notification) => {
        if (notification.type === 'dialog') {
            const parsedIcon = parseInt(notification.imgIcon, 10);
            if (!isNaN(parsedIcon) && parsedIcon >= 0 && parsedIcon <= 3) {
                return <NotificationIcon type={notification.imgIcon} />;
            }
            if (notification.imgIcon?.startsWith('data:image')) {
                return <img src={notification.imgIcon} alt="Icon" style={{ width: '32px', height: '32px', marginRight: '8px' }} />;
            }
        }
        return null;
    };
    const formatContent = (content) => {
        if (!content) return '';
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
    };
    const showNotification = (notification) => {
        const modalConfig = {
            icon: null,
            title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {renderModalIcon(notification)}
                    <span className="ms-3 font-medium">{notification.title}</span>
                </div>
            ),
            content: (
                <div className="space-y-4">
                    <div className="whitespace-pre-line text-base">
                        {formatContent(notification.content)}
                    </div>
                    {notification.url && (
                        <div className="mt-4">
                            <a
                                href={notification.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                {notification.url}
                            </a>
                        </div>
                    )}
                </div>
            ),
            width: 600,
            visible: isModalVisible,
            onOk: handleModalClose,
            onCancel: handleModalClose,
            destroyOnClose: true
        };

        // Thêm custom style cho modal content


        Modal[notification.modalType](modalConfig);
    };

    return null;
};


export default NotificationManager;