# Unit Testing Guide for Jest

This guide provides principles and patterns for writing high-quality, maintainable unit tests in our Jest suite.

## Core Principles

### 1. Test Business Logic, Not Wrappers

❌ **Don't:** Mock so heavily that you're only testing your mocks

```javascript
// Bad - mocking everything means we're not testing real logic
const mockSampleItems = {
    filter: jest.fn().mockReturnValue([{ name: "Test", upc: "123" }])
};
const result = productNameToUPC("Test");
expect(mockSampleItems.filter).toHaveBeenCalled(); // Only testing the mock!
```

✅ **Do:** Test pure business logic without excessive mocking

```javascript
// Good - testing actual logic
describe("resolveAssetPath", () => {
    it("normalizes leading slash and returns path with leading slash", () => {
        const inputPath = "/images/stores/walmart.png";
        const expectedPath = "/images/stores/walmart.png";

        const result = resolveAssetPath(inputPath);

        expect(result).toBe(expectedPath);
    });
});
```

**When to Mock:**

-   External services (HTTP clients, databases, file system)
-   Time-dependent functions (`Date.now()`, timers)
-   Random number generators
-   System resources

**When NOT to Mock:**

-   Pure functions (input → output, no side effects)
-   Simple utility functions
-   Internal business logic
-   Type definitions

### 2. Refactor for Testability

When you encounter code that's hard to test due to tight coupling, consider refactoring before writing tests.

❌ **Before:** Tightly coupled, hard to test

```javascript
// Bad - business logic embedded in random generation
export const randomCart = (count) => {
    count = count || 1;
    const cart = [];
    count = Math.max(1, count);
    for (let i = 0; i < count; i++) {
        const itemType = randomItem();
        // Business logic: price calculation embedded here
        const price = (Math.random() * (itemType.price[1] - itemType.price[0])) + itemType.price[0];
        const quantity = randomInt(itemType.qty[0], itemType.qty[1]);
        cart.push([itemType.name, price.toFixed(2), quantity.toFixed(0)]);
    }
    return cart;
};
```

✅ **After:** Extracted, testable logic

```javascript
// Pure function - easy to test!
export function calculateRandomPrice(minPrice, maxPrice) {
    return (Math.random() * (maxPrice - minPrice)) + minPrice;
}

// Orchestration function - test with mocked Math.random
export const randomCart = (count) => {
    count = count || 1;
    const cart = [];
    count = Math.max(1, count);
    for (let i = 0; i < count; i++) {
        const itemType = randomItem();
        const price = calculateRandomPrice(itemType.price[0], itemType.price[1]);
        const quantity = randomInt(itemType.qty[0], itemType.qty[1]);
        cart.push([itemType.name, price.toFixed(2), quantity.toFixed(0)]);
    }
    return cart;
};

// Unit test
describe("calculateRandomPrice", () => {
    it("returns value within price range", () => {
        const minPrice = 3.99;
        const maxPrice = 5.99;
        
        Math.random = () => 0.5; // Middle value
        const price = calculateRandomPrice(minPrice, maxPrice);
        
        expect(price).toBeGreaterThanOrEqual(minPrice);
        expect(price).toBeLessThanOrEqual(maxPrice);
    });
});
```

### 3. No Magic Numbers

Use named constants to make tests self-documenting.

❌ **Don't:** Use unexplained numbers

```javascript
it("generates cart with items", () => {
    expect(randomCart(2).length).toBe(2);
    expect(randomCart(0).length).toBe(1);
    expect(randomCart(-5).length).toBe(1);
});
```

✅ **Do:** Name your values to explain their purpose

```javascript
it("defaults count to 1 and clamps to minimum of 1", () => {
    const validCount = 2;
    const zeroCount = 0;
    const negativeCount = -5;
    const minimumAllowedCount = 1;

    expect(randomCart(validCount).length).toBe(validCount);
    expect(randomCart(zeroCount).length).toBe(minimumAllowedCount);
    expect(randomCart(negativeCount).length).toBe(minimumAllowedCount);
});
```

**When Numbers Are Obvious:** Simple, self-explanatory values don't need variables:

