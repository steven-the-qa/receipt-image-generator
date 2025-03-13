import React, { useState, useEffect } from 'react';
import * as moment from 'moment'
import Papa from 'papaparse'
import * as retailerInfo from './data/retailerInfo.json'
import Receipt from './components/receipt/Receipt'
import Tabs from './components/dashboard/Tabs'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CreateReceipt from './components/dashboard/CreateReceipt'
import DataTools from './components/dashboard/DataTools'
import EditReceipt from './components/dashboard/EditReceipt'

export default function App() {
  const BASE_RECEIPT_HEIGHT = 350;
  const storeData = retailerInfo.default
  const defaultStore = storeData.filter(store => store.key === '7eleven')[0]
  const [restaurant, setRestaurant] = useState(false)
  const [inputData, setInputData] = useState({
    storeName: '7eleven',
    purchaseDate: moment().format('MM/DD/YYYY'),
    purchaseTime: moment().format(`hh:mm:ss`),
    address1: defaultStore.storeAddress1,
    address2: defaultStore.storeAddress2,
    city: defaultStore.storeCity,
    state: defaultStore.storeState,
    zip: defaultStore.storeZIP,
    phone: defaultStore.storePhone,
    itemDescription: '',
    itemPrice: '',
    itemQuantity: '',
    numOfCopies: 1,
    storeNameBox: true,
    storeAddressBox: true,
    storePhoneBox: true,
    storeBox: true,
    purchaseDateBox: true,
    totalSpentBox: true
  })
  const [subtotal, setSubtotal] = useState(0)
  const tax = 0.051
  const [total, setTotal] = useState((subtotal * tax) + subtotal)
  const [receiptItems, setReceiptItems] = useState([])
  const [receiptItemsCount, setReceiptItemsCount] = useState(0)
  const [csvFile, setCSVFile] = useState('')
  const [csvResults, setCSVResults] = useState([])
  const [receiptLength, setReceiptLength] = useState(BASE_RECEIPT_HEIGHT)
  const [europeanFormat, setEuropeanFormat] = useState(false)
  const [blurryReceipt, setBlurryReceipt] = useState(false)
  const [suppressDollarSign, setSuppressDollarSign] = useState(true)
  const [customStore, setCustomStore] = useState({
    useCustomStoreName: false,
    customStoreName: '',
  });

  const receiptHeightStyle =  `min-h-${receiptLength} pb-[50px]`

  function handleChange(e) {
    const {name, value, type, checked} = e.target

    type === "checkbox" 
      ? setInputData(prevInputData => ({...prevInputData, [name]: checked })) 
      : setInputData(prevInputData => ({...prevInputData, [name]: value}))
  }

  function handleSelect(e) {
    const {value} = e
    const currentStore = storeData.filter(store => store.key === value)[0]

    setInputData(prevInputData => ({...prevInputData,
      "storeName": value,
      "displayName": currentStore.displayName,
      "address1": currentStore.storeAddress1,
      "address2": currentStore.storeAddress2,
      "city": currentStore.storeCity,
      "state": currentStore.storeState,
      "zip": currentStore.storeZIP,
      "phone": currentStore.storePhone
    }))
  }

  function checkCityComma() {
    const currentStore = storeData.filter(store => store.key === inputData.storeName)[0]
    const city = restaurant ? String(inputData.city) : String(currentStore.storeCity)
    const optionalComma = city.length > 0 ? ',' : ''
    return optionalComma
  }

  function refreshDate() {
    const rightNowDate = moment().format('MM/DD/YYYY')
    const rightNowTime = moment().format(`hh:mm:ss`)
    setInputData(prevInputData => ({...prevInputData, purchaseDate: rightNowDate, purchaseTime: rightNowTime}))
  }

  function addItems(items, emptyFirst = false) {
    const newItems = emptyFirst ? [...items] : [...receiptItems, ...items];
    // Add up spacing. 35px for single items, 45px for > 1
    const newLength = items.reduce((p, c) => p + (c[2] > 1 ? 45 : 35), emptyFirst ? BASE_RECEIPT_HEIGHT : receiptLength);
    setReceiptItems(newItems, calculateTotal())
    setReceiptItemsCount(receiptItemsCount + items.length)
    setReceiptLength(newLength);
  }

  function removeItem(idx) {
    const remove = receiptItems[idx][2] > 1 ? 45 : 35;
    const newItems = [...receiptItems];
    newItems.splice(idx, 1);
    setReceiptItems(newItems, calculateTotal())
    setReceiptItemsCount(receiptItemsCount - 1)
    setReceiptLength(receiptLength - remove);
  }

  function updateItems() {
    
    if (!inputData.itemDescription) {
      return alert('Please add an item description.')
    }

    if (!inputData.itemPrice) {
      return alert('Please add an item price.')
    }

    if (!inputData.itemQuantity) {
      return alert('Please add an item quantity.')
    }

    if(inputData.itemQuantity <= 0) {
      return alert('Item quantity must be greater than 0.')
    }

    if(inputData.numOfCopies < 1) {
      setInputData(prevInputData => ({...prevInputData, numOfCopies: 1}))
      return alert('Number of Copies must be greater than or equal to 1')
    }

    const copies = inputData.numOfCopies

    let extraLength = copies > 1 ? copies * 35 : 35
    
    if (inputData.itemDescription && inputData.itemQuantity > 0) {
      extraLength = copies > 1 ? copies * 45 : 45
    }

    let copiesArr = [...receiptItems]

    if (copies >= 1) {
      for (let i = 0; i < copies; i++) {
        copiesArr.push([inputData.itemDescription, inputData.itemPrice, inputData.itemQuantity])
        console.log(copiesArr)
      }
      setReceiptLength(receiptLength + extraLength)
    }

    setReceiptItems(copiesArr, calculateTotal())
    setReceiptItemsCount(copies > 1 ? receiptItemsCount + copies : receiptItemsCount + 1)
  
  }

  function clearItems() {

    setReceiptItems([])
    setReceiptItemsCount(0)
    setReceiptLength(BASE_RECEIPT_HEIGHT)
    setSubtotal(0)
    setTotal(0)
  }

  function subItem() {
    if (!inputData.itemDescription) {
      return alert('Please add an item description.')
    }

    let extraLength = 35

    setReceiptItems([...receiptItems, ['+ ' + inputData.itemDescription, null, 1]])
    setReceiptItemsCount(receiptItemsCount + 1)
    setReceiptLength(receiptLength + extraLength)
  }

  function notifyUserOfFormat() {
    alert(`
      Please be sure your CSV file follows this format:\n
      description, price, quantity\n
      test1, 1.00, 1\n
      test2, 3.29, 1\n
      test3, 2.99, 2\n
      .....etc........
    `)
  }

  function handleCSV(event) {
    if (event.target.files && event.target.files.length > 0) {
        Papa.parse(event.target.files[0], {
          complete: (results, file) => mapDataToComponents(results, file),
          error: function(error) {
            console.log("Parsing has failed unexpectedly:", error)
          }
        })
    }
    else {
      alert(`A new CSV file was not selected. If you have made changes to ${csvFile.name}, please refresh the page and upload the file again.`)
    }
  }

  function mapDataToComponents(results, file) {
    let bulkDescriptions = []
    let bulkPrices = []
    let bulkQuantities = []
    let bulkReceiptItems = []
    let quantities = 0
    const csvData = results.data
    const itemsCount = csvData.length - 1
    let extraLength = 0

    for (let i = 1; i < csvData.length; i++) {
      csvData[i][0] && csvData[i][2] > 1 && quantities++
    }

    if (quantities >= 1) {
      extraLength = (45 * quantities) + (35 * (itemsCount - quantities))
    }

    else {
      extraLength += 35 * (itemsCount) 
    }

    for (let i = 1; i < csvData.length; i++) {
      bulkDescriptions.push(csvData[i][0])
      bulkPrices.push(csvData[i][1])
      bulkQuantities.push(csvData[i][2])
    }

    for (let i = 0; i < bulkDescriptions.length; i++) {
      bulkReceiptItems.push([bulkDescriptions[i]])
    }

    for (let i = 0; i < bulkPrices.length; i++) {
      bulkReceiptItems[i].push(bulkPrices[i])
    }

    for (let i = 0; i < bulkQuantities.length; i++) {
      bulkReceiptItems[i].push(bulkQuantities[i])
    }

    let receiptItemsUpdate = receiptItems

    for (let i = 0; i < bulkReceiptItems.length; i++){
      receiptItemsUpdate.push(bulkReceiptItems[i])
    }

    !csvFile && alert(`Hooray! Your CSV file ${file.name} was successfully parsed.`)

    setCSVResults(results)
    setCSVFile(file)
    setReceiptItems(receiptItemsUpdate)
    setReceiptItemsCount(receiptItemsCount + bulkReceiptItems.length)
    setReceiptLength(receiptLength + extraLength)
  }

  function regenerateCSVData() {
    const results = csvResults
    const file = csvFile
    if (csvFile && csvResults){
      mapDataToComponents(results, file)
    }

    else {
      alert('There is no CSV file to regenerate. Please select a CSV file first.')
    }
  }

  function missingInfoScenarios() {
    // Create an array to hold missing info messages
    const messages = [];

    if (inputData.storeBox === true) {
      const store = document.getElementById('store');
      if (store) {
        if (inputData.storeNameBox === false) {
          store.style.visibility = 'hidden';
        } else {
          store.style.visibility = 'visible';
        }
      }

      const address = document.getElementById('address');
      if (address) {
        if (inputData.storeAddressBox === false) {
          address.style.visibility = 'hidden';
        } else {
          address.style.visibility = 'visible';
        }
      }

      const phone = document.getElementById('phone');
      if (phone) {
        if (inputData.storePhoneBox === false) {
          phone.style.visibility = 'hidden';
        } else {
          phone.style.visibility = 'visible';
        }
      }
    } else {
      const store = document.getElementById('store');
      const address = document.getElementById('address');
      const phone = document.getElementById('phone');
      
      if (store) store.style.visibility = 'hidden';
      if (address) address.style.visibility = 'hidden';
      if (phone) phone.style.visibility = 'hidden';
    }

    const date = document.getElementById('date');
    if (date) {
      if (inputData.purchaseDateBox === true) {
        date.style.visibility = 'visible';
      } else {
        date.style.visibility = 'hidden';
      }
    }

    const subtotal = document.getElementById('subtotal');
    const tax = document.getElementById('tax');
    const total = document.getElementById('total');
    
    if (inputData.totalSpentBox === true) {
      if (subtotal) subtotal.style.visibility = 'visible';
      if (tax) tax.style.visibility = 'visible';
      if (total) total.style.visibility = 'visible';
    } else {
      if (subtotal) subtotal.style.visibility = 'hidden';
      if (tax) tax.style.visibility = 'hidden';
      if (total) total.style.visibility = 'hidden';
    }

    return messages;
  }

  function toggleTypeface() {
    const elem = document.getElementById('receipt');
    const classes = elem.classList;
    if (classes.contains('font-mono')) {
      elem.classList.remove('font-mono');
    } else {
      elem.classList.add('font-mono');
    }
  }

  function handleFormat() {
    setEuropeanFormat(!europeanFormat)
  }

  function handleDollarSign() {
    setSuppressDollarSign(!suppressDollarSign);
  }

  function handleBlur() {
    setBlurryReceipt(!blurryReceipt)
  }

  function allowAddressEdit() {
    setRestaurant(!restaurant)
  }

  function clearAddress() {
    setInputData(prevInputData => ({...prevInputData,
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      phone: ""
    }))
  }

  function calculateTotal() {
    let total = 0

    for (let i = 0; i < receiptItems.length; i++) {
      if (receiptItems[i][1] && receiptItems[i][2]) {
        total += (receiptItems[i][2] * receiptItems[i][1])
      }
    }
    setSubtotal(Math.ceil(total * 100)/100)
    setTotal((subtotal * tax) + subtotal)
  }

  function handleCustomStoreToggle() {
    const chooseCustomStore = document.getElementById('chooseCustomStore');
    const chooseExistingStore = document.getElementById('chooseExistingStore');
    const useCustomStoreNameToggle = document.getElementById('useCustomStoreName');
    const customStoreName = document.getElementById('customStoreName').value;

    if (useCustomStoreNameToggle.checked) {
      chooseCustomStore.classList.remove('hidden');
      chooseExistingStore.classList.add('hidden');
      setCustomStore({ useCustomStoreName: true, customStoreName });
    } else {
      chooseCustomStore.classList.add('hidden');
      chooseExistingStore.classList.remove('hidden');
      setCustomStore({ useCustomStoreName: false, customStoreName });
    }
  }

  function handleCustomStoreNameChange() {
    const customStoreName = document.getElementById('customStoreName').value;
    const useCustomStoreName = document.getElementById('useCustomStoreName').checked;
    setCustomStore({ useCustomStoreName, customStoreName });
  }
  
  useEffect(() => {
      if (!blurryReceipt) {
        const receipt = document.getElementById('receipt');
        if (receipt) {
          receipt.classList.remove('blur-[2px]');
        }
      } else {
        const receipt = document.getElementById('receipt');
        if (receipt) {
          receipt.classList.add('blur-[2px]');
        }
      }
  }, [blurryReceipt]);

  useEffect(() => calculateTotal(), [receiptItems]);

  useEffect(() => inputData.address2 ? setReceiptLength(375) : setReceiptLength(BASE_RECEIPT_HEIGHT), [inputData.address2]);
  
  useEffect(() => {
    // Only call missingInfoScenarios if we're on a page that has the receipt displayed
    const receipt = document.getElementById('receipt');
    if (receipt) {
      missingInfoScenarios();
    }
  }, [inputData.storeBox, inputData.storeNameBox, inputData.storeAddressBox, inputData.storePhoneBox, 
      inputData.purchaseDateBox, inputData.totalSpentBox]);

  return (
    <BrowserRouter>
    <main className="min-h-screen bg-black">
      <Routes>
        <Route path="/" element={
          <div className="flex flex-col xl:flex-row">
            <div className="flex min-h-screen flex-col items-center xl:w-1/2 xl:mr-10 bg-dark-gray">
              <div className="flex-1 w-full m-0 xl:m-5">
                <Tabs />
                <div id="tab-content" className='container mx-auto p-0'>
                  {/* Home Route Content */}
                  <CreateReceipt
                    handleChange={handleChange}
                    handleSelect={handleSelect}
                    handleCustomStoreNameChange={handleCustomStoreNameChange}
                    isRestaurant={restaurant}
                    inputData={inputData}
                    updateItems={updateItems}
                    clearItems={clearItems}
                    refreshDate={refreshDate}
                    allowAddressEdit={allowAddressEdit}
                    clearAddress={clearAddress}
                    handleCustomStoreToggle={handleCustomStoreToggle}
                    subItem={subItem}
                  />
                  <div className="flex flex-col items-center container mx-auto mt-10" id="checklistItems">
                    {missingInfoScenarios && missingInfoScenarios().length > 0 && (
                      <>
                        <hr className="w-11/12 container mx-auto" />
                        {missingInfoScenarios().map((scenario, i) => (
                          <p className="text-white" key={i}>{scenario}</p>
                        ))}
                      </>
                    )}
                  </div>
                  <hr className="w-11/12 container mx-auto my-5" />
                </div>
                <button id="restock" className='justify-center items-center bg-gradient-to-l from-black to-green text-white rounded p-1 m-1 duration-250 flex' onClick={toggleTypeface}>Toggle Typeface</button>
              </div>
            </div>
            <div className="flex-none min-h-screen flex flex-col items-center overflow-x-hidden bg-black">
              <Receipt
                storeData={storeData}
                storeName={inputData.storeName}
                purchaseDate={inputData.purchaseDate}
                purchaseTime={inputData.purchaseTime}
                receiptItems={receiptItems}
                tax={tax}
                subtotal={subtotal}
                total={total}
                europeanFormat={europeanFormat}
                blurryReceipt={blurryReceipt}
                suppressDollarSign={suppressDollarSign}
                checkCityComma={checkCityComma}
                receiptHeightStyle={`min-h-[${receiptLength}px]`}
                inputData={inputData}
                isRestaurant={restaurant}
                removeItemHandler={removeItem}
                customStore={customStore}
              />
            </div>
          </div>
        } />

        <Route path="/edit-receipt" element={
          <div className="flex flex-col xl:flex-row">
            <div className="flex min-h-screen flex-col items-center xl:w-1/2 xl:mr-10 bg-dark-gray">
              <div className="flex-1 w-full m-0 xl:m-5">
                <Tabs />
                <div id="tab-content" className='container mx-auto p-0'>
                  {/* Edit Receipt Route Content */}
                  <EditReceipt
                    key={`${europeanFormat}${blurryReceipt}${suppressDollarSign}`}
                    handleFormat={handleFormat}
                    handleDollarSign={handleDollarSign}
                    handleBlur={handleBlur}
                    europeanFormat={europeanFormat}
                    blurryReceipt={blurryReceipt}
                    suppressDollarSign={suppressDollarSign}
                    handleChange={handleChange}
                    inputData={inputData}
                    toggleTypeface={toggleTypeface}
                    missingInfoScenarios={missingInfoScenarios}
                  />
                </div>
                <button id="restock" className='justify-center items-center bg-gradient-to-l from-black to-green text-white rounded p-1 m-1 duration-250 flex' onClick={toggleTypeface}>Toggle Typeface</button>
              </div>
            </div>
            <div className="flex-none min-h-screen flex flex-col items-center overflow-x-hidden bg-black">
              <Receipt
                storeData={storeData}
                storeName={inputData.storeName}
                purchaseDate={inputData.purchaseDate}
                purchaseTime={inputData.purchaseTime}
                receiptItems={receiptItems}
                tax={tax}
                subtotal={subtotal}
                total={total}
                europeanFormat={europeanFormat}
                blurryReceipt={blurryReceipt}
                suppressDollarSign={suppressDollarSign}
                checkCityComma={checkCityComma}
                receiptHeightStyle={`min-h-[${receiptLength}px]`}
                inputData={inputData}
                isRestaurant={restaurant}
                removeItemHandler={removeItem}
                customStore={customStore}
              />
            </div>
          </div>
        } />

        <Route path="/data-tools" element={
          <div className="flex flex-col xl:flex-row">
            <div className="flex min-h-screen flex-col items-center xl:w-1/2 xl:mr-10 bg-dark-gray">
              <div className="flex-1 w-full m-0 xl:m-5">
                <Tabs />
                <div id="tab-content" className='container mx-auto p-0'>
                  {/* Data Tools Route Content */}
                  <DataTools
                    handleCSV={handleCSV}
                    csvFile={csvFile}
                    regenerateCSVData={regenerateCSVData}
                  />
                </div>
                <button id="restock" className='justify-center items-center bg-gradient-to-l from-black to-green text-white rounded p-1 m-1 duration-250 flex' onClick={toggleTypeface}>Toggle Typeface</button>
              </div>
            </div>
            <div className="flex-none min-h-screen flex flex-col items-center overflow-x-hidden bg-black">
              <Receipt
                storeData={storeData}
                storeName={inputData.storeName}
                purchaseDate={inputData.purchaseDate}
                purchaseTime={inputData.purchaseTime}
                receiptItems={receiptItems}
                tax={tax}
                subtotal={subtotal}
                total={total}
                europeanFormat={europeanFormat}
                blurryReceipt={blurryReceipt}
                suppressDollarSign={suppressDollarSign}
                checkCityComma={checkCityComma}
                receiptHeightStyle={`min-h-[${receiptLength}px]`}
                inputData={inputData}
                isRestaurant={restaurant}
                removeItemHandler={removeItem}
                customStore={customStore}
              />
            </div>
          </div>
        } />
      </Routes>
    </main>
    </BrowserRouter>
  );
}