import React from 'react'
import MissingInfoChecklist from './MissingInfoChecklist'

export default function EditReceipt(props) {
    return (
        <div className='flex flex-col items-center justify-center text-xs'>
            <h2 className='text-xl my-5 text-green'>Missing Info Scenarios</h2>
            <MissingInfoChecklist 
              handleChange={props.handleChange} 
              inputData={props.inputData}
              missingInfoScenarios={props.missingInfoScenarios}
            />
            
            <h2 className='text-xl my-5 text-green'>Receipt Formatting Toggles</h2>
            <div className='flex flex-wrap justify-center mb-5 gap-3'>
              <button className='justify-center items-center bg-gradient-to-l from-black to-green text-white rounded p-3 duration-[250ms] hover:from-dark-gray hover:to-dark-green' onClick={props.handleFormat}>Canadian Prices</button>
              <button className='justify-center items-center bg-gradient-to-l from-black to-green text-white rounded p-3 duration-[250ms] hover:from-dark-gray hover:to-dark-green' onClick={props.handleBlur}>Blurry Receipt</button>
              <button className='justify-center items-center bg-gradient-to-l from-black to-green text-white rounded p-3 duration-[250ms] hover:from-dark-gray hover:to-dark-green' onClick={props.toggleTypeface}>Monospace Font</button>
              <button className='justify-center items-center bg-gradient-to-l from-black to-green text-white rounded p-3 duration-[250ms] hover:from-dark-gray hover:to-dark-green' onClick={props.handleDollarSign}>$ Total</button>
            </div>
        </div>
    )
}