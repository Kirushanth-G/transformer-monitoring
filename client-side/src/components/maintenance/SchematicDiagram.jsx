import React from 'react';

const SWITCH_POINTS = [
  { id: 'la-1', label: 'LA 1', className: 'cb-la-1' },
  { id: 'la-2', label: 'LA 2', className: 'cb-la-2' },
  { id: 'ddlo-1', label: 'DDLO', className: 'cb-ddlo-1' },
  { id: 'tf-core', label: 'TF Core', className: 'cb-tf-core' }
];

const SchematicDiagram = ({ diagramState, onTogglePoint, disabled }) => {
  const handleToggle = (id) => {
    onTogglePoint(id, !diagramState.checkpoints[id]);
  };

  return (
    <div className='maintenance-card rounded-xl bg-white p-5 shadow-sm'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-lg font-semibold text-gray-900'>Schematic Diagram</h2>
          <p className='text-sm text-gray-500'>Toggle each component to reflect on-site findings. Overlays map to the PDF schematic.</p>
        </div>
        <span className='rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700'>Interactive SVG</span>
      </div>

      <div className='schematic-container mx-auto rounded-xl border border-gray-200 shadow-inner'>
        {SWITCH_POINTS.map((point) => (
          <label
            key={point.id}
            className={`schematic-checkbox ${point.className} ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            <input
              type='checkbox'
              checked={!!diagramState.checkpoints[point.id]}
              onChange={() => handleToggle(point.id)}
              disabled={disabled}
            />
            <span className='sr-only'>{point.label}</span>
          </label>
        ))}

      </div>

      <div className='mt-4 grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-4 md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>Legend</p>
          <ul className='mt-2 space-y-1 text-sm text-gray-700'>
            <li>☑ Lightning Arrester</li>
            <li>☑ Double Drop Linear Operated Switch</li>
            <li>☑ Transformer Core</li>
          </ul>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>Checklist</p>
          <p className='mt-2 text-sm text-gray-700'>Click each overlay to confirm the on-site state. Checked boxes will be stored with the diagram JSON.</p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>Diagram Notes</p>
          <p className='mt-2 text-sm text-gray-700'>Document any anomalies or follow-up actions alongside the main report if additional context is needed.</p>
        </div>
      </div>
    </div>
  );
};

export default SchematicDiagram;
