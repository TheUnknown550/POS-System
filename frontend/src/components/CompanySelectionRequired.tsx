import React from 'react';
import { Building2, MapPin } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

const CompanySelectionRequired: React.FC = () => {
  const { hasValidSelection } = useCompany();

  if (hasValidSelection) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <Building2 className="w-12 h-12 text-blue-500" />
            <MapPin className="w-12 h-12 text-green-500" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Select Your Workspace
        </h2>
        
        <p className="text-gray-600 mb-6">
          Please select a company and branch from the sidebar to access your data and continue working.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Tip:</span> Use the dropdown menus in the left sidebar to select your company and branch. 
            If you don't see any options, you may need to create a company first.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanySelectionRequired;
