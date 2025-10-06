import React, { useState } from 'react';
import { thermalApi } from '../services/thermalApi';

const ThermalAnalysisForm = ({ 
  onAnalysisComplete, 
  selectedImageId, 
  equipmentId, 
  inspectionId,
  showSuccess, 
  showError,
  imageInfo
}) => {
  const [formData, setFormData] = useState({
    maintenanceImagePath: selectedImageId || '',
    baselineImagePath: '',
    processingDevice: -1,
    inputImageSize: 640,
    useHalfPrecision: false,
    sensitivityPercentage: 50,
    equipmentId: equipmentId || null,
    inspectionId: inspectionId || null,
    createdBy: 'inspector@company.com'
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [useMockAnalysis, setUseMockAnalysis] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);

    try {
      // Prepare request data matching backend specification
      const requestData = {
        maintenanceImagePath: formData.maintenanceImagePath.toString(),
        baselineImagePath: formData.baselineImagePath || undefined, // Send undefined instead of empty string
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
      
      console.log('Submitting thermal analysis:', requestData);
      const result = useMockAnalysis 
        ? await thermalApi.analyzeMockImage(requestData)
        : await thermalApi.analyzeImage(requestData);
      onAnalysisComplete(result);
      showSuccess('Thermal analysis completed successfully');
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
      {imageInfo && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-blue-800">Selected Image for Analysis</h4>
            <span className="text-xs text-blue-600">ID: {imageInfo.id}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-blue-700">
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
            <input
              type="text"
              value={formData.baselineImagePath}
              onChange={(e) => setFormData({...formData, baselineImagePath: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter baseline image ID"
            />
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
            
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useMockAnalysis}
                onChange={(e) => setUseMockAnalysis(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-orange-600">Use Mock Analysis (for testing)</span>
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

        <div className="space-y-2">
          <button 
            type="submit" 
            disabled={isAnalyzing || !formData.maintenanceImagePath}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              isAnalyzing || !formData.maintenanceImagePath
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
{isAnalyzing 
              ? (useMockAnalysis ? 'Running Mock Analysis...' : 'Analyzing Thermal Image...') 
              : (useMockAnalysis ? 'Start Mock Analysis' : 'Start Thermal Analysis')
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