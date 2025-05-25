import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Star, 
  Eye, 
  ShoppingCart, 
  Users, 
  Calendar,
  Plus,
  Edit,
  BarChart3
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ScrollReveal from '../components/ui/ScrollReveal';

const SellerDashboardPage: React.FC = () => {
  const { state } = useMarketplace();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Mock seller data - in a real app, this would come from the authenticated seller's data
  const sellerStats = {
    totalSales: 15420,
    revenue: 234567,
    activeListings: 47,
    averageRating: 4.8,
    totalViews: 89234,
    conversionRate: 3.2,
    totalCustomers: 1247,
    responseTime: '< 1 hour',
  };

  const recentOrders = [
    {
      id: 'order_1',
      product: 'Nike Air Jordan 1 Chicago',
      customer: 'John D.',
      amount: 450,
      status: 'shipped',
      date: '2024-01-15',
    },
    {
      id: 'order_2',
      product: 'Adidas Yeezy Boost 350',
      customer: 'Sarah M.',
      amount: 380,
      status: 'processing',
      date: '2024-01-14',
    },
    {
      id: 'order_3',
      product: 'Nike Dunk Low Panda',
      customer: 'Mike R.',
      amount: 120,
      status: 'delivered',
      date: '2024-01-13',
    },
  ];

  const topProducts = [
    {
      id: 'product_1',
      name: 'Nike Air Jordan 1 Chicago',
      sales: 23,
      revenue: 10350,
      views: 1247,
      image: 'https://via.placeholder.com/100x100?text=Jordan+1',
    },
    {
      id: 'product_2',
      name: 'Adidas Yeezy Boost 350',
      sales: 18,
      revenue: 6840,
      views: 892,
      image: 'https://via.placeholder.com/100x100?text=Yeezy',
    },
    {
      id: 'product_3',
      name: 'Nike Dunk Low Panda',
      sales: 31,
      revenue: 3720,
      views: 2134,
      image: 'https://via.placeholder.com/100x100?text=Dunk',
    },
  ];

  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    change?: string; 
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <Card className="p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${
              change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {change} from last period
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-600 via-primary-700 to-accent-700 text-white py-12">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Seller Dashboard</h1>
                <p className="text-primary-100">Welcome back, SneakerVault!</p>
              </div>
              
              <div className="flex gap-3 mt-4 md:mt-0">
                <Button
                  icon={<Plus size={20} />}
                  className="!bg-white !text-primary-700 hover:!bg-neutral-100"
                >
                  Add Product
                </Button>
                <Button
                  variant="outline"
                  icon={<BarChart3 size={20} />}
                  className="!border-white !text-white hover:!bg-white/10"
                >
                  Analytics
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Period Selector */}
        <ScrollReveal direction="up">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">Performance Overview</h2>
            <div className="flex border border-neutral-300 rounded-lg overflow-hidden">
              {(['7d', '30d', '90d', '1y'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {period === '7d' ? '7 Days' : 
                   period === '30d' ? '30 Days' : 
                   period === '90d' ? '90 Days' : '1 Year'}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <ScrollReveal direction="up" delay={0.1}>
            <StatCard
              title="Total Sales"
              value={sellerStats.totalSales.toLocaleString()}
              change="+12.5%"
              icon={<ShoppingCart size={24} />}
              color="bg-blue-500"
            />
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={0.2}>
            <StatCard
              title="Revenue"
              value={`$${sellerStats.revenue.toLocaleString()}`}
              change="+8.2%"
              icon={<DollarSign size={24} />}
              color="bg-green-500"
            />
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={0.3}>
            <StatCard
              title="Active Listings"
              value={sellerStats.activeListings}
              change="+3"
              icon={<Package size={24} />}
              color="bg-purple-500"
            />
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={0.4}>
            <StatCard
              title="Average Rating"
              value={sellerStats.averageRating}
              change="+0.1"
              icon={<Star size={24} />}
              color="bg-yellow-500"
            />
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Recent Orders */}
          <ScrollReveal direction="left">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900">Recent Orders</h3>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-neutral-900">{order.product}</h4>
                      <p className="text-sm text-neutral-600">Customer: {order.customer}</p>
                      <p className="text-xs text-neutral-500">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary-600">${order.amount}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </ScrollReveal>

          {/* Top Products */}
          <ScrollReveal direction="right">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900">Top Performing Products</h3>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
              
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900">{product.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-neutral-600">
                        <span>{product.sales} sales</span>
                        <span>{product.views} views</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">${product.revenue.toLocaleString()}</p>
                      <Button variant="outline" size="sm" icon={<Edit size={16} />}>
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </ScrollReveal>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScrollReveal direction="up" delay={0.1}>
            <StatCard
              title="Total Views"
              value={sellerStats.totalViews.toLocaleString()}
              change="+15.3%"
              icon={<Eye size={24} />}
              color="bg-indigo-500"
            />
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={0.2}>
            <StatCard
              title="Conversion Rate"
              value={`${sellerStats.conversionRate}%`}
              change="+0.5%"
              icon={<TrendingUp size={24} />}
              color="bg-orange-500"
            />
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={0.3}>
            <StatCard
              title="Total Customers"
              value={sellerStats.totalCustomers.toLocaleString()}
              change="+23"
              icon={<Users size={24} />}
              color="bg-pink-500"
            />
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;
