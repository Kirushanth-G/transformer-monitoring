import React, { useState, useEffect } from 'react';
import { thermalApi } from '../services/thermalApi';

const ThermalAnalysisHistory = ({ equipmentId, showSuccess, showError }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (equipmentId) {
      loadHistory();
    }
  }, [equipmentId]);

  const loadHistory = async (pageNum = 0) => {
    if (!equipmentId) return;
    
    setLoading(true);
    try {
      const data = await thermalApi.getEquipmentHistory(equipmentId, pageNum, 10);
      
      if (pageNum === 0) {
        setHistory(data);
      } else {
        setHistory(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === 10);
      setPage(pageNum);
    } catch (err) {
      showError(err.message || 'Failed to load thermal analysis history');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadHistory(page + 1);
    }
  };

  const getAssessmentColor = (assessment) => {
    switch (assessment) {
      case 'CRITICAL': return 'bg-red-600';
      case 'WARNING': return 'bg-yellow-600';
      case 'NORMAL': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  if (!equipmentId) {
    return (
      <div className="text-center text-gray-500 py-4">
        No equipment selected for thermal analysis history
      </div>
    );
  }

  if (loading && history.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        Loading thermal analysis history...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No thermal analysis history found for this equipment.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-md font-semibold text-gray-800">
        Thermal Analysis History ({history.length})
      </h4>
      
      <div className="space-y-2">
        {history.map((analysis) => (
          <div key={analysis.id} className="border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-gray-900">
                    Analysis #{analysis.id}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getAssessmentColor(analysis.overallAssessment)}`}>
                    {analysis.overallAssessment}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(analysis.analysisTimestamp).toLocaleString()} • {analysis.createdBy}
                </p>
              </div>
              
              <div className="text-right text-sm">
                <div className="text-gray-900 font-semibold">
                  Score: {analysis.anomalyScore?.toFixed(3)}
                </div>
                <div className="text-gray-500 text-xs">
                  {analysis.totalDetections} detections
                  {analysis.criticalDetections > 0 && (
                    <span className="text-red-600 ml-1">
                      ({analysis.criticalDetections} critical)
                    </span>
                  )}
                </div>
                <div className="text-gray-500 text-xs">
                  {analysis.processingTimeMs}ms
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ThermalAnalysisHistory;