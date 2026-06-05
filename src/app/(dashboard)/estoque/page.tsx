import { createClient } from '@/utils/supabase/server';
import EstoqueClient from './estoque-client';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Fetch products from database
  const { data: dbProducts } = await supabase
    .from('produtos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Map to frontend interface
  const products: Product[] = (dbProducts || []).map(p => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    group: p.group || p.brand,
    price: Number(p.price),
    imageUrl: p.image_url || '',
    sizes: p.sizes || [],
    colorway: p.colorway || '',
    priceCost: p.price_cost ? Number(p.price_cost) : undefined
  }));

  return <EstoqueClient initialProducts={products} />;
}
