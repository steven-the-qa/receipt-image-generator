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
    color: '#4cd137',
    fontWeight: 'bold'
  };

  const groupBadgeStyles = {
    backgroundColor: '#1e272e',
    borderRadius: '2em',
    color: '#4cd137',
    display: 'inline-block',
    fontSize: 8,
    fontWeight: 'normal',
    lineHeight: '1',
    minWidth: 1,
    padding: '0.16666666666667em 0.5em',
    textAlign: 'center',
  };

  const formatGroupLabel = data => (
    <div style={groupStyles}>
      <span>{data.label}</span>
      <span style={groupBadgeStyles}>{data.options.length}</span>
    </div>
  );

  const selectStyles = {
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#1e272e',
      width: '70%',
      minWidth: '250px'
    }),
    option: (provided, state) => ({
      ...provided,
      color: state.isFocused 
        ? '#1e272e'
        : '#f5f6fa',
      backgroundImage: state.isFocused 
        ? 'linear-gradient(to left, #f5f6fa, #4cd137)' 
        : '',
      backgroundColor: state.isFocused
        ? ''
        : '#1e272e',
      height: 25,
      paddingTop: 5
    }),
    control: (provided) => ({
      ...provided,
      backgroundImage: 'linear-gradient(to left, #1e272e, #4cd137)',
      display: 'flex',
      width: '70%',
      minWidth: '250px',
      border: 0,
      boxShadow: 'none',
      cursor: 'pointer'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#f5f6fa'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#f5f6fa'
    })
  }
  return (
    <Select id='storeSelect' 
      options={groupedOptions} 
      styles={selectStyles} 
      onChange={props.onChange} 
      name={props.name} 
      value={props.value} 
      placeholder={placeholder} 
      formatGroupLabel={formatGroupLabel}
    />
  )
}