```javascript
it("returns false when product name not found", () => {
    expect(productNameToUPC("Nonexistent Product XYZ")).toBe(false);
});

it("returns min when Math.random() is 0", () => {
    Math.random = () => 0;
    expect(randomInt(3, 7)).toBe(3);
});
```

### 4. Test Realistic Scenarios

Focus on what can actually happen in production, not contrived edge cases for coverage.

❌ **Don't:** Test impossible or meaningless scenarios

```javascript
// Bad - when would a store key ever be a number in production?
it("handles numeric store keys", () => {
    expect(getStoreImageData(12345)).toBeNull();
});

// Bad - testing implementation detail, not behavior
it("calls formatStoreName exactly once", () => {
    const spy = jest.spyOn(storeImageRegistry, "formatStoreName");
    getStoreImageData("walmart");
    expect(spy).toHaveBeenCalledTimes(1);
});
```

✅ **Do:** Test real-world scenarios

```javascript
// Good - this can actually happen
it("handles missing store key gracefully", () => {
    expect(getStoreImageData(undefined)).toBeNull();
    expect(getStoreImageData("")).toBeNull();
});

// Good - boundary condition that matters
it("clamps cart count to minimum of 1", () => {
    const zeroCount = 0;
    const negativeCount = -5;
    const minimumAllowedCount = 1;

    expect(randomCart(zeroCount).length).toBe(minimumAllowedCount);
    expect(randomCart(negativeCount).length).toBe(minimumAllowedCount);
});
```

### 5. Test Organization and Naming

Use clear, descriptive names and logical grouping.

✅ **Good Structure:**

```javascript
describe("ItemSeeder utilities", () => {
    describe("productNameToUPC", () => {
        it("returns UPC for exact product name", () => {
            /* ... */
        });
        it("returns false when product name not found", () => {
            /* ... */
        });
    });

    describe("randomInt", () => {
        it("returns min when Math.random() is 0", () => {
            /* ... */
        });
        it("returns max when Math.random() is near 1", () => {
            /* ... */
        });
    });

    describe("randomCart", () => {
        it("generates a cart with deterministic values", () => {
            /* ... */
        });
        it("defaults count to 1 and clamps to minimum of 1", () => {
            /* ... */
        });
    });
});
```

**Test Naming Pattern:**

-   State the behavior being tested
-   Use plain English, not technical jargon
-   Be specific about what's being tested
-   Include the expected outcome

Examples:

-   ✅ `"returns UPC for exact product name"`
-   ✅ `"normalizes leading slash and returns root-relative path"`
-   ✅ `"generates fallback for unlisted store with default color"`
-   ❌ `"test1"` or `"it works"` or `"should do the thing"`

### 6. Arrange-Act-Assert Pattern

Structure tests clearly with three sections.

```javascript
it("normalizes leading slash and returns path with leading slash", () => {
    // Arrange - Set up test data
    const inputPath = "/images/stores/walmart.png";
    const expectedPath = "/images/stores/walmart.png";

    // Act - Execute the function
    const result = resolveAssetPath(inputPath);

    // Assert - Verify the result
    expect(result).toBe(expectedPath);
});
```

For more complex tests, use comments:

```javascript
it("generates a cart with deterministic values when Math.random() is 0", () => {
    // Arrange
    Math.random = () => 0;
    const count = 2;
    const firstItem = sampleItems[0];
    const expectedPrice = firstItem.price[0].toFixed(2);
    const expectedQty = firstItem.qty[0].toFixed(0);

    // Act
    const cart = randomCart(count);

    // Assert
    expect(cart).toEqual([
        [firstItem.name, expectedPrice, expectedQty],
        [firstItem.name, expectedPrice, expectedQty]
    ]);
});
```

### 7. Test Coverage Goals

Focus on meaningful coverage, not just hitting a number.

**Priority Order:**

1. **Critical business logic** - Revenue, security, data integrity
2. **Happy paths** - Normal, expected usage
3. **Error handling** - What happens when things go wrong
4. **Edge cases** - Boundaries, empty inputs, null/undefined
5. **Integration points** - Where systems connect

**What to Test:**

-   ✅ Public API/exported functions
-   ✅ Business rules and calculations
-   ✅ Validation logic
-   ✅ Error handling and error messages
-   ✅ State transitions
-   ✅ Boundary conditions (0, 1, max values)
-   ✅ null, undefined, empty string, empty array handling

