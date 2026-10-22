// One source of product truth for both research prototypes.
export const products = [
  { id: 'lk-hoodie-01', name: 'Graffiti Heavyweight Hoodie', category: 'Hoodies', price: 78, description: 'A heavyweight brushed cotton hoodie with the LOWKEY mark.', sizes: ['S', 'M', 'L', 'XL'], colours: ['Black', 'Lime'], image: null, available: true, featured: true },
  { id: 'lk-tee-01', name: 'Oversized Essential Tee', category: 'Tees', price: 38, description: 'A relaxed everyday tee, cut from substantial cotton jersey.', sizes: ['S', 'M', 'L', 'XL'], colours: ['Off-white', 'Charcoal'], image: null, available: true, featured: true },
  { id: 'lk-cargo-01', name: 'Utility Cargo Pant', category: 'Cargos', price: 92, description: 'Roomy utility cargos with considered pocket detailing.', sizes: ['S', 'M', 'L', 'XL'], colours: ['Charcoal', 'Olive'], image: null, available: true, featured: true },
  { id: 'lk-bomber-01', name: 'Shadow Bomber Jacket', category: 'Jackets', price: 128, description: 'A clean, lightly padded layer for late nights and early starts.', sizes: ['S', 'M', 'L', 'XL'], colours: ['Black'], image: null, available: true, featured: true },
  { id: 'lk-cap-01', name: 'Signature 6-Panel Cap', category: 'Accessories', price: 32, description: 'An adjustable cotton cap with a tonal LOWKEY detail.', sizes: ['OS'], colours: ['Black', 'Lime'], image: null, available: true, featured: false },
  { id: 'lk-tee-02', name: 'Washed Graphic Tee', category: 'Tees', price: 42, description: 'A washed finish gives this graphic tee a lived-in feel.', sizes: ['S', 'M', 'L', 'XL'], colours: ['Washed black'], image: null, available: true, featured: false },
  { id: 'lk-hoodie-02', name: 'Core Zip Hoodie', category: 'Hoodies', price: 84, description: 'A full zip layer with an easy oversized fit.', sizes: ['S', 'M', 'L', 'XL'], colours: ['Charcoal', 'Stone'], image: null, available: true, featured: false },
  { id: 'lk-cargo-02', name: 'Parachute Cargo', category: 'Cargos', price: 96, description: 'Lightweight volume and adjustable hems for everyday movement.', sizes: ['S', 'M', 'L', 'XL'], colours: ['Black', 'Olive'], image: null, available: true, featured: false },
  { id: 'lk-jacket-02', name: 'Track Shell Jacket', category: 'Jackets', price: 110, description: 'A water-resistant shell with a minimal profile.', sizes: ['S', 'M', 'L', 'XL'], colours: ['Black', 'Stone'], image: null, available: true, featured: false },
  { id: 'lk-cap-02', name: 'Low Profile Beanie', category: 'Accessories', price: 30, description: 'A soft rib-knit beanie for colder days.', sizes: ['OS'], colours: ['Lime', 'Charcoal'], image: null, available: true, featured: false },
  { id: 'lk-tee-03', name: 'Nothing To Prove Long Sleeve', category: 'Tees', price: 48, description: 'A heavyweight long sleeve with a quiet statement.', sizes: ['S', 'M', 'L', 'XL'], colours: ['Off-white', 'Black'], image: null, available: true, featured: false },
  { id: 'lk-bag-01', name: 'Everyday Crossbody Bag', category: 'Accessories', price: 54, description: 'A compact crossbody for the essentials.', sizes: ['OS'], colours: ['Black'], image: null, available: true, featured: false }
];

export const currency = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });
