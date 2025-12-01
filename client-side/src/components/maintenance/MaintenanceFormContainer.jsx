import React, { useEffect, useMemo, useState } from 'react';
import MetadataSection from './MetadataSection';
import ElectricalReadingsGrid from './ElectricalReadingsGrid';
import SchematicDiagram from './SchematicDiagram';
import { MaintenanceService } from '../../services/MaintenanceService';

const defaultRecord = {
  inspectorName: '',
  supervisedBy: '',
  jobStartedAt: '',
  jobCompletedAt: '',
  baselineIrNumber: '',
  baselineCondition: ''
};

const createDefaultRows = () => [
  { phase: 'R', firstVoltage: '', firstCurrent: '', secondVoltage: '', secondCurrent: '' },
  { phase: 'Y', firstVoltage: '', firstCurrent: '', secondVoltage: '', secondCurrent: '' },
  { phase: 'B', firstVoltage: '', firstCurrent: '', secondVoltage: '', secondCurrent: '' },
  { phase: 'N', firstVoltage: '', firstCurrent: '', secondVoltage: '', secondCurrent: '' }
];

const extractApiMessage = (error, fallback) => {
  if (error?.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string') {
      return data;
    }
    if (typeof data === 'object') {
      if (data.message || data.error) {
        return data.message || data.error;
      }
      try {
        return JSON.stringify(data);
      } catch (stringifyError) {
        console.warn('Failed to stringify API error payload', stringifyError, data);
      }
      return fallback;
    }
  }
  if (error?.message) {
    return error.message;
  }
  return fallback;
};

const hasValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') return !Number.isNaN(value);
  return String(value).trim() !== '';
};

const hasStageData = (rows, stage) => {
  const [voltageKey, currentKey] = stage === 'FIRST_INSPECTION'
    ? ['firstVoltage', 'firstCurrent']
    : ['secondVoltage', 'secondCurrent'];

  return rows.some((row) => hasValue(row[voltageKey]) || hasValue(row[currentKey]));
};

const defaultDiagramState = {
  checkpoints: {
    'la-1': false,
    'la-2': false,
    'ddlo-1': false,
    'tf-core': false
  }
};

const isRecordFinalized = (record) => {
  if (!record) return false;
  if (typeof record.isFinalized === 'boolean') return record.isFinalized;
  if (record.status) {
    return record.status.toUpperCase() === 'FINALIZED';
  }
  return false;
};

const isoToInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
};

const buildStagePayload = (rows, stage) => {
  const phaseMap = rows.reduce((acc, row) => {
    acc[row.phase] = row;
    return acc;
  }, {});

  const isFirst = stage === 'FIRST_INSPECTION';

  return {
    readingStage: stage,
    voltsR: phaseMap.R?.[isFirst ? 'firstVoltage' : 'secondVoltage'] || '',
    ampsR: phaseMap.R?.[isFirst ? 'firstCurrent' : 'secondCurrent'] || '',
    voltsY: phaseMap.Y?.[isFirst ? 'firstVoltage' : 'secondVoltage'] || '',
    ampsY: phaseMap.Y?.[isFirst ? 'firstCurrent' : 'secondCurrent'] || '',
    voltsB: phaseMap.B?.[isFirst ? 'firstVoltage' : 'secondVoltage'] || '',
    ampsB: phaseMap.B?.[isFirst ? 'firstCurrent' : 'secondCurrent'] || '',
    voltsNeutral: phaseMap.N?.[isFirst ? 'firstVoltage' : 'secondVoltage'] || '',
    ampsNeutral: phaseMap.N?.[isFirst ? 'firstCurrent' : 'secondCurrent'] || ''
  };
};

