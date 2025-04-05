import React from "react";

interface Props {
  title: string;
  formulas: string[];
}

export const Formula: React.FC<Props> = ({ title, formulas }) => {
  return (
    <div className='mb-3 last:mb-0'>
      <div className='font-medium text-gray-800 mb-1'>{title}:</div>
      {formulas.map((formula, index) => (
        <div key={index} className='pl-3 text-gray-600 italic'>{formula}</div>
      ))}
    </div>
  )
}