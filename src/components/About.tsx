import React from 'react';
import { Users, Target, Heart, Award } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Made with Love',
      description: 'Every dish carries the taste of mother\'s love'
    },
    {
      icon: Target,
      title: 'Quality Commitment',
      description: 'Only fresh and pure ingredients used'
    },
    {
      icon: Users,
      title: 'Family Atmosphere',
      description: 'Home-like experience and service'
    },
    {
      icon: Award,
      title: 'Traditional Recipes',
      description: 'Preserving centuries-old culinary traditions'
    }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-amber-800 mb-6">
            About Us
          </h2>
          <p className="text-xl text-amber-600 max-w-3xl mx-auto leading-relaxed">
            Gaon Zaika began with a dream - to bring the authentic taste of village cuisine to city dwellers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-3xl font-bold text-amber-800 mb-6">Our Story</h3>
            <p className="text-amber-700 text-lg leading-relaxed mb-6">
              In 2018, Ramesh ji decided to bring his village memories to life in the city. With his wife Sunita ji's magical cooking skills and traditional recipe knowledge, Gaon Zaika was born.
            </p>
            <p className="text-amber-700 text-lg leading-relaxed mb-6">
              Today we have over 15 skilled chefs, all coming from villages to showcase their culinary expertise in the city. Every dish carries the love of a mother and the fragrance of village soil.
            </p>
            <div className="flex items-center">
              <img 
                src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150" 
                alt="Founder"
                className="h-16 w-16 rounded-full object-cover border-4 border-orange-200 mr-4"
              />
              <div>
                <p className="font-semibold text-amber-800">Ramesh & Sunita Gupta</p>
                <p className="text-amber-600">Founders</p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.pexels.com/photos/3338681/pexels-photo-3338681.jpeg?auto=compress&cs=tinysrgb&w=800" 
              alt="Village Kitchen"
              className="rounded-3xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -right-6 bg-orange-600 text-white p-4 rounded-2xl shadow-xl">
              <p className="font-bold text-2xl">7+</p>
              <p className="text-sm">Years Experience</p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center"
            >
              <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <value.icon className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="font-bold text-amber-800 mb-2">{value.title}</h4>
              <p className="text-amber-600 text-sm leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;