**What NOT to Test:**

-   ❌ Third-party library internals
-   ❌ Language features (e.g., does Array.map work?)
-   ❌ Simple getters/setters with no logic
-   ❌ Simple data containers (classes/objects that only store properties)
-   ❌ Private implementation details
-   ❌ Auto-generated code

**Examples of What NOT to Test:**

```javascript
// ❌ Don't test - just a data container
const storeImageRegistry = {
    "walmart": {
        imagePath: "/images/stores/walmart.png",
        displayName: "Walmart",
        fallbackColor: "#0071ce"
    }
};

// ❌ Don't test - just property storage, no business logic
class StoreData {
    constructor(imagePath, displayName, fallbackColor) {
        this.imagePath = imagePath;
        this.displayName = displayName;
        this.fallbackColor = fallbackColor;
    }
}

// Testing the above would only verify that JavaScript's object system works,
// not your business logic. Instead, test the code that USES these objects.

// ✅ DO test - contains business logic
export const getStoreImageData = (storeKey) => {
    if (!storeKey) return null;
    
    const normalizedKey = storeKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    return storeImageRegistry[normalizedKey] || {
        imagePath: resolveAssetPath(`images/stores/${normalizedKey}.png`),
        displayName: formatStoreName(storeKey),
        fallbackColor: "#cccccc"
    };
};

// ✅ DO test - transforms store names with logic
function formatStoreName(name) {
    if (!name) return '';
    
    const specialCases = {
        '7eleven': '7-Eleven',
        'cvs': 'CVS',
        'kfc': 'KFC',
        'tjmaxx': 'TJ Maxx',
    };
    
    const normalizedKey = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (specialCases[normalizedKey]) {
        return specialCases[normalizedKey];
    }
    
    return name.charAt(0).toUpperCase() + 
           name.slice(1).replace(/([A-Z])/g, ' $1');
}
```

### 8. Independence and Isolation

Each test should run independently and in any order.

❌ **Don't:** Share state between tests

```javascript
let cart; // Shared state - dangerous!

it("generates cart", () => {
    Math.random = () => 0;
    cart = randomCart(2);
    expect(cart.length).toBe(2);
});

it("processes cart items", () => {
    // Depends on previous test - will fail if run alone!
    const itemCount = cart.length;
    expect(itemCount).toBe(2);
});
```

✅ **Do:** Keep tests isolated

```javascript
describe("randomCart", () => {
    it("generates cart with specified count", () => {
        Math.random = () => 0;
        const cart = randomCart(2);
        expect(cart.length).toBe(2);
    });

    it("clamps count to minimum of 1", () => {
        Math.random = () => 0;
        const cart = randomCart(0);
        expect(cart.length).toBe(1);
    });
});
```

**Use beforeEach for shared setup:**

```javascript
describe("ItemSeeder utilities", () => {
    const originalMathRandom = Math.random;

    afterEach(() => {
        Math.random = originalMathRandom;
        jest.restoreAllMocks();
    });

    it("returns UPC for exact product name", () => {
        const { name, upc } = sampleItems[0];
        expect(productNameToUPC(name)).toBe(upc);
    });

    it("returns false when product name not found", () => {
        expect(productNameToUPC("Nonexistent Product XYZ")).toBe(false);
    });
});
```

### 9. Type Safety in Tests

Leverage TypeScript/JSDoc for better test reliability.

✅ **Use proper types and structure:**

```javascript
import { sampleItems } from "../../src/data/RandomItems";

it("returns UPC for exact product name", () => {
    const { name, upc } = sampleItems[0];
    
    const result = productNameToUPC(name);
    
    expect(result).toBe(upc);
});

it("generates cart with correct structure", () => {
    Math.random = () => 0;
    const cart = randomCart(1);
    
    expect(cart).toHaveLength(1);
    expect(cart[0]).toHaveLength(3); // [name, price, quantity]
    expect(typeof cart[0][0]).toBe("string"); // name
    expect(typeof cart[0][1]).toBe("string"); // price (formatted)
    expect(typeof cart[0][2]).toBe("string"); // quantity (formatted)
});
```

### 10. Error Testing

