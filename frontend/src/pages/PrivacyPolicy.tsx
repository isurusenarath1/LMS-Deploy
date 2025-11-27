import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheckIcon } from 'lucide-react';
export default function PrivacyPolicy() {
  return <div className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center space-x-3 mb-2">
              <ShieldCheckIcon className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-blue-100">Last updated: December 15, 2024</p>
          </div>
          <div className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                PPP Physics ("we", "our", or "us") respects your privacy and is
                committed to protecting your personal data. This privacy policy
                will inform you about how we look after your personal data when
                you visit our website and tell you about your privacy rights and
                how the law protects you.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                The Data We Collect About You
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We may collect, use, store and transfer different kinds of
                personal data about you which we have grouped together as
                follows:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    <strong>Identity Data:</strong> First name, last name,
                    username or similar identifier, student ID
                  </span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    <strong>Contact Data:</strong> Email address, telephone
                    numbers, physical address
                  </span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    <strong>Technical Data:</strong> Internet protocol (IP)
                    address, login data, browser type and version, device
                    information
                  </span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    <strong>Usage Data:</strong> Information about how you use
                    our website, services, and learning materials
                  </span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    <strong>Academic Data:</strong> Test scores, grades,
                    attendance records, and progress reports
                  </span>
                </li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How We Use Your Personal Data
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We will only use your personal data when the law allows us to.
                Most commonly, we will use your personal data in the following
                circumstances:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    To provide educational services and manage your enrollment
                  </span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    To track your academic progress and provide personalized
                    learning recommendations
                  </span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    To communicate with you about classes, tests, and important
                    updates
                  </span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    To process payments and maintain financial records
                  </span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    To improve our services and develop new educational content
                  </span>
                </li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We have put in place appropriate security measures to prevent
                your personal data from being accidentally lost, used or
                accessed in an unauthorized way, altered or disclosed. We limit
                access to your personal data to those employees, agents,
                contractors and other third parties who have a business need to
                know.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Legal Rights
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Under certain circumstances, you have rights under data
                protection laws in relation to your personal data, including the
                right to:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Request access to your personal data</span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Request correction of your personal data</span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Request erasure of your personal data</span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Object to processing of your personal data</span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    Request restriction of processing your personal data
                  </span>
                </li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this privacy policy or our
                privacy practices, please contact us at:
              </p>
              <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-800">
                  <strong>Email:</strong> privacy@pppphysics.edu
                </p>
                <p className="text-gray-800">
                  <strong>Phone:</strong> +94 11 234 5678
                </p>
                <p className="text-gray-800">
                  <strong>Address:</strong> 123 Physics Lane, Colombo 05, Sri
                  Lanka
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>;
}