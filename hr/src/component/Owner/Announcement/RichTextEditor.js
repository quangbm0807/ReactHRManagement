import React, { useState, useRef } from 'react';
import { Button, Space, Tooltip, Divider, Select, Input, ColorPicker } from 'antd';
import {
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    AlignLeftOutlined,
    AlignCenterOutlined,
    AlignRightOutlined,
    LinkOutlined,
    UnorderedListOutlined,
    OrderedListOutlined,
    BgColorsOutlined
} from '@ant-design/icons';

const { Option } = Select;

const RichTextEditor = ({ value, onChange }) => {
    const [fontSize, setFontSize] = useState('16px');
    const [textColor, setTextColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const editorRef = useRef(null);

    // Hàm lưu trữ và khôi phục selection
    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            return selection.getRangeAt(0);
        }
        return null;
    };

    const restoreSelection = (range) => {
        if (range) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    const handleExecCommand = (command, value = null) => {
        // Lưu vị trí selection hiện tại
        const savedSelection = saveSelection();

        // Focus vào editor nếu chưa được focus
        if (!document.activeElement.closest('.editor-content')) {
            editorRef.current.focus();
        }

        // Khôi phục selection trước khi thực hiện command
        restoreSelection(savedSelection);

        // Thực hiện command
        document.execCommand(command, false, value);

        // Giữ focus trên editor
        editorRef.current.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleExecCommand('insertParagraph');
        }
    };

    const handleLinkClick = () => {
        const savedSelection = saveSelection();
        const url = prompt('Nhập URL:');
        if (url) {
            restoreSelection(savedSelection);
            handleExecCommand('createLink', url);
        }
    };

    const handleColorChange = (color, command) => {
        const colorValue = color.hex;
        const savedSelection = saveSelection();

        if (command === 'foreColor') {
            setTextColor(colorValue);
        } else if (command === 'hiliteColor') {
            setBgColor(colorValue);
        }

        restoreSelection(savedSelection);
        handleExecCommand(command, colorValue);
    };

    const handleFontSizeChange = (value) => {
        const savedSelection = saveSelection();
        setFontSize(value);
        restoreSelection(savedSelection);
        handleExecCommand('fontSize', value);
    };

    return (
        <div className="rich-text-editor" style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}>
            <div style={{ borderBottom: '1px solid #d9d9d9', padding: '8px' }}>
                <Space>
                    <Tooltip title="In đậm">
                        <Button
                            type="text"
                            icon={<BoldOutlined />}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleExecCommand('bold')}
                        />
                    </Tooltip>
                    <Tooltip title="In nghiêng">
                        <Button
                            type="text"
                            icon={<ItalicOutlined />}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleExecCommand('italic')}
                        />
                    </Tooltip>
                    <Tooltip title="Gạch chân">
                        <Button
                            type="text"
                            icon={<UnderlineOutlined />}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleExecCommand('underline')}
                        />
                    </Tooltip>

                    <Divider type="vertical" />

                    <Tooltip title="Căn trái">
                        <Button
                            type="text"
                            icon={<AlignLeftOutlined />}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleExecCommand('justifyLeft')}
                        />
                    </Tooltip>
                    <Tooltip title="Căn giữa">
                        <Button
                            type="text"
                            icon={<AlignCenterOutlined />}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleExecCommand('justifyCenter')}
                        />
                    </Tooltip>
                    <Tooltip title="Căn phải">
                        <Button
                            type="text"
                            icon={<AlignRightOutlined />}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleExecCommand('justifyRight')}
                        />
                    </Tooltip>

                    <Divider type="vertical" />

                    <Tooltip title="Danh sách không thứ tự">
                        <Button
                            type="text"
                            icon={<UnorderedListOutlined />}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleExecCommand('insertUnorderedList')}
                        />
                    </Tooltip>
                    <Tooltip title="Danh sách có thứ tự">
                        <Button
                            type="text"
                            icon={<OrderedListOutlined />}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleExecCommand('insertOrderedList')}
                        />
                    </Tooltip>

                    <Divider type="vertical" />
                </Space>
            </div>
            <div
                ref={editorRef}
                className="editor-content"
                style={{
                    padding: '12px',
                    minHeight: '200px',
                    backgroundColor: bgColor,
                    borderRadius: '0 0 6px 6px',
                    fontSize: fontSize,
                    color: textColor,
                }}
                contentEditable
                dangerouslySetInnerHTML={{ __html: value }}
                onInput={(e) => onChange(e.currentTarget.innerHTML)}
                onKeyDown={handleKeyDown}
                role="textbox"
                aria-multiline="true"
            />

            <style jsx>{`
                .editor-content:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
                }
                .editor-content[contenteditable="true"]:empty:before {
                    content: 'Nhập nội dung...';
                    color: #bfbfbf;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;