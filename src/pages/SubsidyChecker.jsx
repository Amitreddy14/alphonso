import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { BsSearch, BsStar, BsGlobe, BsFilter } from "react-icons/bs";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal","Jammu and Kashmir","Rajathan"
];

const classifyScheme = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  return indianStates.some(state => text.includes(state.toLowerCase()))
    ? "State Government"
    : "Central Government";
};

const SubsidyChecker = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All"); // All, Central Government, State Government
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 21;

  useEffect(() => {
    setIsLoading(true);
    fetch("./services_data.csv") // Ensure the CSV is in the public folder or handle uploads
      .then((response) => response.text())
      .then((csvData) => {
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const parsedServices = result.data.map((row) => {
              const schemeType = classifyScheme(row.Title || "", row.Description || "");
              return {
                Title: row.Title || "Unknown Title",
                Service_Type: row.Service_Type || "Unknown Type",
                Rating: parseFloat(row.Rating) || 0,
                Description: row.Description || "No description available.",
                More_Info_Link: row.More_Info_Link || "#",
                Scheme_Type: schemeType, // Add scheme classification
              };
            });
            setServices(parsedServices);
            setIsLoading(false);
          },
        });
      })
      .catch((error) => {
        console.error("Error loading CSV:", error);
        setIsLoading(false);
      });
  }, []);

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.Title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.Description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.Service_Type?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filter === "All" || service.Scheme_Type === filter;

    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);
  
  // Create pagination range with ellipsis for large page counts
  const getPaginationRange = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-6 mb-8 shadow-xl">
        <h2 className="text-3xl font-extrabold text-white">Agricultural Services Directory</h2>
        <p className="mt-2 text-white opacity-80">Find and explore government schemes for agricultural development</p>
      </div>
      
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on new search
              }}
              className="border border-gray-300 pl-10 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="relative min-w-[200px]">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1); // Reset to first page on new filter
              }}
              className="appearance-none border border-gray-300 px-10 py-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="All">All Schemes</option>
              <option value="Central Government">Central Government</option>
              <option value="State Government">State Government</option>
            </select>
            <BsFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Found {filteredServices.length} services matching your criteria
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Results */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedServices.length > 0 ? (
            displayedServices.map((service, index) => (
              <div key={index} className="bg-white p-6 shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300">
                <h4 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{service.Title}</h4>
                <p className="text-gray-600 mb-4 line-clamp-3">{service.Description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center">
                    <BsStar className="text-yellow-500 mr-2" />
                    <span className="text-sm">Rating: {service.Rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center">
                    <BsGlobe className="text-gray-500 mr-2" />
                    <span className="text-sm">{service.Service_Type}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    service.Scheme_Type === "Central Government" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {service.Scheme_Type}
                  </span>
                  
                  <a
                    href={service.More_Info_Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    More Info →
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center py-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-lg">No matching services found.</p>
              <p className="text-gray-400 mt-2">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${
                currentPage === 1 
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-gray-700 hover:bg-gray-200"
              }`}
              aria-label="Previous page"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>

            {getPaginationRange().map((page, index) => (
              page === '...' ? (
                <span key={index} className="px-4 py-2 text-gray-500">...</span>
              ) : (
                <button
                  key={index}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-md ${
                    currentPage === page
                      ? "bg-green-600 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              )
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${
                currentPage === totalPages 
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-gray-700 hover:bg-gray-200"
              }`}
              aria-label="Next page"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default SubsidyChecker;