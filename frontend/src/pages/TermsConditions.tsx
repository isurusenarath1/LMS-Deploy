import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FileTextIcon } from 'lucide-react';
export default function TermsConditions() {
  return <div className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white">
            <div className="flex items-center space-x-3 mb-2">
              <FileTextIcon className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Terms and Conditions</h1>
            </div>
            <p className="text-purple-100">Last updated: December 15, 2024</p>
          </div>
          <div className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Agreement to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using the PPP Physics platform, you agree to be
                bound by these Terms and Conditions. If you disagree with any
                part of the terms, you may not access the service. These terms
                apply to all students, parents, and visitors of the platform.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Use License
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Permission is granted to temporarily access the materials on PPP
                Physics's website for personal, non-commercial educational
                purposes only. This is the grant of a license, not a transfer of
                title, and under this license you may not:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-gray-700 flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>
                    Modify or copy the materials for commercial purposes
                  </span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>
                    Use the materials for any public display or commercial
                    purpose
                  </span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>
                    Attempt to decompile or reverse engineer any software
                    contained on PPP Physics's website
                  </span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>
                    Remove any copyright or other proprietary notations from the
                    materials
                  </span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>
                    Transfer the materials to another person or mirror the
                    materials on any other server
                  </span>
                </li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Student Responsibilities
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                As a student of PPP Physics, you agree to:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-gray-700 flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>
                    Maintain regular attendance and participate actively in
                    classes
                  </span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>
                    Complete assignments and tests honestly without plagiarism
                  </span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>Respect instructors and fellow students</span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>Make timely payments for enrolled classes</span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>
                    Not share login credentials or course materials with
                    unauthorized persons
                  </span>
                </li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Payment Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                All class fees must be paid according to the payment schedule
                provided at enrollment. Late payments may result in suspension
                of access to classes and materials. Refund requests must be made
                within 7 days of enrollment and are subject to our refund
                policy. No refunds will be issued after attending more than two
                classes.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Intellectual Property
              </h2>
              <p className="text-gray-700 leading-relaxed">
                All course materials, including but not limited to videos,
                notes, presentations, and test papers, are the intellectual
                property of PPP Physics and are protected by copyright laws.
                Unauthorized distribution, reproduction, or sharing of these
                materials is strictly prohibited and may result in legal action.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Disclaimer
              </h2>
              <p className="text-gray-700 leading-relaxed">
                The materials on PPP Physics's website are provided on an "as
                is" basis. PPP Physics makes no warranties, expressed or
                implied, and hereby disclaims and negates all other warranties
                including, without limitation, implied warranties or conditions
                of merchantability, fitness for a particular purpose, or
                non-infringement of intellectual property. While we strive for
                excellence in education, we do not guarantee specific exam
                results or academic outcomes.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                In no event shall PPP Physics or its suppliers be liable for any
                damages (including, without limitation, damages for loss of data
                or profit, or due to business interruption) arising out of the
                use or inability to use the materials on PPP Physics's website.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Modifications
              </h2>
              <p className="text-gray-700 leading-relaxed">
                PPP Physics may revise these terms of service at any time
                without notice. By using this website, you are agreeing to be
                bound by the then current version of these terms of service.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms and Conditions,
                please contact us:
              </p>
              <div className="mt-3 p-4 bg-purple-50 rounded-lg">
                <p className="text-gray-800">
                  <strong>Email:</strong> info@pppphysics.edu
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