Test both success and failure paths.

✅ **Comprehensive error testing:**

```javascript
describe("getStoreImageData", () => {
    describe("valid store keys", () => {
        it("returns known registry entry with correct displayName and path", () => {
            const data = getStoreImageData("walgreens");
            expect(data.displayName).toBe("Walgreens");
            expect(data.imagePath.endsWith("/images/stores/walgreens.png")).toBe(true);
        });

        it("normalizes irregular keys and formats unknown display names", () => {
            const data = getStoreImageData("TJ-Maxx");
            expect(data.displayName).toBe("TJ Maxx");
        });
    });

    describe("invalid store keys", () => {
        it("returns null when storeKey is undefined", () => {
            expect(getStoreImageData(undefined)).toBeNull();
        });

        it("returns null when storeKey is empty string", () => {
            expect(getStoreImageData("")).toBeNull();
        });

        it("generates fallback for unlisted store", () => {
            const data = getStoreImageData("FooBarBaz");
            expect(data.displayName).toBe("Foo Bar Baz");
            expect(data.fallbackColor).toBe("#cccccc");
        });
    });
});
```

### 11. Comments and Documentation

Use comments to explain WHY, not WHAT.

❌ **Don't:** State the obvious

```javascript
it("returns UPC for product name", () => {
    // Call productNameToUPC with a name
    const result = productNameToUPC("Test Product");
    
    // Check if result is the UPC
    expect(result).toBe("123456789");
});
```

✅ **Do:** Explain non-obvious behavior

```javascript
it("generates cart with deterministic values when Math.random() is 0", () => {
    Math.random = () => 0;
    const count = 2;
    const firstItem = sampleItems[0];
    
    const cart = randomCart(count);
    
    // When Math.random() returns 0, randomItem() always returns first item,
    // and randomInt() returns the minimum value
    const expectedPrice = firstItem.price[0].toFixed(2);
    const expectedQty = firstItem.qty[0].toFixed(0);
    expect(cart).toEqual([
        [firstItem.name, expectedPrice, expectedQty],
        [firstItem.name, expectedPrice, expectedQty]
    ]);
});
```

### 12. Test Data Best Practices

Create minimal, relevant test data.

#### Minimal Test Data Pattern

Only include properties that are relevant to what you're testing. Use minimal values for required-but-irrelevant fields.

❌ **Don't:** Include irrelevant properties with realistic values

```javascript
function createMockStoreData() {
    return {
        // Properties used in display
        imagePath: "/images/stores/walmart.png",
        displayName: "Walmart",
        fallbackColor: "#0071ce",
        // Unused metadata with unnecessary detail
        storeId: "12345",
        category: "retail",
        location: { city: "Seattle", state: "WA" },
        hours: "9am-9pm",
        phone: "555-1234",
    };
}

it("formats store display name correctly", () => {
    const store = createMockStoreData();
    expect(formatStoreDisplay(store)).toBe("Walmart");
});
```

✅ **Do:** Separate relevant data from required-but-unused fields

```javascript
function createMockStoreData(overrides) {
    return {
        // Properties actually used by the function under test
        imagePath: "/images/stores/walmart.png",
        displayName: "Walmart",
        fallbackColor: "#0071ce",
        // Required by type but unused - minimal values
        storeId: null,
        category: "",
        location: null,
        hours: "",
        phone: "",
        ...overrides,
    };
}

it("formats store display name correctly", () => {
    const store = createMockStoreData();
    expect(formatStoreDisplay(store)).toBe("Walmart");
});
```

**Benefits:**

-   Makes it obvious which properties matter for the test
-   Reduces noise and improves readability
-   Test failures point to relevant data, not irrelevant fields
-   Faster to write and maintain

#### Simple Use Cases

For simple functions, don't even use factories:

```javascript
it("normalizes leading slash and returns path with leading slash", () => {
    const path = "images/stores/walmart.png";
    
    expect(resolveAssetPath(path)).toBe("/images/stores/walmart.png");
});

it("handles path that already has leading slash", () => {
    const pathWithSlash = "/images/stores/walmart.png";
    
    expect(resolveAssetPath(pathWithSlash)).toBe("/images/stores/walmart.png");
});
```

