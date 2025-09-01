
import React from 'react';

function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl mx-4"
            >
                {children}
            </div>
        </div>
    );
}

export default Modal;