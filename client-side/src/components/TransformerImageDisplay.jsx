import React, { useState, useEffect } from 'react';
import {
  getTransformerImage,
  uploadTransformerImage,
  deleteTransformerImage,
} from '../api/imageApi';
import { PlusIcon, TrashIcon, EyeIcon } from './ui/icons';

function TransformerImageDisplay({
  transformerId,
  onImageChange,
  showSuccess,
  showError,
}) {
  const [imageUrl, setImageUrl] = useState(null);
  const [hasImage, setHasImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load image on component mount
  useEffect(() => {
    const loadImage = async () => {
      if (!transformerId) return;

      setLoading(true);
      try {
        const imageData = await getTransformerImage(transformerId);
        if (imageData && imageData.imageUrl) {
          setImageUrl(imageData.imageUrl);
          setHasImage(true);
        } else {
          setHasImage(false);
          setImageUrl(null);
        }
      } catch (error) {
        // Image doesn't exist or error occurred
        console.log('Image load error:', error);
        setHasImage(false);
        setImageUrl(null);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [transformerId]);

  // No cleanup needed for S3 URLs
  useEffect(() => {
    return () => {
      // S3 URLs don't need cleanup like blob URLs
    };
  }, [imageUrl]);

  const reloadImage = async () => {
    if (!transformerId) return;

    setLoading(true);
    try {
      const imageData = await getTransformerImage(transformerId);
      if (imageData && imageData.imageUrl) {
        setImageUrl(imageData.imageUrl);
        setHasImage(true);
      } else {
        setHasImage(false);
        setImageUrl(null);
      }
    } catch (error) {
      // Image doesn't exist or error occurred
      console.log('Image reload error:', error);
      setHasImage(false);
      setImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async event => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Invalid File', 'Please select an image file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      showError('File Too Large', 'Please select an image smaller than 10MB');
      return;
    }

    setUploading(true);
    try {
      await uploadTransformerImage(transformerId, file);
      showSuccess('Success', 'Baseline image uploaded successfully');
      await reloadImage(); // Reload the image
      if (onImageChange) onImageChange();
    } catch (error) {
      console.error('Error uploading image:', error);
      showError('Upload Failed', 'Failed to upload baseline image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (
      !window.confirm('Are you sure you want to delete the baseline image?')
    ) {
      return;
    }

    setDeleting(true);
    try {
      await deleteTransformerImage(transformerId);
      showSuccess('Success', 'Baseline image deleted successfully');
      setHasImage(false);
      setImageUrl(null);
      if (onImageChange) onImageChange();
    } catch (error) {
      console.error('Error deleting image:', error);
      showError('Delete Failed', 'Failed to delete baseline image');
    } finally {
      setDeleting(false);
    }
  };

  const handleImageClick = () => {
    console.log('Image clicked!');
    console.log('imageUrl:', imageUrl);
    console.log('hasImage:', hasImage);
    console.log('typeof imageUrl:', typeof imageUrl);

    if (imageUrl) {
      console.log('Opening image in modal:', imageUrl);
      // Always use modal to keep viewing within the webapp
      createImageModal(imageUrl);
    } else {
      console.error('No image URL available');
      if (showError) {
        showError('Error', 'No image available to display');
      }
    }
  }; // Create a modal to display the image if popup is blocked
  const createImageModal = imgUrl => {
    // Remove existing modal if any
    const existingModal = document.getElementById('image-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal backdrop
    const modal = document.createElement('div');
    modal.id = 'image-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      cursor: pointer;
      backdrop-filter: blur(4px);
    `;

    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
      position: relative;
      max-width: 95%;
      max-height: 95%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: auto;
    `;

    // Create image
    const img = document.createElement('img');
    img.src = imgUrl;
    img.style.cssText = `
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
      background: white;
      cursor: auto;
    `;

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: -15px;
      right: -15px;
      background: rgba(255, 255, 255, 0.95);
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      width: 45px;
      height: 45px;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #374151;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;
      z-index: 10001;
    `;

    // Add hover effect to close button
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'rgba(239, 68, 68, 0.9)';
      closeBtn.style.color = 'white';
      closeBtn.style.transform = 'scale(1.1)';
    });

    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'rgba(255, 255, 255, 0.95)';
      closeBtn.style.color = '#374151';
      closeBtn.style.transform = 'scale(1)';
    });

    // Create title
    const title = document.createElement('div');
    title.innerHTML = 'Baseline Image';
    title.style.cssText = `
      position: absolute;
      top: -50px;
      left: 0;
      right: 0;
      text-align: center;
      color: white;
      font-size: 18px;
      font-weight: 600;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    `;

    // Add click handlers
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      modal.remove();
    });

    // Prevent clicks on image container from closing modal
    imageContainer.addEventListener('click', e => {
      e.stopPropagation();
    });

    // Add ESC key handler
    const handleEsc = e => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);

    // Assemble modal
    imageContainer.appendChild(img);
    imageContainer.appendChild(closeBtn);
    imageContainer.appendChild(title);
    modal.appendChild(imageContainer);
    document.body.appendChild(modal);

    // Add fade-in animation
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.style.transition = 'opacity 0.3s ease';
      modal.style.opacity = '1';
    }, 10);

    console.log('Image displayed in modal');
  };

  if (loading) {
    return (
      <div className='rounded-lg bg-gray-50 p-2'>
        <h3 className='mb-2 text-sm font-medium text-gray-500'>
          Baseline Image
        </h3>
        <div className='flex h-32 items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-100'>
          <div className='text-gray-500'>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-lg bg-gray-50'>
      <h3 className='text-sm font-medium text-gray-500 text-center'>Baseline Image</h3>

      {hasImage && imageUrl ? (
        <div className='flex items-center justify-center space-x-4 mt-1'>
          <button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              handleImageClick();
            }}
            className='flex items-center justify-center rounded border border-green-400 bg-green-100 p-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <EyeIcon className='h-5 w-5' />
          </button>
          <button
            onClick={handleDeleteImage}
            disabled={deleting}
            className='flex items-center justify-center rounded border border-red-200 bg-red-50 p-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <TrashIcon className='h-5 w-5' />
          </button>
        </div>
      ) : (
        <div className='flex items-center justify-center space-x-4 mt-1'>
          <label className='flex w-full cursor-pointer items-center justify-center rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100'>
            <PlusIcon className='mr-2 h-4 w-4' />
            {uploading ? 'Uploading...' : 'Add Image'}
            <input
              type='file'
              accept='image/*'
              onChange={handleFileSelect}
              disabled={uploading}
              className='hidden'
            />
          </label>
        </div>
      )}
    </div>
  );
}

export default TransformerImageDisplay;
