import React, { useState, useEffect } from 'react';
import { receiptsAPI } from '../../services/api';
import moment from 'moment';

export default function SavedReceipts({ user }) {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    loadReceipts();
  }, [favoritesOnly]);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const data = await receiptsAPI.getAll(favoritesOnly);
      setReceipts(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (receipt) => {
    try {
      const updated = receipt.is_favorite
        ? await receiptsAPI.unmarkFavorite(receipt.id)
        : await receiptsAPI.markFavorite(receipt.id);
      
      setReceipts(receipts.map(r => r.id === receipt.id ? updated : r));
    } catch (err) {
      setError(err.message || 'Failed to update favorite status');
    }
  };

  const handleDelete = async (receiptId) => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) {
      return;
    }

    try {
      await receiptsAPI.delete(receiptId);
      setReceipts(receipts.filter(r => r.id !== receiptId));
    } catch (err) {
      setError(err.message || 'Failed to delete receipt');
    }
  };

  const formatDate = (dateString) => {
    try {
      return moment(dateString).format('MMM DD, YYYY');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-400">Loading receipts...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-emerald-400">Saved Receipts</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
              className="mr-2 h-4 w-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-600"
            />
            <span className="text-sm">Favorites only</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {receipts.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-lg mb-2">No saved receipts yet</p>
          <p className="text-sm">Create a receipt and save it to see it here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {receipts.map((receipt) => (
            <div
              key={receipt.id}
              className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-emerald-500 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-200 mb-1">
                    {receipt.use_custom_store_name && receipt.custom_store_name
                      ? receipt.custom_store_name
                      : receipt.store_name}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {formatDate(receipt.purchase_date)} at {receipt.purchase_time}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleFavorite(receipt)}
                  className="ml-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                  title={receipt.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {receipt.is_favorite ? (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" fillRule="evenodd" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="mb-3">
                <p className="text-sm text-slate-400 mb-1">
                  {receipt.receipt_items?.length || 0} items
                </p>
                <p className="text-lg font-bold text-emerald-400">
                  {formatCurrency(receipt.total)}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(receipt.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    // TODO: Load receipt into editor
                    console.log('Load receipt:', receipt);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 px-3 rounded transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
