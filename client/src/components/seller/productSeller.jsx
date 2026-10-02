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

  return (
    <div className="w-64 rounded-2xl shadow-md bg-blue-100 border border-gray-200 hover:shadow-xl transition duration-300">
      <ProductImage
        className="h-48 w-full object-cover rounded-t-2xl"
        src={image}
        alt={productname || 'product'}
      />

      <div className="p-4 flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-800 truncate" title={productname}>
          {productname}
        </h2>
        <p className="text-green-600 font-medium text-md">₹{price}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        <p
          className={`text-xs font-semibold ${
            stock === 0 ? 'text-red-600' : stock < 5 ? 'text-amber-600' : 'text-gray-600'
          }`}
        >
          {stock} unit{stock === 1 ? '' : 's'} in stock
        </p>

        <div className="flex flex-wrap gap-2 mt-2">
          <button
            type="button"
            onClick={onView}
            className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm"
          >
            View Details
          </button>
          <button
            type="button"
            onClick={() => setModal('price')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm"
          >
            Change Price
          </button>
          <button
            type="button"
            onClick={() => setModal('stock')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm"
          >
            Add Stock
          </button>
          <button
            type="button"
            onClick={() => setModal('delete')}
            className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded-md text-sm"
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
            className="border px-3 py-2 w-full mb-4 rounded"
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
            className="border px-3 py-2 w-full mb-4 rounded"
            placeholder="Units to add"
            value={newStock}
            onChange={(event) => setNewStock(event.target.value)}
          />
          <ModalActions onCancel={close} onConfirm={restock} busy={busy} label="Add Stock" />
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Delete this product?" onCancel={close}>
          <p className="mb-4 text-sm">
            “{productname}” will be removed permanently. Products that already have orders
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
    <div className="fixed inset-0 bg-blue-300 bg-opacity-50 flex justify-center items-center z-50 px-4">
      <div className="bg-blue-100 p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
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
        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-60"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={busy}
        className={`px-4 py-2 text-white rounded disabled:opacity-60 ${
          danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {busy ? 'Working…' : label}
      </button>
    </div>
  );
}

export default ProductCard;
