import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../axios/api';
import Bar from '../../components/seller/sidemenuSeller';
import Navbar from '../../components/seller/navbar';
import { useFlash } from '../../context/FlashContext';
import useLogout from '../../utils/useLogout';

const EMPTY = { productname: '', price: '', description: '', stock: '', image: null };

function AddProduct() {
  const navigate = useNavigate();
  const logout = useLogout('/seller/login');
  const { triggerFlash } = useFlash();

  const fileRef = useRef(null);
  const [sideBar, setSideBar] = useState(false);
  const [formData, setFormData] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, type, files, value } = event.target;
    if (type === 'file') {
      setFormData((prev) => ({ ...prev, image: files?.[0] ?? null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const submit = async (event) => {
    // Previously this was both `onSubmit` and `onClick` on the submit button, so
    // one click uploaded the image twice.
    event.preventDefault();
    if (submitting) return;

    if (!formData.productname.trim() || !formData.description.trim()) {
      triggerFlash('Enter a product name and description.', 'error');
      return;
    }
    if (!formData.image) {
      triggerFlash('Please choose a product image.', 'error');
      return;
    }
    if (formData.price === '' || Number(formData.price) < 0) {
      triggerFlash('Enter a price of zero or more.', 'error');
      return;
    }
    if (formData.stock === '' || !Number.isInteger(Number(formData.stock)) || Number(formData.stock) < 0) {
      triggerFlash('Enter a stock count of zero or a positive whole number.', 'error');
      return;
    }

    const payload = new FormData();
    payload.append('productname', formData.productname.trim());
    payload.append('price', formData.price);
    payload.append('description', formData.description.trim());
    payload.append('stock', formData.stock);
    payload.append('image', formData.image);

    setSubmitting(true);
    try {
      const res = await api.post('/api/seller/create', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        triggerFlash('Product added successfully', 'success');
        setFormData(EMPTY);
        if (fileRef.current) fileRef.current.value = null;
        navigate('/seller/dashboard');
      } else {
        triggerFlash(res.data.error || 'Could not add the product.', 'error');
      }
    } catch (err) {
      triggerFlash(err.friendlyMessage || 'Could not add the product.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell flex">
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={0} />

        <div className="flex w-full min-h-screen flex-1 flex-row">
          <Bar sidebar={sideBar} />

          <div className="mx-6 my-8 w-full md:mx-10">
            <div className="mb-6">
              <p className="section-label">Seller portal</p>
              <h1 className="page-heading mt-1.5">List a new product</h1>
              <p className="page-sub">
                Buyers see this immediately, so use a clear name and an accurate description.
              </p>
            </div>

            <form onSubmit={submit} className="page-panel max-w-2xl">
              <div className="flex flex-col">
                <label className="field-label" htmlFor="productname">
                  Product name
                </label>
                <input
                  id="productname"
                  type="text"
                  name="productname"
                  value={formData.productname}
                  placeholder="e.g. Vintage Exhaust System"
                  onChange={handleChange}
                  className="field-input"
                />
              </div>

              <div className="mt-5 flex flex-col">
                <label className="field-label" htmlFor="price">
                  Price (₹)
                </label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  placeholder="e.g. 4999"
                  onChange={handleChange}
                  min="0"
                  className="field-input"
                />
              </div>

              <div className="mt-5 flex flex-col">
                <label className="field-label" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  placeholder="What is this part, and what does it fit?"
                  value={formData.description}
                  name="description"
                  rows={4}
                  onChange={handleChange}
                  className="field-input resize-none"
                />
              </div>

              <div className="mt-5 flex flex-col">
                <label className="field-label" htmlFor="stock">
                  Stock
                </label>
                <input
                  id="stock"
                  type="number"
                  name="stock"
                  value={formData.stock}
                  placeholder="e.g. 10"
                  onChange={handleChange}
                  min="0"
                  className="field-input"
                />
                <p className="field-hint">How many units you have on hand right now.</p>
              </div>

              <div className="mt-5 flex flex-col">
                <label className="field-label" htmlFor="image">
                  Product image
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  name="image"
                  onChange={handleChange}
                  className="cursor-pointer rounded-xl border border-dashed border-primary-300 bg-surface-50 px-4 py-3 text-sm text-primary-500 transition hover:border-accent-400 hover:bg-surface-100"
                />
              </div>

              <div className="mt-7 border-t border-primary-100 pt-6">
                <button type="submit" disabled={submitting} className="btn-sage">
                  {submitting ? 'Creating product…' : 'Create product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
