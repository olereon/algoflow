import React from 'react';

export const SimpleAnimationTest: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Simple Animation Test</h1>
      <p>This is a basic test component to verify the animation demo works.</p>
      <div className="mt-4 p-4 bg-blue-100 rounded">
        <p>If you can see this, the demo route is working!</p>
      </div>
    </div>
  );
};