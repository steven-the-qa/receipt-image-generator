import React from "react";
import { Link } from "react-router-dom";
import { FaReceipt, FaEdit, FaDatabase } from "react-icons/fa";

const Tabs = () => {
  const formContainerStyles = 'bg-dark-gray text-white flex justify-between items-center p-4 rounded-b-lg'
  const navContainerStyles = 'flex justify-center items-center p-3 mr-5 text-lg bg-gradient-to-l from-black to-green text-white duration-[250ms] rounded-lg hover:from-dark-gray hover:to-dark-green'
  const navContainerIconStyles = 'text-center flex justify-center content-center text-2xl mb-1'
  const navContainerLinkStyles = 'flex flex-col justify-center items-center no-underline'

  return (
    <div className="w-full mb-6">
      <h1 className='flex justify-center items-center text-green text-3xl font-bold mb-4 pt-4'>Receipt Image Generator</h1>
      <div className={formContainerStyles}>
        <Link to='/' className={navContainerStyles}>
          <div className={navContainerLinkStyles}>
              <div className={navContainerIconStyles}><FaReceipt /></div>
              <p>
                Create Receipt
              </p>
          </div>
        </Link>

        <Link to="/edit-receipt" className={navContainerStyles}>
          <div className={navContainerLinkStyles}>
            <div className={navContainerIconStyles}><FaEdit/> </div>
              <p>
                Edit Receipt
              </p>
          </div>
        </Link>

        <Link to="/data-tools" className={navContainerStyles}>
          <div className={navContainerLinkStyles}>
            <div className={navContainerIconStyles}><FaDatabase/> </div>
              <p>
                Data Tools
              </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Tabs;
