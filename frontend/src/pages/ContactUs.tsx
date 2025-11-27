import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MailIcon, PhoneIcon, MapPinIcon, SendIcon, ClockIcon, FacebookIcon, YoutubeIcon } from 'lucide-react';
import { SiTiktok } from 'react-icons/si';
import contactService from '../services/contactService';
import { toast } from 'sonner';
export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await contactService.sendMessage(formData);
      if (res && res.success) {
        toast.success('Message sent — thank you!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(res.message || 'Failed to send message');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error sending message');
    }
  };
  return <div className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h1>
          <p className="text-xl text-gray-600">
            We're here to help and answer any questions you might have
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <PhoneIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone</h3>
            <p className="text-gray-600">+94 11 234 5678</p>
            <p className="text-sm text-gray-500 mt-1">Mon-Fri 9am-6pm</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <MailIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600">info@pppphysics.edu</p>
            <p className="text-sm text-gray-500 mt-1">
              We'll respond within 24 hours
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <MapPinIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Location
            </h3>
            <p className="text-gray-600">123 Physics Lane</p>
            <p className="text-gray-600">Colombo 05, Sri Lanka</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 lg:p-12 text-white">
              <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-6 mb-8">
                <div className="flex items-start space-x-4">
                  <MapPinIcon className="w-6 h-6 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Address</p>
                    <p className="text-blue-100">
                      123 Physics Lane, Colombo 05, Sri Lanka
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <PhoneIcon className="w-6 h-6 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Phone</p>
                    <p className="text-blue-100">+94 71 107 5836</p>
                    <p className="text-blue-100">+94 77 987 3912</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <MailIcon className="w-6 h-6 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Email</p>
                    <p className="text-blue-100">triplepphysics@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <ClockIcon className="w-6 h-6 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Office Hours</p>
                    <p className="text-blue-100">
                      Monday - Sunday: 9:00 AM - 6:00 PM
                    </p>
                    <p className="text-blue-100">Saturday: 9:00 AM - 1:00 PM</p>
                    <p className="text-blue-100">Sunday: Closed</p>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-blue-400">
                <h3 className="text-xl font-semibold mb-3">Follow Us</h3>
                <p className="text-blue-100 mb-4">
                  Stay connected on social media for updates and physics tips
                </p>
                <div className="flex space-x-4">
                  <a href="https://www.facebook.com/share/19zKJMjzhj/" aria-label="Facebook" className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition">
                    <FacebookIcon className="w-5 h-5 text-white" />
                  </a>
                  <a href="https://www.tiktok.com/@triplepphysics?_r=1&_t=ZS-91UnY2fU8pd" aria-label="TikTok" className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition">
                    <SiTiktok className="w-5 h-5 text-white" />
                  </a>
                  <a href="https://youtube.com/@gangitha_kalutara?si=16gDFFdL1vpeB2J1" aria-label="YouTube" className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition">
                    <YoutubeIcon className="w-5 h-5 text-white" />
                  </a>
                </div>
              </div>
            </div>
            <div className="p-8 lg:p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="Enter your full name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email *
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="your.email@example.com" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="What is this regarding?" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea name="message" value={formData.message} onChange={handleChange} rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none" placeholder="Tell us more about your inquiry..." required></textarea>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center justify-center space-x-2">
                  <SendIcon className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>;
}