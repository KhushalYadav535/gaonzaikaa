import React from 'react';
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const TermsConditions = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-orange-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <FileText className="h-12 w-12 text-amber-800 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-amber-800">Terms & Conditions</h1>
          </div>
          <p className="text-xl text-amber-600 max-w-2xl mx-auto">
            Please read these terms and conditions carefully before using our services.
          </p>
          <p className="text-sm text-amber-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-8">
          
          {/* Acceptance of Terms */}
          <section>
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-amber-800">Acceptance of Terms</h2>
            </div>
            <div className="space-y-4 text-amber-700">
              <p>By accessing and using Gaon Zaika's services, including our website, restaurant, and delivery services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.</p>
              <p>These terms apply to all visitors, customers, and users of our services, including but not limited to dine-in customers, takeaway orders, delivery orders, and online reservations.</p>
            </div>
          </section>

          {/* Services Description */}
          <section>
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Services Description</h2>
            <div className="space-y-4 text-amber-700">
              <p>Gaon Zaika provides the following services:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Dine-in restaurant services</li>
                <li>Takeaway and pickup orders</li>
                <li>Home delivery services</li>
                <li>Online reservations and bookings</li>
                <li>Catering services for events</li>
                <li>Online menu browsing and ordering</li>
              </ul>
            </div>
          </section>

          {/* Ordering and Payment */}
          <section>
            <div className="flex items-center mb-4">
              <Scale className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-amber-800">Ordering and Payment</h2>
            </div>
            <div className="space-y-4 text-amber-700">
              <p><strong>Order Placement:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All orders are subject to availability of ingredients and menu items</li>
                <li>We reserve the right to modify or cancel orders due to unavailability</li>
                <li>Orders must be placed during our operating hours</li>
                <li>Minimum order amounts may apply for delivery services</li>
              </ul>
              
              <p className="mt-4"><strong>Payment Terms:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Payment is due at the time of order placement</li>
                <li>We accept cash, credit/debit cards, and digital payments</li>
                <li>Prices are subject to change without prior notice</li>
                <li>All prices include applicable taxes unless otherwise stated</li>
                <li>Gratuities are not included in menu prices</li>
              </ul>
            </div>
          </section>

          {/* Delivery and Pickup */}
          <section>
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Delivery and Pickup</h2>
            <div className="space-y-4 text-amber-700">
              <p><strong>Delivery Services:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Delivery is available within specified areas and during operating hours</li>
                <li>Delivery fees may apply and vary by location</li>
                <li>Estimated delivery times are provided but may vary due to circumstances</li>
                <li>We are not responsible for delays caused by weather, traffic, or other external factors</li>
                <li>Orders must be received by someone at the delivery address</li>
              </ul>
              
              <p className="mt-4"><strong>Pickup Orders:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Pickup orders must be collected within 30 minutes of the specified ready time</li>
                <li>Orders not collected within this time may be disposed of</li>
                <li>Valid identification may be required for pickup</li>
              </ul>
            </div>
          </section>

          {/* Cancellation and Refunds */}
          <section>
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-amber-800">Cancellation and Refunds</h2>
            </div>
            <div className="space-y-4 text-amber-700">
              <p><strong>Cancellation Policy:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Orders may be cancelled up to 15 minutes before the scheduled pickup/delivery time</li>
                <li>Cancellations must be made by phone or through our ordering system</li>
                <li>Late cancellations may result in a cancellation fee</li>
                <li>We reserve the right to cancel orders due to unforeseen circumstances</li>
              </ul>
              
              <p className="mt-4"><strong>Refund Policy:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Refunds will be issued for cancelled orders or quality issues</li>
                <li>Refund processing may take 3-5 business days</li>
                <li>Refunds will be issued to the original payment method</li>
                <li>We do not provide refunds for change of mind after food preparation begins</li>
              </ul>
            </div>
          </section>

          {/* Food Safety and Allergies */}
          <section>
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Food Safety and Allergies</h2>
            <div className="space-y-4 text-amber-700">
              <p><strong>Food Safety:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We maintain high standards of food safety and hygiene</li>
                <li>All food is prepared in accordance with health regulations</li>
                <li>We use fresh, quality ingredients in all our dishes</li>
                <li>Food is prepared to order to ensure freshness</li>
              </ul>
              
              <p className="mt-4"><strong>Allergies and Dietary Requirements:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Please inform us of any allergies or dietary restrictions when ordering</li>
                <li>While we take precautions, we cannot guarantee allergen-free preparation</li>
                <li>Cross-contamination may occur in our kitchen</li>
                <li>Customers with severe allergies should exercise caution</li>
              </ul>
            </div>
          </section>

          {/* Restaurant Policies */}
          <section>
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Restaurant Policies</h2>
            <div className="space-y-4 text-amber-700">
              <p><strong>Dress Code:</strong> Casual dining attire is acceptable. We reserve the right to refuse service to anyone not appropriately dressed.</p>
              
              <p><strong>Behavior:</strong> We expect all customers to behave respectfully. Disruptive behavior may result in being asked to leave.</p>
              
              <p><strong>Photography:</strong> Personal photography is allowed, but commercial photography requires prior permission.</p>
              
              <p><strong>Outside Food and Beverages:</strong> Outside food and beverages are not permitted in our restaurant.</p>
              
              <p><strong>Smoking:</strong> Smoking is not permitted inside the restaurant or within designated non-smoking areas.</p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Intellectual Property</h2>
            <div className="space-y-4 text-amber-700">
              <p>All content on our website, including but not limited to text, images, logos, and menu items, is the property of Gaon Zaika and is protected by copyright laws. You may not reproduce, distribute, or use our content without written permission.</p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Limitation of Liability</h2>
            <div className="space-y-4 text-amber-700">
              <p>Gaon Zaika shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid for the specific order or service.</p>
              <p>We are not responsible for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Delays caused by weather, traffic, or other external factors</li>
                <li>Damage to personal property during delivery</li>
                <li>Allergic reactions or food sensitivities</li>
                <li>Third-party delivery service issues</li>
              </ul>
            </div>
          </section>

          {/* Privacy and Data Protection */}
          <section>
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Privacy and Data Protection</h2>
            <div className="space-y-4 text-amber-700">
              <p>Your privacy is important to us. Please refer to our Privacy Policy for information about how we collect, use, and protect your personal information.</p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-amber-800">Changes to Terms</h2>
            </div>
            <div className="space-y-4 text-amber-700">
              <p>We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after changes become effective constitutes acceptance of the updated terms.</p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Governing Law</h2>
            <div className="space-y-4 text-amber-700">
              <p>These Terms and Conditions are governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Prayagraj, Uttar Pradesh.</p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-orange-50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Contact Us</h2>
            <div className="space-y-2 text-amber-700">
              <p>If you have any questions about these Terms and Conditions, please contact us:</p>
              <p><strong>Address:</strong> Gaon Zaika Restaurant, Janghai, Prayagraj, Uttar Pradesh</p>
              <p><strong>Phone:</strong> +91 81828 38680 / +91 90057 54137</p>
              <p><strong>Email:</strong> legal@gaonzaika.com</p>
            </div>
          </section>
        </div>

        {/* Back to Top Button */}
        <div className="text-center mt-8">
          <button
            onClick={scrollToTop}
            className="bg-amber-800 hover:bg-amber-900 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center mx-auto"
          >
            <ArrowLeft className="h-5 w-5 mr-2 rotate-90" />
            Back to Top
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions; 