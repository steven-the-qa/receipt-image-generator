import React from 'react';
import ReceiptItem from './ReceiptItem'
import StoreImage from '../common/StoreImage'

export default function Receipt(props) {
    const currentStore = props.storeData.filter(store => store.key === props.storeName)[0]

    const address1 = props.isRestaurant ? props.inputData.address1 : currentStore.storeAddress1 
    const address2 = props.isRestaurant ? props.inputData.address2 : currentStore.storeAddress2
    const city = props.isRestaurant ? props.inputData.city : currentStore.storeCity
    const state = props.isRestaurant ? props.inputData.state : currentStore.storeState
    const zip = props.isRestaurant ? props.inputData.zip : currentStore.storeZIP
    const phone = props.isRestaurant ? props.inputData.phone : currentStore.storePhone
    const customStore = props.customStore;

    const costcoDateContainer = 'flex items-center leading-[80%]'
    const costcoDate = 'bg-black text-white mr-[1em] text-[125%]'
    const costcoTotal = 'bg-black text-white pl-[75px] leading-[70%] text-[125%]'

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
    });

    function formatTotal(total) {
      let newTot = formatter.format(total)
      if (!props.europeanFormat && props.suppressDollarSign) {
        return newTot.substr(1)
      }
      else if (props.europeanFormat && props.suppressDollarSign) {
        let canadianTotal = formatter.format(total).split('')
        canadianTotal.splice(canadianTotal.indexOf('$'), 1)
        return canadianTotal
      }
      else {
        return newTot
      }
    }

    function formatTax(tax) {
      return `${tax * 100}%`
    }

    const StoreBanner = () => {
      if (customStore.useCustomStoreName && customStore.customStoreName !== '') {
        return (
          <h3 id='store' className='text-center font-bold text-xl my-4 tracking-tight'>
            {customStore.customStoreName}
          </h3>
        );
      } else {
        return (
          <div data-testid='store' className={`flex flex-col justify-center items-center h-[130px] mb-4 overflow-hidden ${!props.inputData.storeBox || !props.inputData.storeNameBox ? 'hidden' : ''}`}>
            <StoreImage
              storeName={props.storeName}
              size="medium"
              className="w-full"
              showDebug={false}
            />
          </div>
        );
      }
    }

    return (
      <div data-testid='receipt' className='flex justify-center'>
        <section 
          id='receipt' 
          className={`flex flex-col justify-start text-black bg-white w-[20rem] sm:w-[22rem] mx-0 text-xs ${props.currentTypeface || 'font-sans'} font-bold relative ${props.receiptHeightStyle} shadow-xl rounded-sm ${props.blurryReceipt ? 'blur-[2px]' : ''}`}
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.01) 20px, rgba(0,0,0,0.01) 21px)',
            boxShadow: '0 0 10px rgba(0,0,0,0.05), 0 0 5px rgba(0,0,0,0.1), 0 20px 20px -10px rgba(0,0,0,0.1)'
          }}
        >
          {/* Perforated top edge */}
          <div className="absolute top-0 left-0 right-0 h-3 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gray-300"></div>
            <div className="flex w-full">
              {Array(40).fill().map((_, i) => (
                <div key={i} className="h-3 w-[5px] border-r border-gray-300"></div>
              ))}
            </div>
          </div>
          
          <div className="px-5 pt-6 pb-8">
            {/*Store Name/Logo*/}
            {props.inputData.storeBox && props.inputData.storeNameBox && <StoreBanner />}
            
            {/*Store Address*/}
            <div id='address' className={`leading-[150%] text-center mb-3 ${!props.inputData.storeBox || !props.inputData.storeAddressBox ? 'hidden' : ''}`}>
              <div>{address1}</div>
              <div>{address2}</div>
              <div>
                {`${city}${props.checkCityComma()}
                ${state}
                ${zip}`}
              </div>
            </div>
            
            {/*Store Phone Number*/}
            <div className="text-center mb-4">
              <div id='phone' className={!props.inputData.storeBox || !props.inputData.storePhoneBox ? 'hidden' : ''}>{phone}</div>
              <div id='date' className={`mt-4 ${costcoDateContainer} ${!props.inputData.purchaseDateBox ? 'hidden' : ''}`}>
                <div className={props.storeName === 'costco' ? costcoDate : 'mr-1'}>{props.purchaseDate}</div>
                {`@ ${props.purchaseTime}`}
              </div>
            </div>
            
            {/*Divider*/}
            <div className="border-t border-dashed border-gray-400 my-3 mx-2"></div>
            
            {/*Items List*/}
            <div id='receiptItems' className='flex flex-col items-between justify-start tracking-1 mb-1'>
              {props.receiptItems.length > 0 ? (
                props.receiptItems.map((i, idx) => (
                  <ReceiptItem
                    key={idx}
                    index={idx}
                    description={i[0]}
                    price={i[1]}
                    quantity={i[2]}
                    europeanFormat={props.europeanFormat}
                    subItem={props.subItem}
                    removeItemHandler={props.removeItemHandler}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-gray-400 italic">
                  No items added yet
                </div>
              )}
            </div>
            
            {/*Divider*/}
            <div className="border-t border-dashed border-gray-400 my-3 mx-2"></div>
            
            {/*Total Spent*/}
            <div className={`${!props.inputData.totalSpentBox ? 'hidden' : ''}`}>
              <div className='flex justify-between items-start p-1 mt-1'>
                <div style={{marginLeft: 20}}>Subtotal</div>
                <div id='subtotal'>{formatTotal(props.subtotal)}</div>
              </div>
              <div className='flex justify-between items-start p-1 m-0'>
                <div style={{marginLeft: 20}}>Sales Tax {formatTax(props.tax)}</div>
                <div id='tax'>{formatTotal(props.subtotal * props.tax)}</div>
              </div>
              <div className='flex justify-between items-start p-1 m-0 font-extrabold'>
                <div style={{marginLeft: 20}}>Total</div>
                <div id='total' className={props.storeName === 'costco' ? costcoTotal : ''}>{formatTotal(props.total)}</div>
              </div>
            </div>
            
            {/* Thank you message */}
            <div className="text-center mt-8 mb-2 text-xs">
              <p>Thank You For Your Purchase!</p>
              <p className="text-[10px] mt-1 text-gray-500">Please come again</p>
            </div>
          </div>
          
          {/* Perforated bottom edge */}
          <div className="absolute bottom-0 left-0 right-0 h-3 overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-300"></div>
            <div className="flex w-full">
              {Array(40).fill().map((_, i) => (
                <div key={i} className="h-3 w-[5px] border-r border-gray-300"></div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
}