import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import api from '../../axios/api';
import Bar from '../../components/user/sidemenu';
import Navbar from '../../components/user/navbar';
import EditValuesUser from '../../components/user/editValues';
import Flashpopup from '../../components/flashpopup';


function ProfileUser() {
    const [flashPopup,setFlashPopup] = useState({visible:false,message: "",type:""});
    const triggerFlash = (message, type) => {
    setFlashPopup({ visible: true, message, type });
    setTimeout(() => setFlashPopup({ ...flashPopup, visible: false }), 1000); 
    };
    const navigate = useNavigate();
    const [sideBar, setSideBar] = useState(false);
    let [formData, setFormData] = useState({
        fullname: '',
        email: '',
    });
    const [editField,setEditField] =useState({Value:'',originalVal:''});
    const [showEdit, setShowEdit] = useState(false);

    const change = () => setSideBar(prev => !prev);
    const logout = async ()=>{
        try{
        let res = await api.post('/api/user/logout',{},{withCredentials:true})
        if(res.data.success)
        navigate('/user/login');
        else
          triggerFlash("Not Able to Logout","error");
    
        }
        catch{
          triggerFlash("Not Able to Logout","error");
        }
    
        
      }
    const get_data = async () => {
        try{
        let res = await api.get('/api/user/profile', { withCredentials: true });
        setFormData(res.data.user);
        }
        catch(err){
            
        }
    }
    function changeValue(e){
        setShowEdit(true);
        
        setEditField({Value:e.target.name,originalVal:e.target.value});

        
    }
    const change_value = ()=>{setShowEdit(false);get_data();}
    useEffect(() => {
        get_data();
    }, []);
    return (
        <>
            <div className="w-full min-h-screen flex bg-[#FDEFEF] font-sans">
                <Flashpopup visible={flashPopup.visible} message={flashPopup.message} type={flashPopup.type} />
                <div className="flex flex-col flex-1 min-h-screen">
            <Navbar change={change} logout={logout} f={0} />

            
            <div className="flex flex-row flex-1 min-h-screen">
                <Bar sidebar={sideBar} />

                    <div className="mx-8 my-10 w-full h-fit bg-gradient-to-br from-sky-300 to-sky-600 rounded-2xl shadow-md p-10">
                        <p className="text-3xl font-semibold text-red-800 mb-8">
                            Profile Details..
                        </p>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col">
                                <label className="text-lg text-gray-700 mb-1">Name</label>
                                <div className='flex flex-row w-full justify-between gap-4'>
                                    <input type="text" name='fullname' value={formData.fullname} className="border bg-[#FDEFEF] w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" readOnly
                                    />
                                    <button className='px-1 hover:text-blue-300 hover:border-b-2' name='fullname' value={formData.fullname} onClick={(e)=>changeValue(e)}> Edit</button></div>
                            </div>
                            <div className="flex flex-col">
                                <label className="text-lg text-gray-700 mb-1">Email</label>
                                <div className='flex flex-row w-full justify-between gap-4'>
                                    <input type="text" name='email' value={formData.email} className="border w-full bg-[#FDEFEF] border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" readOnly
                                    />
                                    <button className='px-1 hover:text-blue-300 hover:border-b-2' name='email' value={formData.email} onClick={(e)=>changeValue(e)}> Edit</button></div>
                            </div>
                            <div className="flex ">                                    
                                    <button className='rounded-4xl text-2xl hover:text-blue-300 hover:border-b-2 bg-gradient-to-r from-green-500 to-green-800 text-white px-2 w-fit mx-auto' name='password' onClick={(e)=>changeValue(e)}>Change Password</button>
                            </div>
                            
                        </div>
                    </div>
                    {showEdit && (
                        <EditValuesUser
                            Value={editField.Value}
                            originalVal={editField.originalVal}
                            onClose={change_value}
                            triggerFlash={triggerFlash}
                            getdata={get_data}
                        />
                    )}
                </div>
            </div>
            </div>
        </>
    )
}

export default ProfileUser
