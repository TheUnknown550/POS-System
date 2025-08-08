import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, Filter } from 'lucide-react';
import type { Product, ProductCategory } from '../types';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data for now
  useEffect(() => {
    const loadMockData = async () => {
      setIsLoading(true);
      
      // Mock categories
      const mockCategories: ProductCategory[] = [
        { id: '1', name: 'Burgers', description: 'All types of burgers', created_at: new Date().toISOString() },
        { id: '2', name: 'Beverages', description: 'Drinks and beverages', created_at: new Date().toISOString() },
        { id: '3', name: 'Sides', description: 'Side dishes', created_at: new Date().toISOString() },
        { id: '4', name: 'Desserts', description: 'Sweet treats', created_at: new Date().toISOString() }
      ];

      // Mock products
      const mockProducts: Product[] = [
        { 
          id: '1', 
          name: 'Classic Burger', 
          description: 'Beef patty with lettuce, tomato, and sauce',
          price: 12.99,
          category_id: '1',
          stock_quantity: 50,
          is_available: true,
          created_at: new Date().toISOString()
        },
        { 
          id: '2', 
          name: 'Chicken Deluxe', 
          description: 'Grilled chicken with premium toppings',
          price: 14.99,
          category_id: '1',
          stock_quantity: 30,
          is_available: true,
          created_at: new Date().toISOString()
        },
        { 
          id: '3', 
          name: 'Coca Cola', 
          description: 'Refreshing cold drink',
          price: 2.99,
          category_id: '2',
          stock_quantity: 100,
          is_available: true,
          created_at: new Date().toISOString()
        },
        { 
          id: '4', 
          name: 'French Fries', 
          description: 'Crispy golden fries',
          price: 4.99,
          category_id: '3',
          stock_quantity: 75,
          is_available: true,
          created_at: new Date().toISOString()
        },
        { 
          id: '5', 
          name: 'Chocolate Cake', 
          description: 'Rich chocolate layer cake',
          price: 6.99,
          category_id: '4',
          stock_quantity: 15,
          is_available: true,
          created_at: new Date().toISOString()
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      setCategories(mockCategories);
      setProducts(mockProducts);
      setIsLoading(false);
    };

    loadMockData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory === '' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Unknown';
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const toggleAvailability = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, is_available: !p.is_available } : p
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your restaurant menu items</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-48"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  product.is_available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Stock: {product.stock_quantity}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500">
                  Category: {getCategoryName(product.category_id)}
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => toggleAvailability(product.id)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    product.is_available
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {product.is_available ? 'Disable' : 'Enable'}
                </button>
                
                <button className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                
                <button 
                  onClick={() => handleDeleteProduct(product.id)}
                  className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first product.'
            }
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </button>
        </div>
      )}

      {/* Add Product Modal - Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Product</h2>
            <p className="text-gray-600 mb-4">Product creation form will be implemented here.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
