import React from 'react';
import { ArrowLeft, Shield, Eye, Lock, Users, Database } from 'lucide-react';

const PrivacyPolicy = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-orange-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-12 w-12 text-amber-800 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-amber-800">Privacy Policy</h1>
          </div>
          <p className="text-xl text-amber-600 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-amber-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-8">
          
          {/* Information We Collect */}
          <section>
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-amber-800">Information We Collect</h2>
            </div>
            <div className="space-y-4 text-amber-700">
              <p>We collect information you provide directly to us, such as when you:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Make a reservation or place an order</li>
                <li>Contact us through our website or phone</li>
                <li>Sign up for our newsletter or loyalty program</li>
                <li>Participate in surveys or promotions</li>
                <li>Visit our restaurant and provide feedback</li>
              </ul>
              <p className="mt-4">This information may include:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name, email address, and phone number</li>
                <li>Delivery address and preferences</li>
                <li>Order history and dietary preferences</li>
                <li>Payment information (processed securely)</li>
                <li>Feedback and reviews</li>
              </ul>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <div className="flex items-center mb-4">
              <Eye className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-amber-800">How We Use Your Information</h2>
            </div>
            <div className="space-y-4 text-amber-700">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process and fulfill your orders and reservations</li>
                <li>Communicate with you about your orders and our services</li>
                <li>Send you updates about our menu, promotions, and events</li>
                <li>Improve our services and customer experience</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Ensure food safety and accommodate dietary requirements</li>
                <li>Comply with legal obligations and regulations</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-amber-800">Information Sharing</h2>
            </div>
            <div className="space-y-4 text-amber-700">
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service Providers:</strong> With trusted partners who help us operate our business (delivery services, payment processors)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-amber-800">Data Security</h2>
            </div>
            <div className="space-y-4 text-amber-700">
              <p>We implement appropriate security measures to protect your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of sensitive data during transmission</li>
                <li>Secure storage of personal information</li>
                <li>Regular security assessments and updates</li>
                <li>Limited access to personal information on a need-to-know basis</li>
                <li>Employee training on data protection practices</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Your Rights</h2>
            <div className="space-y-4 text-amber-700">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access and review your personal information</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
                <li>File a complaint with relevant authorities</li>
              </ul>
            </div>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Cookies and Tracking</h2>
            <div className="space-y-4 text-amber-700">
              <p>Our website may use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Remember your preferences and settings</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Improve website functionality and user experience</li>
                <li>Provide personalized content and recommendations</li>
              </ul>
              <p>You can control cookie settings through your browser preferences.</p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Children's Privacy</h2>
            <div className="space-y-4 text-amber-700">
              <p>Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.</p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Changes to This Policy</h2>
            <div className="space-y-4 text-amber-700">
              <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Posting the updated policy on our website</li>
                <li>Sending you an email notification</li>
                <li>Displaying a notice in our restaurant</li>
              </ul>
              <p>Your continued use of our services after changes become effective constitutes acceptance of the updated policy.</p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-orange-50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Contact Us</h2>
            <div className="space-y-2 text-amber-700">
              <p>If you have any questions about this Privacy Policy, please contact us:</p>
              <p><strong>Address:</strong> Gaon Zaika Restaurant, Janghai, Prayagraj, Uttar Pradesh</p>
              <p><strong>Phone:</strong> +91 81828 38680 / +91 90057 54137</p>
              <p><strong>Email:</strong> privacy@gaonzaika.com</p>
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

export default PrivacyPolicy; 