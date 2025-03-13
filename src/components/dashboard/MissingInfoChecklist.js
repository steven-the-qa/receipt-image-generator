import React from 'react'

export default function MissingInfoChecklist(props) {
  if (!props.inputData) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-emerald-400 mb-2">Primary Elements</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="storeBox" 
              className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-600" 
              name="storeBox" 
              checked={props.inputData.storeBox} 
              onChange={props.handleChange} 
            />
            <label htmlFor="storeBox" className="text-sm text-slate-300 ml-2">Store Details (name, address, phone)</label>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="purchaseDateBox" 
              className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-600" 
              name="purchaseDateBox" 
              checked={props.inputData.purchaseDateBox} 
              onChange={props.handleChange} 
            />
            <label htmlFor="purchaseDateBox" className="text-sm text-slate-300 ml-2">Purchase Date & Time</label>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="totalSpentBox" 
              className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-600" 
              name="totalSpentBox" 
              checked={props.inputData.totalSpentBox} 
              onChange={props.handleChange} 
            />
            <label htmlFor="totalSpentBox" className="text-sm text-slate-300 ml-2">Total Price Details</label>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-emerald-400 mb-2">Store Information</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="storeNameBox" 
              className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-600" 
              name="storeNameBox" 
              checked={props.inputData.storeNameBox} 
              onChange={props.handleChange} 
            />
            <label htmlFor="storeNameBox" className="text-sm text-slate-300 ml-2">Store Logo/Name</label>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="storeAddressBox" 
              className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-600" 
              name="storeAddressBox" 
              checked={props.inputData.storeAddressBox} 
              onChange={props.handleChange} 
            />
            <label htmlFor="storeAddressBox" className="text-sm text-slate-300 ml-2">Store Address</label>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="storePhoneBox" 
              className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-600" 
              name="storePhoneBox" 
              checked={props.inputData.storePhoneBox} 
              onChange={props.handleChange} 
            />
            <label htmlFor="storePhoneBox" className="text-sm text-slate-300 ml-2">Store Phone Number</label>
          </div>
        </div>
      </div>
    </div>
  )
}