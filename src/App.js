import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment'
import Papa from 'papaparse'
import * as retailerInfo from './data/retailerInfo.json'
import Receipt from './components/receipt/Receipt'
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom'
import CreateReceipt from './components/dashboard/CreateReceipt'
import DataTools from './components/dashboard/DataTools'
import EditReceipt from './components/dashboard/EditReceipt'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import SavedReceipts from './components/receipts/SavedReceipts'
import { authAPI, receiptsAPI } from './services/api'

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
  const navigate = useNavigate();
  const BASE_RECEIPT_HEIGHT = 350;
  const storeData = retailerInfo.default
  const defaultStore = storeData.filter(store => store.key === '7eleven')[0]
  const [restaurant, setRestaurant] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentTypeface, setCurrentTypeface] = useState('font-sans')
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
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [saveReceiptLoading, setSaveReceiptLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu (with option to delay)
  const closeMobileMenu = (delay = 0) => {
    if (delay) {
      setTimeout(() => {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth < 768) {
          sidebar.classList.add('hidden');
          setMobileMenuOpen(false);
        }
      }, delay);
    } else {
      const sidebar = document.getElementById('sidebar');
      if (window.innerWidth < 768) {
        sidebar.classList.add('hidden');
        setMobileMenuOpen(false);
      }
    }
  };

  // After adding an item on mobile, scroll back to the form
  const handleMobileItemAdd = () => {
    updateItems();
    
    // On mobile, scroll to see the preview after a short delay
    if (window.innerWidth < 768) {
      setTimeout(() => {
        const previewSection = document.querySelector('.md\\:hidden.w-full.bg-slate-900');
        if (previewSection) {
          previewSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // After updating form settings on mobile, scroll to see the preview
  const handleMobileFormUpdate = (updateFn) => {
    updateFn();
    
    // On mobile, scroll to see the preview after a short delay
    if (window.innerWidth < 768) {
      setTimeout(() => {
        const previewSection = document.querySelector('.md\\:hidden.w-full.bg-slate-900');
        if (previewSection) {
          previewSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

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
      bulkPrices.push(parseFloat(csvData[i][1]))
      bulkQuantities.push(parseInt(csvData[i][2]))
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
    
    // Calculate the new total after importing items
    let newSubtotal = 0
    for (let i = 0; i < receiptItemsUpdate.length; i++) {
      if (receiptItemsUpdate[i][1] && receiptItemsUpdate[i][2]) {
        newSubtotal += (receiptItemsUpdate[i][2] * receiptItemsUpdate[i][1])
      }
    }
    setSubtotal(Math.ceil(newSubtotal * 100)/100)
    // Calculate total directly from the new subtotal value
    const newTotal = (Math.ceil(newSubtotal * 100)/100 * tax) + Math.ceil(newSubtotal * 100)/100
    setTotal(newTotal)
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
    // Visibility is now controlled via props, so this function just serves as an 
    // event handler for the checkbox settings in EditReceipt
    // No DOM manipulation needed
  }, []);

  function toggleTypeface() {
    setCurrentTypeface(prev => prev === 'font-sans' ? 'font-mono' : 'font-sans');
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
    let newSubtotal = 0

    for (let i = 0; i < receiptItems.length; i++) {
      if (receiptItems[i][1] && receiptItems[i][2]) {
        newSubtotal += (receiptItems[i][2] * receiptItems[i][1])
      }
    }
    const roundedSubtotal = Math.ceil(newSubtotal * 100)/100
    setSubtotal(roundedSubtotal)
    // Calculate total directly from the calculated subtotal value
    const newTotal = (roundedSubtotal * tax) + roundedSubtotal
    setTotal(newTotal)
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
    let newSubtotal = 0
    for (let i = 0; i < receiptItems.length; i++) {
      if (receiptItems[i][1] && receiptItems[i][2]) {
        newSubtotal += (receiptItems[i][2] * receiptItems[i][1])
      }
    }
    const roundedSubtotal = Math.ceil(newSubtotal * 100)/100
    setSubtotal(roundedSubtotal)
    // Calculate total directly from the calculated subtotal value
    const newTotal = (roundedSubtotal * tax) + roundedSubtotal
    setTotal(newTotal)
  }, [receiptItems, tax]);

  useEffect(() => inputData.address2 ? setReceiptLength(375) : setReceiptLength(BASE_RECEIPT_HEIGHT), [inputData.address2]);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogin(userData) {
    setUser(userData);
  }

  async function handleLogout() {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  function loadReceipt(receipt) {
    // Load receipt data into editor state
    setInputData({
      storeName: receipt.store_name,
      purchaseDate: receipt.purchase_date,
      purchaseTime: receipt.purchase_time,
      address1: receipt.address1 || '',
      address2: receipt.address2 || '',
      city: receipt.city || '',
      state: receipt.state || '',
      zip: receipt.zip || '',
      phone: receipt.phone || '',
      itemDescription: '',
      itemPrice: '',
      itemQuantity: '',
      numOfCopies: 1,
      storeNameBox: receipt.store_name_box ?? true,
      storeAddressBox: receipt.store_address_box ?? true,
      storePhoneBox: receipt.store_phone_box ?? true,
      storeBox: receipt.store_box ?? true,
      purchaseDateBox: receipt.purchase_date_box ?? true,
      totalSpentBox: receipt.total_spent_box ?? true
    });
    
    setCustomStore({
      useCustomStoreName: receipt.use_custom_store_name || false,
      customStoreName: receipt.custom_store_name || ''
    });
    
    setRestaurant(receipt.is_restaurant || false);
    setEuropeanFormat(receipt.european_format || false);
    setBlurryReceipt(receipt.blurry_receipt || false);
    setSuppressDollarSign(receipt.suppress_dollar_sign !== undefined ? receipt.suppress_dollar_sign : true);
    setCurrentTypeface(receipt.current_typeface || 'font-sans');
    
    // Load receipt items
    const items = receipt.receipt_items || [];
    setReceiptItems(items);
    setReceiptItemsCount(items.length);
    
    // Set totals
    setSubtotal(receipt.subtotal || 0);
    setTotal(receipt.total || 0);
    
    // Calculate receipt length
    let calculatedLength = BASE_RECEIPT_HEIGHT;
    if (receipt.address2) calculatedLength = 375;
    if (items.length > 0) {
      calculatedLength += items.length * 35;
    }
    setReceiptLength(calculatedLength);
    
    // Navigate to edit route
    navigate('/edit-receipt');
  }

  async function saveReceipt() {
    if (!user) {
      setNotification({
        message: 'Please log in to save receipts',
        type: 'error'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (receiptItems.length === 0) {
      setNotification({
        message: 'Please add at least one item before saving',
        type: 'error'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setSaveReceiptLoading(true);
    try {
      // Ensure receipt_items have correct types (price and quantity as numbers)
      const normalizedReceiptItems = receiptItems.map(item => [
        item[0], // description (string)
        item[1] === null ? null : (typeof item[1] === 'string' ? parseFloat(item[1]) : item[1]), // price (number | null)
        typeof item[2] === 'string' ? parseInt(item[2], 10) : item[2] // quantity (number)
      ]);

      const receiptData = {
        store_name: inputData.storeName,
        custom_store_name: customStore.customStoreName || null,
        use_custom_store_name: customStore.useCustomStoreName,
        address1: restaurant ? inputData.address1 : null,
        address2: restaurant ? inputData.address2 : null,
        city: restaurant ? inputData.city : null,
        state: restaurant ? inputData.state : null,
        zip: restaurant ? inputData.zip : null,
        phone: restaurant ? inputData.phone : null,
        purchase_date: inputData.purchaseDate,
        purchase_time: inputData.purchaseTime,
        receipt_items: normalizedReceiptItems,
        subtotal: typeof subtotal === 'string' ? parseFloat(subtotal) : subtotal,
        tax: typeof tax === 'string' ? parseFloat(tax) : tax,
        total: typeof total === 'string' ? parseFloat(total) : total,
        european_format: europeanFormat,
        suppress_dollar_sign: suppressDollarSign,
        blurry_receipt: blurryReceipt,
        current_typeface: currentTypeface,
        is_restaurant: restaurant,
        store_name_box: inputData.storeNameBox,
        store_address_box: inputData.storeAddressBox,
        store_phone_box: inputData.storePhoneBox,
        store_box: inputData.storeBox,
        purchase_date_box: inputData.purchaseDateBox,
        total_spent_box: inputData.totalSpentBox,
        is_favorite: false,
      };

      await receiptsAPI.create(receiptData);
      
      // Show success notification
      setNotification({
        message: 'Receipt saved successfully!',
        type: 'success'
      });
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err) {
      // Show error notification
      setNotification({
        message: err.message || 'Failed to save receipt',
        type: 'error'
      });
      
      // Auto-hide notification after 5 seconds for errors
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } finally {
      setSaveReceiptLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in ${
          notification.type === 'success' 
            ? 'bg-emerald-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
      <main className="flex flex-col md:flex-row h-screen bg-slate-900 text-white md:overflow-hidden overflow-auto">
        {/* Mobile Navigation Toggle Button */}
      <div className="md:hidden bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
        <h1 className="text-xl font-bold text-emerald-400">Receipt Generator</h1>
        <button 
          onClick={toggleMobileMenu}
          className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </div>

      {/* Left Sidebar - Navigation */}
      <aside id="sidebar" className="hidden md:flex w-full md:w-64 bg-slate-800 border-r border-slate-700 flex-col">
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
                onClick={() => closeMobileMenu(50)}
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
                onClick={() => closeMobileMenu(50)}
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
                onClick={() => closeMobileMenu(50)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                </svg>
                Data Import
              </NavLink>
            </li>
            {user && (
              <li>
                <NavLink 
                  to="/saved-receipts" 
                  className={({isActive}) => 
                    `flex items-center p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-slate-300 hover:bg-slate-700'
                    }`
                  }
                  onClick={() => closeMobileMenu(50)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                  </svg>
                  Saved Receipts
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-700">
          {user ? (
            <div className="space-y-2">
              <div className="text-sm text-slate-400 px-3 py-2">
                Logged in as <span className="text-emerald-400 font-semibold">{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center p-3 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Logout
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="flex items-center p-3 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
              onClick={() => closeMobileMenu(50)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
              Login
            </NavLink>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-auto">
        <RedirectHandler>
          <Routes>
            <Route path="/" element={
              <div className="flex-1 flex flex-col overflow-visible">
                {/* Preview Section - Mobile View (top) */}
                <div className="lg:hidden w-full bg-slate-900 border-b border-slate-700">
                  <div className="w-full p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-400">Receipt Preview</h3>
                      <p className="text-xs text-slate-400">Live preview of your generated receipt</p>
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-center p-4">
                    <div className="transform scale-75 transition-transform shadow-2xl">
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
                        currentTypeface={currentTypeface}
                      />
                    </div>
                  </div>
                </div>

                {/* Main Layout with Forms and Preview */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-visible">
                  {/* Forms Column */}
                  <div className="w-full lg:w-3/5 bg-slate-800 overflow-visible md:overflow-auto">
                    <div className="p-4 md:p-6">
                      <div className="flex justify-between items-center mb-4 md:mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-emerald-400">Create Your Receipt</h2>
                        {user && (
                          <button
                            onClick={saveReceipt}
                            disabled={saveReceiptLoading || receiptItems.length === 0}
                            className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            {saveReceiptLoading ? 'Saving...' : 'Save Receipt'}
                          </button>
                        )}
                      </div>
                      <CreateReceipt
                        handleChange={handleChange}
                        handleSelect={handleSelect}
                        handleCustomStoreNameChange={handleCustomStoreNameChange}
                        isRestaurant={restaurant}
                        inputData={inputData}
                        updateItems={window.innerWidth < 768 ? handleMobileItemAdd : updateItems}
                        clearItems={clearItems}
                        refreshDate={() => handleMobileFormUpdate(refreshDate)}
                        allowAddressEdit={() => handleMobileFormUpdate(() => allowAddressEdit())}
                        clearAddress={clearAddress}
                        handleCustomStoreToggle={() => handleMobileFormUpdate(handleCustomStoreToggle)}
                        subItem={window.innerWidth < 768 ? () => handleMobileFormUpdate(subItem) : subItem}
                      />
                    </div>
                  </div>

                  {/* Preview Column - Desktop View (right side) */}
                  <div className="hidden lg:flex lg:w-2/5 bg-slate-900 flex-col items-center overflow-auto">
                    <div className="w-full p-4 bg-slate-800 border-b border-slate-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-emerald-400">Receipt Preview</h3>
                          <p className="text-xs text-slate-400">Live preview of your generated receipt</p>
                        </div>
                      </div>
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
                          currentTypeface={currentTypeface}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } />

            <Route path="/edit-receipt" element={
              <div className="flex-1 flex flex-col overflow-visible">
                {/* Preview Section - Mobile View (top) */}
                <div className="lg:hidden w-full bg-slate-900 border-b border-slate-700">
                  <div className="w-full p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-400">Receipt Preview</h3>
                      <p className="text-xs text-slate-400">Live preview of your generated receipt</p>
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-center p-4">
                    <div className="transform scale-75 transition-transform shadow-2xl">
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
                        currentTypeface={currentTypeface}
                      />
                    </div>
                  </div>
                </div>

                {/* Main Layout with Forms and Preview */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-visible">
                  {/* Forms Column */}
                  <div className="w-full lg:w-3/5 bg-slate-800 overflow-visible md:overflow-auto">
                    <div className="p-4 md:p-6">
                      <div className="flex justify-between items-center mb-4 md:mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-emerald-400">Format Receipt</h2>
                        {user && (
                          <button
                            onClick={saveReceipt}
                            disabled={saveReceiptLoading || receiptItems.length === 0}
                            className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            {saveReceiptLoading ? 'Saving...' : 'Save Receipt'}
                          </button>
                        )}
                      </div>
                      <EditReceipt
                        handleChange={handleChange}
                        inputData={inputData}
                        handleFormat={() => handleMobileFormUpdate(handleFormat)}
                        handleDollarSign={() => handleMobileFormUpdate(handleDollarSign)}
                        handleBlur={() => handleMobileFormUpdate(handleBlur)}
                        handleCustomStoreToggle={() => handleMobileFormUpdate(handleCustomStoreToggle)}
                        handleCustomStoreNameChange={() => handleMobileFormUpdate(handleCustomStoreNameChange)}
                        blurryReceipt={blurryReceipt}
                        europeanFormat={europeanFormat}
                        suppressDollarSign={suppressDollarSign}
                        toggleTypeface={toggleTypeface}
                        missingInfoScenarios={missingInfoScenarios}
                      />
                    </div>
                  </div>

                  {/* Preview Column - Desktop View (right side) */}
                  <div className="hidden lg:flex lg:w-2/5 bg-slate-900 flex-col items-center overflow-auto">
                    <div className="w-full p-4 bg-slate-800 border-b border-slate-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-emerald-400">Receipt Preview</h3>
                          <p className="text-xs text-slate-400">Live preview of your generated receipt</p>
                        </div>
                      </div>
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
                          currentTypeface={currentTypeface}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } />

            <Route path="/data-tools" element={
              <div className="flex-1 flex flex-col overflow-visible">
                {/* Preview Section - Mobile View (top) */}
                <div className="lg:hidden w-full bg-slate-900 border-b border-slate-700">
                  <div className="w-full p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-400">Receipt Preview</h3>
                      <p className="text-xs text-slate-400">Live preview of your generated receipt</p>
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-center p-4">
                    <div className="transform scale-75 transition-transform shadow-2xl">
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
                        currentTypeface={currentTypeface}
                      />
                    </div>
                  </div>
                </div>

                {/* Main Layout with Forms and Preview */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-visible">
                  {/* Forms Column */}
                  <div className="w-full lg:w-3/5 bg-slate-800 overflow-visible md:overflow-auto">
                    <div className="p-4 md:p-6">
                      <h2 className="text-xl md:text-2xl font-bold text-emerald-400 mb-4 md:mb-6">Data Import</h2>
                      <DataTools
                        handleCSV={handleCSV}
                        csvFile={csvFile}
                        regenerateCSVData={() => handleMobileFormUpdate(regenerateCSVData)}
                      />
                    </div>
                  </div>

                  {/* Preview Column - Desktop View (right side) */}
                  <div className="hidden lg:flex lg:w-2/5 bg-slate-900 flex-col items-center overflow-auto">
                    <div className="w-full p-4 bg-slate-800 border-b border-slate-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-emerald-400">Receipt Preview</h3>
                          <p className="text-xs text-slate-400">Live preview of your generated receipt</p>
                        </div>
                      </div>
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
                          currentTypeface={currentTypeface}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } />

            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/saved-receipts" element={
              user ? (
                <SavedReceipts user={user} onLoadReceipt={loadReceipt} />
              ) : (
                <div className="flex items-center justify-center h-screen">
                  <div className="text-center">
                    <p className="text-slate-400 mb-4">Please log in to view saved receipts</p>
                    <NavLink to="/login" className="text-emerald-400 hover:text-emerald-300">
                      Go to Login
                    </NavLink>
                  </div>
                </div>
              )
            } />
          </Routes>
        </RedirectHandler>
      </div>
    </main>
    </>
  );
}