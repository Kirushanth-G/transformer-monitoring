import React, { useState, useEffect } from 'react';
import {
  getTransformerImage,
  uploadTransformerImage,
  deleteTransformerImage,
  createImageUrl,
} from '../api/imageApi';
import { PlusIcon, TrashIcon } from './ui/icons';

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
        const imageBlob = await getTransformerImage(transformerId);
        if (imageBlob && imageBlob.size > 0) {
          const url = createImageUrl(imageBlob);
          setImageUrl(url);
          setHasImage(true);
        } else {
          setHasImage(false);
          setImageUrl(null);
        }
      } catch {
        // Image doesn't exist or error occurred
        setHasImage(false);
        setImageUrl(null);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [transformerId]);

  const reloadImage = async () => {
    if (!transformerId) return;

    setLoading(true);
    try {
      const imageBlob = await getTransformerImage(transformerId);
      if (imageBlob && imageBlob.size > 0) {
        const url = createImageUrl(imageBlob);
        setImageUrl(url);
        setHasImage(true);
      } else {
        setHasImage(false);
        setImageUrl(null);
      }
    } catch {
      // Image doesn't exist or error occurred
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
    if (imageUrl) {
      // Open image in new window/tab
      window.open(imageUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className='rounded-lg bg-gray-50 p-4'>
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
    <div className='rounded-lg bg-gray-50 p-4'>
      <h3 className='mb-2 text-sm font-medium text-gray-500'>Baseline Image</h3>

      {hasImage && imageUrl ? (
        <div className='space-y-3'>
          <div className='group relative'>
            <img
              src={imageUrl}
              alt='Transformer baseline'
              className='h-32 w-full cursor-pointer rounded border object-cover transition-opacity hover:opacity-90'
              onClick={handleImageClick}
            />
            <div className='bg-opacity-0 group-hover:bg-opacity-20 absolute inset-0 flex items-center justify-center rounded bg-black transition-all duration-200'>
              <span className='text-sm text-white opacity-0 transition-opacity group-hover:opacity-100'>
                Click to view full size
              </span>
            </div>
          </div>
          <button
            onClick={handleDeleteImage}
            disabled={deleting}
            className='flex w-full items-center justify-center rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <TrashIcon className='mr-2 h-4 w-4' />
            {deleting ? 'Deleting...' : 'Delete Image'}
          </button>
        </div>
      ) : (
        <div className='space-y-3'>
          <div className='flex h-32 items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-100'>
            <div className='text-center'>
              <div className='text-sm text-gray-400'>No baseline image</div>
            </div>
          </div>
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
