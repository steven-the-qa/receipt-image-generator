import React from 'react'

export default function MissingInfoChecklist(props) {
  const titleStyles = 'text-black my-1 text-lg font-bold'
  const checkboxStyles = 'focus:bg-gray mr-2 rounded h-6 text-black bg-white duration-[250ms]'
  return (
    <div className='flex mb-5 text-sm'>
      <div id="threeDataPoints" className='mr-5 p-3 pr-10 border'>
        <h3 className={titleStyles}>Primary Data Points</h3>
        <div className='flex items-center'>
          <input type="checkbox" id="storeBox" className={checkboxStyles} name="storeBox" checked={props.inputData.storeBox} onChange={props.handleChange} />
          <label htmlFor="storeBox">Store (name, address, phone)</label>
        </div>
        <div className='flex items-center'>
          <input type="checkbox" id="purchaseDateBox" className={checkboxStyles} name="purchaseDateBox" checked={props.inputData.purchaseDateBox} onChange={props.handleChange} />
          <label htmlFor="purchaseDateBox">Purchase Date</label>
        </div>
        <div className='flex items-center'>
          <input type="checkbox" id="totalSpentBox" className={checkboxStyles} name="totalSpentBox" checked={props.inputData.totalSpentBox} onChange={props.handleChange} />
          <label htmlFor="totalSpentBox">Total Spent</label>
        </div>
      </div>
      
      <div id="storeDataPoints" className='p-3 border pr-10'>
        <h3 className={titleStyles}>Store Data Points</h3>
        <div className='flex items-center'>
          <input type="checkbox" id="storeNameBox" className={checkboxStyles} name="storeNameBox" checked={props.inputData.storeNameBox} onChange={props.handleChange} />
          <label htmlFor="storeNameBox">Logo/Name</label>
        </div>
        <div className='flex items-center'>
          <input type="checkbox" id="storeAddressBox" className={checkboxStyles} name="storeAddressBox" checked={props.inputData.storeAddressBox} onChange={props.handleChange} />
          <label htmlFor="storeAddressBox">Street Address</label>
        </div>
        <div className='flex items-center'>
          <input type="checkbox" id="storePhoneBox" className={checkboxStyles} name="storePhoneBox" checked={props.inputData.storePhoneBox} onChange={props.handleChange} />
          <label htmlFor="storePhoneBox">Phone Number</label>
        </div>
      </div>
    </div>
  )
}