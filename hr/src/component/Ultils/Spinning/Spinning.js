import React from 'react';

const LoadingSpinner = ({ type = 'default', size = 'medium', color = '#2563eb' }) => {
    return (
        <div className="spinner-container">
            {type === 'default' && <div className="spinner-default"></div>}
            {type === 'dots' && <div className="spinner-dots"></div>}
            {type === 'wave' && <div className="spinner-wave"></div>}
            {type === 'circle' && <div className="spinner-circle"></div>}

            <style jsx>{`
        .spinner-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        /* Default Spinner */
        .spinner-default {
          width: ${size === 'small' ? '30px' : size === 'large' ? '60px' : '40px'};
          height: ${size === 'small' ? '30px' : size === 'large' ? '60px' : '40px'};
          border: 4px solid #f3f3f3;
          border-top: 4px solid ${color};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Dots Spinner */
        .spinner-dots {
          display: flex;
          gap: 8px;
        }

        .spinner-dots::before,
        .spinner-dots::after,
        .spinner-dots {
          content: '';
          width: ${size === 'small' ? '8px' : size === 'large' ? '16px' : '12px'};
          height: ${size === 'small' ? '8px' : size === 'large' ? '16px' : '12px'};
          border-radius: 50%;
          background-color: ${color};
          animation: dots 1.4s ease-in-out infinite;
        }

        .spinner-dots::before {
          animation-delay: -0.32s;
        }

        .spinner-dots::after {
          animation-delay: -0.16s;
        }

        /* Wave Spinner */
        .spinner-wave {
          display: flex;
          gap: 4px;
        }

        .spinner-wave::before,
        .spinner-wave::after,
        .spinner-wave {
          content: '';
          width: ${size === 'small' ? '4px' : size === 'large' ? '8px' : '6px'};
          height: ${size === 'small' ? '20px' : size === 'large' ? '40px' : '30px'};
          background-color: ${color};
          animation: wave 1.2s ease-in-out infinite;
        }

        .spinner-wave::before {
          animation-delay: -0.4s;
        }

        .spinner-wave::after {
          animation-delay: -0.2s;
        }

        /* Circle Spinner */
        .spinner-circle {
          width: ${size === 'small' ? '30px' : size === 'large' ? '60px' : '40px'};
          height: ${size === 'small' ? '30px' : size === 'large' ? '60px' : '40px'};
          position: relative;
        }

        .spinner-circle::before,
        .spinner-circle::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 4px solid transparent;
          border-top-color: ${color};
        }

        .spinner-circle::before {
          animation: spin 2s linear infinite;
        }

        .spinner-circle::after {
          animation: spin 2s linear infinite reverse;
          border-top-color: transparent;
          border-right-color: ${color};
        }

        /* Animations */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes dots {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        @keyframes wave {
          0%, 40%, 100% { transform: scaleY(0.4); }
          20% { transform: scaleY(1); }
        }
      `}</style>
        </div>
    );
};

// Loading Container Component
const LoadingContainer = ({
    children,
    loading = false,
    spinnerType = 'default',
    spinnerSize = 'medium',
    spinnerColor = '#2563eb',
    overlay = false
}) => {
    if (!loading) return children;

    return (
        <div className="loading-container">
            {children}
            <div className={`loading-overlay ${overlay ? 'with-backdrop' : ''}`}>
                <LoadingSpinner type={spinnerType} size={spinnerSize} color={spinnerColor} />
            </div>

            <style jsx>{`
        .loading-container {
          position: relative;
          min-height: 100px;
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .with-backdrop {
          background-color: rgba(255, 255, 255, 0.8);
        }
      `}</style>
        </div>
    );
};

export { LoadingSpinner, LoadingContainer };