const readingsToRows = (readings) => {
  const rows = createDefaultRows();
  if (!Array.isArray(readings)) return rows;

  const phaseMap = rows.reduce((acc, row) => {
    acc[row.phase] = row;
    return acc;
  }, {});

  readings.forEach((reading) => {
    if (reading.readingStage === 'FIRST_INSPECTION') {
      phaseMap.R.firstVoltage = reading.voltsR || '';
      phaseMap.R.firstCurrent = reading.ampsR || '';
      phaseMap.Y.firstVoltage = reading.voltsY || '';
      phaseMap.Y.firstCurrent = reading.ampsY || '';
      phaseMap.B.firstVoltage = reading.voltsB || '';
      phaseMap.B.firstCurrent = reading.ampsB || '';
      phaseMap.N.firstVoltage = reading.voltsNeutral || '';
      phaseMap.N.firstCurrent = reading.ampsNeutral || '';
    }
    if (reading.readingStage === 'SECOND_INSPECTION') {
      phaseMap.R.secondVoltage = reading.voltsR || '';
      phaseMap.R.secondCurrent = reading.ampsR || '';
      phaseMap.Y.secondVoltage = reading.voltsY || '';
      phaseMap.Y.secondCurrent = reading.ampsY || '';
      phaseMap.B.secondVoltage = reading.voltsB || '';
      phaseMap.B.secondCurrent = reading.ampsB || '';
      phaseMap.N.secondVoltage = reading.voltsNeutral || '';
      phaseMap.N.secondCurrent = reading.ampsNeutral || '';
    }
  });

  return rows;
};

