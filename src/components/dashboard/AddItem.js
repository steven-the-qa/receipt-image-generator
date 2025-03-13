import React from 'react'

function AddItem(props) {
    return (
        <div id='addItemContainer' className='flex flex-col max-h-full items-center p-3 mb-5 border-t-2 border-green pt-4'>
            <h2 className='text-xl mb-5 text-green'>Add Item</h2>
            <div className='flex flex-col items-center mb-5'>
                <div className='flex flex-col mb-3'>
                    <label htmlFor='itemDescription' className='text-white mb-1'>Description</label>
                    <input id="itemDescription" className='py-3 pl-2 focus:bg-gray flex justify-start items-center rounded h-6 text-black bg-white duration-[250ms]'  onChange={props.handleChange} type='text' name='itemDescription' value={props.inputData.itemDescription} />
                </div>
                <div className='flex flex-col mb-3'>
                    <label htmlFor='itemPrice' className='text-white mb-1'>Price</label>
                    <input className='py-3 pl-2 focus:bg-gray rounded h-6 text-black bg-white duration-[250ms] flex justify-start items-center' onChange={props.handleChange} type='text' name='itemPrice' value={props.inputData.itemPrice} />
                </div>
                <div className='flex flex-col mb-3'>
                    <label htmlFor='itemQuantity' className='text-white mb-1'>Quantity</label>
                    <input className='py-3 pl-2 focus:bg-gray rounded h-6 text-black bg-white duration-[250ms] flex justify-start items-center' onChange={props.handleChange} type='text' name='itemQuantity' value={props.inputData.itemQuantity} />
                </div>
                <div className='flex flex-col mb-3 w-full'>
                    <label htmlFor='numOfCopies' className='text-white mb-1'># of Copies</label>
                    <input id="numOfCopies" className='py-3 pl-2 focus:bg-gray rounded h-6 w-16 text-black bg-white duration-[250ms] flex justify-start items-center'  onChange={props.handleChange} type='text' name='numOfCopies' value={props.inputData.numOfCopies} />
                </div>
            </div>

            <div className='flex mb-3'>
                <button className='mr-5 justify-center items-center bg-gradient-to-l from-black to-green text-white rounded p-3 duration-[250ms] hover:from-dark-gray hover:to-dark-green' onClick={props.updateItems}>Add Item</button>
                <div className='relative mr-5'>
                    <button className='justify-center items-center bg-gradient-to-l from-black to-light-green text-white rounded p-3 duration-[250ms] hover:from-dark-gray hover:to-dark-green flex items-center' onClick={props.subItem}>
                        Add Sub-Item
                        <span className='ml-1 text-xs'>(+)</span>
                    </button>
                    <div className='absolute -bottom-8 left-0 right-0 text-xs text-white opacity-70'>
                        Creates an indented sub-item
                    </div>
                </div>
                <button className='justify-center items-center bg-gradient-to-l from-black to-green text-white rounded p-3 duration-[250ms] hover:from-dark-gray hover:to-dark-green' onClick={props.clearItems}>Clear Items</button>
            </div>

            <p className='w-[50%] leading-5 p-2 border-2 border-green rounded bg-black text-white mt-4'>
                <strong className='text-green'>Hint: </strong>
                To the left of each line item on the receipt, there is a small, hidden 
                <span className='bg-white p-1 mx-1 text-black'>&#x274C;</span> 
                you can use to delete the line item. Hover over the 
                <span className='bg-white p-1 mx-1 text-black'>&#x274C;</span> 
                to reveal it.
            </p>
        </div>
    )
}

export default AddItem