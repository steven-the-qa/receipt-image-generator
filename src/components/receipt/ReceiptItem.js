import React from 'react'

export default function ReceiptItem(props) {
    const formatter = props.europeanFormat ? 
    new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2
    })
    :     
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })

    const isSubItem = props.description && props.description.match(/^\+/);
    const description = isSubItem
        ? <div className='pl-[20px] text-xs text-gray-700'>{props.description}</div>
        : <div className='font-medium'>{props.description}</div>
    
    const quantityLine = props.quantity > 1
        ? `${props.quantity} @ ${formatter.format(props.price || 0)}`
        : ''
    const quantityLineVisibility = quantityLine ? "visible pt-1 text-[9px] text-gray-600" : "hidden"
    const lineItemHeight = quantityLine ? 'min-h-[40px]' : 'min-h-[30px]'

    return (
        <div data-testid='receiptItem' className={`flex flex-col justify-between items-start py-1 px-2 m-0 ${lineItemHeight} relative group hover:bg-gray-50`}>
            <div className='absolute -left-1 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10'>
                <button 
                    data-testid='removeItem'
                    className="w-5 h-5 flex items-center justify-center text-red-500 hover:text-red-700 cursor-pointer" 
                    onClick={() => { props.removeItemHandler(props.index); }}
                    aria-label="Remove item"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            
            <div className='flex justify-between w-full'>
                <div data-testid='descriptionAndPrice' className='flex justify-between w-full'>
                    <div className='break-words w-[16rem] pr-3'>
                        {description}
                    </div>
                    <div data-testid='price' className='tabular-nums'>
                        {props.quantity && props.price && (props.quantity * props.price).toFixed(2)}
                    </div>
                </div>
            </div>
            
            <div data-testid='quantityLine' className={`${quantityLineVisibility} tabular-nums`}>
                {quantityLine}
            </div>
        </div>
    )
}
