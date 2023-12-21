import { sampleItems } from "./RandomItems";

export const productNameToUPC = (name) => {
    const item = [...sampleItems.filter(p => p.name === name), false][0];
    return item ? item.upc : false;
}

export const randomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const randomItem = () => sampleItems[Math.floor(Math.random() * sampleItems.length)];

export const randomCart = (count) => {
    count = count || 1;
    const cart = [];
    count = Math.max(1, count);
    for (let i = 0; i < count; i++) {
        const itemType = randomItem();
        const price = (Math.random() * (itemType.price[1] - itemType.price[0])) + itemType.price[0];
        const quantity = randomInt(itemType.qty[0], itemType.qty[1]);
        const item = [
            itemType.name,
            price.toFixed(2),
            quantity.toFixed(0)
        ];
        cart.push(item);
    }
    return cart;
};