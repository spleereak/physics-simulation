import React from "react";

interface Props {
  label: string;
  value: string | number;
  unit?: string;
}

export const ValueRow: React.FC<Props> = ({ label, value, unit='' }) => {
  return (
    <div className='flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0'>
      <span className='text-gray-700'>{label}:</span>
      <span className='font-medium text-gray-900'>{value}{unit}</span>
    </div>
  )
}