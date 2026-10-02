import { useState } from 'react';
import EditValues from '../../components/EditValues';
import Bar from '../../components/user/sidemenu';
import Navbar from '../../components/user/navbar';
import useFetch from '../../utils/useFetch';
import useLogout from '../../utils/useLogout';

/** Mirrors the server's `USER_EDITABLE` allowlist. */
const EDITABLE = ['fullname', 'email', 'contact', 'password'];

function ProfileUser() {
  const [sideBar, setSideBar] = useState(false);
  const [editField, setEditField] = useState(null);

  const logout = useLogout();
  const { data, loading, error, reload } = useFetch('/api/user/profile');

  const user = data?.user;

  return (
    <div className="w-full min-h-screen flex bg-[#FDEFEF] font-sans">
      <div className="flex flex-col flex-1 min-h-screen">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={0} />

        <div className="flex flex-row flex-1 min-h-screen">
          <Bar sidebar={sideBar} />

          <div className="mx-8 my-10 w-full h-fit bg-gradient-to-br from-sky-300 to-sky-600 rounded-2xl shadow-md p-10">
            <p className="text-3xl font-semibold text-red-800 mb-8">Profile Details</p>

            {loading && <p className="text-lg text-gray-900">Loading your profile…</p>}
            {!loading && error && <p className="text-lg text-red-900">{error}</p>}

            {user && (
              <div className="flex flex-col gap-6">
                {[
                  { field: 'fullname', label: 'Name' },
                  { field: 'email', label: 'Email' },
                  { field: 'contact', label: 'Contact number' },
                ].map(({ field, label }) => (
                  <div key={field} className="flex flex-col">
                    <label className="text-lg text-gray-700 mb-1">{label}</label>
                    <div className="flex flex-row w-full justify-between gap-4">
                      <input
                        type="text"
                        value={user[field] ?? ''}
                        readOnly
                        className="border bg-[#FDEFEF] w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditField({ field, originalVal: user[field] ?? '' })
                        }
                        className="px-1 text-blue-600 hover:text-blue-400 hover:border-b-2 hover:border-blue-400"
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
                    className="rounded-xl text-xl hover:text-blue-300 bg-gradient-to-r from-green-500 to-green-800 text-white px-4 py-2 w-fit mx-auto"
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
            apiBase="/api/user"
            allowedFields={EDITABLE}
            getdata={reload}
            onClose={() => setEditField(null)}
          />
        )}
      </div>
    </div>
  );
}

export default ProfileUser;
