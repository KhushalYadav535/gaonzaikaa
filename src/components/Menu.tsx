import React, { useState } from 'react';
import { Star, Clock, Flame } from 'lucide-react';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('thali');

  const categories = [
    { id: 'thali', name: 'Thali Special', icon: '🍽️' },
    { id: 'roti', name: 'Bread & Parathas', icon: '🫓' },
    { id: 'sabji', name: 'Vegetables', icon: '🥬' },
    { id: 'dal', name: 'Dal & Curry', icon: '🍲' },
    { id: 'rice', name: 'Rice', icon: '🍚' },
    { id: 'dessert', name: 'Desserts', icon: '🍰' }
  ];

  const menuItems = {
    thali: [
      {
        name: 'Village Thali',
        description: 'Dal, vegetable, roti, rice, papad, pickle, salad',
        price: '₹180',
        image: 'https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=400',
        popular: true,
        spicy: 2
      },
      {
        name: 'Rajasthani Thali',
        description: 'Dal baati churma, gatte ki sabji, bajra roti',
        price: '₹220',
        image: 'https://images.pexels.com/photos/6210747/pexels-photo-6210747.jpeg?auto=compress&cs=tinysrgb&w=400',
        popular: false,
        spicy: 3
      },
      {
        name: 'Punjabi Thali',
        description: 'Rajma, chole, makki roti, sarson ka saag',
        price: '₹200',
        image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400',
        popular: false,
        spicy: 2
      }
    ],
    roti: [
      {
        name: 'Tandoori Roti',
        description: 'Made in clay oven',
        price: '₹25',
        image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400',
        popular: true,
        spicy: 0
      },
      {
        name: 'Aloo Paratha',
        description: 'Served with ghee and yogurt',
        price: '₹45',
        image: 'https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=400',
        popular: true,
        spicy: 1
      },
      {
        name: 'Gobi Paratha',
        description: 'Fresh cauliflower with spices',
        price: '₹40',
        image: 'https://images.pexels.com/photos/6210747/pexels-photo-6210747.jpeg?auto=compress&cs=tinysrgb&w=400',
        popular: false,
        spicy: 1
      }
    ],
    sabji: [
      {
        name: 'Mixed Vegetables',
        description: 'Seasonal vegetables blend',
        price: '₹120',
        image: 'https://images.pexels.com/photos/3338681/pexels-photo-3338681.jpeg?auto=compress&cs=tinysrgb&w=400',
        popular: true,
        spicy: 2
      },
      {
        name: 'Palak Paneer',
        description: 'Homemade cottage cheese',
        price: '₹140',
        image: 'https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=400',
        popular: false,
        spicy: 2
      }
    ],
    dal: [
      {
        name: 'Dal Tadka',
        description: 'Yellow lentil with tempering',
        price: '₹80',
        image: 'https://images.pexels.com/photos/6210747/pexels-photo-6210747.jpeg?auto=compress&cs=tinysrgb&w=400',
        popular: true,
        spicy: 1
      },
      {
        name: 'Dal Makhani',
        description: 'Rich lentil with butter and cream',
        price: '₹100',
        image: 'https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=400',
        popular: false,
        spicy: 1
      }
    ],
    rice: [
      {
        name: 'Jeera Rice',
        description: 'Fragrant basmati rice',
        price: '₹60',
        image: 'https://images.pexels.com/photos/3338681/pexels-photo-3338681.jpeg?auto=compress&cs=tinysrgb&w=400',
        popular: true,
        spicy: 0
      },
      {
        name: 'Veg Biryani',
        description: 'Aromatic rice with vegetables',
        price: '₹150',
        image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400',
        popular: false,
        spicy: 2
      }
    ],
    dessert: [
      {
        name: 'Gulab Jamun',
        description: 'Homemade sweet dumplings',
        price: '₹40',
        image: 'https://images.pexels.com/photos/6210747/pexels-photo-6210747.jpeg?auto=compress&cs=tinysrgb&w=400',
        popular: true,
        spicy: 0
      },
      {
        name: 'Kheer',
        description: 'Sweet rice pudding with milk',
        price: '₹50',
        image: 'https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=400',
        popular: false,
        spicy: 0
      }
    ]
  };

  return (
    <section id="menu" className="py-20 bg-gradient-to-b from-green-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-amber-800 mb-6">
            Our Menu
          </h2>
          <p className="text-xl text-amber-600 max-w-2xl mx-auto">
            A beautiful blend of traditional flavors and modern presentation
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full transition-all duration-300 font-medium ${
                activeCategory === category.id
                  ? 'bg-orange-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-amber-800 hover:bg-orange-100 shadow-md'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems[activeCategory]?.map((item, index) => (
            <div 
              key={index}
              className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                {item.popular && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-current" />
                    Popular
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1 rounded-full text-lg font-bold">
                  {item.price}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-amber-800">{item.name}</h3>
                  <div className="flex items-center">
                    {Array.from({ length: item.spicy }).map((_, i) => (
                      <Flame key={i} className="h-4 w-4 text-red-500 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-amber-600 leading-relaxed mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-green-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">15-20 mins</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm text-gray-600">4.5</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Menu;