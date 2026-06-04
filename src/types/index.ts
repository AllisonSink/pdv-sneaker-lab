export interface SizeStock {
  size: string;      // e.g. "38", "39", "40"
  sku: string;       // e.g. "NK-AF1-WHT-38"
  barcode: string;   // e.g. "883123456038" (for bar code reader)
  stock: number;     // Quantity in stock for this size
}

export interface Product {
  id: string;
  name: string;      // e.g. "Air Force 1 '07"
  brand: string;     // e.g. "Nike"
  group: string;     // e.g. "Nike" or "Adidas"
  price: number;     // e.g. 799.90
  imageUrl: string;  // Image path or generated base64
  sizes: SizeStock[]; // Size grid containing stock and barcode
  colorway?: string; // e.g. "Triple White" or "Preto/Branco"
}

export interface CartItem {
  id: string;        // Unique cart item identifier (e.g. sku or product.id + size)
  product: Product;
  size: string;
  sku: string;
  barcode: string;
  quantity: number;
  price: number;     // Item price at purchase
}

export interface Customer {
  name: string;
  cpf?: string;      // Standard Brazilian Tax ID (optional, common in BR retail)
}

export type PaymentMethod = 'credit_card' | 'debit_card' | 'pix' | 'money';

export interface TeamMember {
  id: string;
  name: string;
  role: 'admin' | 'seller';
  status: 'active' | 'inactive';
  pin: string;
  salesCountMonth: number;
  salesValueMonth: number;
  commissionPercentage: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  customer?: Customer;
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  status?: 'completed' | 'returned' | 'exchanged';
  sellerName?: string;
}
