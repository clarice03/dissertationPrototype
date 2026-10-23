// Shared source of truth for the traditional and future gamified prototypes.
// The uploaded catalog sheet is one image; sheetPosition selects each product tile.
const categories = [
  {
    key: 'hoodie', name: 'Hoodies', sheetRow: 0, sizes: ['S', 'M', 'L', 'XL'], colours: ['Black', 'Charcoal', 'Off-white', 'Lime'],
    description: 'A LOWKEY hoodie made for the everyday rotation.',
    items: [
      ['Graffiti Hoodie', 78], ['Character Hoodie', 84], ['Shadow Hoodie', 76], ['Star Logo Hoodie', 80], ['Contrast Hoodie', 88],
      ['Washed Hoodie', 86], ['Flame Hoodie', 82], ['Sketch Hoodie', 79], ['Zip Hoodie', 84], ['Text Hoodie', 76]
    ]
  },
  {
    key: 'tee', name: 'Tees', sheetRow: 205, sizes: ['S', 'M', 'L', 'XL'], colours: ['Black', 'Off-white', 'Charcoal'],
    description: 'A LOWKEY graphic tee with an easy, relaxed fit.',
    items: [
      ['Classic Logo Tee', 38], ['Character Tee', 42], ['Star Tee', 36], ['Text Tee', 38], ['Distressed Tee', 42],
      ['Graphic Tee', 40], ['Flame Tee', 40], ['Oversized Tee', 42], ['Layer Tee', 48], ['Back Print Tee', 42]
    ]
  },
  {
    key: 'cargo', name: 'Cargos', sheetRow: 410, sizes: ['S', 'M', 'L', 'XL'], colours: ['Black', 'Grey', 'Olive'],
    description: 'A utility-focused LOWKEY trouser with a relaxed shape.',
    items: [
      ['Black Cargo Pants', 92], ['Grey Cargo Pants', 92], ['Green Cargo Pants', 94], ['Two Tone Cargo', 98], ['Utility Cargo', 102],
      ['Parachute Pants', 96], ['Baggy Cargo', 98], ['Washed Cargo', 104], ['Tech Cargo', 110], ['Camo Cargo', 104]
    ]
  },
  {
    key: 'jacket', name: 'Jackets', sheetRow: 615, sizes: ['S', 'M', 'L', 'XL'], colours: ['Black', 'Charcoal', 'Off-white'],
    description: 'A LOWKEY outer layer designed to finish the fit.',
    items: [
      ['Puffer Jacket', 148], ['Tech Jacket', 128], ['Bomber Jacket', 138], ['Varsity Jacket', 158], ['Denim Jacket', 132],
      ['Windbreaker', 118], ['Fleece Jacket', 124], ['Padded Jacket', 148], ['Hooded Jacket', 142], ['Zip Jacket', 126]
    ]
  },
  {
    key: 'accessory', name: 'Accessories', sheetRow: 810, sizes: ['OS'], colours: ['Black', 'Charcoal', 'Off-white', 'Lime'],
    description: 'A LOWKEY finishing piece for the everyday rotation.',
    items: [
      ['Logo Cap', 32], ['Star Cap', 32], ['Beanie', 30], ['Bucket Hat', 34], ['Crossbody Bag', 54],
      ['Backpack', 78], ['Wallet', 38], ['Sunglasses', 42], ['Belt', 36], ['Socks (3 Pack)', 24]
    ]
  }
];

export const products = categories.flatMap(category => category.items.map(([name, price], index) => {
  const sourceX = 139 + Math.round(index * 139.7);
  return {
  id: `lk-${category.key}-${String(index + 1).padStart(2, '0')}`,
  name,
  category: category.name,
  price,
  description: category.description,
  sizes: category.sizes,
  colours: category.colours,
  sheetPosition: {
    x: Number((sourceX / 1396.36 * 100).toFixed(3)),
    y: Number((category.sheetRow / 858.84 * 100).toFixed(3))
  },
  available: true,
  featured: index === 0 && category.key !== 'accessory'
  };
}));

export const currency = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });
