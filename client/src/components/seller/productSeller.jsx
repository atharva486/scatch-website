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
    if (stock < 5) return 'text-accent-600';
    return 'text-primary-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-primary-100 overflow-hidden transition-shadow duration-200 hover:shadow-md">
      <ProductImage
        className="h-48 w-full object-cover bg-primary-100 rounded-t-2xl"
        src={image}
        alt={productname || 'product'}
      />

      <div className="flex flex-col gap-2 p-4">
        <h2 className="truncate text-base font-semibold text-primary-900" title={productname}>
          {productname}
        </h2>
        <p className="text-xl font-bold text-primary-900">₹{price}</p>
        <p className="line-clamp-2 text-sm text-primary-500">{description}</p>
        <p className={`text-xs font-semibold ${getStockColor()}`}>
          {stock} unit{stock === 1 ? '' : 's'} in stock
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-primary-100 pt-4">
          <button type="button" onClick={onView} className="btn-quiet col-span-2">
            View details
          </button>
          <button type="button" onClick={() => setModal('price')} className="btn-primary">
            Change price
          </button>
          <button type="button" onClick={() => setModal('stock')} className="btn-sage">
            Add stock
          </button>
          <button
            type="button"
            onClick={() => setModal('delete')}
            className="col-span-2 text-xs font-semibold text-red-600 underline-offset-4 transition hover:text-red-700 hover:underline"
          >
            Delete product
          </button>
        </div>
      </div>

      {modal === 'price' && (
        <Modal title="Change Price" onCancel={close}>
          <label className="field-label" htmlFor="new-price">
            New price
          </label>
          <input
            id="new-price"
            type="number"
            min="0"
            className="field-input mb-4"
            placeholder="New price"
            value={newPrice}
            onChange={(event) => setNewPrice(event.target.value)}
          />
          <ModalActions onCancel={close} onConfirm={changePrice} busy={busy} label="Save Price" />
        </Modal>
      )}

      {modal === 'stock' && (
        <Modal title="Add Stock" onCancel={close}>
          <label className="field-label" htmlFor="new-stock">
            Units to add
          </label>
          <input
            id="new-stock"
            type="number"
            min="1"
            className="field-input mb-4"
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-950/50 px-4 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-sm animate-scale-in rounded-2xl border border-primary-100 bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-primary-900">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onConfirm, busy, label, danger = false }) {
  return (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onCancel} disabled={busy} className="btn-quiet">
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={busy}
        className={danger ? 'btn-danger' : 'btn-primary'}
      >
        {busy ? 'Working…' : label}
      </button>
    </div>
  );
}

export default ProductCard;