import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SendIcon, UsersIcon, BellIcon, BookOpenIcon, MessageCircleIcon } from 'lucide-react';
import telegramService from '../services/telegramService';

export default function TelegramChannels() {
  const [channels, setChannels] = useState<any[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await telegramService.listPublicChannels();
        if (mounted && res && res.success) setChannels(res.channels || []);
      } catch (err) {
        console.error('Failed to load channels', err);
      }
    })();
    return () => { mounted = false; };
  }, []);
  const benefits = ['Instant updates on class schedules and changes', 'Direct communication with instructors', 'Access to exclusive study materials', 'Participate in group discussions', 'Get quick answers to your questions', 'Stay informed about upcoming events'];
  return <div className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <SendIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join Our Telegram Community
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay connected with PPP Physics through our active Telegram
            channels. Get instant updates, study materials, and connect with
            fellow physics enthusiasts.
          </p>
        </div>
        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {channels.map((channel: any, index: number) => {
          const Icon = channel.icon ? channel.icon : SendIcon;
          // members count unknown from API - keep placeholder
          const members = channel.members || '';
          // fallback color
          const color = (channel.color || 'blue').toString();
          return <div key={channel._id || index} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
                <div className={`p-6`} style={{ background: 'linear-gradient(90deg, rgba(59,130,246,1) 0%, rgba(99,102,241,1) 100%)' }}>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {channel.name}
                      </h3>
                      <div className="flex items-center space-x-1 text-white text-sm opacity-90">
                        <UsersIcon className="w-4 h-4" />
                        <span>{members} {members ? 'members' : ''}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 mb-4">{channel.description}</p>
                  <a href={channel.link} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition`}>
                    <SendIcon className="w-4 h-4" />
                    <span>Join Channel</span>
                  </a>
                </div>
              </div>;
        })}
        </div>
        {/* Benefits Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Join Our Telegram Channels?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <p className="text-gray-700">{benefit}</p>
              </div>)}
          </div>
        </div>
        {/* How to Join Section */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            How to Join
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Download Telegram
              </h3>
              <p className="text-gray-600 text-sm">
                Get the Telegram app from your app store if you don't have it
                already
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Click Join Channel
              </h3>
              <p className="text-gray-600 text-sm">
                Click on the "Join Channel" button for the channels you're
                interested in
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Stay Connected
              </h3>
              <p className="text-gray-600 text-sm">
                Enable notifications to never miss important updates and
                announcements
              </p>
            </div>
          </div>
        </div>
        {/* CTA Section */}
        <div className="text-center mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Join the Community?
          </h2>
          <p className="text-lg mb-6 text-blue-100">
            Join thousands of students already benefiting from our Telegram
            channels
          </p>
          <a href="https://t.me/pppphysics" target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:shadow-xl transition text-lg">
            <SendIcon className="w-6 h-6" />
            <span>Join Main Channel Now</span>
          </a>
        </div>
      </div>
      <Footer />
    </div>;
}