#### Factory Pattern for Complex Data

For complex objects used across multiple tests, use factories:

```javascript
// test/factories/storeData.js
export function createTestStoreData(overrides) {
    return {
        imagePath: "/images/stores/walmart.png",
        displayName: "Walmart",
        fallbackColor: "#0071ce",
        ...overrides,
    };
}

// In tests
it("handles known stores differently from unknown stores", () => {
    const knownStore = createTestStoreData({ displayName: "Walgreens" });
    const unknownStore = createTestStoreData({ displayName: "Foo Bar", fallbackColor: "#cccccc" });

    expect(getStoreImageData("walgreens").displayName).toBe("Walgreens");
    expect(getStoreImageData("foobar").fallbackColor).toBe("#cccccc");
});
```

### 13. Parameterized Tests with `it.each()`

When testing the same behavior with different inputs, use `it.each()` to reduce code duplication and improve maintainability.

#### When to Use `it.each()`

Use parameterized tests when you have:

-   Multiple test cases with identical structure
-   Same assertions, different inputs
-   Tests that only differ in data values
-   Repetitive test patterns that can be consolidated

❌ **Don't:** Write repetitive individual tests

```javascript
it("returns correct display name for walmart", () => {
    const data = getStoreImageData("walmart");
    expect(data.displayName).toBe("Walmart");
});

it("returns correct display name for target", () => {
    const data = getStoreImageData("target");
    expect(data.displayName).toBe("Target");
});

it("returns correct display name for cvs", () => {
    const data = getStoreImageData("cvs");
    expect(data.displayName).toBe("CVS");
});

it("returns correct display name for kroger", () => {
    const data = getStoreImageData("kroger");
    expect(data.displayName).toBe("Kroger");
});

// ... 20 more nearly identical tests
```

✅ **Do:** Use `it.each()` to consolidate

```javascript
// Named constants for clarity
const STORE_DISPLAY_NAMES = {
    WALMART: "Walmart",
    TARGET: "Target",
    CVS: "CVS",
    KROGER: "Kroger",
    // ... more stores
};

describe("known stores", () => {
    it.each([
        ["walmart", STORE_DISPLAY_NAMES.WALMART],
        ["target", STORE_DISPLAY_NAMES.TARGET],
        ["cvs", STORE_DISPLAY_NAMES.CVS],
        ["kroger", STORE_DISPLAY_NAMES.KROGER],
        // ... more test cases
    ])("returns correct display name for '%s'", (storeKey, expectedDisplayName) => {
        const data = getStoreImageData(storeKey);
        expect(data.displayName).toBe(expectedDisplayName);
    });
});
```

**Benefits:**

-   **Reduced lines of code**: 25 tests in ~30 lines instead of ~125 lines
-   **Easier maintenance**: Add new test case by adding one line
-   **Better readability**: Pattern is obvious, no noise
-   **Clear test names**: Each case shows in test output with its values

#### Template String Placeholders

Use printf-style format specifiers in test names:

```javascript
it.each([
    ["walmart", "Walmart", "#0071ce"],
    ["target", "Target", "#cc0000"],
    ["cvs", "CVS", "#cc0000"],
])(
    "returns correct data for '%s' store: displayName='%s', color='%s'", // %s=string
    (storeKey, expectedDisplayName, expectedColor) => {
        const data = getStoreImageData(storeKey);
        expect(data.displayName).toBe(expectedDisplayName);
        expect(data.fallbackColor).toBe(expectedColor);
    }
);
```

Common placeholders:

-   `%s` - String
-   `%i` - Integer
-   `%d` - Number (decimal)
-   `%o` - Object (JSON representation)
-   `%j` - JSON
-   `%%` - Literal percent sign

#### Grouping Related Test Cases

Combine `it.each()` with `describe` blocks for logical organization:

```javascript
describe("formatStoreName", () => {
    describe("special case formatting", () => {
        it.each([
            ["7eleven", "7-Eleven"],
            ["cvs", "CVS"],
            ["kfc", "KFC"],
            ["tjmaxx", "TJ Maxx"],
        ])("formats '%s' to '%s'", (input, expected) => {
            expect(formatStoreName(input)).toBe(expected);
        });
    });

    describe("default formatting", () => {
        it.each([
            ["", "empty string"],
            ["homeDepot", "Home Depot", "camelCase conversion"],
            ["fooBarBaz", "Foo Bar Baz", "multiple words"],
        ])("formats '%s' to '%s' (%s)", (input, expected, reason) => {
            expect(formatStoreName(input)).toBe(expected);
        });
    });
});
```

