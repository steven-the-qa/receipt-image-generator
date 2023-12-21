import React from 'react';
import ReceiptItem from './ReceiptItem'

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
        return <h3 id='store'>{customStore.customStoreName}</h3>;
      } else {
        return <img src={`images/stores/${props.storeName}.png`} id='store' className='block h-[150px] mb-[1em]' alt='store logo on receipt' />;
      }
    }

    return (
      <div className='w-[30rem]'>
        <section id='receipt' className={`flex flex-col justify-start items-between text-black bg-white w-[25rem] px-5 pb-10 pt-5 mx-0 text-xs font-mono font-bold ${props.receiptHeightStyle}`}>
          {/*Store Name/Logo*/}
          <StoreBanner></StoreBanner>
          {/*Store Address*/}
          <div id='address' className='leading-[150%]'>
            <div>{address1}</div>
            <div>{address2}</div>
            <div>
              {`${city}${props.checkCityComma()}
              ${state}
              ${zip}`}
            </div>
          </div>
          {/*Store Phone Number*/}
          <div>
            <div id='phone'>{phone}</div>
            <br />
            <div id='date' className={costcoDateContainer}>
              <div className={props.storeName === 'costco' ? costcoDate : 'mr-1'}>{props.purchaseDate}</div>
              {`@ ${props.purchaseTime}`}
            </div>
          </div>
          {/*Divider*/}
          <br />
          {/*Items List*/}
          <div id='receiptItems' className='flex flex-col items-between justify-start tracking-1 mb-1'>
            {props.receiptItems.map((i, idx) => {
              return <ReceiptItem
                key={idx}
                index={idx}
                description={i[0]}
                price={i[1]}
                quantity={i[2]}
                europeanFormat={props.europeanFormat}
                subItem={props.subItem}
                removeItemHandler={props.removeItemHandler}
              />
            })}
          </div>
          {/*Divider*/}
          <br />
          {/*Total Spent*/}
          <div className='flex justify-between items-start p-1 mt-1'>
            <div style={{marginLeft: 20}}>Subtotal</div>
            <div id='subtotal'>{formatTotal(props.subtotal)}</div>
          </div>
          <div className='flex justify-between items-start p-1 m-0'>
            <div style={{marginLeft: 20}}>Sales Tax {formatTax(props.tax)}</div>
            <div id='tax'>{formatTotal(props.subtotal * props.tax)}</div>
          </div>
          <div className='flex justify-between items-start p-1 m-0'>
            <div style={{marginLeft: 20}}>Total</div>
            <div id='total' className={props.storeName === 'costco' ? costcoTotal : ''}>{formatTotal(props.total)}</div>
          </div>
        </section>
      </div>
    )
}