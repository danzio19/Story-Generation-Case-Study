// src/pages/HomePage.jsx

import React, { useState } from 'react';
import StoryList from '../components/StoryList';
import NewStoryForm from '../components/NewStoryForm';
import Modal from '../components/Modal';

function HomePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleStoryCreated = (newStory) => {
        handleCloseModal();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Story Library</h2>
                <button
                    onClick={handleOpenModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                    + Create New Story
                </button>
            </div>

            <StoryList />

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} isLoading={isLoading}>
                <NewStoryForm onSuccess={handleStoryCreated} isSubmitting={isLoading} onSubmittingChange={setIsLoading} />
            </Modal>
        </div>
    );
}

export default HomePage;