const MaintenanceFormContainer = ({ inspectionId, showSuccess, showError }) => {
  const [recordId, setRecordId] = useState(null);
  const [recordData, setRecordData] = useState(defaultRecord);
  const [electricalRows, setElectricalRows] = useState(createDefaultRows());
  const [diagramState, setDiagramState] = useState(defaultDiagramState);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      try {
        const response = await MaintenanceService.getRecordByInspection(inspectionId);
        const data = response.data || response;
        setRecordId(data.id);
        setRecordData({
          inspectorName: data.inspectorName || '',
          supervisedBy: data.supervisedBy || '',
          jobStartedAt: isoToInputValue(data.jobStartedAt),
          jobCompletedAt: isoToInputValue(data.jobCompletedAt),
          baselineIrNumber: data.baselineIrNo || data.baselineIrNumber || '',
          baselineCondition: data.baselineCondition || ''
        });
        setElectricalRows(readingsToRows(data.electricalReadings));
        setIsFinalized(isRecordFinalized(data));
        setLastSavedAt(data.updatedAt || data.createdAt || new Date().toISOString());
      } catch (error) {
        if (error?.response?.status !== 404) {
          const message = extractApiMessage(error, 'Failed to load maintenance record');
          console.error('Maintenance record fetch failed:', error?.response || error);
          showError?.(message);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchSchematic = async () => {
      try {
        const response = await MaintenanceService.getSchematic(inspectionId);
        const payload = response.data || response;
        if (payload?.diagramState) {
          const parsed = typeof payload.diagramState === 'string' ? JSON.parse(payload.diagramState) : payload.diagramState;
          setDiagramState({
            checkpoints: {
              ...defaultDiagramState.checkpoints,
              ...(parsed.checkpoints || {})
            }
          });
        }
      } catch (error) {
        if (error?.response?.status !== 404) {
          const message = extractApiMessage(error, 'Failed to load schematic');
          console.error('Schematic fetch failed:', error?.response || error);
          showError?.(message);
        }
      }
    };

    if (inspectionId) {
      fetchRecord();
      fetchSchematic();
    }
  }, [inspectionId, showError]);

  const statusBadge = useMemo(() => {
    if (isFinalized) {
      return { label: 'Finalized', className: 'bg-green-100 text-green-800' };
    }
    if (recordId) {
      return { label: 'Draft', className: 'bg-yellow-100 text-yellow-800' };
    }
    return { label: 'New Record', className: 'bg-gray-100 text-gray-700' };
  }, [isFinalized, recordId]);

  const handleRecordChange = (field, value) => {
    setRecordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleElectricalChange = (phase, field, value) => {
    setElectricalRows((prev) =>
      prev.map((row) => (row.phase === phase ? { ...row, [field]: value } : row))
    );
  };

  const handleTogglePoint = (id, value) => {
    setDiagramState((prev) => ({
      ...prev,
      checkpoints: {
        ...prev.checkpoints,
        [id]: value
      }
    }));
  };

  const recordPayload = () => ({
    inspectorName: recordData.inspectorName,
    supervisedBy: recordData.supervisedBy,
    jobStartedAt: recordData.jobStartedAt ? new Date(recordData.jobStartedAt).toISOString() : null,
    jobCompletedAt: recordData.jobCompletedAt ? new Date(recordData.jobCompletedAt).toISOString() : null,
  baselineIrNo: recordData.baselineIrNumber,
    baselineCondition: recordData.baselineCondition,
    inspectionId
  });

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      let currentRecordId = recordId;
      if (currentRecordId) {
        await MaintenanceService.updateRecord(currentRecordId, recordPayload());
      } else {
        const response = await MaintenanceService.createRecord(recordPayload());
        const data = response.data || response;
        currentRecordId = data.id;
        setRecordId(data.id);
      }

      const readingPayloads = [];
      if (hasStageData(electricalRows, 'FIRST_INSPECTION')) {
        readingPayloads.push(buildStagePayload(electricalRows, 'FIRST_INSPECTION'));
      }
      if (hasStageData(electricalRows, 'SECOND_INSPECTION')) {
        readingPayloads.push(buildStagePayload(electricalRows, 'SECOND_INSPECTION'));
      }

      if (readingPayloads.length) {
        await MaintenanceService.addReadings(currentRecordId, readingPayloads);
      }

      await MaintenanceService.saveSchematic(inspectionId, diagramState);
      setLastSavedAt(new Date().toISOString());
      showSuccess?.('Maintenance record saved successfully');
    } catch (error) {
      const message = extractApiMessage(error, 'Failed to save maintenance record');
      console.error('Maintenance save failed:', error?.response || error);
      showError?.(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!recordId) {
      showError?.('Save the draft before finalizing.');
      return;
    }

    if (!window.confirm('Once finalized, the report will be locked. Proceed?')) {
      return;
    }

    setIsSaving(true);
    try {
      await MaintenanceService.finalizeRecord(recordId);
      setIsFinalized(true);
      showSuccess?.('Maintenance record finalized');
    } catch (error) {
      const message = extractApiMessage(error, 'Failed to finalize record');
      console.error('Finalize error:', error?.response || error);
      showError?.(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeeReport = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className='rounded-xl bg-white p-8 text-center shadow-sm'>
        <p className='text-gray-600'>Loading maintenance record…</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='maintenance-card rounded-xl bg-white p-5 shadow-sm'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-wide text-gray-500'>Maintenance Report</p>
            <h1 className='text-2xl font-bold text-gray-900'>Inspection #{inspectionId}</h1>
            <p className='text-sm text-gray-500'>
              Status updated {lastSavedAt ? new Date(lastSavedAt).toLocaleString() : '—'}
            </p>
          </div>
          <div className='flex flex-wrap gap-3'>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
            {isFinalized ? (
              <>
                <button
                  type='button'
                  onClick={handleSeeReport}
                  className='rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-200'
                >
                  See Report
                </button>
                <button
                  type='button'
                  onClick={handlePrint}
                  className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50'
                >
                  Print
                </button>
              </>
            ) : (
              <>
                <button
                  type='button'
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className='save-btn rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  {recordId ? 'Save Draft' : 'Create Draft'}
                </button>
                <button
                  type='button'
                  onClick={handleFinalize}
                  disabled={isSaving}
                  className='finalize-btn rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  Finalize
                </button>
                <button
                  type='button'
                  onClick={handlePrint}
                  className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50'
                >
                  Print
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <MetadataSection data={recordData} onChange={handleRecordChange} disabled={isFinalized} />
      <ElectricalReadingsGrid rows={electricalRows} onChange={handleElectricalChange} disabled={isFinalized} />
      <SchematicDiagram
        diagramState={diagramState}
        onTogglePoint={handleTogglePoint}
        disabled={isFinalized}
      />
    </div>
  );
};

export default MaintenanceFormContainer;
