import React, { useState } from 'react';
import { thermalApi } from '../services/thermalApi';

const ThermalAnalysisForm = ({ 
  onAnalysisComplete, 
  selectedImageId, 
  baselineImageId,
  equipmentId, 
  inspectionId,
  showSuccess, 
  showError,
  imageInfo,
  baselineImageInfo
}) => {
  const [formData, setFormData] = useState({
    maintenanceImagePath: selectedImageId || '',
    baselineImagePath: baselineImageId || '',
    processingDevice: -1,
    inputImageSize: 640,
    useHalfPrecision: false,
    sensitivityPercentage: 50,
    equipmentId: equipmentId || null,
    inspectionId: inspectionId || null,
    createdBy: 'inspector@company.com'
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const createAnalysisRequest = () => {
    const requestData = {
      maintenanceImagePath: formData.maintenanceImagePath.toString(),
      baselineImagePath: formData.baselineImagePath || undefined,
      processingDevice: formData.processingDevice,
      inputImageSize: formData.inputImageSize,
      useHalfPrecision: formData.useHalfPrecision,
      sensitivityPercentage: formData.sensitivityPercentage,
      equipmentId: formData.equipmentId ? parseInt(formData.equipmentId) : undefined,
      inspectionId: formData.inspectionId ? parseInt(formData.inspectionId) : undefined,
      createdBy: formData.createdBy
    };
    
    // Remove undefined values to match backend expectations
    Object.keys(requestData).forEach(key => {
      if (requestData[key] === undefined || requestData[key] === '') {
        delete requestData[key];
      }
    });
    
    return requestData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);

    try {
      let requestData = createAnalysisRequest();
      
      console.log('Submitting thermal analysis:', requestData);
      
      const result = await thermalApi.analyzeImage(requestData);
        
      console.log('Analysis completed successfully:', result);
      onAnalysisComplete(result);
      
      const analysisType = requestData.baselineImagePath ? 'Enhanced analysis' : 'Standard analysis';
      showSuccess(`${analysisType} completed successfully`);
    } catch (err) {
      console.error('Form submission error:', err);
      showError(err.message || 'Thermal analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      {/* Image Information Display */}
      <div className="mb-4 space-y-3">
        {/* Maintenance Image Info */}
        {imageInfo && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold text-blue-800">Maintenance Image</h4>
              <span className="text-xs text-blue-600">ID: {imageInfo.id}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-blue-700 mb-2">
              <div>
                <span className="font-medium">Uploader:</span> {imageInfo.uploaderName}
              </div>
              <div>
                <span className="font-medium">Condition:</span> {imageInfo.environmentalCondition}
              </div>
              <div>
                <span className="font-medium">Upload Time:</span> {new Date(imageInfo.uploadTime).toLocaleString()}
              </div>
            </div>
            {imageInfo.imageUrl && (
              <div className="mt-2">
                <img 
                  src={imageInfo.imageUrl} 
                  alt="Selected for analysis" 
                  className="w-32 h-20 object-cover rounded border"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Baseline Image Info */}
        {baselineImageInfo ? (
                  <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center mb-2">
              <h4 className="text-sm font-semibold text-green-800">Baseline Image</h4>
              <span className="text-xs text-green-600 ml-2">ID: {baselineImageId}</span>
            </div>
            <div className="text-xs text-green-700 space-y-1">
              <div>
                <span className="font-medium">Transformer:</span> {baselineImageInfo.transformerId}
              </div>
              <div>
                <span className="font-medium">Uploader:</span> {baselineImageInfo.uploaderName || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">Upload Time:</span> {new Date(baselineImageInfo.uploadTime).toLocaleString()}
              </div>
            </div>
            {baselineImageInfo.imageUrl && (
              <div className="mt-2">
                <img 
                  src={baselineImageInfo.imageUrl} 
                  alt="Baseline reference" 
                  className="w-32 h-20 object-cover rounded border"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="mt-2 text-xs text-green-600">
              Enhanced analysis enabled
            </div>
          </div>
        ) : baselineImageId ? (
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center mb-2">
              <h4 className="text-sm font-semibold text-yellow-800">Baseline Image</h4>
              <span className="text-xs text-yellow-600 ml-2">ID: {baselineImageId}</span>
            </div>
            <div className="text-xs text-yellow-700">
              Baseline image reference provided but details not loaded
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-2">
              <h4 className="text-sm font-semibold text-gray-600">📊 Baseline Image</h4>
            </div>
            <div className="text-xs text-gray-600">
              ⚠️ No baseline image available - analysis will use fallback method with reduced accuracy
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maintenance Image ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.maintenanceImagePath}
                onChange={(e) => setFormData({...formData, maintenanceImagePath: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                placeholder="Image ID will be auto-filled"
                readOnly={!!selectedImageId}
              />
              {selectedImageId && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-green-600 text-sm">✓ Auto-filled</span>
                </div>
              )}
            </div>
            {imageInfo && (
              <p className="text-xs text-gray-500 mt-1">
                Using inspection image: {imageInfo.uploaderName} • {imageInfo.environmentalCondition}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Baseline Image ID (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.baselineImagePath}
                onChange={(e) => setFormData({...formData, baselineImagePath: e.target.value})}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  baselineImageId ? 'bg-green-50' : ''
                }`}
                placeholder={baselineImageId ? "Baseline image auto-filled" : "Enter baseline image ID"}
                readOnly={!!baselineImageId}
              />
              {baselineImageId && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-green-600 text-sm">Baseline set</span>
                </div>
              )}
            </div>
            {baselineImageInfo ? (
              <p className="text-xs text-green-600 mt-1">
                Baseline: {baselineImageInfo.uploaderName} - {new Date(baselineImageInfo.uploadTime).toLocaleDateString()}
              </p>
            ) : baselineImageId ? (
              <p className="text-xs text-green-600 mt-1">
                Baseline ID: {baselineImageId}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                No baseline - standard analysis will be used
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Size
            </label>
            <select
              value={formData.inputImageSize}
              onChange={(e) => setFormData({...formData, inputImageSize: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={224}>224x224</option>
              <option value={416}>416x416</option>
              <option value={640}>640x640</option>
              <option value={1024}>1024x1024</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.useHalfPrecision}
                onChange={(e) => setFormData({...formData, useHalfPrecision: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Use Half Precision</span>
            </label>
            

          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sensitivity: {formData.sensitivityPercentage}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.sensitivityPercentage}
            onChange={(e) => setFormData({...formData, sensitivityPercentage: parseInt(e.target.value)})}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div className={`p-2 rounded text-xs ${
          baselineImageId ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
        }`}>
          <span className="font-medium">
            {baselineImageId ? 'Enhanced Analysis' : 'Standard Analysis'}
          </span>
        </div>

        <div className="space-y-2">
          <button 
            type="submit" 
            disabled={isAnalyzing || !formData.maintenanceImagePath}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              isAnalyzing || !formData.maintenanceImagePath
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : baselineImageId 
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isAnalyzing 
              ? 'Analyzing...' 
              : baselineImageId ? 'Start Enhanced Analysis' : 'Start Analysis'
            }
          </button>
          
          {!formData.maintenanceImagePath && (
            <p className="text-xs text-gray-500 text-center">
              Please enter a maintenance image ID to proceed
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default ThermalAnalysisForm;