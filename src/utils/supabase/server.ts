import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SupabaseClient } from '@supabase/supabase-js'

// Define static mock data for products
const mockProducts = [
  {
    id: "prod-1",
    user_id: "mock-user-id",
    name: "Air Jordan 1 Retro High OG",
    brand: "Nike",
    price: 1299.90,
    price_cost: 800.00,
    sizes: [
      {size: "38", quantity: 5, sku: "AJ1-38"},
      {size: "39", quantity: 8, sku: "AJ1-39"},
      {size: "40", quantity: 12, sku: "AJ1-40"},
      {size: "41", quantity: 10, sku: "AJ1-41"},
      {size: "42", quantity: 4, sku: "AJ1-42"}
    ],
    image_url: "",
    colorway: "Chicago",
    group: "Jordan",
    created_at: new Date().toISOString()
  },
  {
    id: "prod-2",
    user_id: "mock-user-id",
    name: "Yeezy Boost 350 V2",
    brand: "Adidas",
    price: 1899.90,
    price_cost: 1100.00,
    sizes: [
      {size: "39", quantity: 3, sku: "YZY-39"},
      {size: "40", quantity: 5, sku: "YZY-40"},
      {size: "41", quantity: 6, sku: "YZY-41"},
      {size: "42", quantity: 2, sku: "YZY-42"}
    ],
    image_url: "",
    colorway: "Zebra",
    group: "Yeezy",
    created_at: new Date().toISOString()
  },
  {
    id: "prod-3",
    user_id: "mock-user-id",
    name: "Air Force 1 '07",
    brand: "Nike",
    price: 599.90,
    price_cost: 350.00,
    sizes: [
      {size: "37", quantity: 15, sku: "AF1-37"},
      {size: "38", quantity: 20, sku: "AF1-38"},
      {size: "39", quantity: 25, sku: "AF1-39"},
      {size: "40", quantity: 18, sku: "AF1-40"},
      {size: "41", quantity: 12, sku: "AF1-41"}
    ],
    image_url: "",
    colorway: "Triple White",
    group: "Classics",
    created_at: new Date().toISOString()
  }
];

// Define static mock data for sales
const mockSales = [
  {
    id: "V-1001",
    user_id: "mock-user-id",
    created_at: new Date().toISOString(),
    items: [
      {
        id: "prod-1",
        name: "Air Jordan 1 Retro High OG",
        price: 1299.90,
        size: "40",
        quantity: 1,
        sku: "AJ1-40"
      }
    ],
    customer: {
      name: "João Silva",
      phone: "11999999999"
    },
    subtotal: 1299.90,
    total: 1299.90,
    payment_method: "Pix",
    status: "completed",
    seller_name: "Admin Demo"
  },
  {
    id: "V-1002",
    user_id: "mock-user-id",
    created_at: new Date().toISOString(),
    items: [
      {
        id: "prod-3",
        name: "Air Force 1 '07",
        price: 599.90,
        size: "38",
        quantity: 1,
        sku: "AF1-38"
      }
    ],
    customer: {
      name: "Maria Souza",
      phone: "11888888888"
    },
    subtotal: 599.90,
    total: 599.90,
    payment_method: "Cartão de Crédito",
    status: "completed",
    seller_name: "Admin Demo"
  }
];

export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies()
  const mockUserCookie = cookieStore.get('mock_user')?.value
  
  const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                     process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') || 
                     !!mockUserCookie;

  if (isMockMode) {
    let mockUser = {
      id: 'mock-user-id',
      email: 'admin@sneakerlab.com',
      user_metadata: {
        username: 'admin',
        role: 'admin',
        tenant_id: 'mock-tenant',
        full_name: 'Admin Demo',
        store_name: 'Sneaker Lab'
      }
    };
    
    if (mockUserCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(mockUserCookie));
        mockUser = {
          id: parsed.id || 'mock-user-id',
          email: parsed.email || 'admin@sneakerlab.com',
          user_metadata: {
            username: parsed.username || 'admin',
            role: parsed.role || 'admin',
            tenant_id: parsed.tenant_id || 'mock-tenant',
            full_name: parsed.username || 'Admin Demo',
            store_name: 'Sneaker Lab'
          }
        };
      } catch {}
    }

    const mockClient = {
      auth: {
        getUser: async () => {
          return { data: { user: mockUser }, error: null };
        },
        getSession: async () => {
          return { data: { session: {} }, error: null };
        },
        signUp: async () => {
          return { data: { user: mockUser }, error: null };
        },
        signInWithPassword: async () => {
          return { data: { user: mockUser }, error: null };
        },
        signOut: async () => {
          return { error: null };
        }
      },
      from: (table: string) => {
        const data = table === 'produtos' ? mockProducts : mockSales;
        const createChain = (currentData: any): any => {
          const chain = {
            select: () => createChain(currentData),
            eq: () => createChain(currentData),
            order: () => createChain(currentData),
            insert: (payload: any) => createChain(currentData),
            update: (payload: any) => createChain(currentData),
            delete: () => createChain(currentData),
            then: (resolve: any) => {
              resolve({ data: currentData, error: null });
              return Promise.resolve({ data: currentData, error: null });
            }
          };
          return chain;
        };
        return createChain(data);
      }
    };
    return mockClient as any;
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
