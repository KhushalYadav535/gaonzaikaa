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
          <h1 className="text-4xl md:text-5xl font-bold text-amber-800 mb-6">
            About Us
          </h1>
          <p className="text-xl text-amber-600 max-w-3xl mx-auto leading-relaxed">
            Gaon Zaika began with a dream - to bring the authentic taste of village cuisine to city dwellers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-3xl font-bold text-amber-800 mb-6">Our Story</h3>
            <p className="text-amber-700 text-lg leading-relaxed mb-6">
              Gaon Zaika was born from a simple yet heartfelt idea: "Why not bring the authentic taste of Indian villages straight to people's homes?"
            </p>
            <p className="text-amber-700 text-lg leading-relaxed mb-6">
              In a world where fast food dominates and traditional flavors are slowly fading, we saw a beautiful opportunity — to revive and deliver the soul of rural India through its food.
            </p>
            <p className="text-amber-700 text-lg leading-relaxed mb-6">
              Our journey began in small villages, where grandmothers still cook on clay stoves, where meals are made with love, and ingredients come fresh from the fields. Gaon Zaika's mission is to bring that real, rustic flavor – from the heart of villages to your plate.
            </p>
            <p className="text-amber-700 text-lg leading-relaxed mb-6">
              But we are not just a food delivery app. We are a bridge – connecting skilled village home cooks with food lovers across towns and cities. Through every order, we empower rural women, support local farmers, and preserve age-old recipes that tell a story of tradition, warmth, and community.
            </p>
            <div className="bg-orange-50 p-6 rounded-2xl mb-6">
              <h4 className="font-bold text-amber-800 mb-4">What we promise:</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-amber-700">
                  <span className="text-green-600 mr-2">✔</span>
                  Fresh, authentic, preservative-free village food
                </li>
                <li className="flex items-center text-amber-700">
                  <span className="text-green-600 mr-2">✔</span>
                  Empowerment of rural kitchens and farmers
                </li>
                <li className="flex items-center text-amber-700">
                  <span className="text-green-600 mr-2">✔</span>
                  A taste of tradition in every delivery
                </li>
              </ul>
            </div>
            <p className="text-amber-700 text-lg leading-relaxed mb-6 font-semibold">
              Gaon Zaika continues to grow with one mission in mind – "A story from the village in every meal."
            </p>
            <div>
              <p className="font-semibold text-amber-800">Founder</p>
              <p className="text-amber-600 mb-2">Khushal Yadav</p>
              <p className="font-semibold text-amber-800">Co-founder</p>
              <p className="text-amber-600 mb-2">Satyam Yadav</p>
              <p className="font-semibold text-amber-800">Founding Team</p>
              <p className="text-amber-600">Ramesh Kumar</p>
              <p className="text-amber-600">Shabhajeet Gautam</p>
              <p className="text-amber-600">Sachin Yadav</p>
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