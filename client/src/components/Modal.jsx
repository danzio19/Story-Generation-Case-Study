
import React from 'react';
import Spinner from './Spinner';

function Modal({ isOpen, onClose, isLoading, children }) {
    if (!isOpen) return null;

    return (
        <div
            onClick={isLoading ? undefined : onClose}
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl mx-4 relative"
            > {isLoading && (
                <div className="absolute inset-0 bg-slate-800 bg-opacity-80 flex flex-col justify-center items-center rounded-lg">
                    <Spinner />
                    <p className="mt-4 text-lg text-slate-300">Generating your story...</p>
                </div>
            )}
                {children}
            </div>
        </div>
    );
}

export default Modal;