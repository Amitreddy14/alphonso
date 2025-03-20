import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BsGrid1X2Fill, 
  BsBug, 
  BsGraphUp, 
  BsCloud, 
  BsCash, 
  BsChatDots, 
  BsX,
  BsFlower1,
  BsCalendar
} from 'react-icons/bs';
import { GiSprout } from "react-icons/gi";
import { MdOutlineRecordVoiceOver } from "react-icons/md";


function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: BsGrid1X2Fill, label: 'Dashboard' },
    { path: '/disease-detection', icon: BsBug, label: 'Disease Detection' },
    { path: '/market-analytics', icon: BsGraphUp, label: 'Market Analytics' },
    { path: '/weather-insights', icon: BsCloud, label: 'Weather Insights' },
    { path: '/crop-calendar', icon: BsCalendar, label: 'Crop Calendar' },
    { path: '/subsidy-checker', icon: BsCash, label: 'Subsidy Checker' },
    { path: '/ai-support', icon: BsChatDots, label: 'AI Support' },
    { path: '/voice-support', icon: MdOutlineRecordVoiceOver, label: 'Voice Support' },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
            <GiSprout className="h-6 w-6 text-emerald-600" />
              <span className="text-xl font-semibold text-gray-800">Prithvi Mitra</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-700"
              aria-label="Close menu"
            >
              <BsX className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-4 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-screen z-30">
        <div className="bg-white w-64 h-full border-r border-gray-100 shadow-sm">
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
            <GiSprout className="h-6 w-6 text-emerald-600" />
              <span className="text-xl font-semibold text-gray-800">Prithvi Mitra</span>
            </div>
          </div>
          <nav className="mt-4 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        aria-label="Open menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
}

export default Sidebar;
