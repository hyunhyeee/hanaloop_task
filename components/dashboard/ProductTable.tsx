import React from 'react';
import { ProductPCF } from '../../types/pcf';
import { MoreHorizontal, ArrowUpRight } from 'lucide-react';

interface ProductTableProps {
  products: ProductPCF[];
}

export const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-zinc-900">Product PCF Inventory</h3>
        <button className="text-emerald-600 text-sm font-semibold flex items-center gap-1 hover:underline">
          View All <ArrowUpRight size={16} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Total PCF (kgCO2e)</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Updated</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{product.productName}</p>
                    <p className="text-xs text-zinc-500">{product.sku}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded text-xs font-medium">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900">{product.totalCo2e}</span>
                    <div className="w-16 bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full" 
                        style={{ width: `${Math.min((product.totalCo2e / 150) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    Verified
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500">
                  {product.lastUpdated}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-zinc-400 hover:text-zinc-600">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
