import React from 'react';

const MetadataSection = ({ data, onChange, disabled }) => {
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <div className='maintenance-card rounded-xl bg-white p-5 shadow-sm'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-lg font-semibold text-gray-900'>Inspection Metadata</h2>
          <p className='text-sm text-gray-500'>Capture the contextual information for this maintenance record.</p>
        </div>
        <span className='rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700'>Page 2 Header</span>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div>
          <label className='text-sm font-medium text-gray-700'>Inspector Name</label>
          <input
            type='text'
            value={data.inspectorName}
            onChange={(e) => handleChange('inspectorName', e.target.value)}
            disabled={disabled}
            className='mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100'
          />
        </div>
        <div>
          <label className='text-sm font-medium text-gray-700'>Supervised By</label>
          <input
            type='text'
            value={data.supervisedBy}
            onChange={(e) => handleChange('supervisedBy', e.target.value)}
            disabled={disabled}
            className='mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100'
          />
        </div>
        <div>
          <label className='text-sm font-medium text-gray-700'>Job Started At</label>
          <input
            type='datetime-local'
            value={data.jobStartedAt}
            onChange={(e) => handleChange('jobStartedAt', e.target.value)}
            disabled={disabled}
            className='mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100'
          />
        </div>
        <div>
          <label className='text-sm font-medium text-gray-700'>Job Completed At</label>
          <input
            type='datetime-local'
            value={data.jobCompletedAt}
            onChange={(e) => handleChange('jobCompletedAt', e.target.value)}
            disabled={disabled}
            className='mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100'
          />
        </div>
        <div>
          <label className='text-sm font-medium text-gray-700'>Baseline IR Number</label>
          <input
            type='text'
            value={data.baselineIrNumber}
            onChange={(e) => handleChange('baselineIrNumber', e.target.value)}
            disabled={disabled}
            className='mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100'
          />
        </div>
        <div>
          <label className='text-sm font-medium text-gray-700'>Baseline Condition</label>
          <select
            value={data.baselineCondition}
            onChange={(e) => handleChange('baselineCondition', e.target.value)}
            disabled={disabled}
            className='mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100'
          >
            <option value=''>Select condition</option>
            <option value='SUNNY'>Sunny</option>
            <option value='CLOUDY'>Cloudy</option>
            <option value='RAINY'>Rainy</option>
          </select>
        </div>
      </div>

      <div className='mt-6 grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 md:grid-cols-3'>
        <div>
          <p className='text-xs uppercase tracking-wide text-gray-500'>Inspection Window</p>
          <p className='text-base font-semibold text-gray-900'>
            {data.jobStartedAt ? new Date(data.jobStartedAt).toLocaleString() : '—'}
          </p>
        </div>
        <div>
          <p className='text-xs uppercase tracking-wide text-gray-500'>Completion</p>
          <p className='text-base font-semibold text-gray-900'>
            {data.jobCompletedAt ? new Date(data.jobCompletedAt).toLocaleString() : '—'}
          </p>
        </div>
        <div>
          <p className='text-xs uppercase tracking-wide text-gray-500'>Duration</p>
          <p className='text-base font-semibold text-gray-900'>
            {data.jobStartedAt && data.jobCompletedAt
              ? `${Math.max(1, Math.round((new Date(data.jobCompletedAt) - new Date(data.jobStartedAt)) / 3600000))} hrs`
              : 'Pending'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetadataSection;
