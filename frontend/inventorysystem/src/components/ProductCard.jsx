
import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

const ProductCard = ({ product, onDelete }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'accessories': return 'from-orange-400 to-orange-500';
      case 'merchandise': return 'from-orange-500 to-orange-600';
      case 'workshop': return 'from-orange-600 to-orange-700';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getTypeBg = (type) => {
    switch (type) {
      case 'accessories': return 'from-orange-50 to-orange-100/50';
      case 'merchandise': return 'from-orange-100 to-orange-200/50';
      case 'workshop': return 'from-orange-200 to-orange-300/50';
      default: return 'from-gray-50 to-gray-100/50';
    }
  };

  return (
    <Card className={`group relative overflow-hidden bg-gradient-to-br ${getTypeBg(product.type)} border border-orange-200 p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 bg-gradient-to-r ${getTypeColor(product.type)} rounded-xl group-hover:rotate-12 transition-transform`}>
            <Package className="w-6 h-6 text-white" />
          </div>
          <div className="flex gap-2">
            <Link
              to={`/products/${product.id}/edit`}
              className="p-2 bg-white/70 rounded-lg hover:bg-white transition-colors group/edit border border-orange-200"
            >
              <Edit className="w-4 h-4 text-orange-600 group-hover/edit:scale-110 transition-transform" />
            </Link>
            <button
              onClick={() => onDelete(product.id)}
              className="p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors group/delete border border-red-200"
            >
              <Trash2 className="w-4 h-4 text-red-500 group-hover/delete:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <Link to={`/products/${product.id}`} className="block group/title">
            <h3 className="text-xl font-bold text-gray-900 group-hover/title:text-orange-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {product.description || 'No description available'}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-orange-200">
            <div className="text-center">
              <p className="text-gray-500 text-xs uppercase tracking-wide">Quantity</p>
              <p className="text-gray-900 font-semibold">{product.quantity || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-xs uppercase tracking-wide">Value</p>
              <p className="text-gray-900 font-semibold">${product.value || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-xs uppercase tracking-wide">Type</p>
              <span className={`px-2 py-1 bg-gradient-to-r ${getTypeColor(product.type)} text-white text-xs rounded-full font-medium`}>
                {product.type}
              </span>
            </div>
          </div>

          {product.part_number && (
            <div className="pt-2">
              <p className="text-gray-500 text-xs">Part #: {product.part_number}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
