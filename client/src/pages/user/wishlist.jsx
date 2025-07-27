import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Bar from '../../components/user/sidemenu';
import Navbar from '../../components/user/navbar';
import Flashpopup from '../../components/flashpopup';


function Wishlist() {
    const [flashPopup, setFlashPopup] = useState({ visible: false, message: "", type: "" });
    const triggerFlash = (message, type) => {
        setFlashPopup({ visible: true, message, type });
        setTimeout(() => setFlashPopup({ ...flashPopup, visible: false }), 1000);
    };
    const [searchValue, setSearchValue] = useState('');
    const [dataFound, setDataFound] = useState([]);
    const navigate = useNavigate();
    const [sideBar, setSideBar] = useState(false);
    const change = () => {
        setSideBar(prev => (!prev))
    }
    const name_search = (e) => {
        setSearchValue(e.target.value);
    }
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
    const [data, setData] = useState([]);
    async function delete_data(id) {
        try {
            let res = await axios.post(`/api/user/delete/wishlist_item/${id}`, { id }, { withCredentials: true });
            if (res.data.success) {
                get_data();
                triggerFlash("Deleted Successfully", "error");
            }
            else
                triggerFlash("Failed to delete item. Something went wrong!", "error");
        }
        catch (err) {
            triggerFlash("Something Went Wrong", "error");
        }

    }
    const get_data = async () => {
        let res = await axios.get('/api/user/wishlist_products', { withCredentials: true });
        setDataFound(res.data.products);
    }
    useEffect(() => {
        get_data();
    }, [searchValue]);

    let filteredProducts = (dataFound.filter((product) =>
        product.prod.productname
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(
                searchValue
                    .toLowerCase()
                    .replace(/\s+/g, '')

            )
    ))
    if (filteredProducts.length === 0) {

        filteredProducts =
            (dataFound.filter((product) =>
                product.time
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(
                        searchValue
                            .toLowerCase()
                            .replace(/\s+/g, '')

                    )
            ))
    }

    useEffect(() => {
        setData(filteredProducts);
    }, [dataFound]);
    return (
        <>
            <div className="w-full min-h-screen flex flex-row bg-gradient-to-br from-[#f7f7fa] to-[#e3e8f0]">
                <Flashpopup visible={flashPopup.visible} message={flashPopup.message} type={flashPopup.type} />
                <div className="flex flex-col flex-1 min-h-screen">
                    <Navbar change={change} logout={logout} f={1} name_search={name_search} />

                    <div className="flex flex-row flex-1">
                        <Bar sidebar={sideBar} />
                        <div className="mx-10 my-8 w-full h-fit bg-gradient-to-br from-sky-300 to-sky-600 rounded-2xl shadow-md p-8">
                            <h3 className="text-4xl font-bold text-red-800   pb-6 border-b border-gray-200">Your Wishlist</h3>
                            <div className="overflow-hidden rounded-2xl shadow-md mt-6">
                                <table className="w-full table-fixed">
                                    <thead className="bg-[#f4f4f7] text-[#333]">
                                        <tr>
                                            <th className="w-[60px] border-r px-2 py-3 text-center text-sm font-semibold">S.no.</th>
                                            <th className="w-[480px] border-r px-6 py-3 text-center text-sm font-semibold">Product Name</th>
                                            <th className="w-[100px] border-r px-6 py-3 text-center text-sm font-semibold">Price (₹)</th>
                                            <th className="w-[160px] px-6 py-3 text-center text-sm font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[#555] bg-white">
                                        {data?.map((item, index) => (
                                            <tr key={index} className="border-b hover:bg-[#fdfdfd] transition duration-150 ease-in-out">
                                                <td className="border-r py-2 text-center">{index + 1}</td>
                                                <td className="border-r py-2 text-center">{item.prod.productname}</td>
                                                <td className="border-r py-2 text-center">{item.prod.price}</td>
                                                <td className="py-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => delete_data(item.prod._id)}
                                                        className="text-sm text-red-500 hover:text-red-600 hover:underline transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );

}

export default Wishlist