#### When NOT to Use `it.each()`

Don't use `it.each()` when:

-   Test logic differs significantly between cases
-   Setup/teardown varies per test
-   Assertions are different for each case
-   Only 2-3 similar tests exist (overhead not worth it)

```javascript
// Bad - logic differs too much for it.each()
it.each([
    ["walmart", { hasRegistry: true, displayName: "Walmart" }],
    ["foobarbaz", { hasRegistry: false, displayName: "Foo Bar Baz" }],
])("handles %s store", (storeKey, expected) => {
    if (expected.hasRegistry) {
        // Special logic for known stores
        const data = getStoreImageData(storeKey);
        expect(data.displayName).toBe(expected.displayName);
        expect(data.fallbackColor).not.toBe("#cccccc");
    } else {
        // Different logic for unknown stores
        const data = getStoreImageData(storeKey);
        expect(data.displayName).toBe(expected.displayName);
        expect(data.fallbackColor).toBe("#cccccc");
    }
});

// Better - separate tests with clear logic
it("returns registry entry for known store", () => {
    const data = getStoreImageData("walmart");
    expect(data.displayName).toBe("Walmart");
    expect(data.fallbackColor).toBe("#0071ce");
});

it("generates fallback for unknown store", () => {
    const data = getStoreImageData("foobarbaz");
    expect(data.displayName).toBe("Foo Bar Baz");
    expect(data.fallbackColor).toBe("#cccccc");
});
```

#### Real-World Example

Before (91 lines):

```javascript
it("returns correct display name for walmart", () => {
    /* ... */
});
it("returns correct display name for target", () => {
    /* ... */
});
// ... 23 more tests
it("handles uppercase store keys", () => {
    /* ... */
});
it("handles mixed case store keys", () => {
    /* ... */
});
it("returns null for undefined", () => {
    /* ... */
});
it("returns null for empty string", () => {
    /* ... */
});
// ... 4 more error cases
```

After (60 lines with better coverage):

```javascript
describe("known stores", () => {
    it.each([
        ["walmart", "Walmart"],
        ["target", "Target"],
        ["cvs", "CVS"],
        // ... 25 test cases
    ])("returns correct display name for '%s'", (storeKey, expectedDisplayName) => {
        const data = getStoreImageData(storeKey);
        expect(data.displayName).toBe(expectedDisplayName);
    });
});

describe("case handling", () => {
    it("handles case-insensitive store keys", () => {
        expect(getStoreImageData("WALMART").displayName).toBe("Walmart");
        expect(getStoreImageData("Target").displayName).toBe("Target");
    });
});

describe("invalid inputs", () => {
    it.each([
        [undefined, "undefined"],
        ["", "empty string"],
        // ... 4 error cases
    ])("returns null for %s", (storeKey, description) => {
        expect(getStoreImageData(storeKey)).toBeNull();
    });
});
```

### 14. Avoid Testing Implementation Details

Test behavior, not how it's implemented.

❌ **Don't:** Test internal implementation

```javascript
// Bad - testing implementation detail
it("calls formatStoreName internally", () => {
    const spy = jest.spyOn(storeImageRegistry, "formatStoreName");
    getStoreImageData("foobarbaz");
    expect(spy).toHaveBeenCalled();
});

// Bad - testing private helper functions
it("normalizes store key with toLowerCase", () => {
    const normalized = "walmart".toLowerCase();
    expect(normalized).toBe("walmart");
});
```

✅ **Do:** Test observable behavior

```javascript
// Good - testing the outcome
it("normalizes store key and finds registry entry", () => {
    const data = getStoreImageData("Home Depot");
    
    expect(data.displayName).toBe("Home Depot");
    expect(data.imagePath.endsWith("/images/stores/homedepot.png")).toBe(true);
});

// Good - testing public API behavior
it("returns null for falsy store key", () => {
    expect(getStoreImageData(undefined)).toBeNull();
    expect(getStoreImageData("")).toBeNull();
});
```

