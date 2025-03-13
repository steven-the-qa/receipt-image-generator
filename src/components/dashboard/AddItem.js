import React from 'react'

function AddItem(props) {
    return (
        <div>
            <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                Item Management
            </h3>

            <div className="space-y-4">
                <div>
                    <label htmlFor='itemDescription' className='text-sm text-slate-300 mb-1 block'>Item Description</label>
                    <input 
                        id="itemDescription" 
                        className='w-full py-2 px-3 bg-slate-800 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors'  
                        onChange={props.handleChange} 
                        type='text' 
                        name='itemDescription' 
                        value={props.inputData.itemDescription} 
                        placeholder="Enter item description"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor='itemPrice' className='text-sm text-slate-300 mb-1 block'>Price</label>
                        <input 
                            className='w-full py-2 px-3 bg-slate-800 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors' 
                            onChange={props.handleChange} 
                            type='text' 
                            name='itemPrice' 
                            value={props.inputData.itemPrice} 
                            placeholder="0.00"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor='itemQuantity' className='text-sm text-slate-300 mb-1 block'>Quantity</label>
                        <input 
                            className='w-full py-2 px-3 bg-slate-800 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors' 
                            onChange={props.handleChange} 
                            type='text' 
                            name='itemQuantity' 
                            value={props.inputData.itemQuantity} 
                            placeholder="1"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor='numOfCopies' className='text-sm text-slate-300 mb-1 block'>Number of Copies</label>
                    <input 
                        id="numOfCopies" 
                        className='w-24 py-2 px-3 bg-slate-800 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors'
                        onChange={props.handleChange} 
                        type='text' 
                        name='numOfCopies' 
                        value={props.inputData.numOfCopies} 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                <button 
                    className='flex items-center justify-center py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors' 
                    onClick={props.updateItems}
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add Item
                </button>
                
                <button 
                    className='flex items-center justify-center py-2 px-4 bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors' 
                    onClick={props.subItem}
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                    Add Sub-Item
                </button>
                
                <button 
                    className='flex items-center justify-center py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded transition-colors' 
                    onClick={props.clearItems}
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Clear All
                </button>
            </div>

            <div className="mt-4 p-3 bg-slate-800 border border-slate-600 rounded-md">
                <div className="flex items-start">
                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div className="ml-3">
                        <p className="text-sm text-slate-300">
                            <span className="font-medium">Tip:</span> Hover over items in the receipt to reveal a delete button.
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            Use "Add Sub-Item" for indented items like modifiers or add-ons.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddItem