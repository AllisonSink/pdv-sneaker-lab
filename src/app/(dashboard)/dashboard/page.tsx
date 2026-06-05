import { createClient } from '@/utils/supabase/server';
import DashboardClient from './dashboard-client';
import { Sale, Product } from '@/types';

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

  // Fetch sales from database
  const { data: dbSales } = await supabase
    .from('vendas')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch products from database
  const { data: dbProducts } = await supabase
    .from('produtos')
    .select('*')
    .eq('user_id', user.id);

  // Map database structures to frontend interfaces
  const sales: Sale[] = (dbSales || []).map(s => ({
    id: s.id,
    items: s.items || [],
    customer: s.customer || undefined,
    subtotal: Number(s.subtotal),
    total: Number(s.total),
    paymentMethod: s.payment_method as any,
    createdAt: s.created_at ? new Date(s.created_at).toLocaleDateString('pt-BR') + ' ' + new Date(s.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
    status: s.status as any,
    sellerName: s.seller_name || undefined
  }));

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

  return <DashboardClient initialSales={sales} initialProducts={products} />;
}
