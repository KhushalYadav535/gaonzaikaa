import React from 'react';
import { ArrowLeft, RefreshCw, XCircle, Clock, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';

const RefundCancellationPolicy = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-orange-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <RefreshCw className="h-12 w-12 text-amber-800 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-amber-800">Refund & Cancellation Policy</h1>
          </div>
          <p className="text-xl text-amber-600 max-w-2xl mx-auto">
            Clear guidelines for order cancellations, refunds, and customer satisfaction
          </p>
          <p className="text-sm text-amber-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-8">
          
          {/* Cancellation Policy */}
          <section>
            <div className="flex items-center mb-4">
              <XCircle className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-amber-800">Order Cancellation Policy</h2>
            </div>
            <div className="space-y-4 text-amber-700">
              <p><strong>Pre-Order Cancellation:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Orders can be cancelled up to 15 minutes before the scheduled pickup/delivery time</li>
                <li>Cancellations must be made by phone or through our ordering system</li>
                <li>Late cancellations may result in a cancellation fee of ₹50</li>
                <li>We reserve the right to cancel orders due to unforeseen circumstances</li>
              </ul>
              
              <p className="mt-4"><strong>Post-Order Cancellation:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Once food preparation begins, cancellations are not accepted</li>
                <li>Orders already in transit cannot be cancelled</li>
                <li>In case of delivery issues, we will attempt to resolve the problem</li>
              </ul>
            </div>
          </section>

          {/* Refund Policy */}
          <section>
            <div className="flex items-center mb-4">
              <DollarSign className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-amber-800">Refund Policy</h2>
            </div>
            <div className="space-y-4 text-amber-700">
              <p><strong>Eligible for Full Refund:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Orders cancelled within the allowed time frame (15 minutes before pickup/delivery)</li>
                <li>Orders cancelled by Gaon Zaika due to unavailability or technical issues</li>
                <li>Quality issues reported within 30 minutes of receiving the order</li>
                <li>Delivery delays exceeding 45 minutes from the promised time</li>
                <li>Wrong items delivered (subject to verification)</li>
              </ul>
              
              <p className="mt-4"><strong>Partial Refund:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Missing items from the order (refund for missing items only)</li>
                <li>Minor quality issues (refund for affected items only)</li>
                <li>Late delivery (refund of delivery charges only)</li>
              </ul>
              
              <p className="mt-4"><strong>Not Eligible for Refund:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Change of mind after food preparation begins</li>
                <li>Orders not collected within 30 minutes of ready time</li>
                <li>Complaints reported after 30 minutes of receiving the order</li>
                <li>Personal taste preferences or spice level issues</li>
                <li>Orders cancelled due to customer's unavailability at delivery address</li>
              </ul>
            </div>
          </section>

          {/* Refund Process */}
          <section>
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-amber-800">Refund Process</h2>
            </div>
            <div className="space-y-4 text-amber-700">
              <p><strong>Processing Time:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Refunds are processed within 3-5 business days</li>
                <li>Online payments are refunded to the original payment method</li>
                <li>Cash payments require in-person verification and processing</li>
                <li>You will receive an email confirmation once the refund is processed</li>
              </ul>
              
              <p className="mt-4"><strong>How to Request a Refund:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Call us immediately at +91 81828 38680 or +91 90057 54137</li>
                <li>Provide your order number and reason for refund</li>
                <li>For quality issues, please provide photos if possible</li>
                <li>Our team will assess the situation and process the refund accordingly</li>
              </ul>
            </div>
          </section>

          {/* Delivery Issues */}
          <section>
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-amber-800">Delivery Issues</h2>
            </div>
            <div className="space-y-4 text-amber-700">
              <p><strong>Late Delivery:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>If delivery is delayed by more than 45 minutes, delivery charges will be refunded</li>
                <li>We will keep you informed about any delays</li>
                <li>Weather conditions, traffic, or other external factors may cause delays</li>
              </ul>
              
              <p className="mt-4"><strong>Failed Delivery:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>If delivery fails due to customer unavailability, a re-delivery fee may apply</li>
                <li>Orders not collected within 30 minutes may be disposed of</li>
                <li>We will attempt to contact you before disposing of the order</li>
              </ul>
            </div>
          </section>

          {/* Quality Issues */}
          <section>
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Quality Issues</h2>
            <div className="space-y-4 text-amber-700">
              <p><strong>Reporting Quality Issues:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Report quality issues within 30 minutes of receiving your order</li>
                <li>Provide clear description of the problem</li>
                <li>Photos of the issue are helpful for assessment</li>
                <li>We may request to inspect the food in person</li>
              </ul>
              
              <p className="mt-4"><strong>Quality Standards:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We maintain high standards of food quality and hygiene</li>
                <li>All ingredients are fresh and properly stored</li>
                <li>Food is prepared to order to ensure freshness</li>
                <li>We follow all food safety regulations</li>
              </ul>
            </div>
          </section>

          {/* Special Circumstances */}
          <section>
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Special Circumstances</h2>
            <div className="space-y-4 text-amber-700">
              <p><strong>Force Majeure:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Natural disasters, extreme weather, or government restrictions</li>
                <li>Technical failures or system outages</li>
                <li>Unforeseen circumstances beyond our control</li>
                <li>In such cases, we will communicate clearly and offer appropriate solutions</li>
              </ul>
              
              <p className="mt-4"><strong>Restaurant Closures:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>In case of emergency closures, all affected orders will be fully refunded</li>
                <li>We will notify customers as soon as possible</li>
                <li>Alternative arrangements may be offered when possible</li>
              </ul>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-orange-50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Contact Us</h2>
            <div className="space-y-2 text-amber-700">
              <p>For any questions about our refund and cancellation policy, please contact us:</p>
              <p><strong>Phone:</strong> +91 81828 38680 / +91 90057 54137</p>
              <p><strong>Email:</strong> support@gaonzaika.com</p>
              <p><strong>Address:</strong> Gaon Zaika Restaurant, Janghai, Prayagraj, Uttar Pradesh</p>
              <p><strong>Business Hours:</strong> Monday - Sunday, 11:00 AM - 11:00 PM</p>
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

export default RefundCancellationPolicy; 