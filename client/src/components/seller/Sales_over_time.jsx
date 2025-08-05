'use client';

import React, { useEffect, useState } from 'react';
import api from '../../axios/api';
import {BarChart,Bar,ResponsiveContainer,XAxis,YAxis,Tooltip,Legend,CartesianGrid,} from 'recharts';

function Sales_over_time() {
  const [data,setData] = useState([]);
      useEffect(()=>{
        const get_data = async ()=>{
          let res = await api.get('/api/seller/monthly_orders',{withCredentials:true});
          setData(res.data.data_req);
        }
        get_data();
      },[])
  
    let sales_over_time = [];
    if(data.length>0)
    sales_over_time = data;

  return (
    <>
      <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">
        Monthly Sales Overview
      </h2>
      <div className="w-full h-[350px] p-4 rounded-2xl shadow-md bg-white overflow-x-auto">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sales_over_time} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fill: '#4b5563', fontSize: 12 }} />
          <YAxis tick={{ fill: '#4b5563', fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar
            type="monotone"
            dataKey="totalOrders"
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.6} 
            animationDuration={2000}
          />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </>
  );
}

export default Sales_over_time;
