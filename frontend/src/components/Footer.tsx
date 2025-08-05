import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-amber-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Restaurant Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Utensils className="h-8 w-8 text-orange-300 mr-2" />
              <span className="text-2xl font-bold text-orange-100">Gaon Zaika</span>
            </div>
            <p className="text-orange-100 text-sm leading-relaxed">
              Experience the authentic flavors of traditional Indian cuisine. 
              We bring the taste of village cooking to your table with fresh ingredients 
              and time-honored recipes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-orange-200 hover:text-white transition-colors duration-200">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-orange-200 hover:text-white transition-colors duration-200">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-orange-200 hover:text-white transition-colors duration-200">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-100">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection('home')}
                  className="text-orange-200 hover:text-white transition-colors duration-200 text-sm"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('about')}
                  className="text-orange-200 hover:text-white transition-colors duration-200 text-sm"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('menu')}
                  className="text-orange-200 hover:text-white transition-colors duration-200 text-sm"
                >
                  Our Menu
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('gallery')}
                  className="text-orange-200 hover:text-white transition-colors duration-200 text-sm"
                >
                  Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="text-orange-200 hover:text-white transition-colors duration-200 text-sm"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-100">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-orange-300 mt-0.5 flex-shrink-0" />
                <p className="text-orange-200 text-sm">
                  Janghai<br />
                  Prayagraj, Uttar Pradesh
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-300 flex-shrink-0" />
                <div className="text-orange-200 text-sm">
                  <p>+91 81828 38680</p>
                  <p>+91 90057 54137</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-300 flex-shrink-0" />
                <p className="text-orange-200 text-sm">info@gaonzaika.com</p>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-100">Opening Hours</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-orange-300 flex-shrink-0" />
                <div className="text-orange-200 text-sm">
                  <p><span className="font-medium">Monday - Friday:</span></p>
                  <p>11:00 AM - 10:00 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-orange-300 flex-shrink-0" />
                <div className="text-orange-200 text-sm">
                  <p><span className="font-medium">Saturday - Sunday:</span></p>
                  <p>12:00 PM - 11:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-orange-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-orange-200 text-sm">
              © {currentYear} Gaon Zaika. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <button
                onClick={() => navigate('/privacy-policy')}
                className="text-orange-200 hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => navigate('/terms-conditions')}
                className="text-orange-200 hover:text-white transition-colors duration-200"
              >
                Terms & Conditions
              </button>
              <button
                onClick={() => navigate('/refund-cancellation')}
                className="text-orange-200 hover:text-white transition-colors duration-200"
              >
                Refund & Cancellation Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 