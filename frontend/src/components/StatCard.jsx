import { useEffect } from "react";

const StatCard = ({ title, value, icon, trend, color }) => {
  // Debug: Log when StatCard receives new props
  useEffect(() => {
    console.log(`StatCard [${title}] received new value:`, value);
  }, [value, title]);

  const colorStyles = {
    blue: 'bg-blue-500/10 text-blue-400',
    amber: 'bg-amber-500/10 text-amber-400',
    emerald: 'bg-emerald-500/10 text-emerald-400'
  };

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorStyles[color]} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-full border border-slate-700">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    </div>
  );
};

export default StatCard;