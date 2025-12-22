import { productNameToUPC, randomInt, randomItem, randomCart } from '../../src/data/ItemSeeder';
import { sampleItems } from '../../src/data/RandomItems';

describe('ItemSeeder utilities', () => {
    const originalMathRandom = Math.random;

    afterEach(() => {
        Math.random = originalMathRandom;
        jest.restoreAllMocks();
    });

    describe('productNameToUPC', () => {
        it('returns UPC for exact product name', () => {
            const { name, upc } = sampleItems[0]!;
            expect(productNameToUPC(name)).toBe(upc);
        });

        it('returns false when product name not found', () => {
            expect(productNameToUPC('Nonexistent Product XYZ')).toBe(false);
        });
    });

    describe('randomInt', () => {
        it('returns min when Math.random() is 0 (inclusive lower bound)', () => {
            Math.random = () => 0;
            expect(randomInt(3, 7)).toBe(3);
        });

        it('returns max when Math.random() is near 1 (inclusive upper bound)', () => {
            Math.random = () => 0.999999999;
            expect(randomInt(3, 7)).toBe(7);
        });
    });

    describe('randomItem', () => {
        it('returns first item when Math.random() is 0', () => {
            Math.random = () => 0;
            expect(randomItem()).toStrictEqual(sampleItems[0]);
        });
    });

    describe('randomCart', () => {
        it('generates a cart with deterministic values when Math.random() is 0', () => {
            Math.random = () => 0;

            const count = 2;
            const cart = randomCart(count);

            const first = sampleItems[0]!;
            const expectedPrice = first.price[0]!.toFixed(2);
            const expectedQty = first.qty[0]!.toFixed(0);

            expect(cart).toEqual([
                [first.name, expectedPrice, expectedQty],
                [first.name, expectedPrice, expectedQty]
            ]);
        });

        it('defaults count to 1 and clamps to minimum of 1', () => {
            Math.random = () => 0;

            expect(randomCart().length).toBe(1);
            expect(randomCart(0).length).toBe(1);
            expect(randomCart(-5).length).toBe(1);
        });
    });
});


