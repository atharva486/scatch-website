'use client';
import axios from 'axios'
import React, { useEffect, useState } from 'react';
import {BarChart,Bar,ResponsiveContainer,XAxis,YAxis,Tooltip,Legend,CartesianGrid,} from 'recharts';

function Total_revenue() {
   const [data,setData] = useState([]);
    useEffect(()=>{
      const get_data = async ()=>{
        let res = await axios.get('/api/seller/monthly_revenue',{withCredentials:true});
        setData(res.data.data_req);
      }
      get_data();
    },[])

  let sales_over_time = [];
  if(data.length>0)
  sales_over_time = data;
  return (
    <>
      <h2 className="text-xl text-center font-semibold mb-2 text-gray-800">Monthly Revenue</h2>
      <div className="w-full h-[350px] p-4 rounded-2xl shadow-md bg-white overflow-x-auto">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sales_over_time}
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#8884d8', fontSize: 12 }}
            
            tickLine={true}
          />
          <YAxis
            tick={{ fill: '#8884d8', fontSize: 12 }}
           
            tickLine={true}
          />
          <Tooltip />
          <Legend />
          <Bar
            type="monotone"
            dataKey="totalRevenue"
            name="Total Revenue (₹)"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.3}
            strokeWidth={2}
            animationDuration={2000}
          />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </>
  );
}

export default Total_revenue;
