import React from 'react';

const columnConfig = [
  { label: 'Voltage (1st Insp)', field: 'firstVoltage' },
  { label: 'Current (1st Insp)', field: 'firstCurrent' },
  { label: 'Voltage (2nd Insp)', field: 'secondVoltage' },
  { label: 'Current (2nd Insp)', field: 'secondCurrent' }
];

const ElectricalReadingsGrid = ({ rows, onChange, disabled }) => {
  const handleChange = (phase, field, value) => {
    onChange(phase, field, value);
  };

  return (
    <div className='maintenance-card rounded-xl bg-white p-5 shadow-sm'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-lg font-semibold text-gray-900'>Electrical Measurements</h2>
          <p className='text-sm text-gray-500'>Record the comparative voltage and current readings for each phase.</p>
        </div>
        <span className='rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700'>Page 1 Grid</span>
      </div>

      <div className='overflow-x-auto rounded-xl border border-gray-200'>
        <table className='min-w-full divide-y divide-gray-200 text-sm'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-3 text-left font-semibold text-gray-600'>Phase</th>
              {columnConfig.map((column) => (
                <th key={column.field} className='px-4 py-3 text-left font-semibold text-gray-600'>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100 bg-white'>
            {rows.map((row) => (
              <tr key={row.phase}>
                <td className='px-4 py-3 font-semibold text-gray-800'>{row.phase}</td>
                {columnConfig.map((column) => (
                  <td key={column.field} className='px-4 py-2'>
                    <input
                      type='text'
                      value={row[column.field]}
                      onChange={(e) => handleChange(row.phase, column.field, e.target.value)}
                      disabled={disabled}
                      className='w-full rounded-lg border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 disabled:bg-gray-100'
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ElectricalReadingsGrid;
