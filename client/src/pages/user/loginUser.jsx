import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import Flashpopup from '../../components/flashpopup';
function LoginUser() {
  const [flashPopup, setFlashPopup] = useState({ visible: false, message: "", type: "" });
  const triggerFlash = (message, type) => {
    setFlashPopup({ visible: true, message, type });
    setTimeout(() => setFlashPopup({ ...flashPopup, visible: false }), 3000);
  };
  const navigate = useNavigate();
  const register = () => {
    navigate('/user/register');
  }
  const sellerLogin = () => {
    navigate('/seller/login')
  }
  const [formData, setFormData] = useState({ email: '', password: '' });
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }
  const submit = async (e) => {
    e.preventDefault();
    let { email, password } = formData;
    if (email.length == 0 || password.length == 0) {
      triggerFlash("Enter all the fields to Login", "error");
      return;
    }
    else if (!email.includes('@')) {
      triggerFlash("Invalid email address", "error");
      return;
    }
    else {
      try {
        let res = await axios.post('/api/user/login', { email, password }, { withCredentials: true });
        if (res.data.success == true){
          triggerFlash("LogInned Successfully", "success");
          navigate('/user/homepage');
        }
        else {
          if (res.data.user)
            triggerFlash("Please enter Correct credentials", "error");
          else
            triggerFlash("There is no account linked to this email.PLease Register", "error");
        }
      }
      catch (err) {
        triggerFlash("Something went Wrong", "error");
      }
    }

  }
  return (
    <>
      <div className='h-screen w-full bg-gradient-to-b from-sky-100 to-sky-500 py-5 flex flex-col gap-25 items-center  '>
        <Flashpopup visible={flashPopup.visible} message={flashPopup.message} type={flashPopup.type} />
        <div className='w-full flex justify-between px-5'>
          <div className='text-xl rounded-2xl px-2 '>Are u seller?
            <button className='text-xl rounded-2xl px-2 text-blue-500  hover:cursor-pointer' onClick={sellerLogin}>Login</button></div>
          <div className='text-xl rounded-2xl px-2 '>Create a New Account?
            <button className='text-xl rounded-2xl px-2 text-blue-500  hover:cursor-pointer' onClick={register}>Register</button></div>
        </div>
        <div className='w-1/2 h-1/2 flex flex-col justify-top gap-2 pt-20 rounded-4xl'>
          <div className='w-full mx-auto text-2xl font-bold text-black'>Login Your Account</div>
          <form className='m-0 p-0 w-3/4 flex flex-col gap-3' onSubmit={submit}>
            <input type="email" onChange={handleChange} name='email' placeholder='Email' className=' bg-gray-300 rounded-xl px-3 h-10 w-full outline-none font-semibold' />
            <input type="password" onChange={handleChange} name='password' placeholder='Password' className=' bg-gray-300 rounded-xl px-3 h-10 w-full outline-none font-semibold' />
            <input type="submit" onClick={submit} value='Login' className='ml-1 w-fit bg-blue-700 hover:bg-blue-900 px-4 rounded-4xl h-10 text-2xl text-white font-semibold hover:cursor-pointer' />
          </form>
        </div>

      </div>
    </>
  )
}

export default LoginUser;
