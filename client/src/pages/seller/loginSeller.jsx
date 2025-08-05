import React, { useEffect, useState } from 'react'
import api from '../../axios/api';
import { useNavigate } from 'react-router-dom';
import Flashpopup from '../../components/flashpopup';

function LoginSeller() {
  const [flashPopup,setFlashPopup] = useState({visible:false,message: "",type:""});
  const triggerFlash = (message, type) => {
    setFlashPopup({ visible: true, message, type });
    setTimeout(() => setFlashPopup({ ...flashPopup, visible: false }), 1000); 
  };
    const navigate = useNavigate();
    const sellerRegister = ()=>{
      navigate('/seller/register')
    }
    const [formData,setFormData]= useState({email:'',password:''});
    const handleChange =(e)=>{
        setFormData(prev=> ({...prev,[e.target.name]:e.target.value}));
    }
    const userLogin = () => {
    navigate('/user/login')
  }
    const submit = async(e)=>{
        e.preventDefault();
        let {email,password} = formData;
        if(email.length==0 ||password.length==0)
          triggerFlash("Enter all the fields to Login","error");
        else{
            try{
            let res = await api.post('/api/seller/login',{email,password,"seller":true},{withCredentials:true});
            if(!res.data.user)
              triggerFlash("U havent Registered Yet!!!","error");
            else{
            if(res.data.success == true)
                navigate('/seller/dashboard');
            else
              triggerFlash("Please enter Correct credentials","error");
            }}
            catch(err){
              triggerFlash("Something went wrong","error");
            }
        }
    }
  return (
    <>
    <div className='h-screen w-full bg-gradient-to-b from-sky-100 to-sky-500 py-5 flex flex-col gap-25 items-center  '>
      <Flashpopup visible={flashPopup.visible} message={flashPopup.message} type={flashPopup.type} />
      <div className='w-full flex justify-between px-5'>
        <div className='text-xl rounded-2xl px-2 '>Are u customer?
            <button className='text-xl rounded-2xl px-2 text-blue-500  hover:cursor-pointer' onClick={userLogin}>Login</button></div>
        <div className='text-xl rounded-2xl px-2 '>Create a Seller Account?
        <button className='text-xl rounded-2xl px-2 text-blue-500  hover:cursor-pointer' onClick={sellerRegister}>Register Here</button></div>
        </div>
      <div className='w-1/2 h-1/2 flex flex-col justify-top gap-2 pt-20 rounded-4xl'>
      <div className='w-full mx-auto text-2xl font-bold  text-black'>Login Your Account</div>
      <form className='m-0 p-0 w-3/4 flex flex-col gap-3' onSubmit={submit}>
        <input type="email" onChange={handleChange} name='email' placeholder='Email' className=' bg-gray-300 rounded-xl px-3 h-10 w-full outline-none font-semibold' />
        <input type="password" onChange={handleChange} name='password' placeholder='Password' className=' bg-gray-300 rounded-xl px-3 h-10 w-full outline-none font-semibold' />
        <input type="submit" onClick={submit} value='Login' className=' bg-blue-700 ml-1 w-fit hover:bg-blue-950 px-4 rounded-4xl h-10 text-2xl text-white font-semibold hover:cursor-pointer' />
      </form>
      </div>

    </div>
    </>
  )
}

export default LoginSeller;
