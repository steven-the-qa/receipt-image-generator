import retailerInfo from './retailerInfo.json'

function mapRetailersByGroupName(groupName) {
    const retailers = retailerInfo.filter(retailer => {
        return retailer.retailerGroup === groupName
    })

    return retailers.map(retailer => {
        return ({
            value: retailer.key,
            label: retailer.displayName
        })
    })
}

const autoOptions = mapRetailersByGroupName('auto')
const dollarOptions = mapRetailersByGroupName('dollar')
const drugOptions = mapRetailersByGroupName('drug')
const groceryOptions = mapRetailersByGroupName('grocery')
const gasConvenienceOptions = mapRetailersByGroupName('gasConvenience')
const massOptions = mapRetailersByGroupName('mass')
const quickServiceOptions = mapRetailersByGroupName('quickService')
const restaurantsOptions = mapRetailersByGroupName('restaurants')
const otherOptions = mapRetailersByGroupName('other')

export const groupedOptions = [
    {
        label: "Auto",
        options: autoOptions
    },
    {
        label: "Dollar",
        options: dollarOptions
    },
    {
        label: "Drug",
        options: drugOptions
    },
    {
        label: "Grocery",
        options: groceryOptions,
    },
    {
        label: "Gas & Convenience",
        options: gasConvenienceOptions,
    },
    {
        label: "Mass",
        options: massOptions
    },
    {
        label: "Quick Service",
        options: quickServiceOptions
    },
    {
        label: "Restaurants",
        options: restaurantsOptions
    },
    {
        label: "Other",
        options: otherOptions
    }
  ];