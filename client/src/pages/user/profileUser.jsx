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
    <div className="page-shell flex">
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={0} />

        <div className="flex w-full min-h-screen flex-1 flex-row">
          <Bar sidebar={sideBar} />

          <div className="mx-6 my-8 w-full md:mx-10">
            <div className="mb-6">
              <p className="section-label">Your account</p>
              <h1 className="page-heading mt-1.5">Profile details</h1>
              <p className="page-sub">Keep your contact details current so deliveries reach you.</p>
            </div>

            {loading && (
              <div className="page-panel">
                <p className="text-sm text-primary-500">Loading your profile…</p>
              </div>
            )}

            {!loading && error && (
              <div className="page-panel border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {user && (
              <div className="page-panel max-w-2xl">
                <dl className="flex flex-col gap-5">
                  {[
                    { field: 'fullname', label: 'Name' },
                    { field: 'email', label: 'Email' },
                    { field: 'contact', label: 'Contact number' },
                  ].map(({ field, label }) => (
                    <div key={field} className="flex items-end justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <dt className="field-label">{label}</dt>
                        <dd className="truncate text-sm font-medium text-primary-900">
                          {user[field] ?? '—'}
                        </dd>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditField({ field, originalVal: user[field] ?? '' })}
                        className="btn-quiet shrink-0 px-3 py-1.5 text-xs"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </dl>

                <div className="mt-7 border-t border-primary-100 pt-6">
                  <button
                    type="button"
                    onClick={() => setEditField({ field: 'password', originalVal: '' })}
                    className="btn-sage"
                  >
                    Change password
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
