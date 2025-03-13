import React from 'react'
import Select from 'react-select'
import { groupedOptions } from '../../data/selectData'

export default function StoreSelect(props) {
  const category = groupedOptions.find( (channel) => channel.options.find(({value}) => value === props.value))
  const placeholder = category.options.find(({value}) => value === props.value).label
  
  const groupStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#10b981',
    fontWeight: 'bold',
    padding: '8px 12px'
  };

  const groupBadgeStyles = {
    backgroundColor: '#1e293b',
    borderRadius: '9999px',
    color: '#10b981',
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: 'normal',
    padding: '0.25em 0.7em',
    minWidth: '1.5rem',
    textAlign: 'center',
  };

  const formatGroupLabel = data => (
    <div style={groupStyles}>
      <span>{data.label}</span>
      <span style={groupBadgeStyles}>{data.options.length}</span>
    </div>
  );

  const selectStyles = {
    container: (provided) => ({
      ...provided,
      width: '100%',
    }),
    control: (provided, state) => ({
      ...provided,
      background: '#1e293b',
      borderColor: state.isFocused ? '#10b981' : '#475569',
      boxShadow: state.isFocused ? '0 0 0 1px #10b981' : 'none',
      borderRadius: '0.375rem',
      '&:hover': {
        borderColor: '#10b981',
      },
      padding: '2px',
      transition: 'all 150ms',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#1e293b',
      borderRadius: '0.375rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '5px',
    }),
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? 'white' : '#cbd5e1',
      backgroundColor: state.isSelected 
        ? '#10b981' 
        : state.isFocused 
          ? '#334155' 
          : '#1e293b',
      borderRadius: '0.25rem',
      transition: 'background-color 150ms',
      cursor: 'pointer',
      ':active': {
        backgroundColor: state.isSelected ? '#0d9488' : '#334155',
      },
    }),
    input: (provided) => ({
      ...provided,
      color: '#e2e8f0',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#e2e8f0',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#94a3b8',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#334155',
      borderRadius: '0.25rem',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#e2e8f0',
      fontSize: '0.875rem',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#94a3b8',
      ':hover': {
        backgroundColor: '#475569',
        color: '#e2e8f0',
      },
    }),
  };
  
  return (
    <Select
      id='storeSelect' 
      options={groupedOptions} 
      styles={selectStyles} 
      onChange={props.onChange} 
      name={props.name} 
      value={props.value} 
      placeholder={placeholder} 
      formatGroupLabel={formatGroupLabel}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: '#10b981',
          primary75: '#10b981cc',
          primary50: '#10b98199',
          primary25: '#10b98133',
        },
      })}
    />
  )
}