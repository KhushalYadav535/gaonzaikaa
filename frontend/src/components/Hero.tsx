import React from 'react';
import { Sparkles, Heart, Star } from 'lucide-react';

const Hero = () => {
  const featuredDishes = [
    {
      name: 'Village Thali',
      description: 'Complete traditional meal with authentic flavors',
      image: 'https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=400',
      price: '₹180'
    },
    {
      name: 'Tandoori Roti',
      description: 'Fresh bread from village clay oven',
      image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400',
      price: '₹25'
    },
    {
      name: 'Dal Baati Churma',
      description: 'Traditional Rajasthani delicacy',
      image: 'https://images.pexels.com/photos/6210747/pexels-photo-6210747.jpeg?auto=compress&cs=tinysrgb&w=400',
      price: '₹220'
    }
  ];

  return (
    <section id="home" className="pt-16 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=1200)',
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-8 w-8 text-red-400 mr-2" />
              <Sparkles className="h-10 w-10 text-yellow-400 mx-2" />
              <Heart className="h-8 w-8 text-red-400 ml-2" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Gaon Zaika
            </h1>
            
            <p className="text-2xl md:text-3xl mb-8 font-medium text-yellow-200">
              Authentic Village Flavors!
            </p>
            
            <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed text-gray-200">
              Experience the taste of home-cooked meals, village soil's aroma, and traditional flavors - all in one place
            </p>
            
            <button 
              onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              View Menu
            </button>
          </div>
        </div>
      </div>

      {/* Featured Dishes */}
      <div className="bg-gradient-to-b from-orange-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-amber-800 mb-4">
              Featured Dishes
            </h2>
            <p className="text-xl text-amber-600 max-w-2xl mx-auto">
              Taste our most popular and delicious traditional dishes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDishes.map((dish, index) => (
              <div 
                key={index}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-3xl"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={dish.image} 
                    alt={dish.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {dish.price}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-bold text-amber-800 mr-2">{dish.name}</h3>
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  </div>
                  <p className="text-amber-600 leading-relaxed">{dish.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;