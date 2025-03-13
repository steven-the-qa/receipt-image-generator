import React from 'react'
import StoreSelect from './StoreSelect'
import ManualAddress from './ManualAddress'
import AddItem from './AddItem'

function CreateReceipt(props) {
  const chooseCustomStoreStyles = props.inputData.storeBox && 'hidden'

  return (
    <section className='flex flex-col items-center text-xs text-white'>
      <div className='flex flex-col'>
        <div className='flex flex-col items-center my-5 p-3 h-full'>
          <h2 className='text-xl mb-5 text-green'>Receipt Details</h2>
          <div id="chooseExistingStore" className='flex flex-col justify-between'>
            <label htmlFor='storeName' className='text-white mb-2'>Store Name</label>
            <StoreSelect
              id='storeSelect'
              onChange={props.handleSelect}
              name="storeName"
              value={props.inputData.storeName}
            />
          </div>

          <div id="customStoreCheckboxContainer" className='mt-4 mb-2'>
            <input id="useCustomStoreName" name="useCustomStoreName" type="checkbox" onChange={props.handleCustomStoreToggle} className="mb-1 focus:bg-gray align-middle rounded h-6 text-black bg-white duration-[250ms] mr-1" />
            <label htmlFor="useCustomStoreName" className='text-white'>Custom store?</label>
          </div>

          <div id="chooseCustomStore" className={`${chooseCustomStoreStyles} flex flex-col w-full items-center`}>
            <label htmlFor='customStoreName' className='text-white mb-2'>Store Name</label>
            <input 
              type="text" 
              id="customStoreName" 
              name="customStoreName" 
              className="py-3 pl-2 w-[70%] min-w-[250px] focus:bg-gray flex justify-start items-center rounded h-6 text-black bg-white duration-[250ms]" 
              onChange={props.handleCustomStoreNameChange}
              placeholder="Enter custom store name"
            />
          </div>

          <button className='flex mt-5 items-center bg-gradient-to-l from-black to-green text-white rounded p-2 duration-[250ms] hover:from-dark-gray hover:to-dark-green' onClick={props.allowAddressEdit}>Toggle Custom Address</button>
          {props.isRestaurant && 
            <ManualAddress 
              handleChange={props.handleChange}
              inputData={props.inputData}
              clearAddress={props.clearAddress}
            />
          }
        </div>

        <div id='addItemAndPurchaseDateColumn' className='flex flex-col items-center'>
          <AddItem
            handleChange={props.handleChange}
            inputData={props.inputData}
            updateItems={props.updateItems}
            clearItems={props.clearItems}
            subItem={props.subItem}
          />

          <div className='flex flex-col items-start p-3'>
            <label htmlFor='purchaseDate' className='text-white'>Purchase Date</label>
            <br/>
            <input className='py-3 pl-2 focus:bg-gray rounded h-6 text-black bg-white duration-[250ms] flex justify-start items-center' onChange={props.handleChange} type='text' name='purchaseDate' value={props.inputData.purchaseDate} />
            <br/>
            <label htmlFor='purchaseTime' className='text-white'>Purchase Time</label>
            <br/>
            <input className='py-3 pl-2 focus:bg-gray rounded h-6 text-black bg-white duration-[250ms] flex justify-start items-center' onChange={props.handleChange} type='text' name='purchaseTime' value={props.inputData.purchaseTime} />
            <button className='justify-center items-center bg-gradient-to-l from-black to-green text-white rounded p-3 duration-[250ms] mt-5 hover:from-dark-gray hover:to-dark-green' onClick={props.refreshDate}>Refresh Date</button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CreateReceipt