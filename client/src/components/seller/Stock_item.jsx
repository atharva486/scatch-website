'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {BarChart,Bar,ResponsiveContainer,XAxis,YAxis,Tooltip,Cell,CartesianGrid,} from 'recharts';

function Stock_item() {
    const [data,setData] = useState([]);

    useEffect(() => {
    const get_data = async () => {
      let res = await axios.get('/api/seller/low_stock', { withCredentials: true });
        setData(res.data.products);
        
    }
    get_data();
  }, []);
const product_stock_levels =[];
if (data && data.length > 0) {
    data.map((item) => {
        const productname = item.productname;
        const stock = item.stock;
        product_stock_levels.push({ productname, stock });
    });
}
const lowStockItems = product_stock_levels.filter(p => p.stock < 5);
const updatedStock = lowStockItems.map((item)=>({
        ...item,
        displayStock :item.stock ===0? 0.2:item.stock,
    }))
const getColor = (stock) => {
        if (stock === 0) return 'red';
        return 'orange';
    };
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-300 p-2 rounded shadow">
        <p className="font-semibold">{data.productname}</p>
        <p>Stock: {data.stock}</p>
      </div>
    );
  }

  return null;
};

    return (
        <>
        <h2 className="text-center text-lg font-semibold mb-4">
            Low Stock Items (Less than 5)
        </h2>
        <div className="w-full h-[350px] p-4 rounded-2xl shadow-md bg-white overflow-x-auto">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={updatedStock}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis angle={0} textAnchor='end' dataKey="productname" />
            <YAxis allowDecimals={false} />
            <Tooltip content={<CustomTooltip/>}/>
            <Bar  animationDuration={2000} dataKey="displayStock">
                {lowStockItems.map((item, index) => (
                    
                <Cell key={index} fill={getColor(item.stock)} />
                ))}
            </Bar>
            </BarChart>
        </ResponsiveContainer>
        </div>
        </>
    );
    }

    export default Stock_item;
