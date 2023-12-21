import React from "react";
import { Link } from "react-router-dom";
import { FaReceipt, FaEdit, FaDatabase } from "react-icons/fa";

const Tabs = () => {
  const formContainerStyles = 'bg-black text-black flex justify-between items-center'
  const navContainerStyles = 'flex justify-center items-center p-3 mr-5 text-lg bg-gradient-to-l from-white to-green bg-green duration-[250ms]'
  const navContainerIconStyles = 'text-center flex justify-center content-center text-2xl'
  const navContainerLinkStyles = 'flex flex-col justify-center items-center no-underline'

  return (
    <div className={formContainerStyles}>

      <Link to='/create-receipt' className={navContainerStyles}>
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
  );
};

export default Tabs;
