import React, { useState, useEffect, useRef } from 'react';
import {
  getInspectionImage,
  uploadInspectionImage,
  deleteInspectionImage,
  getTransformerImage,
} from '../api/imageApi';
import { getAllTransformers } from '../api/transformerApi';
import { PlusIcon, TrashIcon } from './ui/icons';

function InspectionImageDisplay({
  inspectionId,
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
  const [environmentalCondition, setEnvironmentalCondition] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [baselineImageUrl, setBaselineImageUrl] = useState(null);
  const [errors, setErrors] = useState({
    environmentalCondition: '',
    uploaderName: '',
    file: '',
  });
  const fileInputRef = useRef(null);

  // Load image on component mount
  useEffect(() => {
    const loadImage = async () => {
      if (!inspectionId) return;

      setLoading(true);
      try {
        const imageData = await getInspectionImage(inspectionId);
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
  }, [inspectionId]);

  // No cleanup needed for S3 URLs
  useEffect(() => {
    return () => {
      // S3 URLs don't need cleanup like blob URLs
    };
  }, [imageUrl]);

  const reloadImage = async () => {
    if (!inspectionId) return;

    setLoading(true);
    try {
      const imageData = await getInspectionImage(inspectionId);
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

  // Add validation for Environmental Condition, Uploader Name, and Image
  const validateForm = () => {
    const newErrors = {};

    if (!environmentalCondition) {
      newErrors.environmentalCondition =
        'Please select an environmental condition.';
    }
    if (!uploaderName.trim()) {
      newErrors.uploaderName = 'Please enter your name.';
    }

    const file = fileInputRef.current ? fileInputRef.current.files[0] : null;
    if (!file) {
      newErrors.file = 'Please select an image file.';
    } else {
      if (!file.type.startsWith('image/')) {
        newErrors.file = 'The selected file must be an image.';
      } else if (file.size > 10 * 1024 * 1024) {
        newErrors.file = 'The image size must not exceed 10 MB.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = async () => {
    if (!validateForm()) {
      return;
    }

    const file = fileInputRef.current.files[0];
    if (!file) {
      showError('Validation Error', 'Please select an image file.');
      return;
    }

    setUploading(true);
    try {
      await uploadInspectionImage(
        inspectionId,
        file,
        environmentalCondition,
        uploaderName,
      );
      showSuccess('Success', 'Inspection image uploaded successfully');
      await reloadImage(); // Reload the image
      if (onImageChange) onImageChange();
      // Reset form
      setEnvironmentalCondition('');
      setUploaderName('');
      setShowUploadForm(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      showError('Upload Failed', 'Failed to upload inspection image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (
      !window.confirm('Are you sure you want to delete the inspection image?')
    ) {
      return;
    }

    setDeleting(true);
    try {
      await deleteInspectionImage(inspectionId);
      showSuccess('Success', 'Inspection image deleted successfully');
      setHasImage(false);
      setImageUrl(null);
      if (onImageChange) onImageChange();
    } catch (error) {
      console.error('Error deleting image:', error);
      showError('Delete Failed', 'Failed to delete inspection image');
    } finally {
      setDeleting(false);
    }
  };

  const handleImageClick = () => {
    console.log('Image clicked!');
    console.log('imageUrl:', imageUrl);
    console.log('hasImage:', hasImage);

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
  };

  const handleCompareImages = async () => {
    if (!transformerId || !imageUrl) {
      showError(
        'Error',
        'Cannot compare images - missing transformer or inspection image',
      );
      return;
    }

    try {
      // First, get the transformer details to find the actual database ID
      console.log('Looking for transformer with ID:', transformerId);
      const transformers = await getAllTransformers();

      // Find the transformer by transformerId (string like "T5")
      const transformer = transformers.find(
        t => t.transformerId === transformerId,
      );

      if (!transformer) {
        showError('Error', `Transformer ${transformerId} not found`);
        return;
      }

      console.log('Found transformer:', transformer);
      const actualTransformerId = transformer.id; // This should be the database ID like 1, 2, 3, etc.

      // Load baseline image using the actual database ID
      const baselineData = await getTransformerImage(actualTransformerId);
      if (baselineData && baselineData.imageUrl) {
        setBaselineImageUrl(baselineData.imageUrl);
        setShowComparison(true);
        createComparisonModal(baselineData.imageUrl, imageUrl);
      } else {
        showError('Error', 'No baseline image found for this transformer');
      }
    } catch (error) {
      console.error('Error loading baseline image:', error);
      showError('Error', 'Failed to load baseline image for comparison');
    }
  };

  // Create a modal to display the image
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
    title.innerHTML = 'Inspection Image';
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

  // Create a comparison modal to display baseline and inspection images side by side
  const createComparisonModal = (baselineUrl, inspectionUrl) => {
    // Remove existing modal if any
    const existingModal = document.getElementById('comparison-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal backdrop
    const modal = document.createElement('div');
    modal.id = 'comparison-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      cursor: pointer;
      backdrop-filter: blur(4px);
    `;

    // Create main container
    const container = document.createElement('div');
    container.style.cssText = `
      position: relative;
      width: 90%;
      height: 80%;
      max-width: 1400px;
      display: flex;
      gap: 4px;
      cursor: auto;
    `;

    // Create baseline image section
    const baselineSection = document.createElement('div');
    baselineSection.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
    `;

    const baselineHeader = document.createElement('div');
    baselineHeader.innerHTML = 'Baseline';
    baselineHeader.style.cssText = `
      background: #1e40af;
      color: white;
      padding: 12px 16px;
      font-size: 16px;
      font-weight: 600;
      text-align: center;
    `;

    const baselineImg = document.createElement('img');
    baselineImg.src = baselineUrl;
    baselineImg.style.cssText = `
      flex: 1;
      width: 100%;
      height: 100%;
      object-fit: contain; /* Ensure the image is fully visible */
      background: #f0f0f0ff;
    `;

    // Create current image section
    const currentSection = document.createElement('div');
    currentSection.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
    `;

    const currentHeader = document.createElement('div');
    currentHeader.innerHTML = 'Current';
    currentHeader.style.cssText = `
      background: #dc2626;
      color: white;
      padding: 12px 16px;
      font-size: 16px;
      font-weight: 600;
      text-align: center;
    `;

    const currentImg = document.createElement('img');
    currentImg.src = inspectionUrl;
    currentImg.style.cssText = `
      flex: 1;
      width: 100%;
      height: 100%;
      object-fit: contain; /* Ensure the image is fully visible */
      background: #f0f0f0ff;
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
      width: 50px;
      height: 50px;
      font-size: 20px;
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

    // Create title
    const title = document.createElement('div');
    title.innerHTML = 'Thermal Image Comparison';
    title.style.cssText = `
      position: absolute;
      top: -60px;
      left: 0;
      right: 0;
      text-align: center;
      color: white;
      font-size: 24px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
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

    // Add click handlers
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        setShowComparison(false);
      }
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      modal.remove();
      setShowComparison(false);
    });

    // Prevent clicks on container from closing modal
    container.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Add ESC key handler
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        setShowComparison(false);
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);

    // Assemble baseline section
    baselineSection.appendChild(baselineHeader);
    baselineSection.appendChild(baselineImg);

    // Assemble current section
    currentSection.appendChild(currentHeader);
    currentSection.appendChild(currentImg);

    // Assemble container
    container.appendChild(baselineSection);
    container.appendChild(currentSection);
    container.appendChild(closeBtn);
    container.appendChild(title);
    modal.appendChild(container);
    document.body.appendChild(modal);

    // Add fade-in animation
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.style.transition = 'opacity 0.3s ease';
      modal.style.opacity = '1';
    }, 10);

    console.log('Comparison modal displayed');
  };

  if (loading) {
    return (
      <div className='rounded-lg bg-gray-50 p-4'>
        <h3 className='mb-2 text-sm font-medium text-gray-500'>
          Inspection Image
        </h3>
        <div className='flex h-32 items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-100'>
          <div className='text-gray-500'>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-lg bg-gray-50 p-4'>
      <h3 className='mb-2 text-sm font-medium text-gray-500'>
        Inspection Image
      </h3>

      {hasImage && imageUrl ? (
        <div className='space-y-3'>
          <div className='group relative'>
            <img
              src={imageUrl}
              alt='Inspection'
              className='h-32 w-full cursor-pointer rounded border object-cover transition-opacity hover:opacity-90'
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                console.log('=== INSPECTION IMAGE CLICK EVENT TRIGGERED ===');
                handleImageClick();
              }}
              onError={e => {
                console.error('Inspection image failed to load:', e);
                console.error('Image src was:', imageUrl);
              }}
            />
            <div className='bg-opacity-0 group-hover:bg-opacity-20 pointer-events-none absolute inset-0 flex items-center justify-center rounded bg-black transition-all duration-200'>
              <span className='text-sm text-white opacity-0 transition-opacity group-hover:opacity-100'>
                Click to view full size
              </span>
            </div>
          </div>
          <div className='space-y-2'>
            <button
              onClick={handleCompareImages}
              disabled={!transformerId}
              className='flex w-full items-center justify-center rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <svg
                className='mr-2 h-4 w-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              Compare Images
            </button>
            <button
              onClick={handleDeleteImage}
              disabled={deleting}
              className='flex w-full items-center justify-center rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <TrashIcon className='mr-2 h-4 w-4' />
              {deleting ? 'Deleting...' : 'Delete Image'}
            </button>
          </div>
        </div>
      ) : (
        <div className='space-y-3'>
          <div className='flex h-32 items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-100'>
            <div className='text-center'>
              <div className='text-sm text-gray-400'>No inspection image</div>
            </div>
          </div>

          {!showUploadForm ? (
            <button
              onClick={() => setShowUploadForm(true)}
              className='flex w-full items-center justify-center rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100'
            >
              <PlusIcon className='mr-2 h-4 w-4' />
              Add Image
            </button>
          ) : (
            <div className='space-y-3 rounded border border-blue-200 bg-blue-50 p-4'>
              <h4 className='text-sm font-medium text-blue-800'>
                Upload Inspection Image
              </h4>

              {/* Environmental Condition Dropdown */}
              <div>
                <label className='mb-1 block text-xs font-medium text-gray-700'>
                  Environmental Condition
                </label>
                <select
                  value={environmentalCondition}
                  onChange={e => {
                    setEnvironmentalCondition(e.target.value);
                    setErrors({ ...errors, environmentalCondition: '' });
                  }}
                  className={`w-full rounded border px-3 py-2 text-sm focus:outline-none ${
                    errors.environmentalCondition
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                >
                  <option value=''>Select condition</option>
                  <option value='Sunny'>Sunny</option>
                  <option value='Cloudy'>Cloudy</option>
                  <option value='Rainy'>Rainy</option>
                </select>
                {errors.environmentalCondition && (
                  <p className='mt-1 text-xs text-red-500'>
                    {errors.environmentalCondition}
                  </p>
                )}
              </div>

              {/* Uploader Name Input */}
              <div>
                <label className='mb-1 block text-xs font-medium text-gray-700'>
                  Uploader Name
                </label>
                <input
                  type='text'
                  value={uploaderName}
                  onChange={e => {
                    setUploaderName(e.target.value);
                    setErrors({ ...errors, uploaderName: '' });
                  }}
                  placeholder='Enter your name'
                  className={`w-full rounded border px-3 py-2 text-sm focus:outline-none ${
                    errors.uploaderName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.uploaderName && (
                  <p className='mt-1 text-xs text-red-500'>
                    {errors.uploaderName}
                  </p>
                )}
              </div>

              {/* File Input */}
              <div>
                <label className='mb-1 block text-xs font-medium text-gray-700'>
                  Select Image File
                </label>
                <input
                  type='file'
                  accept='image/*'
                  ref={fileInputRef}
                  onChange={() => setErrors({ ...errors, file: '' })}
                  className={`w-full rounded border px-3 py-2 text-sm file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-1 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 ${
                    errors.file ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.file && (
                  <p className='mt-1 text-xs text-red-500'>{errors.file}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className='flex gap-2'>
                <button
                  onClick={() => {
                    setShowUploadForm(false);
                    setEnvironmentalCondition('');
                    setUploaderName('');
                  }}
                  disabled={uploading}
                  className='flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className='flex-1 rounded border border-blue-300 bg-blue-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  Upload
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InspectionImageDisplay;
