import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import Flashpopup from '../../components/flashpopup';

function RegisterUser() {
  const [flashPopup,setFlashPopup] = useState({visible:false,message: "",type:""});
    const triggerFlash = (message, type) => {
      setFlashPopup({ visible: true, message, type });
      setTimeout(() => setFlashPopup({ ...flashPopup, visible: false }), 1000); 
    };
  const navigate = useNavigate();
  const login = () => {
    navigate('/user/login');
  }
  const register = ()=>{
    navigate('/seller/register');
  }

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: ''
  });
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  const submit = async (e) => {
    e.preventDefault();
    const { fullname, email, password } = formData;
    if (!fullname || !email || !password) {
      triggerFlash("All fields are required!","error");
      return;
    }

    if (!email.includes('@')) {
      triggerFlash("Invalid email address","error");
      return;
    }

    try {
      const res = await axios.post('/api/user/register', formData, { withCredentials: true });
      if (res.data.success === true) {
        triggerFlash("Registered Successfully","success");
        navigate('/user/login');
      } else {
        if(!res.data.error)
        triggerFlash("Email is already used","error");
        else
        triggerFlash("Server error","error");
      }
    } catch (err) {
      triggerFlash("Something Went Wrong","error");
    }
  }

  return (
    <div className='h-screen w-full bg-gradient-to-b from-sky-100 to-sky-500 py-5 flex flex-col gap-25 items-center'>
      <Flashpopup visible={flashPopup.visible} message={flashPopup.message} type={flashPopup.type} />
      <div className='w-full flex justify-between px-5'>
        <div className='text-xl rounded-2xl px-2 '>Create a New Account?
        <button className='text-xl rounded-2xl px-2 text-blue-500  hover:cursor-pointer' onClick={register}>Register</button></div>
        <div className='text-xl rounded-2xl px-2 '>
        <button
          className='text-2xl  rounded-2xl px-2  text-blue-600 hover:cursor-pointer'
          onClick={login}
        >Login</button></div>
      </div>

      <div className='w-1/2 h-1/2 flex flex-col justify-top gap-2 pt-5 rounded-4xl'>
        <div className='w-full mx-auto text-2xl font-bold text-black'>
          Welcome to <span className='text-blue-600 text-4xl'>Scatch</span><br />
          Create Your Account
        </div>

        <form className='m-0 p-0 w-3/4 flex flex-col gap-3' onSubmit={submit}>
          <input
            type="text"
            name="fullname"
            placeholder='Full Name'
            onChange={handleChange}
            value={formData.fullname}
            className='bg-gray-300 rounded-xl px-3 h-10 w-full outline-none font-semibold'
          />
          <input
            type="email"
            name="email"
            placeholder='Email'
            onChange={handleChange}
            value={formData.email}
            className='bg-gray-300 rounded-xl px-3 h-10 w-full outline-none font-semibold'
          />
          <input
            type="password"
            name="password"
            placeholder='Password'
            onChange={handleChange}
            value={formData.password}
            className='bg-gray-300 rounded-xl px-3 h-10 w-full outline-none font-semibold'
          />
          <input
            type="submit"
            value='Create My Account'
            className='mx-auto w-fit bg-blue-700 hover:bg-blue-900 px-4 rounded-4xl h-10 text-2xl text-white font-semibold hover:cursor-pointer'
          />
        </form>
      </div>
    </div>
  );
}

export default RegisterUser;
