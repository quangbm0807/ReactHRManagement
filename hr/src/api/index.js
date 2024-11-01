import axios from 'axios';
import API_DOMAIN from './API_URL/API_URL';
import { Button, notification } from 'antd';

const api = axios.create({
  baseURL: API_DOMAIN,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để xử lý yêu cầu
api.interceptors.request.use(
  config => {
    const isOwner = localStorage.getItem('owner') === 'true';
    if (isOwner) {
      config.headers['token-owner'] = localStorage.getItem('key');
    } else {
      config.headers['token-employee'] = localStorage.getItem('key-employee');
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý phản hồi
api.interceptors.response.use(
  response => {
    const isOwner = localStorage.getItem('owner') === 'true'; // Check if the user is an owner
    if (response.data.status !== 1) {
      const message = response.data.message;
      if (message === 'unauthorized') {
        showErrorNotification('Chưa được cấp quyền!', 'Bạn chưa được cấp quyền, vui lòng liên hệ quản trị viên!', null);
      } else if (message === 'Token is null') {
        showErrorNotification('Phiên đã hết hạn!', 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!', isOwner);
      } else if (message === 'Token timeout or error') {
        showErrorNotification('Phiên đã hết hạn!', 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!', isOwner);
      }
    }

    return response; // Trả về response nếu không có vấn đề
  },
  error => {
    return Promise.reject(error);
  }
);


function showErrorNotification(title, description, isOwner) {
  const key = `open${Date.now()}`;
  const redirectUrl = isOwner ? '/owner/login' : (isOwner === null ? '' : '/employee/login');

  notification.warning({
    key: Date.now(),
    message: title,
    description: description,
    closeIcon: null,
    btn: (
      <Button
        type="primary"
        onClick={() => {
          if (redirectUrl) {
            window.location.href = redirectUrl;
          }
        }}
      >
        OK
      </Button>
    ),
    onClose: () => {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },
  });
}


export default api;