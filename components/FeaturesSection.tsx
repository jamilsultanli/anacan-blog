
import React from 'react';
import { FEATURES } from '../constants';

const FeaturesSection: React.FC = () => {
  return (
    <div className="bg-white py-16">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {FEATURES.map((feature, idx) => (
                <div key={idx} className="bg-rose-50/50 rounded-3xl p-8 border border-rose-50 hover:border-rose-200 transition-all hover:shadow-lg group">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                   <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default FeaturesSection;
