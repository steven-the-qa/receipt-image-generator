/*  */import React from 'react'
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

    const isSubItem = props.description.match(/^\+/);
    const description = isSubItem
        ? <div className='pl-[20px]'>{props.description}</div>
        : <div>{props.description}</div>
        // eslint-disable-next-line
    const quantityLine = props.quantity > 1
        ? `${props.quantity} @ ${formatter.format(props.price)}`
        : ''
    const quantityLineVisibility = quantityLine ? "visible pt-1" : "invisible"
    const lineItemHeight = quantityLine ? 'min-h-[40px]' : 'min-h-[30px]'
    const deleteXContainerStyles = 'opacity-0 hover:opacity-100 inline-block bg-white absolute z-[1000] p-1 cursor-pointer left-16'
    return (
        <div className={`flex flex-col justify-between items-start p-1 m-0 ${lineItemHeight}`}>
            <div className='flex justify-between w-full'>
                <div className={deleteXContainerStyles} role="img" aria-label="delete" onClick={() => { props.removeItemHandler(props.index); }}>
                    <span>&#x274C;</span>
                </div>
                <div id='descriptionAndPrice' className='flex justify-between'>
                    <div className='break-words w-[20rem] pr-5'>
                        {description}
                    </div>
                    <div>
                        {props.quantity && props.price && (props.quantity * props.price).toFixed(2)}
                    </div>
                </div>
            </div>
            <div className={`${quantityLineVisibility}`}>
                {quantityLine}
            </div>
        </div>
    )

}
