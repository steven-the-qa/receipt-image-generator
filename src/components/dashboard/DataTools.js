import React from 'react'

function DataTools(props) {
    return (
        <div className='flex flex-col items-center text-xs my-5'>
            <h2 className='text-xl mb-5 text-green'>Bulk-Add Items</h2>
            <div className='flex justify-center mb-5'>
                <div className='flex flex-col mr-3'>
                    <input type="file" accept=".csv" multiple={false} onChange={props.handleCSV} name="file" id="file" className="focus:bg-gray w-[0.1px] opacity-0 overflow-hidden absolute -z-[1] rounded text-black bg-white duration-[250ms]" />
                    <label className='rounded p-3 bg-gradient-to-l from-black to-green text-white duration-[250ms] hover:from-dark-gray hover:to-dark-green cursor-pointer' htmlFor="file">Select a CSV file</label>
                </div>
                <button 
                    className='bg-gradient-to-l from-black to-green text-white rounded p-3 duration-[250ms] hover:from-dark-gray hover:to-dark-green' 
                    onClick={props.regenerateCSVData}
                    disabled={!props.csvFile}
                >
                    Add Another Copy
                </button>
            </div>

            <h2 className='text-xl mb-5 text-green'>Current CSV File</h2>
            <div className='text-white mb-5'>
                {props.csvFile ? (
                    <p>Selected file: {props.csvFile.name}</p>
                ) : (
                    <p>No CSV file selected</p>
                )}
            </div>

            <p className='text-white text-center mb-5 max-w-lg'>
                <span className='text-green font-bold'>CSV Format:</span><br />
                Your CSV file should follow this format:<br />
                description, price, quantity<br />
                <span className='text-xs opacity-70'>
                    Example: soda, 1.99, 1
                </span>
            </p>
        </div>
    )
}

export default DataTools