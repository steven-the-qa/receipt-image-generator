import React from 'react'

export default function ManualAddress(props) {
    
    return(
        <div className='mt-5'>
            <div className='flex w-full flex-col'>
                <div className='flex w-full flex-col h-full my-3'>
                    <label htmlFor='address1'>Address 1</label>
                    <br />
                    <input id="address1" className='py-3 pl-1 focus:bg-gray rounded h-6 text-black bg-white duration-[250ms] flex justify-start items-center' onChange={props.handleChange} type='text' name='address1' value={props.inputData.address1} />
                </div>
                <div className='flex w-full flex-col h-full my-3'>
                    <label htmlFor='address2'>Address 2</label>
                    <br />
                    <input className='py-3 pl-1 focus:bg-gray rounded h-6 text-black bg-white duration-[250ms] flex justify-start items-center' onChange={props.handleChange} type='text' name='address2' value={props.inputData.address2} />
                </div>
                <div className='flex w-full flex-col h-full my-3'>
                    <label htmlFor='city'>City</label>
                    <br />
                    <input className='py-3 pl-1 focus:bg-gray rounded h-6 text-black bg-white duration-[250ms] flex justify-start items-center' onChange={props.handleChange} type='text' name='city' value={props.inputData.city} />
                </div>
                <div className='flex w-full flex-col h-full my-3'>
                    <label htmlFor='state'>State</label>
                    <br />
                    <input className='py-3 pl-1 focus:bg-gray rounded h-6 text-black bg-white duration-[250ms] flex justify-start items-center' onChange={props.handleChange} type='text' name='state' value={props.inputData.state} />
                </div>
                <div className='flex w-full flex-col h-full my-3'>
                    <label htmlFor='zip'>ZIP</label>
                    <br />
                    <input className='py-3 pl-1 focus:bg-gray rounded h-6 text-black bg-white duration-[250ms] flex justify-start items-center' onChange={props.handleChange} type='text' name='zip' value={props.inputData.zip} />
                </div>
                <div className='flex w-full flex-col h-full my-3'>
                    <label htmlFor='phone'>Phone</label>
                    <br />
                    <input className='py-3 pl-1 focus:bg-gray rounded h-6 text-black bg-white duration-[250ms] flex justify-start items-center' onChange={props.handleChange} type='text' name='phone' value={props.inputData.phone} />
                </div>
            </div>
            <button className='justify-center items-center bg-gradient-to-l from-white to-green text-black rounded p-3 duration-[250ms] mt-5' onClick={props.clearAddress}>Clear Address</button>
        </div>
    )
}