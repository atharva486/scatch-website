import { useState } from 'react';
import EditValues from '../../components/EditValues';
import Bar from '../../components/seller/sidemenuSeller';
import Navbar from '../../components/seller/navbar';
import useFetch from '../../utils/useFetch';
import useLogout from '../../utils/useLogout';

/** Mirrors the server's `SELLER_EDITABLE` allowlist. */
const EDITABLE = ['fullname', 'email', 'gstin', 'password'];

function ProfileSeller() {
  const [sideBar, setSideBar] = useState(false);
  const [editField, setEditField] = useState(null);

  const logout = useLogout('/seller/login');
  const { data, loading, error, reload } = useFetch('/api/seller/profile');

  const seller = data?.seller;

  return (
    <div className="w-full min-h-screen flex bg-[#FDEFEF] font-sans">
      <div className="flex flex-col flex-1 min-h-screen">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={0} />

        <div className="flex flex-row flex-1 w-full min-h-screen">
          <Bar sidebar={sideBar} />

          <div className="mx-8 my-10 bg-gradient-to-b from-sky-300 to-sky-700 h-fit w-full rounded-2xl shadow-md p-10">
            <p className="text-3xl font-semibold text-red-900 mb-8 border-b pb-4">Profile Details</p>

            {loading && <p className="text-lg text-gray-900">Loading your profile…</p>}
            {!loading && error && <p className="text-lg text-red-900">{error}</p>}

            {seller && (
              <div className="flex flex-col gap-6">
                {[
                  { field: 'fullname', label: 'Name' },
                  { field: 'email', label: 'Email' },
                  { field: 'gstin', label: 'GSTIN' },
                ].map(({ field, label }) => (
                  <div key={field}>
                    <label className="text-lg text-gray-700 mb-1 block">{label}</label>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={seller[field] ?? ''}
                        readOnly
                        className="border bg-[#FDEFEF] w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditField({ field, originalVal: seller[field] ?? '' })
                        }
                        className="px-1 text-blue-600 hover:text-blue-400 hover:border-b hover:border-blue-400"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setEditField({ field: 'password', originalVal: '' })}
                    className="mx-auto bg-green-500 text-white rounded-xl px-6 py-2 text-lg font-semibold hover:bg-green-700 transition-all duration-200"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {editField && (
          <EditValues
            value={editField.field}
            originalVal={editField.originalVal}
            apiBase="/api/seller"
            allowedFields={EDITABLE}
            getdata={reload}
            onClose={() => setEditField(null)}
          />
        )}
      </div>
    </div>
  );
}

export default ProfileSeller;
