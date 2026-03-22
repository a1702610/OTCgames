# Product Images

Place product images here following this naming convention:

`{product_id}_{side}.jpg`

Where:
- `product_id` matches the `id` field in `src/data/products.js`
- `side` is one of: `front`, `back`, `side`

## Examples

- `codral-original_front.jpg`
- `codral-original_back.jpg`
- `nurofen-original_front.jpg`

## Missing Images

If an image file is missing, the app renders a styled placeholder using the product's `bgColor`.
No errors are thrown for missing images.

## Supported Format

JPEG only (`.jpg`). Recommended size: 400×400px minimum.
