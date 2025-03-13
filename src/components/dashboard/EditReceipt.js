import React from 'react'
import MissingInfoChecklist from './MissingInfoChecklist'

export default function EditReceipt(props) {
    return (
        <div className="space-y-8">
            <div className="bg-slate-700 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path>
                    </svg>
                    Receipt Visibility Settings
                </h3>
                
                <div className="text-sm text-slate-300 mb-4">
                    Control which elements appear on your receipt
                </div>
                
                <MissingInfoChecklist 
                    handleChange={props.handleChange} 
                    inputData={props.inputData}
                    missingInfoScenarios={props.missingInfoScenarios}
                />
            </div>
            
            <div className="bg-slate-700 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path>
                    </svg>
                    Receipt Format Options
                </h3>
                
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <button 
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border ${props.europeanFormat ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'} transition-colors`}
                        onClick={props.handleFormat}
                    >
                        <span className="text-xl mb-1">$</span>
                        <span className="text-xs">USD Format</span>
                    </button>
                    
                    <button 
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border ${!props.europeanFormat ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'} transition-colors`}
                        onClick={props.handleFormat}
                    >
                        <span className="text-xl mb-1">$</span>
                        <span className="text-xs">CAD Format</span>
                    </button>
                    
                    <button 
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border ${props.blurryReceipt ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'} transition-colors`}
                        onClick={props.handleBlur}
                    >
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                        </svg>
                        <span className="text-xs">{props.blurryReceipt ? 'Clear' : 'Blur'}</span>
                    </button>
                    
                    <button 
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border ${props.suppressDollarSign ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'} transition-colors`}
                        onClick={props.handleDollarSign}
                    >
                        <div className="text-xl mb-1 relative">
                            <span>$</span>
                            {props.suppressDollarSign && <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current transform -rotate-45"></div>}
                        </div>
                        <span className="text-xs">{props.suppressDollarSign ? 'Show $' : 'Hide $'}</span>
                    </button>
                </div>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
                    </svg>
                    Typography Settings
                </h3>
                
                <button 
                    className="w-full flex items-center justify-center p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg transition-colors"
                    onClick={props.toggleTypeface}
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path>
                    </svg>
                    Toggle Typeface
                </button>
            </div>
        </div>
    )
}