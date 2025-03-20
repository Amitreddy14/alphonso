import { useState } from "react";

function Navbar({ toggleAura, auraEnabled }) {
  return (
    <nav className="relative bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-900">
        AgriTech Support System
      </h1>

      {/* Toggle Switch for Aura Light */}
      <label className="flex items-center cursor-pointer">
        <span className="mr-2 text-gray-700">Aura Light</span>
        <div
          className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 transition-all duration-300 ${
            auraEnabled ? "bg-blue-500" : ""
          }`}
          onClick={toggleAura}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300 ${
              auraEnabled ? "translate-x-5" : ""
            }`}
          ></div>
        </div>
      </label>
    </nav>
  );
}

export default Navbar;
