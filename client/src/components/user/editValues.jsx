import React, { useRef, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import Flashpopup from '../flashpopup';

function EditValuesUser({Value,originalVal,onClose,triggerFlash,getdata}) {
  const [flashPopup,setFlashPopup] = useState({visible:false,message: "",type:""});
  const triggerFlash_pass = (message, type) => {
    setFlashPopup({ visible: true, message, type });
    setTimeout(() => setFlashPopup({ ...flashPopup, visible: false }), 1000); 
  };
  const navigate = useNavigate();
  const [newVal,setNewVal] = useState(originalVal);
  const passref = useRef();
  const [showPass,setShowPass] = useState(false);

  const handleNewVal = async () => {
  try {
    let res = await axios.post(
      `/api/user/edit/${Value}`,
      { newVal },
      { withCredentials: true }
    );

    triggerFlash(`Updated ${Value} Successfully`, "success")
    setNewVal("");
    await getdata();
    onClose();
  } catch (err) {
    triggerFlash("Something went wrong","error");
  }
  };

  const checkPassword = async ()=>{
    let prevpass=passref.current?.value;
    try{
    let res = await axios.post(`/api/user/check_password`,{prevpass},{withCredentials:true})
    if(!res.data.result)
      triggerFlash_pass("Pls Enter Correct Password to Change it","error");
    else
      setShowPass(true);
    }
    catch(err){
      triggerFlash_pass("Something went wrong","error");
    }
  }
      
  const [Val,setValue]= useState(Value);

  
  if(Value=== "password") return (
    <>
    <div className="fixed inset-0 bg-blue-300 bg-opacity-40 flex justify-center items-center z-50">
      <Flashpopup visible={flashPopup.visible} message={flashPopup.message} type={flashPopup.type} />
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Enter Previous Password</h3>
            <input
              type="password" ref={passref}
              className="border px-3 py-2 w-full mb-4 rounded"
              name='password'
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={checkPassword}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Confirm Previous Password
              </button>
            </div>
            {showPass && (<>
            <h3 className="text-lg font-semibold mb-4">Add New {Val}</h3>
            <input
              type="text"
              className="border px-3 py-2 w-full mb-4 rounded"
              placeholder={newVal}
              value={newVal}
              onChange={(e) => setNewVal(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => onClose()}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleNewVal}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Change The {Value}
              </button>
            </div>
            </>
            )}
            
          </div>
        </div>
    </>
  )

  else return (
    <>
        <div className="fixed inset-0 bg-blue-300 bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Add New {Val}</h3>
            <input
              type="text"
              className="border px-3 py-2 w-full mb-4 rounded"
              placeholder={newVal}
              value={newVal}
              onChange={(e) => setNewVal(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => onClose()}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleNewVal}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Change The {Value}
              </button>
            </div>
          </div>
        </div>
      
    </>
  )
}

export default EditValuesUser
