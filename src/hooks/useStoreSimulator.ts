import { useEffect, useRef } from 'react';
import { Sale, Product, TeamMember, PaymentMethod, CartItem } from '@/types';
import { toast } from 'sonner';

export function useStoreSimulator() {
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Avoid duplicate intervals in React 18 Strict Mode or layout re-mounts
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    console.log('Background store simulator initialized.');

    const runSimulationStep = () => {
      // 1. Load current stores from localStorage
      let products: Product[] = [];
      let sales: Sale[] = [];
      let teamMembers: TeamMember[] = [];
      let notifications: any[] = [];

      try {
        const savedProducts = localStorage.getItem('sneaker_pos_products');
        if (savedProducts) products = JSON.parse(savedProducts);
        
        const savedSales = localStorage.getItem('sneaker_pos_sales');
        if (savedSales) sales = JSON.parse(savedSales);

        const savedMembers = localStorage.getItem('sneaker_pos_team_members');
        if (savedMembers) teamMembers = JSON.parse(savedMembers);

        const savedNotifications = localStorage.getItem('sneaker_pos_notifications');
        if (savedNotifications) notifications = JSON.parse(savedNotifications);
      } catch (e) {
        console.error('Simulator failed to load data from localStorage:', e);
        return;
      }

      if (products.length === 0) return;

      // Choose Event: Event 1 ("Nova Venda") (70% probability) or Event 2 ("Alerta de Estoque") (30% probability)
      const eventType = Math.random() < 0.7 ? 1 : 2;

      if (eventType === 1) {
        // --- Event 1: New Sale ("Nova Venda") ---
        // Find products that have sizes with stock > 0
        const eligibleProducts = products.filter(p => p.sizes.some(sz => sz.stock > 0));
        if (eligibleProducts.length === 0) return;

        const randomProduct = eligibleProducts[Math.floor(Math.random() * eligibleProducts.length)];
        const eligibleSizes = randomProduct.sizes.filter(sz => sz.stock > 0);
        const randomSize = eligibleSizes[Math.floor(Math.random() * eligibleSizes.length)];

        // Low stock reduction: decrement stock by 1
        products = products.map(p => {
          if (p.id === randomProduct.id) {
            return {
              ...p,
              sizes: p.sizes.map(sz => {
                if (sz.size === randomSize.size) {
                  return { ...sz, stock: sz.stock - 1 };
                }
                return sz;
              })
            };
          }
          return p;
        });

        // Pick a seller name from teamMembers database
        const activeSellers = teamMembers.filter(m => m.status === 'active');
        const randomSeller = activeSellers.length > 0
          ? activeSellers[Math.floor(Math.random() * activeSellers.length)]
          : null;
        
        const sellerName = randomSeller ? randomSeller.name : 'Lucas Vendedor';

        // Update seller stats in team database
        if (randomSeller) {
          teamMembers = teamMembers.map(m => {
            if (m.id === randomSeller.id) {
              return {
                ...m,
                salesCountMonth: m.salesCountMonth + 1,
                salesValueMonth: Number((m.salesValueMonth + randomProduct.price).toFixed(2))
              };
            }
            return m;
          });
        }

        // Random payment method
        const paymentMethods: PaymentMethod[] = ['pix', 'credit_card', 'debit_card', 'money'];
        const randomPayment = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        // Generate sale receipt ID
        const saleId = `SNK-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(Math.random() * 10)}`;

        // Random customer name
        const customers = ['Matheus Lima', 'Renata Costa', 'Thiago Ramos', 'Vanessa Alves', 'Felipe Santos', 'Clara Melo'];
        const customerName = Math.random() < 0.8 ? customers[Math.floor(Math.random() * customers.length)] : 'Consumidor Geral';

        const now = new Date();
        const formattedDate = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        const cartItem: CartItem = {
          id: `${randomProduct.id}-${randomSize.size}`,
          product: { ...randomProduct, sizes: [] }, // clean copy
          size: randomSize.size,
          sku: randomSize.sku,
          barcode: randomSize.barcode,
          quantity: 1,
          price: randomProduct.price
        };

        const newSale: Sale = {
          id: saleId,
          items: [cartItem],
          customer: { name: customerName, cpf: '000.000.000-00' },
          subtotal: randomProduct.price,
          total: randomProduct.price,
          paymentMethod: randomPayment,
          createdAt: formattedDate,
          status: 'completed',
          sellerName
        };

        // Prepend new sale to history
        sales = [newSale, ...sales];

        // Format currency for notification/toast text
        const priceFormatted = randomProduct.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // Add to layout notification list
        const notificationText = `Venda aprovada: 1x ${randomProduct.name} (Tam. ${randomSize.size}) por ${priceFormatted} (${sellerName})`;
        const newNotification = {
          id: Date.now(),
          text: notificationText,
          date: `Hoje, ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
          unread: true
        };
        notifications = [newNotification, ...notifications];

        // Save updated stores back to localStorage
        try {
          localStorage.setItem('sneaker_pos_products', JSON.stringify(products));
          localStorage.setItem('sneaker_pos_sales', JSON.stringify(sales));
          localStorage.setItem('sneaker_pos_team_members', JSON.stringify(teamMembers));
          localStorage.setItem('sneaker_pos_notifications', JSON.stringify(notifications));
        } catch (e) {
          console.error('Simulator failed to save updated state:', e);
        }

        // Show toast notification
        toast.success(`Nova venda registrada! (${sellerName})`, {
          description: `${randomProduct.name} - Tamanho ${randomSize.size} por R$ ${randomProduct.price.toFixed(2)}`,
          duration: 4500
        });

        // Trigger native web notifications
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification('Nova Venda Registrada!', {
                body: `${sellerName} vendeu 1x ${randomProduct.name} (Tamanho ${randomSize.size}) por R$ ${randomProduct.price.toFixed(2)}`,
                icon: '/next.svg',
                badge: '/next.svg'
              });
            }).catch(() => {
              new Notification('Nova Venda Registrada!', {
                body: `${sellerName} vendeu 1x ${randomProduct.name} (Tamanho ${randomSize.size}) por R$ ${randomProduct.price.toFixed(2)}`
              });
            });
          } else {
            new Notification('Nova Venda Registrada!', {
              body: `${sellerName} vendeu 1x ${randomProduct.name} (Tamanho ${randomSize.size}) por R$ ${randomProduct.price.toFixed(2)}`
            });
          }
        }

        // Dispatch update event for reactivity
        window.dispatchEvent(new CustomEvent('sneaker_pos_update', { detail: { type: 'sale', sale: newSale } }));

      } else {
        // --- Event 2: Stock Alert ("Alerta de Estoque") ---
        // Find products and sizes that currently have stock > 2
        const potentialSizes: { productId: string; product: Product; sizeIndex: number; sizeName: string; currentStock: number }[] = [];
        products.forEach(p => {
          p.sizes.forEach((sz, idx) => {
            if (sz.stock > 2) {
              potentialSizes.push({
                productId: p.id,
                product: p,
                sizeIndex: idx,
                sizeName: sz.size,
                currentStock: sz.stock
              });
            }
          });
        });

        if (potentialSizes.length === 0) return;

        const target = potentialSizes[Math.floor(Math.random() * potentialSizes.length)];
        
        // Reduce stock of this size to a critical level: 0, 1, or 2
        const newCriticalStock = Math.floor(Math.random() * 3);

        products = products.map(p => {
          if (p.id === target.productId) {
            return {
              ...p,
              sizes: p.sizes.map((sz, idx) => {
                if (idx === target.sizeIndex) {
                  return { ...sz, stock: newCriticalStock };
                }
                return sz;
              })
            };
          }
          return p;
        });

        // Add Notification
        const now = new Date();
        const notificationText = `Alerta: ${target.product.name} (Tam. ${target.sizeName}) com estoque crítico (${newCriticalStock} restantes).`;
        const newNotification = {
          id: Date.now(),
          text: notificationText,
          date: `Hoje, ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
          unread: true
        };
        notifications = [newNotification, ...notifications];

        // Save
        try {
          localStorage.setItem('sneaker_pos_products', JSON.stringify(products));
          localStorage.setItem('sneaker_pos_notifications', JSON.stringify(notifications));
        } catch (e) {
          console.error('Simulator failed to save updated stock state:', e);
        }

        // Show Toast alert
        toast.warning('Alerta: Estoque Crítico!', {
          description: `${target.product.name} (Tam. ${target.sizeName}) restam apenas ${newCriticalStock} unidades.`,
          duration: 5000
        });

        // Trigger native notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification('Alerta de Estoque Crítico!', {
                body: `${target.product.name} (Tamanho ${target.sizeName}) restam apenas ${newCriticalStock} unidades!`,
                icon: '/next.svg',
                badge: '/next.svg'
              });
            }).catch(() => {
              new Notification('Alerta de Estoque Crítico!', {
                body: `${target.product.name} (Tamanho ${target.sizeName}) restam apenas ${newCriticalStock} unidades!`
              });
            });
          } else {
            new Notification('Alerta de Estoque Crítico!', {
              body: `${target.product.name} (Tamanho ${target.sizeName}) restam apenas ${newCriticalStock} unidades!`
            });
          }
        }

        // Dispatch update event
        window.dispatchEvent(new CustomEvent('sneaker_pos_update', { detail: { type: 'stock', productId: target.productId } }));
      }
    };

    // Run simulator step every 35 seconds (35000ms)
    const intervalId = setInterval(runSimulationStep, 35000);

    return () => {
      clearInterval(intervalId);
      isRunningRef.current = false;
      console.log('Background store simulator cleaned up.');
    };
  }, []);
}
