import { useState } from 'react';
import api from '../../axios/api';
import ProductImage from '../ProductImage';

/**
 * Seller-side product card.
 *
 * Fixes:
 *   - `window.location.reload()` after a delete threw away all local state and
 *     re-ran every effect; the parent now refetches and passes `onChanged`;
 *   - the new-price / new-stock modals closed *before* the request, so a failed
 *     save silently discarded what the seller typed;
 *   - the Cloudinary cloud name was hardcoded in the `src`;
 *   - the "Delete" button fired on any click with no confirmation.
 */
function ProductCard({
  product_id: productId,
  image,
  productname,
  price,
  description,
  stock,
  onChanged,
  onView,
  onError,
}) {
  const [newPrice, setNewPrice] = useState(String(price ?? ''));
  const [newStock, setNewStock] = useState('');
  const [modal, setModal] = useState(null); // 'price' | 'stock' | 'delete'
  const [busy, setBusy] = useState(false);

  const close = () => {
    setModal(null);
    setBusy(false);
  };

  const changePrice = async () => {
    const next = Number(newPrice);
    if (!Number.isFinite(next) || next < 0) {
      onError('Enter a price of zero or more.');
      return;
    }

    setBusy(true);
    try {
      await api.post(`/api/product/change_price/${productId}`, { newprice: next });
      setModal(null);
      setNewPrice(String(next));
      await onChanged?.();
    } catch (err) {
      onError?.(err.friendlyMessage || 'Could not change the price.');
    } finally {
      setBusy(false);
    }
  };

  const restock = async () => {
    const next = Number(newStock);
    if (!Number.isInteger(next) || next < 1) {
      onError('Enter how many units to add (at least 1).');
      return;
    }

    setBusy(true);
    try {
      await api.post(`/api/product/restock/${productId}`, { newStock: next });
      setModal(null);
      setNewStock('');
      await onChanged?.();
    } catch (err) {
      onError?.(err.friendlyMessage || 'Could not update the stock.');
    } finally {
      setBusy(false);
    }
  };

  const removeProduct = async () => {
    setBusy(true);
    try {
      await api.post('/api/seller/delete', { product_id: productId });
      setModal(null);
      await onChanged?.();
    } catch (err) {
      setModal(null);
      onError?.(err.friendlyMessage || 'Could not delete the product.');
    } finally {
      setBusy(false);
    }
  };

  const getStockColor = () => {
    if (stock === 0) return 'text-red-600';
    if (stock < 5) return 'text-amber-600';
    return 'text-primary-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-primary-100 overflow-hidden transition-shadow duration-200 hover:shadow-md">
      <ProductImage
        className="h-48 w-full object-cover bg-primary-100 rounded-t-2xl"
        src={image}
        alt={productname || 'product'}
      />

      <div className="p-4 flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-primary-900 truncate" title={productname}>
          {productname}
        </h2>
        <p className="text-sage-600 font-medium text-md">₹{price}</p>
        <p className="text-sm text-primary-500 line-clamp-2">{description}</p>
        <p className={`text-xs font-semibold ${getStockColor()}`}>
          {stock} unit{stock === 1 ? '' : 's'} in stock
        </p>

        <div className="flex flex-wrap gap-2 mt-2">
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-primary-300 text-primary-700 hover:bg-primary-50 focus:ring-primary-500 text-sm py-2"
          >
            View Details
          </button>
          <button
            type="button"
            onClick={() => setModal('price')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary-900 text-white hover:bg-primary-800 focus:ring-primary-500 active:scale-[0.98] shadow-sm text-sm py-2"
          >
            Change Price
          </button>
          <button
            type="button"
            onClick={() => setModal('stock')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-sage-600 text-white hover:bg-sage-700 focus:ring-sage-500 active:scale-[0.98] shadow-sm text-sm py-2"
          >
            Add Stock
          </button>
          <button
            type="button"
            onClick={() => setModal('delete')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:scale-[0.98] shadow-sm text-sm py-2"
          >
            Delete
          </button>
        </div>
      </div>

      {modal === 'price' && (
        <Modal title="Change Price" onCancel={close}>
          <input
            type="number"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 placeholder:text-primary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent disabled:bg-primary-50 disabled:cursor-not-allowed mb-4"
            placeholder="New price"
            value={newPrice}
            onChange={(event) => setNewPrice(event.target.value)}
          />
          <ModalActions onCancel={close} onConfirm={changePrice} busy={busy} label="Save Price" />
        </Modal>
      )}

      {modal === 'stock' && (
        <Modal title="Add Stock" onCancel={close}>
          <input
            type="number"
            min="1"
            className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 placeholder:text-primary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent disabled:bg-primary-50 disabled:cursor-not-allowed mb-4"
            placeholder="Units to add"
            value={newStock}
            onChange={(event) => setNewStock(event.target.value)}
          />
          <ModalActions onCancel={close} onConfirm={restock} busy={busy} label="Add Stock" />
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Delete this product?" onCancel={close}>
          <p className="mb-4 text-sm text-primary-600">
            "{productname}" will be removed permanently. Products that already have orders
            cannot be deleted — set their stock to 0 instead.
          </p>
          <ModalActions
            onCancel={close}
            onConfirm={removeProduct}
            busy={busy}
            label="Delete"
            danger
          />
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children }) {
  return (
    <div className="fixed inset-0 bg-primary-900/50 flex justify-center items-center z-50 px-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 animate-scale-in">
        <h3 className="text-lg font-semibold text-primary-900 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onConfirm, busy, label, danger = false }) {
  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent text-primary-700 hover:bg-primary-100 focus:ring-primary-500"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={busy}
        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          danger
            ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:scale-[0.98] shadow-sm'
            : 'bg-primary-900 text-white hover:bg-primary-800 focus:ring-primary-500 active:scale-[0.98] shadow-sm'
        }`}
      >
        {busy ? 'Working…' : label}
      </button>
    </div>
  );
}

export default ProductCard;