### 15. Assertions Best Practices

Choose the right matcher for better error messages.

```javascript
// Use specific matchers
expect(value).toBe(5); // Exact equality (===)
expect(object).toEqual(expected); // Deep equality
expect(array).toHaveLength(3); // Array length
expect(string).toContain("text"); // Substring
expect(fn).toThrow("error"); // Exception throwing
expect(value).toBeDefined(); // Not undefined
expect(value).toBeNull(); // Is null
expect(array).toContainEqual(item); // Array contains item

// Check multiple related things with separate assertions
it("returns store data with all required properties", () => {
    const data = getStoreImageData("walmart");

    expect(data.displayName).toBe("Walmart");
    expect(data.imagePath).toContain("/images/stores/walmart.png");
    expect(data.fallbackColor).toBe("#0071ce");
    expect(typeof data.imagePath).toBe("string");
});
```

#### Non-Null Assertion Pattern

After asserting a value is defined/not null, use `!` instead of optional chaining. This prevents redundant checks and provides clearer error messages.

❌ **Don't:** Use optional chaining after null checks

```javascript
it("returns store data correctly", () => {
    const data = getStoreImageData("walmart");

    expect(data).not.toBeNull();
    expect(data?.displayName).toBe("Walmart"); // Redundant optional chaining
    expect(data?.fallbackColor).toBe("#0071ce");
});
```

✅ **Do:** Use non-null assertion after check

```javascript
it("returns store data correctly", () => {
    const data = getStoreImageData("walmart");

    expect(data).not.toBeNull();
    expect(data.displayName).toBe("Walmart"); // Clear and direct
    expect(data.fallbackColor).toBe("#0071ce");
});
```

**Why?** If the first assertion passes, TypeScript knows the value isn't null. Optional chaining after that check is redundant and makes tests harder to read. The `!` assertion makes intent clear and fails fast if the assumption is wrong.

### 16. Performance Considerations

Keep unit tests fast.

✅ **Fast tests:**

-   Avoid real I/O (network, file system, database)
-   Mock slow operations
-   Use fake timers for time-dependent code
-   Keep test data small
-   Don't sleep/wait unnecessarily

```javascript
// Good - mocks Math.random for deterministic tests
it("generates cart with deterministic values when Math.random() is 0", () => {
    const originalMathRandom = Math.random;
    Math.random = () => 0;
    
    const cart = randomCart(2);
    const firstItem = sampleItems[0];
    const expectedPrice = firstItem.price[0].toFixed(2);
    
    expect(cart[0][1]).toBe(expectedPrice);
    
    Math.random = originalMathRandom;
});
```

### 17. Final Check: Eliminate Test Redundancy

Before finalizing any test file (new or edited), always perform a "lint check" for redundant tests.

#### What to Look For

**Duplicate Logic:**

-   Tests that verify the same behavior with different wording
-   Parameterized tests (`it.each`) that could consolidate repetitive individual tests
-   Multiple tests that could be combined into one with multiple assertions

**Redundant Coverage:**

-   Case-handling tests that duplicate valid input tests (e.g., testing "ETH" when "eth" is already tested)
-   Error case tests that verify the same error condition multiple ways
-   Tests that verify the same property through different access patterns

#### Examples of Redundancy

❌ **Redundant: Testing same values in different groups**

```javascript
describe("known stores", () => {
    it.each([
        ["walmart", "Walmart"],
        ["target", "Target"],
        ["cvs", "CVS"],
    ])("returns correct display name for '%s'", (storeKey, expectedDisplayName) => {
        expect(getStoreImageData(storeKey).displayName).toBe(expectedDisplayName);
    });
});

describe("case handling", () => {
    // ❌ Redundant - testing same stores, just different case
    it.each([
        ["WALMART", "Walmart"],
        ["Target", "Target"],
        ["CVS", "CVS"],
    ])("handles case-insensitive: %s", (storeKey, expectedDisplayName) => {
        expect(getStoreImageData(storeKey).displayName).toBe(expectedDisplayName);
    });
});
```

✅ **Efficient: Minimal case-handling proof**

