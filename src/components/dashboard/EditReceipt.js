import React from 'react'
import MissingInfoChecklist from './MissingInfoChecklist'

export default function EditReceipt(props) {
    return (
        <div className='text-xs w-[40rem]'>
            <h2 className='text-xl mb-5 text-black'>Missing Info Scenarios</h2>
            <MissingInfoChecklist 
              handleChange={props.handleChange} 
              inputData={props.inputData}
              missingInfoScenarios={props.missingInfoScenarios}
            />
            
            <h2 className='text-xl mb-5 text-black'>Receipt Formatting Toggles</h2>
            <div className='flex justify-start'>
              <button className='justify-center items-center bg-gradient-to-l from-white to-green text-black rounded p-3 mr-5 duration-[250ms] border border-black' onClick={props.europeanFormat}>Canadian Prices</button>
              <button className='justify-center items-center bg-gradient-to-l from-white to-green text-black rounded p-3 mr-5 duration-[250ms] border border-black' onClick={props.handleBlur}>Blurry Receipt</button>
              <button className='justify-center items-center bg-gradient-to-l from-white to-green text-black rounded p-3 mr-5 duration-[250ms] border border-black' onClick={props.toggleTypeface}>Monospace Font</button>
              <button className='justify-center items-center bg-gradient-to-l from-white to-green text-black rounded p-3 duration-[250ms] border border-black' onClick={props.handleDollarSign}>$ Total</button>
            </div>
        </div>
    )
}