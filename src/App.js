import React, { useState, useEffect, useCallback } from 'react';
import * as moment from 'moment'
import Papa from 'papaparse'
import * as retailerInfo from './data/retailerInfo.json'
import Receipt from './components/receipt/Receipt'
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom'
import CreateReceipt from './components/dashboard/CreateReceipt'
import DataTools from './components/dashboard/DataTools'
import EditReceipt from './components/dashboard/EditReceipt'

// Helper component to handle redirects from 404.html
const RedirectHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Check for redirect parameter in URL
    const query = new URLSearchParams(location.search);
    const redirectFrom = query.get('redirectFrom');
    
    if (redirectFrom) {
      // Clean the URL and navigate to the correct route
      const cleanRedirect = redirectFrom.replace('/receipt-image-generator', '');
      navigate(cleanRedirect || '/', { replace: true });
    }
  }, [location, navigate]);
  
  return children;
};

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

  // eslint-disable-next-line no-unused-vars
  function addItemsToReceipt(items, emptyFirst = false) {
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

  // Make missingInfoScenarios a memoized function that only changes when related dependencies change
  const missingInfoScenarios = useCallback(() => {
    if (!inputData.storeBox) {
      document.getElementById('store').classList.add('hidden')
      document.getElementById('address').classList.add('hidden')
      document.getElementById('phone').classList.add('hidden')
    } else {
      document.getElementById('store').classList.remove('hidden')
      
      if (inputData.storeNameBox) {
        document.getElementById('store').classList.remove('hidden')
      } else {
        document.getElementById('store').classList.add('hidden')
      }

      if (inputData.storeAddressBox) {
        document.getElementById('address').classList.remove('hidden')
      } else {
        document.getElementById('address').classList.add('hidden')
      }

      if (inputData.storePhoneBox) {
        document.getElementById('phone').classList.remove('hidden')
      } else {
        document.getElementById('phone').classList.add('hidden')
      }
    }

    if (inputData.purchaseDateBox) {
      document.getElementById('date').classList.remove('hidden')
    } else {
      document.getElementById('date').classList.add('hidden')
    }

    if (inputData.totalSpentBox) {
      document.getElementById('subtotal').parentElement.parentElement.classList.remove('hidden')
    } else {
      document.getElementById('subtotal').parentElement.parentElement.classList.add('hidden')
    }
  }, [inputData.storeBox, inputData.storeNameBox, inputData.storeAddressBox, inputData.storePhoneBox, 
      inputData.purchaseDateBox, inputData.totalSpentBox]);

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

  useEffect(() => {
    let total = 0
    for (let i = 0; i < receiptItems.length; i++) {
      if (receiptItems[i][1] && receiptItems[i][2]) {
        total += (receiptItems[i][2] * receiptItems[i][1])
      }
    }
    setSubtotal(Math.ceil(total * 100)/100)
    setTotal(prevSubtotal => (prevSubtotal * tax) + prevSubtotal)
  }, [receiptItems, tax]);

  useEffect(() => inputData.address2 ? setReceiptLength(375) : setReceiptLength(BASE_RECEIPT_HEIGHT), [inputData.address2]);
  
  useEffect(() => {
    // Only call missingInfoScenarios if we're on a page that has the receipt displayed
    const receipt = document.getElementById('receipt');
    if (receipt) {
      missingInfoScenarios();
    }
  }, [missingInfoScenarios]);

  return (
    <main className="flex h-screen bg-slate-900 text-white overflow-hidden">
      {/* Left Sidebar - Navigation */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-xl font-bold text-emerald-400">Receipt Generator</h1>
          <p className="text-xs text-slate-400 mt-1">Create customized receipt images</p>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <NavLink 
                to="/" 
                className={({isActive}) => 
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-700'
                  }`
                }
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                Create Receipt
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/edit-receipt" 
                className={({isActive}) => 
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-700'
                  }`
                }
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Format Receipt
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/data-tools" 
                className={({isActive}) => 
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-700'
                  }`
                }
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                </svg>
                Data Import
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={toggleTypeface}
            className="w-full flex items-center justify-center p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
            Toggle Font
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <RedirectHandler>
          <Routes>
            <Route path="/" element={
              <div className="flex-1 flex flex-col-reverse lg:flex-row overflow-hidden">
                {/* Forms Column */}
                <div className="lg:w-3/5 bg-slate-800 overflow-y-auto">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-emerald-400 mb-6">Create Your Receipt</h2>
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
                  </div>
                </div>

                {/* Preview Column */}
                <div className="lg:w-2/5 bg-slate-900 flex flex-col items-center">
                  <div className="w-full p-4 bg-slate-800 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-emerald-400">Receipt Preview</h3>
                    <p className="text-xs text-slate-400">Live preview of your generated receipt</p>
                  </div>
                  <div className="flex-1 w-full flex items-center justify-center p-4 overflow-y-auto">
                    <div className="transform scale-90 md:scale-100 transition-transform shadow-2xl">
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
                </div>
              </div>
            } />

            <Route path="/edit-receipt" element={
              <div className="flex-1 flex flex-col-reverse lg:flex-row overflow-hidden">
                {/* Forms Column */}
                <div className="lg:w-3/5 bg-slate-800 overflow-y-auto">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-emerald-400 mb-6">Format Receipt</h2>
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
                </div>

                {/* Preview Column */}
                <div className="lg:w-2/5 bg-slate-900 flex flex-col items-center">
                  <div className="w-full p-4 bg-slate-800 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-emerald-400">Receipt Preview</h3>
                    <p className="text-xs text-slate-400">Live preview of your generated receipt</p>
                  </div>
                  <div className="flex-1 w-full flex items-center justify-center p-4 overflow-y-auto">
                    <div className="transform scale-90 md:scale-100 transition-transform shadow-2xl">
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
                </div>
              </div>
            } />

            <Route path="/data-tools" element={
              <div className="flex-1 flex flex-col-reverse lg:flex-row overflow-hidden">
                {/* Forms Column */}
                <div className="lg:w-3/5 bg-slate-800 overflow-y-auto">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-emerald-400 mb-6">Data Import</h2>
                    <DataTools
                      handleCSV={handleCSV}
                      csvFile={csvFile}
                      regenerateCSVData={regenerateCSVData}
                    />
                  </div>
                </div>

                {/* Preview Column */}
                <div className="lg:w-2/5 bg-slate-900 flex flex-col items-center">
                  <div className="w-full p-4 bg-slate-800 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-emerald-400">Receipt Preview</h3>
                    <p className="text-xs text-slate-400">Live preview of your generated receipt</p>
                  </div>
                  <div className="flex-1 w-full flex items-center justify-center p-4 overflow-y-auto">
                    <div className="transform scale-90 md:scale-100 transition-transform shadow-2xl">
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
                </div>
              </div>
            } />
          </Routes>
        </RedirectHandler>
      </div>
    </main>
  );
}