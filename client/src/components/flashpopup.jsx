import React from 'react';
import { motion, AnimatePresence } from "framer-motion";

function Flashpopup({type,message,visible}) {
  return (
    <>
    <AnimatePresence>
    {visible && (
        <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.4 }}
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium
            ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
                {message}
        </motion.div>
    )}
    </AnimatePresence>
    </>
  )
}

export default Flashpopup
