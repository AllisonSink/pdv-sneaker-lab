import { Product } from '@/types';

// Minimalist premium SVG representations of the sneakers
export const SNEAKER_IMAGES = {
  yeezy: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10,40 Q25,35 35,22 Q42,12 55,18 L70,30 L90,45 L85,48 L15,48 Z" fill="%23e8e6e3" stroke="%233c3c43" /><path d="M55,18 Q45,28 35,28" stroke="%233c3c43" /><path d="M70,30 Q65,40 50,42" stroke="%233c3c43" /><circle cx="28" cy="45" r="4" fill="%231c1c1e" /><circle cx="72" cy="45" r="4" fill="%231c1c1e" /><path d="M12,48 Q10,43 15,42 Q25,48 40,48 Q70,48 88,48" stroke="%233c3c43" stroke-width="2" /></svg>`,
  airforce: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10,42 L25,20 L45,20 L65,30 L90,42 L88,46 L12,46 Z" fill="%23ffffff" stroke="%231c1c1e" /><path d="M25,20 Q35,30 40,32" stroke="%231c1c1e" /><path d="M45,20 L50,35 L68,36" stroke="%238e8e93" stroke-dasharray="2 2" /><path d="M52,28 L80,36" stroke="%231c1c1e" stroke-width="3" /><circle cx="28" cy="43" r="5" fill="%231c1c1e" /><circle cx="70" cy="43" r="5" fill="%231c1c1e" /></svg>`,
  jordan: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12,45 L20,12 L35,10 L50,22 L65,30 L88,42 L84,46 L14,46 Z" fill="%23f7dfd4" stroke="%23ff3b30" /><path d="M20,12 L28,24 L48,22" stroke="%231c1c1e" stroke-width="2" /><path d="M35,10 L40,45" stroke="%231c1c1e" /><path d="M50,22 L82,41" fill="%231c1c1e" d="M50,22 L78,35 L80,38 Z" fill-rule="evenodd" fill="%231c1c1e" /><circle cx="30" cy="43" r="5" fill="%231c1c1e" /><circle cx="68" cy="43" r="5" fill="%231c1c1e" /></svg>`,
  samba: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8,44 Q22,25 35,22 Q50,20 62,28 L88,40 L85,44 Z" fill="%231c1c1e" stroke="%23ffffff" stroke-width="1" /><path d="M30,23 L34,35" stroke="%23ffffff" stroke-width="2" /><path d="M35,22 L39,34" stroke="%23ffffff" stroke-width="2" /><path d="M40,22 L44,33" stroke="%23ffffff" stroke-width="2" /><path d="M10,44 L88,44" stroke="%23a2845e" stroke-width="3" /><circle cx="26" cy="41" r="4.5" fill="%23a2845e" /><circle cx="70" cy="41" r="4.5" fill="%23a2845e" /></svg>`,
  nb550: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10,42 L22,22 L48,22 L62,28 L88,40 L84,45 L12,45 Z" fill="%23f2f2f7" stroke="%230040ff" /><path d="M32,26 H42 V34 H32 Z" fill="%230040ff" /><text x="35" y="32" font-family="sans-serif" font-weight="bold" font-size="7" fill="white">N</text><circle cx="28" cy="42" r="5" fill="%231c1c1e" /><circle cx="70" cy="42" r="5" fill="%231c1c1e" /></svg>`
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-yeezy-350',
    name: 'Yeezy Boost 350 V2',
    brand: 'Adidas',
    group: 'Adidas',
    price: 1899.90,
    imageUrl: SNEAKER_IMAGES.yeezy,
    colorway: 'Triple White',
    sizes: [
      { size: '36', sku: 'ADI-YZ350-WHT-36', barcode: '789000100036', stock: 3 },
      { size: '38', sku: 'ADI-YZ350-WHT-38', barcode: '789000100038', stock: 5 },
      { size: '39', sku: 'ADI-YZ350-WHT-39', barcode: '789000100039', stock: 7 },
      { size: '40', sku: 'ADI-YZ350-WHT-40', barcode: '789000100040', stock: 0 },
      { size: '41', sku: 'ADI-YZ350-WHT-41', barcode: '789000100041', stock: 4 },
      { size: '42', sku: 'ADI-YZ350-WHT-42', barcode: '789000100042', stock: 2 },
      { size: '44', sku: 'ADI-YZ350-WHT-44', barcode: '789000100044', stock: 1 }
    ]
  },
  {
    id: 'prod-airforce-1',
    name: 'Air Force 1 \'07 Triple White',
    brand: 'Nike',
    group: 'Nike',
    price: 799.90,
    imageUrl: SNEAKER_IMAGES.airforce,
    colorway: 'Branco',
    sizes: [
      { size: '35', sku: 'NKE-AF1-WHT-35', barcode: '789000200035', stock: 10 },
      { size: '37', sku: 'NKE-AF1-WHT-37', barcode: '789000200037', stock: 12 },
      { size: '38', sku: 'NKE-AF1-WHT-38', barcode: '789000200038', stock: 8 },
      { size: '39', sku: 'NKE-AF1-WHT-39', barcode: '789000200039', stock: 15 },
      { size: '40', sku: 'NKE-AF1-WHT-40', barcode: '789000200040', stock: 6 },
      { size: '41', sku: 'NKE-AF1-WHT-41', barcode: '789000200041', stock: 9 },
      { size: '42', sku: 'NKE-AF1-WHT-42', barcode: '789000200042', stock: 4 },
      { size: '43', sku: 'NKE-AF1-WHT-43', barcode: '789000200043', stock: 3 }
    ]
  },
  {
    id: 'prod-jordan-1',
    name: 'Air Jordan 1 Retro High OG',
    brand: 'Nike',
    group: 'Nike',
    price: 1499.90,
    imageUrl: SNEAKER_IMAGES.jordan,
    colorway: 'Chicago/Vermelho',
    sizes: [
      { size: '37', sku: 'NKE-AJ1-RED-37', barcode: '789000300037', stock: 2 },
      { size: '38', sku: 'NKE-AJ1-RED-38', barcode: '789000300038', stock: 4 },
      { size: '39', sku: 'NKE-AJ1-RED-39', barcode: '789000300039', stock: 3 },
      { size: '40', sku: 'NKE-AJ1-RED-40', barcode: '789000300040', stock: 5 },
      { size: '41', sku: 'NKE-AJ1-RED-41', barcode: '789000300041', stock: 2 },
      { size: '42', sku: 'NKE-AJ1-RED-42', barcode: '789000300042', stock: 0 },
      { size: '43', sku: 'NKE-AJ1-RED-43', barcode: '789000300043', stock: 1 }
    ]
  },
  {
    id: 'prod-adidas-samba',
    name: 'Samba Leather Black/White',
    brand: 'Adidas',
    group: 'Adidas',
    price: 699.90,
    imageUrl: SNEAKER_IMAGES.samba,
    colorway: 'Preto e Branco',
    sizes: [
      { size: '36', sku: 'ADI-SAM-BLK-36', barcode: '789000400036', stock: 8 },
      { size: '37', sku: 'ADI-SAM-BLK-37', barcode: '789000400037', stock: 9 },
      { size: '38', sku: 'ADI-SAM-BLK-38', barcode: '789000400038', stock: 14 },
      { size: '39', sku: 'ADI-SAM-BLK-39', barcode: '789000400039', stock: 10 },
      { size: '40', sku: 'ADI-SAM-BLK-40', barcode: '789000400040', stock: 11 },
      { size: '41', sku: 'ADI-SAM-BLK-41', barcode: '789000400041', stock: 7 },
      { size: '42', sku: 'ADI-SAM-BLK-42', barcode: '789000400042', stock: 5 }
    ]
  },
  {
    id: 'prod-nb-550',
    name: 'New Balance 550 White Blue',
    brand: 'New Balance',
    group: 'New Balance',
    price: 899.90,
    imageUrl: SNEAKER_IMAGES.nb550,
    colorway: 'Branco e Azul',
    sizes: [
      { size: '37', sku: 'NB-550-BLU-37', barcode: '789000500037', stock: 4 },
      { size: '38', sku: 'NB-550-BLU-38', barcode: '789000500038', stock: 6 },
      { size: '39', sku: 'NB-550-BLU-39', barcode: '789000500039', stock: 5 },
      { size: '40', sku: 'NB-550-BLU-40', barcode: '789000500040', stock: 8 },
      { size: '41', sku: 'NB-550-BLU-41', barcode: '789000500041', stock: 3 },
      { size: '42', sku: 'NB-550-BLU-42', barcode: '789000500042', stock: 2 }
    ]
  }
];
