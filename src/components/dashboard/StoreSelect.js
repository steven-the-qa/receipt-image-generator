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
    color: 'green',
    fontWeight: 'bold'
  };

  const groupBadgeStyles = {
    backgroundColor: 'white',
    borderRadius: '2em',
    color: '#300D38',
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
      backgroundColor: '#300D38',
      width: '70%',
      minWidth: '250px'
    }),
    option: (provided, state) => ({
      ...provided,
      color: state.isFocused 
        ? '#300D38'
        : 'white',
      backgroundImage: state.isFocused 
        ? 'linear-gradient(to left, white, green)' 
        : '',
      backgroundColor: state.isFocused
        ? ''
        : '#300D38',
      height: 25,
      paddingTop: 5
    }),
    control: (provided) => ({
      ...provided,
      backgroundImage: 'linear-gradient(to left, white, green)',
      display: 'flex',
      width: '70%',
      minWidth: '250px',
      border: 0,
      boxShadow: 'none',
      cursor: 'pointer'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#300D38'
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