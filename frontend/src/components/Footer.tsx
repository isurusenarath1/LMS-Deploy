import React from 'react';
import { Link } from 'react-router-dom';
import { FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon, MailIcon, PhoneIcon, MapPinIcon, } from 'lucide-react';
import logo from '../assets/ppplogo';
export default function Footer() {
  return <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src={logo} alt="PPP Physics" className="w-10 h-10 object-cover rounded-lg" />
              <span className="text-xl font-bold text-white">PPP PHYSICS</span>
            </div>
            <p className="text-sm mb-4">
              Empowering students to master physics through comprehensive
              learning and expert guidance.
            </p>
            <div className="flex space-x-3">
              <a href="https://www.facebook.com/share/19zKJMjzhj/" className="hover:text-blue-400 transition">
                <FacebookIcon className="w-5 h-5" />
              </a>
              {/*<a href="#" className="hover:text-blue-400 transition">
                <TwitterIcon className="w-5 h-5" />
              </a> */}
              <a href="https://www.tiktok.com/@triplepphysics?_r=1&_t=ZS-91UnY2fU8pd" className="hover:text-blue-400 transition">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@gangitha_kalutara?si=16gDFFdL1vpeB2J1" className="hover:text-blue-400 transition">
                <YoutubeIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-blue-400 transition">
                  Home
                </Link>
              </li>
              {/* <li>
                <Link to="/months" className="hover:text-blue-400 transition">
                  Courses
                </Link>
              </li> */}
              <li>
                <Link to="/dashboard" className="hover:text-blue-400 transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-400 transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy-policy" className="hover:text-blue-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="hover:text-blue-400 transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPinIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>123 Physics Lane, Colombo 05, Sri Lanka</span>
              </li>
              <li className="flex items-center space-x-2">
                <PhoneIcon className="w-5 h-5 flex-shrink-0" />
                <span>077 987 39 12</span>
              </li>
              <li className="flex items-center space-x-2">
                <PhoneIcon className="w-5 h-5 flex-shrink-0" />
                <span>071 107 58 36</span>
              </li>
              <li className="flex items-center space-x-2">
                <MailIcon className="w-5 h-5 flex-shrink-0" />
                <span>triplepphysics@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-6 pt-4 text-sm">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between max-w-2xl mx-auto gap-1 px-4">
            <div className="w-full sm:w-auto text-center sm:text-left">&copy; {new Date().getFullYear()} PPP Physics. All rights reserved.</div>
            <div className="w-full sm:w-auto text-center sm:text-right">Developed by IsuruSenarath.</div>
          </div>
        </div>
      </div>
    </footer>;
}