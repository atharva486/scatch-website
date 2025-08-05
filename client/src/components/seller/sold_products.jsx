'use client';

import React, { useEffect, useState } from 'react';
import api from '../../axios/api';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell} from 'recharts';

function Sold_products() {
  const [data,setData] = useState([]);
  useEffect(()=>{
    const get_data = async ()=>{
      let res = await api.get('/api/seller/prod_quantity',{withCredentials:true});
      setData(res.data.data_req);
    }
    get_data();
  },[])

  let sold_products = [];
  if(data.length>0)
    sold_products =data;
  


  return (
    <>
      <h2 className="text-lg font-semibold text-center text-gray-700 mb-2">Quantity of Products Sold</h2>
      <div className="w-full h-[350px] p-4 rounded-2xl shadow-md bg-white overflow-x-auto">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sold_products} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="productname"
            angle={-40}
            textAnchor="end"
            tick={{ fill: '#555', fontSize: 12 }}
            
          />
          <YAxis
            tick={{ fill: '#555', fontSize: 12 }}
            
          />
          <Tooltip />

          <Bar
            dataKey="unitsSold"
            name="Units Sold"
            fill="#6366f1"
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
          >
            {sold_products.map((entry, index) => (
              <Cell key={`bar-${index}`} fill="#6366f1" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    </>
  );
}

export default Sold_products;
