import React from 'react';

const ThermalAnalysisResults = ({ analysis }) => {
  if (!analysis) return null;

  const getAssessmentColor = (assessment) => {
    switch (assessment) {
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      case 'WARNING': return 'text-yellow-600 bg-yellow-100';
      case 'NORMAL': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAssessmentIcon = (assessment) => {
    switch (assessment) {
      case 'CRITICAL': return '⚠️';
      case 'WARNING': return '⚡';
      case 'NORMAL': return '✅';
      default: return '❓';
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Analysis Results</h3>
      
      {/* Overall Assessment */}
      <div className={`rounded-lg p-4 border-2 ${
        analysis.overallAssessment === 'CRITICAL' ? 'border-red-300 bg-red-50' :
        analysis.overallAssessment === 'WARNING' ? 'border-yellow-300 bg-yellow-50' :
        'border-green-300 bg-green-50'
      }`}>
        <div className="flex items-center mb-3">
          <span className="text-2xl mr-3">
            {getAssessmentIcon(analysis.overallAssessment)}
          </span>
          <h4 className={`text-xl font-semibold ${getAssessmentColor(analysis.overallAssessment)}`}>
            {analysis.overallAssessment}
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3">
            <p className="text-sm text-gray-600">Anomaly Score</p>
            <p className="text-lg font-bold text-gray-900">
              {analysis.anomalyScore?.toFixed(3) || '0.000'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-sm text-gray-600">Total Detections</p>
            <p className="text-lg font-bold text-gray-900">
              {analysis.totalDetections || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-sm text-gray-600">Critical</p>
            <p className="text-lg font-bold text-red-600">
              {analysis.criticalDetections || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-sm text-gray-600">Warnings</p>
            <p className="text-lg font-bold text-yellow-600">
              {analysis.warningDetections || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Processing Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Analysis Details</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Processing Time</p>
            <p className="font-semibold">
              {analysis.processingTimeMs ? `${analysis.processingTimeMs}ms` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Sensitivity</p>
            <p className="font-semibold">{analysis.sensitivityPercentage}%</p>
          </div>
          <div>
            <p className="text-gray-600">Analysis ID</p>
            <p className="font-semibold">#{analysis.id}</p>
          </div>
          <div>
            <p className="text-gray-600">API Version</p>
            <p className="font-semibold">{analysis.apiVersion || '1.0.0'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-3">
          <div>
            <p className="text-gray-600">Analysis Time</p>
            <p className="font-semibold">
              {new Date(analysis.analysisTimestamp).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Created By</p>
            <p className="font-semibold">{analysis.createdBy || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-gray-600">Equipment ID</p>
            <p className="font-semibold">{analysis.equipmentId || 'N/A'}</p>
          </div>
        </div>
        
        {/* Image Information */}
        {(analysis.maintenanceImageUrl || analysis.baselineImageUrl) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h5 className="text-sm font-semibold text-gray-700 mb-2">Image Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {analysis.maintenanceImageUrl && (
                <div>
                  <p className="text-gray-600">Maintenance Image</p>
                  <p className="font-semibold">ID: {analysis.maintenanceImageId}</p>
                  <p className="text-xs text-blue-600 truncate">{analysis.maintenanceImageUrl}</p>
                </div>
              )}
              {analysis.baselineImageUrl && (
                <div>
                  <p className="text-gray-600">Baseline Image</p>
                  <p className="font-semibold">ID: {analysis.baselineImageId}</p>
                  <p className="text-xs text-blue-600 truncate">{analysis.baselineImageUrl}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detected Anomalies */}
      {analysis.detections && analysis.detections.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-3">
            Detected Anomalies ({analysis.detections.length})
          </h4>
          <div className="space-y-3">
            {analysis.detections.map((detection, index) => (
              <div key={index} className={`border rounded-lg p-4 ${
                detection.isCritical ? 'border-red-200 bg-red-50' : 
                detection.severityLevel === 'HIGH' ? 'border-orange-200 bg-orange-50' :
                'border-yellow-200 bg-yellow-50'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-semibold text-gray-900">{detection.label}</h5>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      detection.isCritical ? 'bg-red-600 text-white' : 
                      detection.severityLevel === 'HIGH' ? 'bg-orange-600 text-white' :
                      'bg-yellow-600 text-white'
                    }`}>
                      {detection.severityLevel || (detection.isCritical ? 'CRITICAL' : 'WARNING')}
                    </span>
                    {detection.temperatureCelsius && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                        {detection.temperatureCelsius}°C
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Confidence</p>
                    <p className="font-semibold">{(detection.confidence * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Position</p>
                    <p className="font-semibold">({detection.x}, {detection.y})</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Size</p>
                    <p className="font-semibold">{detection.width} × {detection.height}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Area</p>
                    <p className="font-semibold">{detection.area} px²</p>
                  </div>
                </div>
                {detection.id && (
                  <div className="mt-2 text-xs text-gray-500">
                    Detection ID: #{detection.id}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThermalAnalysisResults;