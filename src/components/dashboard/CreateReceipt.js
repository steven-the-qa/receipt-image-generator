import React from 'react'
import StoreSelect from './StoreSelect'
import ManualAddress from './ManualAddress'
import AddItem from './AddItem'

function CreateReceipt(props) {
  const chooseCustomStoreStyles = props.inputData.storeBox && 'hidden'

  return (
    <section className='text-xs w-[40rem]'>
      <div className='flex'>
        <div className='flex flex-col justify-start p-3 rounded-md border mr-5 h-full min-w-[50%]'>
          <h2 className='text-xl mb-5'>Receipt Details</h2>
          <div id="chooseExistingStore" className='flex flex-col justify-between'>
            <label htmlFor='storeName'>Store Name</label>
            <StoreSelect
              id='storeSelect'
              onChange={props.handleSelect}
              name="storeName"
              value={props.inputData.storeName}
            />
          </div>

          <div id="customStoreCheckboxContainer">
            <input id="useCustomStoreName" name="useCustomStoreName" type="checkbox" onChange={props.handleCustomStoreToggle} className="mb-1 focus:bg-gray align-middle rounded h-6 text-black bg-white duration-[250ms] mr-1" />
            <label htmlFor="useCustomStoreName">Custom store?</label>
          </div>

          <div id="chooseCustomStore" className={`${chooseCustomStoreStyles} flex flex-col`}>
            <label htmlFor='customStoreName'>Store Name</label>
            <br />
            <input type="text" id="customStoreName" name="customStoreName" className="py-3 pl-1 focus:bg-gray flex justify-start items-center rounded h-6 text-black bg-white duration-[250ms]" onChange={props.handleCustomStoreNameChange}></input>
          </div>

          <button className='mt-5 justify-center items-center bg-gradient-to-l from-white to-green text-black rounded p-2 duration-[250ms]' onClick={props.allowAddressEdit}>Toggle Custom Address</button>
          {props.isRestaurant && 
            <ManualAddress 
              handleChange={props.handleChange}
              inputData={props.inputData}
              clearAddress={props.clearAddress}
            />
          }
        </div>

        <div id='addItemAndPurchaseDateColumn' className='flex flex-col'>
          <AddItem
            handleChange={props.handleChange}
            inputData={props.inputData}
            updateItems={props.updateItems}
            clearItems={props.clearItems}
            subItem={props.subItem}
          />

          <div className='flex w-full flex-col justify-start items-start p-3 rounded-md border mr-5'>
            <label htmlFor='purchaseDate'>Purchase Date</label>
            <br/>
            <input className='py-3 pl-1 focus:bg-gray rounded h-6 text-black bg-white duration-[250ms] flex justify-start items-center' onChange={props.handleChange} type='text' name='purchaseDate' value={props.inputData.purchaseDate} />
            <br/>
            <label htmlFor='purchaseTime'>Purchase Time</label>
            <br/>
            <input className='py-3 pl-1 focus:bg-gray rounded h-6 text-black bg-white duration-[250ms] flex justify-start items-center' onChange={props.handleChange} type='text' name='purchaseTime' value={props.inputData.purchaseTime} />
            <button className='justify-center items-center bg-gradient-to-l from-white to-green text-black rounded p-3 duration-[250ms] mt-5' onClick={props.refreshDate}>Refresh Date</button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CreateReceipt