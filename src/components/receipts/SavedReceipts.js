import React, { useState, useEffect } from 'react';
import { receiptsAPI } from '../../services/api';
import moment from 'moment';
import Notification from '../common/Notification';

export default function SavedReceipts({ user, onLoadReceipt }) {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [editingNameId, setEditingNameId] = useState(null);
  const [editingNameValue, setEditingNameValue] = useState('');
  const [notification, setNotification] = useState(null);
  const [deleteModalReceiptId, setDeleteModalReceiptId] = useState(null);

  useEffect(() => {
    loadReceipts();
  }, [favoritesOnly]); // eslint-disable-line react-hooks/exhaustive-deps

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
      const newFavoriteStatus = !receipt.is_favorite;
      const updated = await receiptsAPI.update(receipt.id, {
        is_favorite: newFavoriteStatus
      });
      
      setReceipts(receipts.map(r => r.id === receipt.id ? updated : r));
      setError(null); // Clear any previous errors
      
      // Show notification
      setNotification({
        message: newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites',
        type: 'success'
      });
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError(err.message || 'Failed to update favorite status');
    }
  };

  const handleDeleteClick = (receiptId) => {
    setDeleteModalReceiptId(receiptId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalReceiptId) return;

    try {
      await receiptsAPI.delete(deleteModalReceiptId);
      setReceipts(receipts.filter(r => r.id !== deleteModalReceiptId));
      setDeleteModalReceiptId(null);
      
      // Show success notification
      setNotification({
        message: 'Receipt deleted successfully',
        type: 'success'
      });
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete receipt');
      setDeleteModalReceiptId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalReceiptId(null);
  };

  const handleStartEditName = (receipt) => {
    const currentName = receipt.receipt_name || '';
    setEditingNameId(receipt.id);
    setEditingNameValue(currentName);
  };

  const handleCancelEditName = () => {
    setEditingNameId(null);
    setEditingNameValue('');
  };

  const handleSaveName = async (receipt) => {
    const trimmedValue = editingNameValue.trim();
    // Allow empty name (user can clear it)
    try {
      const updated = await receiptsAPI.update(receipt.id, {
        receipt_name: trimmedValue || null
      });
      
      setReceipts(receipts.map(r => r.id === receipt.id ? updated : r));
      setEditingNameId(null);
      setEditingNameValue('');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to update receipt name');
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
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-emerald-400 mb-3">Saved Receipts</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <span className="text-sm text-slate-300">Show favorites only</span>
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </div>
        </label>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Notification 
        notification={notification} 
        onDismiss={() => setNotification(null)} 
      />

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
                  {editingNameId === receipt.id ? (
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="text"
                        value={editingNameValue}
                        onChange={(e) => setEditingNameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveName(receipt);
                          } else if (e.key === 'Escape') {
                            handleCancelEditName();
                          }
                        }}
                        placeholder="Enter receipt name..."
                        className="flex-1 bg-slate-700 border border-emerald-500 rounded px-2 py-1 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveName(receipt)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        title="Save"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={handleCancelEditName}
                        className="text-slate-400 hover:text-slate-300 transition-colors"
                        title="Cancel"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 
                        className="font-semibold text-slate-200 mb-1 cursor-pointer hover:text-emerald-400 transition-colors"
                        onClick={() => handleStartEditName(receipt)}
                        title="Click to edit name"
                      >
                        {receipt.receipt_name || 'Unnamed Receipt'}
                      </h3>
                      <p className="text-xs text-slate-500 mb-1">
                        {receipt.use_custom_store_name && receipt.custom_store_name
                          ? receipt.custom_store_name
                          : receipt.store_name}
                      </p>
                    </>
                  )}
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
                    <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 20 20" strokeWidth="1.5">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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
                  onClick={() => handleDeleteClick(receipt.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    if (onLoadReceipt) {
                      onLoadReceipt(receipt);
                    } else {
                      console.log('Load receipt:', receipt);
                    }
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 px-3 rounded transition-colors"
                >
                  Load Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalReceiptId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleDeleteCancel}>
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-200 mb-4">Delete Receipt</h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete this receipt? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

