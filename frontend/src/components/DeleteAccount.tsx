import React from 'react';
import { ArrowLeft, UserX, Mail, AlertTriangle } from 'lucide-react';

const DeleteAccount = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-orange-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <UserX className="h-12 w-12 text-red-600 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-red-700">Account Deletion</h1>
          </div>
          <p className="text-xl text-amber-600 max-w-2xl mx-auto">
            Instructions for requesting the deletion of your account and associated data.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-8">
          
          <section>
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <h2 className="text-2xl font-bold text-amber-800">What Happens When You Delete Your Account</h2>
            </div>
            <div className="space-y-4 text-amber-700">
              <p>When you request to delete your account, the following actions will be taken:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your profile and login details will be permanently removed.</li>
                <li>Your order history and active orders will be deleted.</li>
                <li>Your saved addresses and payment methods will be erased.</li>
                <li>You will be unsubscribed from all marketing communications.</li>
              </ul>
              <p className="font-semibold text-red-600">Please note: This action is irreversible. Once your account is deleted, it cannot be recovered.</p>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Mail className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-amber-800">How to Request Account Deletion</h2>
            </div>
            <div className="space-y-4 text-amber-700">
              <p>To request the deletion of your account, please send an email to our support team with the following details:</p>
              
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200 font-mono text-sm">
                <p><strong>To:</strong> gaonzaika@gmail.com</p>
                <p><strong>Subject:</strong> Account Deletion Request</p>
                <br />
                <p><strong>Body:</strong></p>
                <p>I would like to request the permanent deletion of my account and all associated data.</p>
                <p>Registered Name: [Your Full Name]</p>
                <p>Registered Phone Number: [Your Phone Number]</p>
                <p>Registered Email Address: [Your Email Address]</p>
              </div>
              
              <p>Our support team will verify your request and process the deletion within 7-14 business days. You will receive a confirmation email once the process is complete.</p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-orange-50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Need Help?</h2>
            <div className="space-y-2 text-amber-700">
              <p>If you have any questions or face issues regarding account deletion, please contact our support team:</p>
              <p><strong>Phone:</strong> +91 81828 38680 / +91 90057 54137</p>
              <p><strong>Email:</strong> gaonzaika@gmail.com</p>
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

export default DeleteAccount;
