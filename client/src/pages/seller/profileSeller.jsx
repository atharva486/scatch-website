import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Bar from '../../components/seller/sidemenuSeller';
import Navbar from '../../components/seller/navbar';
import EditValuesSeller from '../../components/seller/editValuesSeller';
import Flashpopup from '../../components/flashpopup';

function ProfileSeller() {
    const [flashPopup, setFlashPopup] = useState({ visible: false, message: "", type: "" });
    const triggerFlash = (message, type) => {
        setFlashPopup({ visible: true, message, type });
        setTimeout(() => setFlashPopup({ ...flashPopup, visible: false }), 1500);

    };
    const navigate = useNavigate();
    const [sideBar, setSideBar] = useState(false);
    let [formData, setFormData] = useState({
        fullname: '',
        email: '',
        gstin: ''
    });
    const [editField, setEditField] = useState({ Value: '', originalVal: '' });
    const [showEdit, setShowEdit] = useState(false);
    const change_data = () => {
        setShowEdit(false); get_data();
    }
    const change = () => setSideBar(prev => !prev);
    const logout = async () => {
        try {
            let res = await axios.post('/api/user/logout', {}, { withCredentials: true })
            if (res.data.success)
                navigate('/user/login');
            else
                triggerFlash("Not Able to Logout", "error");

        }
        catch {
            triggerFlash("Not Able to Logout", "error");
        }


    }
    const get_data = async () => {
        try {
            const res = await axios.get('/api/seller/profile', { withCredentials: true });
            setFormData(res.data.seller);
        } catch (err) {
            console.log("Error fetching profile:", err);
        }
    };

    function changeValue(e) {
        setShowEdit(true);
        setEditField({ Value: e.target.name, originalVal: e.target.value });


    }

    useEffect(() => {
        get_data();
    }, []);

return (
  <>
    <div className="w-full min-h-screen flex bg-[#FDEFEF] font-sans">
      <Flashpopup visible={flashPopup.visible} message={flashPopup.message} type={flashPopup.type} />

      <div className="flex flex-col flex-1 min-h-screen">
        <Navbar change={change} logout={logout} f={0} />

        <div className="flex flex-row flex-1 w-full min-h-screen">
          <Bar sidebar={sideBar} />

          <div className="mx-8 my-10 bg-gradient-to-b from-sky-300 to-sky-700 h-fit w-full rounded-2xl shadow-md p-10">
            <p className="text-3xl font-semibold text-red-900 mb-8 border-b pb-4">Profile Details</p>

            <div className="flex flex-col gap-6">
              <div>
                <label className="text-lg text-gray-700 mb-1 block">Name</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    className="border  bg-[#FDEFEF] w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    readOnly
                  />
                  <button
                    className="text-blue-600 hover:text-blue-400 hover:border-b hover:border-blue-400"
                    name="fullname"
                    value={formData.fullname}
                    onClick={(e) => changeValue(e)}
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div>
                <label className="text-lg text-gray-700 mb-1 block">Email</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    className="border w-full bg-[#FDEFEF] border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    readOnly
                  />
                  <button
                    className="text-blue-600 hover:text-blue-400 hover:border-b hover:border-blue-400"
                    name="email"
                    value={formData.email}
                    onClick={(e) => changeValue(e)}
                  >
                    Edit
                  </button>
                </div>
              </div>
              <div>
                <label className="text-lg text-gray-700 mb-1 block">GST Number</label>
                <div className="flex gap-4">
                  <input
                    value={formData.gstin}
                    name="gstin"
                    className="border bg-[#FDEFEF]  w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    readOnly
                  />
                  <button
                    className="text-blue-600 hover:text-blue-400 hover:border-b hover:border-blue-400"
                    value={formData.gstin}
                    name="gstin"
                    onClick={(e) => changeValue(e)}
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="flex">
                <button
                  className="mx-auto bg-green-400 text-white rounded-xl px-6 py-2 text-lg font-semibold hover:bg-green-700 transition-all duration-200"
                  name="password"
                  onClick={(e) => changeValue(e)}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {showEdit && (
            <EditValuesSeller
              Value={editField.Value}
              originalVal={editField.originalVal}
              onClose={change_data}
              getdata={get_data}
              triggerFlash={triggerFlash}
            />
          )}
        </div>
      </div>
    </div>
  </>
);

}

export default ProfileSeller
