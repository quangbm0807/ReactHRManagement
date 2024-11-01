import React from 'react';
import { motion } from 'framer-motion';
import { ClockAlert, HammerIcon } from 'lucide-react';
import constructionImage from './construction.png'; // Replace with your image path

const ComingSoon = () => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - 60px)',
                padding: '20px',
                boxSizing: 'border-box',
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    textAlign: 'center',
                    padding: '20px',
                    backgroundColor: '#2e2e48',
                    borderRadius: '10px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    maxWidth: '600px',
                    width: '100%',
                }}
            >
                <motion.img
                    src={constructionImage}
                    alt="Coming Soon"
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                    style={{ width: '100px', marginBottom: '10px' }}
                />
                <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 5, repeat: Infinity }}
                    style={{ display: 'inline-block', margin: '10px' }}
                >
                    <HammerIcon size={40} color="#FF6347" />
                </motion.div>
                <h2 style={{ color: '#fff' }}>Tính năng đang phát triển</h2>
                <p style={{ color: '#ccc' }}>
                    <ClockAlert style={{ marginRight: '8px' }} />
                    Vui lòng quay lại sau!
                </p>
            </motion.div>
        </div>
    );
};

export default ComingSoon;
