import React from 'react'

function DataTools(props) {
    return (
        <div className="space-y-8">
            <div className="bg-slate-700 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    CSV Data Import
                </h3>
                
                <p className="text-slate-300 mb-4 text-sm">
                    Import your receipt data in CSV format for bulk item addition.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                    <div className="w-full sm:w-auto">
                        <div className="relative bg-slate-800 rounded-lg overflow-hidden">
                            <input 
                                type="file" 
                                accept=".csv" 
                                multiple={false} 
                                onChange={props.handleCSV} 
                                name="file" 
                                id="file" 
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" 
                            />
                            <label 
                                htmlFor="file" 
                                className="flex items-center justify-center py-3 px-4 bg-slate-800 text-slate-200 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                                </svg>
                                {props.csvFile ? 'Change CSV File' : 'Select CSV File'}
                            </label>
                        </div>
                    </div>
                    
                    <button 
                        className="w-full sm:w-auto flex items-center justify-center py-3 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
                        onClick={props.regenerateCSVData}
                        disabled={!props.csvFile}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Add Another Copy
                    </button>
                </div>
                
                {props.csvFile ? (
                    <div className="bg-emerald-900/30 border border-emerald-600/30 rounded-lg p-4 mt-4 text-sm">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div className="ml-3">
                                <p className="text-emerald-400 font-medium">CSV File Loaded Successfully</p>
                                <p className="text-slate-300 mt-1">{props.csvFile.name}</p>
                                <p className="text-slate-400 mt-1 text-xs">Use the "Add Another Copy" button to add these items again.</p>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
            
            <div className="bg-slate-700 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    CSV Format Requirements
                </h3>
                
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                    <p className="text-slate-300 mb-3">Your CSV file should follow this format:</p>
                    <div className="bg-slate-900 p-3 rounded text-sm font-mono overflow-x-auto mb-3">
                        <code className="text-emerald-400">description, price, quantity</code>
                    </div>
                    
                    <p className="text-slate-300 mb-2">Example:</p>
                    <div className="bg-slate-900 p-3 rounded text-sm font-mono overflow-x-auto">
                        <code className="text-slate-300">
                            Coffee, 3.50, 1<br />
                            Bagel, 2.25, 2<br />
                            Cream Cheese, 0.75, 1
                        </code>
                    </div>
                </div>
                
                <div className="mt-4 text-xs text-slate-400">
                    <p>The first row should be the header row (column names).</p>
                    <p className="mt-1">Subsequent rows will be added as items to your receipt.</p>
                </div>
            </div>
        </div>
    )
}

export default DataTools