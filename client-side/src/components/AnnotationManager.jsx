import React, { useState } from 'react';
import AnnotateImageModal from './AnnotateImageModal';
import { useAnnotationPersistence } from '../hooks/useAnnotationPersistence';

/**
 * Annotation Manager Component
 * Orchestrates the annotation workflow and provides management features
 * Implements FR3.2 and FR3.3 requirements
 */
function AnnotationManager({ 
  isOpen, 
  onClose, 
  thermalAnalysisResult, 
  currentUserId, 
  transformerId,
  imageId 
}) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  
  const {
    savedAnnotations,
    saveAnnotations,
    exportFeedbackData,
    getFeedbackStatistics,
    isLoading,
    error
  } = useAnnotationPersistence(imageId, transformerId, currentUserId);

  const handleSaveAnnotations = async (annotationData) => {
    try {
      await saveAnnotations(annotationData);
      console.log('Annotations saved successfully with metadata tracking');
    } catch (err) {
      console.error('Failed to save annotations:', err);
      // You might want to show a user-friendly error message here
    }
  };

  const handleExportFeedback = () => {
    const exportData = exportFeedbackData(exportFormat);
    const blob = new Blob([exportData], { 
      type: exportFormat === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback_log_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  return (
    <>
      <AnnotateImageModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSaveAnnotations}
        thermalAnalysisResult={thermalAnalysisResult}
        currentUserId={currentUserId}
        transformerId={transformerId}
        imageId={imageId}
      />

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">Export Feedback Data</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Export Format:</label>
              <select 
                value={exportFormat} 
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2">Feedback Statistics:</h4>
              {(() => {
                const stats = getFeedbackStatistics();
                return (
                  <div className="text-sm text-gray-700">
                    <p>Total Entries: {stats.totalEntries}</p>
                    <p>Images Annotated: {stats.totalImages}</p>
                    <p>Active Users: {stats.totalUsers}</p>
                    <p>Avg. Corrections/Image: {stats.averageCorrectionsPerImage?.toFixed(1) || 0}</p>
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleExportFeedback}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Export Button */}
      {isOpen && (
        <button
          onClick={() => setShowExportModal(true)}
          className="fixed bottom-6 right-6 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 z-40"
          title="Export Feedback Data"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      )}

      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <p className="font-medium">Error saving annotations:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </>
  );
}

export default AnnotationManager;
