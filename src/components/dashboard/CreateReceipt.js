import React from 'react'
import StoreSelect from './StoreSelect'
import ManualAddress from './ManualAddress'
import AddItem from './AddItem'

function CreateReceipt(props) {
  return (
    <div className="space-y-8">
      {/* Store Selection Panel */}
      <div className="bg-slate-700 rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          Store Details
        </h3>
        
        <div className="space-y-4">
          <div id="chooseExistingStore">
            <label htmlFor='storeName' className='text-sm text-slate-300 mb-1 block'>Select Store</label>
            <StoreSelect
              id='storeSelect'
              onChange={props.handleSelect}
              name="storeName"
              value={props.inputData.storeName}
            />
          </div>

          <div className="flex items-center">
            <input 
              id="useCustomStoreName" 
              name="useCustomStoreName" 
              type="checkbox" 
              onChange={props.handleCustomStoreToggle} 
              className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-600" 
            />
            <label htmlFor="useCustomStoreName" className='text-sm text-slate-300 ml-2'>Use custom store</label>
          </div>

          <div id="chooseCustomStore" className={`${props.inputData.storeBox ? 'hidden' : ''}`}>
            <label htmlFor='customStoreName' className='text-sm text-slate-300 mb-1 block'>Store Name</label>
            <input 
              type="text" 
              id="customStoreName" 
              name="customStoreName" 
              className="w-full py-2 px-3 bg-slate-800 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors" 
              onChange={props.handleCustomStoreNameChange}
              placeholder="Enter custom store name"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <button 
            className='flex items-center justify-center w-full py-2 px-4 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded transition-colors text-sm'
            onClick={props.allowAddressEdit}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
            {props.isRestaurant ? 'Use Store Address' : 'Use Custom Address'}
          </button>
        </div>
      </div>
      
      {props.isRestaurant && 
        <div className="bg-slate-700 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Custom Address
          </h3>
          <ManualAddress 
            handleChange={props.handleChange}
            inputData={props.inputData}
            clearAddress={props.clearAddress}
          />
        </div>
      }

      {/* Item Management Panel */}
      <div className="bg-slate-700 rounded-lg p-6 shadow-md">
        <AddItem
          handleChange={props.handleChange}
          inputData={props.inputData}
          updateItems={props.updateItems}
          clearItems={props.clearItems}
          subItem={props.subItem}
        />
      </div>

      {/* Date Panel */}
      <div className="bg-slate-700 rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Transaction Date
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor='purchaseDate' className='text-sm text-slate-300 mb-1 block'>Date (MM/DD/YYYY)</label>
            <input 
              className='w-full py-2 px-3 bg-slate-800 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors' 
              onChange={props.handleChange} 
              type='text' 
              name='purchaseDate' 
              value={props.inputData.purchaseDate} 
            />
          </div>
          
          <div>
            <label htmlFor='purchaseTime' className='text-sm text-slate-300 mb-1 block'>Time (HH:MM:SS)</label>
            <input 
              className='w-full py-2 px-3 bg-slate-800 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors' 
              onChange={props.handleChange} 
              type='text' 
              name='purchaseTime' 
              value={props.inputData.purchaseTime} 
            />
          </div>
        </div>
        
        <div className="mt-4">
          <button 
            className='flex items-center justify-center w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors' 
            onClick={props.refreshDate}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Use Current Date/Time
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateReceipt