import React from 'react'

function AddItem(props) {
    return (
        <div id='addItemContainer' className='flex flex-col max-h-full justify-start border rounded p-3 min-w-[50%] mb-5'>
            <h2 className='text-xl mb-5'>Add Item</h2>
            <div className='flex justify-start items-center mb-5'>
                <div className='flex flex-col justify-start items-start mr-5'>
                    <label htmlFor='itemDescription'>Description</label>
                    <br/>
                    <input id="itemDescription" className='py-3 pl-1 focus:bg-gray flex justify-start items-center rounded h-6 text-black bg-white duration-[250ms]'  onChange={props.handleChange} type='text' name='itemDescription' value={props.inputData.itemDescription} />
                </div>

                <div className='flex w-full flex-col h-full justify-start items-start mr-5'>
                    <label htmlFor='itemPrice'>Price</label>
                    <br/>
                    <input className='py-3 pl-1 focus:bg-gray rounded h-6 text-black bg-white duration-[250ms] flex justify-start items-center' onChange={props.handleChange} type='text' name='itemPrice' value={props.inputData.itemPrice} />
                </div>
            </div>

            <div className='flex w-full flex-col justify-start items-start mb-5'>
                <label htmlFor='itemQuantity'>Quantity</label>
                <br/>
                <input className='py-3 pl-1 focus:bg-gray rounded h-6 text-black bg-white duration-[250ms] flex justify-start items-center' onChange={props.handleChange} type='text' name='itemQuantity' value={props.inputData.itemQuantity} />
            </div>

            <div className='flex w-full flex-col mb-5'>
                <label htmlFor='numOfCopies'># of Copies</label>
                <br/>
                <input id="numOfCopies" className='py-3 pl-1 focus:bg-gray rounded h-6 w-16 text-black bg-white duration-[250ms] flex justify-start items-center'  onChange={props.handleChange} type='text' name='numOfCopies' value={props.inputData.numOfCopies} />
            </div>

            <div className='flex mb-5'>
                <button className='mr-5 justify-center items-center bg-gradient-to-l from-white to-green text-black rounded p-3 duration-[250ms]' onClick={props.updateItems}>Add Item</button>
                <button className='mr-5 justify-center items-center bg-gradient-to-l from-white to-green text-black rounded p-3 duration-[250ms]' onClick={props.subItem}>Add Sub-Item</button> 
                <button className='justify-center items-center bg-gradient-to-l from-white to-green text-black rounded p-3 duration-[250ms]' onClick={props.clearItems}>Clear Items</button>
            </div>

            <p className='leading-5 p-2 border-4 rounded bg-green-500 text-black'>
                <strong>Hint: </strong>
                To the left of each line item on the receipt, there is a small, hidden 
                <span className='bg-white p-1 mx-1'>&#x274C;</span> 
                you can use to delete the line item. Hover over the 
                <span className='bg-white p-1 mx-1'>&#x274C;</span> 
                to reveal it.
            </p>
        </div>
    )
}

export default AddItem