```javascript
describe("known stores", () => {
    it.each([
        ["walmart", "Walmart"],
        ["target", "Target"],
        ["cvs", "CVS"],
    ])("returns correct display name for '%s'", (storeKey, expectedDisplayName) => {
        expect(getStoreImageData(storeKey).displayName).toBe(expectedDisplayName);
    });
});

describe("case handling", () => {
    // ✅ Efficient - just prove case-insensitivity works
    it("handles case-insensitive store keys", () => {
        expect(getStoreImageData("WALMART").displayName).toBe("Walmart");
        expect(getStoreImageData("Target").displayName).toBe("Target");
    });
});
```

#### Redundancy Checklist

Before submitting tests, ask:

-   [ ] **Can any `it.each()` consolidate repetitive tests?** Look for 3+ tests with identical structure
-   [ ] **Do multiple tests verify the same behavior?** Consolidate or remove duplicates
-   [ ] **Are there tests that differ only in input casing?** Reduce to minimal proof of case handling
-   [ ] **Do error tests redundantly verify the same error path?** Group with `it.each()` or reduce
-   [ ] **Can any single test with multiple assertions replace separate tests?** Consider combining when testing related properties
-   [ ] **Are there tests for features already covered by other tests?** Remove unnecessary duplication

#### When Duplication Is Acceptable

Some duplication is intentional and useful:

✅ **Different scenarios with same assertion pattern:**

```javascript
it("returns registry entry for known store", () => {
    expect(getStoreImageData("walmart").displayName).toBe("Walmart");
});

it("generates fallback for unknown store", () => {
    expect(getStoreImageData("foobarbaz").displayName).toBe("Foo Bar Baz");
});
// Different business rules, not redundant
```

✅ **Critical paths worth extra coverage:**

```javascript
it("returns null for falsy store key", () => {
    expect(getStoreImageData(undefined)).toBeNull();
});
it("returns null for empty string store key", () => {
    expect(getStoreImageData("")).toBeNull();
});
// Edge case handling worth explicit tests
```

#### Process Integration

**When writing new tests:**

1. Write tests for all scenarios
2. Review for patterns that could use `it.each()`
3. Check for redundant coverage
4. Consolidate where appropriate
5. Document why duplication exists if intentional

**When editing existing tests:**

1. Understand current coverage
2. Add new test cases
3. Look for newly created redundancy
4. Consolidate if multiple tests now share structure
5. Verify reduced test count maintains coverage

This "lint check" ensures test suites remain lean, maintainable, and efficient while preserving comprehensive coverage.

## Quick Reference Checklist

Before submitting tests, verify:

-   [ ] Tests are independent and can run in any order
-   [ ] Test names clearly describe what's being tested
-   [ ] Magic numbers are replaced with named constants
-   [ ] Testing realistic scenarios, not contrived cases
-   [ ] Mocking is minimal and purposeful
-   [ ] Both success and failure paths are covered
-   [ ] Edge cases and boundary conditions are tested
-   [ ] Tests are fast (no unnecessary delays)
-   [ ] TypeScript types are used properly
-   [ ] Comments explain non-obvious behavior
-   [ ] Using proper Jest matchers for clear error messages
-   [ ] Following Arrange-Act-Assert pattern
-   [ ] Test data is minimal and relevant
-   [ ] **Using `it.each()` for repetitive test patterns (3+ similar tests)**
-   [ ] **Using non-null assertions (`!`) after null checks, not optional chaining**
-   [ ] **Performed redundancy check - eliminated duplicate test coverage**

## Examples from Our Codebase

See these files for examples of well-tested code:

-   `test/jest/itemSeeder.test.js` - Testing random generation with Math.random mocking
-   `test/jest/pathResolver.test.js` - Simple utility function testing
-   `test/jest/storeImageRegistry.test.js` - Testing store data retrieval and formatting logic

## When in Doubt

Ask yourself:

1. **"What behavior am I testing?"** - Focus on observable outcomes
2. **"Could this actually happen in production?"** - Test real scenarios
3. **"Will this test break when I refactor implementation?"** - If yes, you're testing implementation details
4. **"Is this test readable as documentation?"** - Tests should explain how the code works
5. **"Can this test run independently?"** - No shared state between tests

Happy testing! 🧪
