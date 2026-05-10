import { AlertCircle } from 'lucide-react';

export const EmptyState = ({ 
  icon: Icon = AlertCircle, 
  title, 
  description, 
  action,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
    {Icon && <Icon size={48} className="text-slate-400 mb-4" />}
    <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 mb-6">{description}</p>
    {action && <div>{action}</div>}
  </div>
);

export default EmptyState;
