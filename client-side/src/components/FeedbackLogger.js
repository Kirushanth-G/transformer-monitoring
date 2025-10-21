/**
 * Feedback Logger Component for Phase 3
 * Handles logging, storage, and export of annotation feedback data
 * Implements FR3.3 requirements for model improvement feedback
 */

class FeedbackLogger {
  constructor() {
    this.feedbackLog = [];
    this.apiEndpoint = '/api/feedback';
  }

  /**
   * Log annotation feedback for model improvement
   * @param {Object} feedbackData - Complete feedback data from annotation modal
   */
  async logFeedback(feedbackData) {
    const logEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      imageId: feedbackData.metadata.imageId,
      transformerId: feedbackData.metadata.transformerId,
      userId: feedbackData.metadata.userId,
      originalDetections: feedbackData.originalDetections,
      finalAnnotations: [
        ...feedbackData.added,
        ...feedbackData.edited,
        ...feedbackData.originalDetections.filter(orig => 
          !feedbackData.deleted.some(del => del.id === orig.id)
        )
      ],
      userActions: {
        added: feedbackData.added.length,
        edited: feedbackData.edited.length,
        deleted: feedbackData.deleted.length
      },
      annotationHistory: feedbackData.history,
      modelVersion: this.getCurrentModelVersion(),
      feedbackType: 'annotation_correction'
    };

    this.feedbackLog.push(logEntry);
    
    try {
      await this.saveFeedbackToBackend(logEntry);
      console.log('Feedback logged successfully:', logEntry.id);
      return logEntry.id;
    } catch (error) {
      console.error('Failed to save feedback:', error);
      // Store locally as fallback
      this.saveFeedbackLocally(logEntry);
      return logEntry.id;
    }
  }

  /**
   * Export feedback log in specified format
   * @param {string} format - 'json' or 'csv'
   * @param {Object} filters - Optional filters for export
   */
  exportFeedbackLog(format = 'json', filters = {}) {
    let filteredLog = this.feedbackLog;

    // Apply filters
    if (filters.dateRange) {
      filteredLog = filteredLog.filter(entry => 
        new Date(entry.timestamp) >= filters.dateRange.start &&
        new Date(entry.timestamp) <= filters.dateRange.end
      );
    }

    if (filters.userId) {
      filteredLog = filteredLog.filter(entry => entry.userId === filters.userId);
    }

    if (filters.transformerId) {
      filteredLog = filteredLog.filter(entry => entry.transformerId === filters.transformerId);
    }

    if (format === 'csv') {
      return this.convertToCSV(filteredLog);
    }

    return JSON.stringify(filteredLog, null, 2);
  }

  /**
   * Get feedback statistics for model improvement analysis
   */
  getFeedbackStatistics() {
    return {
      totalEntries: this.feedbackLog.length,
      totalImages: new Set(this.feedbackLog.map(entry => entry.imageId)).size,
      totalUsers: new Set(this.feedbackLog.map(entry => entry.userId)).size,
      averageCorrectionsPerImage: this.feedbackLog.reduce((sum, entry) => 
        sum + entry.userActions.added + entry.userActions.edited + entry.userActions.deleted, 0
      ) / this.feedbackLog.length,
      mostActiveUsers: this.getMostActiveUsers(),
      commonCorrectionTypes: this.getCommonCorrectionTypes()
    };
  }

  // Private helper methods
  generateId() {
    return 'feedback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getCurrentModelVersion() {
    // This should be dynamically set based on your current model version
    return process.env.REACT_APP_MODEL_VERSION || '1.0.0';
  }

  async saveFeedbackToBackend(logEntry) {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logEntry)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  saveFeedbackLocally(logEntry) {
    const existingData = JSON.parse(localStorage.getItem('feedbackLog') || '[]');
    existingData.push(logEntry);
    localStorage.setItem('feedbackLog', JSON.stringify(existingData));
  }

  convertToCSV(data) {
    if (data.length === 0) return '';

    const headers = [
      'ID', 'Timestamp', 'ImageID', 'TransformerID', 'UserID',
      'OriginalDetectionsCount', 'FinalAnnotationsCount',
      'AddedCount', 'EditedCount', 'DeletedCount', 'ModelVersion'
    ];

    const csvRows = [headers.join(',')];

    data.forEach(entry => {
      const row = [
        entry.id,
        entry.timestamp,
        entry.imageId,
        entry.transformerId,
        entry.userId,
        entry.originalDetections.length,
        entry.finalAnnotations.length,
        entry.userActions.added,
        entry.userActions.edited,
        entry.userActions.deleted,
        entry.modelVersion
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  getMostActiveUsers() {
    const userCounts = {};
    this.feedbackLog.forEach(entry => {
      userCounts[entry.userId] = (userCounts[entry.userId] || 0) + 1;
    });

    return Object.entries(userCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([userId, count]) => ({ userId, count }));
  }

  getCommonCorrectionTypes() {
    const correctionCounts = { added: 0, edited: 0, deleted: 0 };
    
    this.feedbackLog.forEach(entry => {
      correctionCounts.added += entry.userActions.added;
      correctionCounts.edited += entry.userActions.edited;
      correctionCounts.deleted += entry.userActions.deleted;
    });

    return correctionCounts;
  }
}

export default FeedbackLogger;
