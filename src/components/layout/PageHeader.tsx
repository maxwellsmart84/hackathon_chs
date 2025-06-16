import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconBgColor?: string;
}

export default function PageHeader({
  title,
  description,
  icon: Icon,
  iconBgColor = 'bg-blue-600',
}: PageHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <div className="mb-4 flex items-center justify-center space-x-2">
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgColor}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      </div>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
}
