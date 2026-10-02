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
    <div className="w-full min-h-screen flex bg-gradient-to-br from-[#fef6f6] to-[#f2f6fb] font-sans">
      <div className="flex flex-col flex-1 min-h-screen">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={0} />

        <div className="flex flex-row flex-1 min-h-screen">
          <Bar sidebar={sideBar} />

          <div className="mx-8 my-10 bg-gradient-to-b from-sky-300 to-sky-700 w-full rounded-2xl shadow-lg p-10">
            <p className="text-3xl font-bold text-[#2C3E50] mb-8 border-b pb-3 border-gray-300">
              List a New Product
            </p>

            <form onSubmit={submit} className="flex flex-col gap-6">
              <div className="flex flex-col">
                <label className="text-lg text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  name="productname"
                  value={formData.productname}
                  placeholder="e.g. Vintage Exhaust System"
                  onChange={handleChange}
                  className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#f9fafb]"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-lg text-gray-700 mb-1">Price (in Rupees)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  placeholder="e.g. 4999"
                  onChange={handleChange}
                  min="0"
                  className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#f9fafb]"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-lg text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Detailed product description…"
                  value={formData.description}
                  name="description"
                  rows={4}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-xl px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#f9fafb]"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-lg text-gray-700 mb-1">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  placeholder="e.g. 10"
                  onChange={handleChange}
                  min="0"
                  className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#f9fafb]"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-lg text-gray-700 mb-1">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  name="image"
                  onChange={handleChange}
                  className="border border-dashed border-blue-300 px-4 py-3 rounded-xl bg-[#f0f6ff] hover:bg-[#e4efff] transition-all duration-200"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-500 text-white disabled:bg-green-300 px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-800 transition-all duration-200"
                >
                  {submitting ? 'Creating product…' : 'Create Product'}
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
