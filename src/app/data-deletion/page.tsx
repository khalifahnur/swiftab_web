import React from 'react';

export const metadata = {
  title: 'Data Deletion Policy | Swiftab',
  description: 'Instructions on how to request account and data deletion for Swiftab.',
};

export default function DataDeletionPage() {
  const contactEmail = 'support@swiftab.co.ke'; 

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <main className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-100">
        
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-6">
            Account & Data Deletion Request
          </h1>
          
          <div className="bg-teal-50 border-l-4 border-teal-600 p-4 rounded-r-xl">
            <p className="text-sm text-teal-900 font-medium">Developer: <span className="font-bold">Musa Ahmed Ibrahim</span></p>
            <p className="text-sm text-teal-900 font-medium mt-1">App Name: <span className="font-bold">Swiftab</span></p>
          </div>
        </div>

        <p className="text-lg text-gray-600 leading-relaxed mb-10">
          At Swiftab, we respect your privacy and give you full control over your data. 
          If you wish to delete your account and all associated personal data, please follow the steps below.
        </p>

        {/* How to Request Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">
            How to Request Account Deletion
          </h2>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="bg-teal-100 text-teal-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
              Option 1: In-App Deletion
            </h3>
            <ul className="list-decimal pl-12 space-y-2 text-gray-600">
              <li>Open the Swiftab app and log in to your account.</li>
              <li>Navigate to the <span className="font-semibold text-gray-800">Profile</span> tab.</li>
              <li>Tap on <span className="font-semibold text-gray-800">Settings</span> (the gear icon).</li>
              <li>Scroll to the bottom and tap <span className="font-semibold text-red-600">Delete Account</span>.</li>
              <li>Confirm your choice. Your account will be scheduled for immediate deletion.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="bg-teal-100 text-teal-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
              Option 2: Web / Email Request
            </h3>
            <p className="text-gray-600 mb-3 pl-11">
              If you have uninstalled the app and wish to delete your data, you can submit a deletion request via email:
            </p>
            <ul className="list-disc pl-16 space-y-2 text-gray-600">
              <li>
                Send an email to <a href={`mailto:${contactEmail}`} className="text-teal-600 hover:text-teal-700 font-medium transition-colors">{contactEmail}</a>.
              </li>
              <li>
                Use the subject line: <span className="font-semibold text-gray-800">"Account Deletion Request - Swiftab"</span>.
              </li>
              <li>
                In the body of the email, please include the <span className="font-medium text-gray-800">email address</span> and <span className="font-medium text-gray-800">phone number</span> associated with your Swiftab account so we can verify your identity.
              </li>
            </ul>
            <p className="mt-4 pl-11 text-sm text-gray-500 italic">
              We will process your request and confirm the deletion within 7 business days.
            </p>
          </div>
        </section>

        {/* What Happens Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">
            What Happens When Your Account is Deleted?
          </h2>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-600 mb-3">
              Data That Will Be Deleted:
            </h3>
            <p className="text-gray-600 mb-3">
              When your deletion request is processed, the following data is permanently erased from our active servers:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Your personal profile information (Name, Email, Phone Number).</li>
              <li>Your past reservation history.</li>
              <li>Your food pre-order history.</li>
              <li>Saved favorite restaurants.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-teal-700 mb-3">
              Data That May Be Retained:
            </h3>
            <p className="text-gray-600 mb-3">
              Please note that certain information may be retained strictly for legal, security, or accounting purposes:
            </p>
            <ul className="space-y-4 text-gray-600">
              
              <li className="flex items-start">
                <span className="text-teal-500 mr-2 mt-1">✓</span>
                <div>
                  <span className="font-semibold text-gray-800">Anonymized Data:</span> We may retain non-personally identifiable, aggregated data (such as general app usage statistics) to help us improve the Swiftab platform. This data cannot be traced back to you.
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-12 bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-gray-600">
            If you have any questions about our data deletion practices, please contact us at{' '}
            <a href={`mailto:${contactEmail}`} className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
              {contactEmail}
            </a>.
          </p>
        </div>

      </main>
    </div>
  );
}