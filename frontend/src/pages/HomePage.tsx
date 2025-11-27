import React, { useEffect, useState } from 'react';
import settingsService from '../services/settingsService';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChevronLeftIcon, ChevronRightIcon, BeakerIcon, BrainIcon, TrophyIcon, StarIcon, CheckCircleIcon, ArrowRightIcon } from 'lucide-react';
const heroSlidesFallback = [{
  title: 'Master Physics with Confidence',
  subtitle: 'Join PPP Physics and unlock your potential',
  image: 'https://github.com/isurusenarath1/Assets-for-portfolio/blob/main/cro2.jpg?raw=true',
  cta: 'Get Started'
}, {
  title: 'Expert-Led Learning',
  subtitle: 'Learn from the best physics educators',
  image: 'https://github.com/isurusenarath1/Assets-for-portfolio/blob/main/cro1.jpg?raw=true',
  cta: 'Explore Classes'
}, {
  title: 'Plan. Prepare. Perform.',
  subtitle: 'Your pathway to physics excellence',
  image: 'https://github.com/isurusenarath1/Assets-for-portfolio/blob/main/cro3.jpg?raw=true',
  cta: 'Learn More'
}];
const specialties = [{
  icon: BeakerIcon,
  title: 'Experimental Physics',
  description: 'Hands-on learning with real-world experiments and practical applications'
}, {
  icon: BrainIcon,
  title: 'Conceptual Understanding',
  description: 'Deep dive into physics principles with expert guidance'
}, {
  icon: TrophyIcon,
  title: 'Exam Excellence',
  description: 'Proven strategies for success in A/L and competitive exams'
}];
const feedbacks = [{
  name: 'Rasika Lakmal',
  badge: '2025 A/L',
  rating: 5,
  comment: 'PPP Physics transformed my understanding of physics. The teaching methodology is outstanding!',
  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
}, {
  name: 'Sithum De Silva',
  badge: '2024 A/L',
  rating: 5,
  comment: 'Best physics class in Sri Lanka. Got an A for my A/L thanks to the excellent guidance here.',
  image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
}, {
  name: 'Kavishka Navinda',
  badge: '2025 A/L',
  rating: 5,
  comment: 'The triple P approach really works! My confidence in physics has grown tremendously.',
  image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop'
}];
function AnimatedSection({
  children
}: {
  children: React.ReactNode;
}) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);
  return <motion.div ref={ref} animate={controls} initial="hidden" variants={{
    visible: {
      opacity: 1,
      y: 0
    },
    hidden: {
      opacity: 0,
      y: 50
    }
  }} transition={{
    duration: 0.6
  }}>
      {children}
    </motion.div>;
}
export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState(heroSlidesFallback);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await settingsService.getSettings();
        if (res && res.success && mounted) {
          const s = res.settings || {};
          if (s.carousel && Array.isArray(s.carousel) && s.carousel.length) {
            // map existing titles from fallback to provided images
            const updated = heroSlidesFallback.map((h, i) => ({ ...h, image: s.carousel[i] || h.image }));
            setHeroSlides(updated);
          }
          setSiteSettings(s);
          // also update teacher/physics images via global state? pages will read from settingsService directly where needed
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % heroSlides.length);
  };
  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
  };
  return <div className="min-h-screen w-full bg-gray-50">
      <Navbar />

      {/* Hero Carousel */}
      <div className="relative h-[600px] overflow-hidden">
        {heroSlides.map((slide, index) => <motion.div key={index} initial={{
        opacity: 0
      }} animate={{
        opacity: currentSlide === index ? 1 : 0
      }} transition={{
        duration: 0.5
      }} className="absolute inset-0" style={{
        pointerEvents: currentSlide === index ? 'auto' : 'none'
      }}>
            <div className="relative h-full">
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <motion.h1 initial={{
                y: 20,
                opacity: 0
              }} animate={{
                y: 0,
                opacity: 1
              }} transition={{
                delay: 0.2
              }} className="text-5xl md:text-6xl font-bold mb-4">
                    {slide.title}
                  </motion.h1>
                  <motion.p initial={{
                y: 20,
                opacity: 0
              }} animate={{
                y: 0,
                opacity: 1
              }} transition={{
                delay: 0.4
              }} className="text-xl md:text-2xl mb-8">
                    {slide.subtitle}
                  </motion.p>
                  <motion.button initial={{
                y: 20,
                opacity: 0
              }} animate={{
                y: 0,
                opacity: 1
              }} transition={{
                delay: 0.6
              }} whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow">
                    {slide.cta}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>)}

        {/* Carousel Controls */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition">
          <ChevronRightIcon className="w-6 h-6" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition ${currentSlide === index ? 'bg-white' : 'bg-white bg-opacity-50'}`} />)}
        </div>
      </div>

      {/* Specialty Section - Teacher Profile */}
      <AnimatedSection>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Specialties
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn from an experienced physics educator dedicated to helping
              students achieve excellence through proven teaching methodologies
              and personalized guidance.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Teacher Photo - Left Side */}
            <div className="relative h-full">
              <img src={siteSettings && siteSettings.teacherImage ? siteSettings.teacherImage : 'https://github.com/isurusenarath1/Assets-for-portfolio/blob/main/c79e695b-f9c1-4a51-892e-36feec27dd7b.png?raw=true'} alt="Physics Teacher" className="w-full h-full object-cover min-h-[500px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            {/* Teacher Details - Right Side */}
            <div className="p-8 lg:p-12">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
                    Lead Physics Instructor
                  </h3>
                  <h4 className="text-3xl font-bold text-gray-900 mb-4">
                    Mr. Gagithaa Kaluthara
                  </h4>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Education
                      </p>
                      <p className="text-gray-600">
                        B.Sc. (Hons) in Physics, University of Colombo
                      </p>
                      <p className="text-gray-600">
                        M.Sc. in Applied Physics, University of Peradeniya
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Professional Roles
                      </p>
                      <ul className="space-y-1">
                        <li className="text-gray-600">
                          • Senior Physics Lecturer at PPP Institute
                        </li>
                        <li className="text-gray-600">
                          • A/L Physics Curriculum Developer
                        </li>
                        <li className="text-gray-600">
                          • Educational Consultant for Physics Programs
                        </li>
                        <li className="text-gray-600">
                          • Author of Physics Study Materials
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Experience
                      </p>
                      <p className="text-gray-600">
                        15+ years of teaching experience with proven track
                        record of student success in A/L examinations
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-blue-600">500+</p>
                      <p className="text-sm text-gray-600">Students Taught</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-purple-600">95%</p>
                      <p className="text-sm text-gray-600">Success Rate</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-indigo-600">15+</p>
                      <p className="text-sm text-gray-600">Years Experience</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* What is Physics Section */}
      <AnimatedSection>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  What is Physics?
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Physics is the natural science that studies matter, its
                  fundamental constituents, its motion and behavior through
                  space and time, and the related entities of energy and force.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  At PPP Physics, we make complex concepts simple and engaging,
                  helping students develop a deep understanding of the physical
                  world around them.
                </p>
                <ul className="space-y-3">
                  {['Mechanics & Motion', 'Electricity & Magnetism', 'Waves & Optics', 'Modern Physics'].map((topic, index) => <li key={index} className="flex items-center space-x-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{topic}</span>
                    </li>)}
                </ul>
              </div>
              <div>
                <img src={siteSettings && siteSettings.physicsImage ? siteSettings.physicsImage : 'https://github.com/isurusenarath1/Assets-for-portfolio/blob/main/b6070d1a-3e02-454d-91f5-bd8acda48fd0.png?raw=true'} alt="Physics Concepts" className="rounded-xl shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Triple P Theory Section */}
      <AnimatedSection>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The Triple P Theory
            </h2>
            <p className="text-xl text-gray-600">
              Our proven methodology for physics mastery
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
            title: 'PLAN',
            description: 'Strategic learning pathways tailored to your goals',
            color: 'blue'
          }, {
            title: 'PREPARE',
            description: 'Comprehensive resources and expert guidance',
            color: 'purple'
          }, {
            title: 'PERFORM',
            description: 'Excel in exams with confidence and knowledge',
            color: 'yellow'
          }].map((p, index) => <motion.div key={index} whileHover={{
            scale: 1.05
          }} className={`bg-gradient-to-br from-${p.color}-500 to-${p.color}-600 text-white p-8 rounded-xl shadow-lg`}>
                <div className="text-6xl font-bold mb-4 opacity-20">
                  {index + 1}
                </div>
                <h3 className="text-3xl font-bold mb-3">{p.title}</h3>
                <p className="text-lg">{p.description}</p>
                <ArrowRightIcon className="w-6 h-6 mt-4" />
              </motion.div>)}
          </div>
        </div>
      </AnimatedSection>

      {/* Feedback Section */}
      <AnimatedSection>
        <div className="bg-gray-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Student Success Stories
              </h2>
              <p className="text-xl text-gray-600">
                Hear from our accomplished students
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {feedbacks.map((feedback, index) => <motion.div key={index} whileHover={{
              y: -5
            }} className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center mb-4">
                    <img src={feedback.image} alt={feedback.name} className="w-12 h-12 rounded-full mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {feedback.name}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {feedback.badge} Batch
                      </span>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(feedback.rating)].map((_, i) => <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                  </div>
                  <p className="text-gray-700 italic">"{feedback.comment}"</p>
                </motion.div>)}
            </div>
          </div>
        </div>
      </AnimatedSection>

      <Footer />
    </div>;
}