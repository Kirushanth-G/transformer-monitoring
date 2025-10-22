import { useState, useEffect, useCallback } from 'react';
import FeedbackLogger from '../components/FeedbackLogger';

/**
 * Custom hook for annotation persistence and metadata tracking
 * Implements FR3.2 requirements for automatic saving and metadata capture
 */
export const useAnnotationPersistence = (imageId, transformerId, userId) => {
  const [savedAnnotations, setSavedAnnotations] = useState([]);
  const [feedbackLogger] = useState(() => new FeedbackLogger());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load existing annotations when component mounts
  useEffect(() => {
    if (imageId) {
      loadAnnotations(imageId);
    }
  }, [imageId]);

  const loadAnnotations = async (imgId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Updated endpoint to match backend
      const response = await fetch(`/api/user-annotations/${imgId}`);
      if (response.ok) {
        const data = await response.json();
        setSavedAnnotations(data.annotations || []);
      } else if (response.status !== 404) {
        throw new Error('Failed to load annotations');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading annotations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnnotations = useCallback(async (annotationData) => {
    if (!imageId || !transformerId || !userId) {
      throw new Error('Missing required metadata for saving annotations');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare data for persistence
      const persistenceData = {
        imageId,
        transformerId,
        userId,
        timestamp: new Date().toISOString(),
        annotations: annotationData,
        metadata: {
          totalAnnotations: [
            ...annotationData.added,
            ...annotationData.edited,
            ...annotationData.originalDetections.filter(orig => 
              !annotationData.deleted.some(del => del.id === orig.id)
            )
          ].length,
          userModifications: annotationData.added.length + annotationData.edited.length + annotationData.deleted.length,
          modelVersion: process.env.REACT_APP_MODEL_VERSION || '1.0.0'
        }
      };

      // Save to backend - Use axios from configured instance
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(persistenceData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Log feedback for model improvement (separate from annotation save)
      try {
        await feedbackLogger.logFeedback({
          ...annotationData,
          metadata: {
            imageId,
            transformerId,
            userId
          }
        });
      } catch (feedbackError) {
        console.warn('Failed to log feedback, but annotations saved:', feedbackError);
      }

      setSavedAnnotations(result.annotations);
      return result;

    } catch (err) {
      setError(err.message);
      console.error('Error saving annotations:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [imageId, transformerId, userId, feedbackLogger]);

  const exportFeedbackData = useCallback((format = 'json', filters = {}) => {
    return feedbackLogger.exportFeedbackLog(format, filters);
  }, [feedbackLogger]);

  const getFeedbackStatistics = useCallback(() => {
    return feedbackLogger.getFeedbackStatistics();
  }, [feedbackLogger]);

  return {
    savedAnnotations,
    saveAnnotations,
    loadAnnotations,
    exportFeedbackData,
    getFeedbackStatistics,
    isLoading,
    error
  };
};

export default useAnnotationPersistence;
