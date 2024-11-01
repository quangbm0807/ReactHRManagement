import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import { ConfigProvider } from 'antd';
import './index.css';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ConfigProvider theme={{
        token: {
            borderRadius: 10,
            tablePaddingVertical: 0,
            tablePaddingHorizontal: 0,
            borderColor: '#555',
        },
    }}>
        <StrictMode>
            <App />
        </StrictMode>
    </ConfigProvider>
);
