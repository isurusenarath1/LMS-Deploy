import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeftIcon, ClockIcon, UsersIcon, StarIcon, CalendarIcon, BookOpenIcon, ShoppingCartIcon, CheckCircleIcon, PlayIcon } from 'lucide-react';

export default function CoursePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return setLoading(false);
      try {
        const svc = await import('../services/courseService');
        const res = await svc.getCourse(id);
        const item = res && (res.course || res) ? (res.course || res) : null;
        if (mounted) {
          setCourse(item);
        }
      } catch (err) {
        console.error('Error loading course', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <div className="min-h-screen w-full bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">Loading...</div>
        <Footer />
      </div>;
  }

  if (!course) {
    return <div className="min-h-screen w-full bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <button onClick={() => navigate('/classes')} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Back to Classes</button>
        </div>
        <Footer />
      </div>;
  }

  const getYearBadgeColor = (year: string) => {
    switch (year) {
      case '2026':
        return 'from-blue-500 to-blue-600';
      case '2027':
        return 'from-purple-500 to-purple-600';
      case '2028':
        return 'from-pink-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const instructorName = course.instructor?.name || course.instructor || 'Instructor';
  const getYoutubeEmbed = (url: string) => {
    if (!url) return null
    const ytIdMatch = url.match(/(?:youtube\.com.*(?:v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    if (ytIdMatch && ytIdMatch[1]) return `https://www.youtube-nocookie.com/embed/${ytIdMatch[1]}?rel=0&modestbranding=1`
    try {
      const u = new URL(url)
      if ((u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) && u.searchParams.get('v')) {
        const id = u.searchParams.get('v')
        return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`
      }
    } catch (e) {
      // ignore
    }
    return null
  }

  const videoSrc = course.sourceType === 'youtube' ? (getYoutubeEmbed(course.sourceUrl) || course.sourceUrl) : course.sourceUrl;
  const isFree = !course.price || course.price === 0 || course.price === 'Free' || course.isFree;
  const priceLabel = typeof course.price === 'number' ? `Rs. ${course.price}` : (course.price || (isFree ? 'Free' : 'Free'));

  // player control state
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const ytPlayerRef = useRef<any>(null)
  const playerContainerIdRef = useRef<string>(`course-preview-yt-${Math.random().toString(36).slice(2)}`)
  const lastTimeRef = useRef<number>(0)
  const qualityLevelsRef = useRef<string[]>([])
  const seekingProgrammaticRef = useRef<boolean>(false)
  const playingStateRef = useRef<boolean>(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const extractYouTubeId = (url: string | undefined) => {
    if (!url) return null
    const m = url.match(/(?:youtube\.com.*(?:v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    if (m && m[1]) return m[1]
    try {
      const u = new URL(url)
      const v = u.searchParams.get('v')
      if (v) return v
    } catch (e) {
      // ignore
    }
    return null
  }

  useEffect(() => {
    if (course.sourceType !== 'youtube') return
    const id = extractYouTubeId(course.sourceUrl)
    if (!id) return

    let pollInterval: any = null

    const onPlayerStateChange = (e: any) => {
      const state = e.data
      try {
        if (state === 1) {
          // playing
        } else if (state === 2) {
          // paused
        } else if (state === 0) {
          // ended - reset to 0 and pause to avoid related UI
          seekingProgrammaticRef.current = true
          try { e.target.seekTo(0, true) } catch (err) {}
          try { e.target.pauseVideo && e.target.pauseVideo() } catch (err) {}
          seekingProgrammaticRef.current = false
        }
      } catch (err) {}
    }

    const createPlayer = () => {
      try {
        ytPlayerRef.current = new (window as any).YT.Player(playerContainerIdRef.current, {
          videoId: id,
          playerVars: {
            controls: 0,
            disablekb: 1,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            fs: 1,
            playsinline: 1,
          },
          events: {
            onReady: (e: any) => {
              try {
                const levels = e.target.getAvailableQualityLevels ? e.target.getAvailableQualityLevels() : []
                qualityLevelsRef.current = levels || []
              } catch (err) {}
            },
            onStateChange: onPlayerStateChange,
          }
        })
      } catch (e) {
        console.error('YT init failed', e)
      }
    }

    if ((window as any).YT && (window as any).YT.Player) createPlayer()
    else {
      const existing = document.getElementById('youtube-iframe-api')
      if (!existing) {
        const s = document.createElement('script')
        s.src = 'https://www.youtube.com/iframe_api'
        s.id = 'youtube-iframe-api'
        document.body.appendChild(s)
      }
      ;(window as any).onYouTubeIframeAPIReady = () => createPlayer()
    }

    const startPoll = () => {
      pollInterval = setInterval(() => {
        try {
          if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
            const t = ytPlayerRef.current.getCurrentTime()
            if (t > lastTimeRef.current + 0.6 && !seekingProgrammaticRef.current) {
              seekingProgrammaticRef.current = true
              try { ytPlayerRef.current.seekTo(lastTimeRef.current, true) } catch (err) {}
              seekingProgrammaticRef.current = false
            } else {
              lastTimeRef.current = t
            }
          }
        } catch (e) {}
      }, 500)
    }

    setTimeout(startPoll, 800)

    return () => {
      try { ytPlayerRef.current && ytPlayerRef.current.destroy && ytPlayerRef.current.destroy() } catch (e) {}
      ytPlayerRef.current = null
      if (pollInterval) clearInterval(pollInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.sourceType, course?.sourceUrl])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTime = () => { lastTimeRef.current = v.currentTime }
    const onSeeking = () => { v.currentTime = lastTimeRef.current }
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('seeking', onSeeking)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('seeking', onSeeking)
    }
  }, [course?.sourceType])

  const handlePlay = async () => {
    if (course.sourceType === 'youtube') {
      try { ytPlayerRef.current && ytPlayerRef.current.playVideo && ytPlayerRef.current.playVideo(); setPlaying(true) } catch (e) {}
    } else {
      if (videoRef.current) { await videoRef.current.play(); setPlaying(true) }
    }
  }
  const handleStop = () => {
    if (course.sourceType === 'youtube') {
      try { ytPlayerRef.current && ytPlayerRef.current.pauseVideo && ytPlayerRef.current.pauseVideo(); ytPlayerRef.current.seekTo && ytPlayerRef.current.seekTo(0) } catch (e) {}
      setPlaying(false)
    } else {
      if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0 }
      setPlaying(false)
    }
  }

  const toggleSize = () => {}

  return <div className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => navigate('/classes')} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition">
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Classes</span>
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div ref={containerRef} className={`relative aspect-video bg-gray-900 flex items-center justify-center`}>
                {course.sourceType === 'youtube' ? (
                  <div id={playerContainerIdRef.current} className="w-full h-full" />
                ) : (videoSrc && (videoSrc.endsWith('.mp4') || videoSrc.includes('.mp4'))) ? (
                  <video ref={videoRef} src={videoSrc} className="w-full h-full object-cover" playsInline />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                    <div className="text-center">
                      <div className="mb-4 text-5xl">{course.sourceType === 'zoom' ? '🎥' : '👥'}</div>
                      <p className="text-lg font-medium mb-2">{course.sourceType === 'zoom' ? 'Zoom Session' : 'Teams Meeting'}</p>
                      <p className="text-sm text-gray-400 mb-4 max-w-sm">Click to open {course.sourceType} session</p>
                      <a href={course.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                        <PlayIcon className="w-5 h-5" />
                        <span>Open {course.sourceType.charAt(0).toUpperCase() + course.sourceType.slice(1)}</span>
                      </a>
                    </div>
                  </div>
                )}

                <div className="absolute right-3 bottom-3 flex items-center space-x-2 bg-white/5 p-2 rounded-md">
                  <button onClick={handlePlay} className="bg-white/90 text-gray-900 p-2 rounded-md shadow hover:scale-105 transition">
                    <PlayIcon className="w-4 h-4" />
                  </button>
                  <button onClick={handleStop} className="bg-red-600 text-white p-2 rounded-md shadow hover:scale-105 transition">Stop</button>
                  <button onClick={() => {
                    try {
                      const el = containerRef.current as any
                      if (!el) return
                      if (el.requestFullscreen) el.requestFullscreen()
                      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
                      else if (el.msRequestFullscreen) el.msRequestFullscreen()
                    } catch (err) {}
                  }} className="bg-white/90 text-gray-900 p-2 rounded-md shadow hover:scale-105 transition">Full</button>

                  <select onChange={(e) => {
                    try {
                      const q = (e.target as HTMLSelectElement).value
                      if (ytPlayerRef.current && ytPlayerRef.current.setPlaybackQuality) ytPlayerRef.current.setPlaybackQuality(q)
                    } catch (err) {}
                  }} className="bg-white/90 text-gray-900 p-2 rounded-md shadow">
                    {(qualityLevelsRef.current && qualityLevelsRef.current.length > 0 ? qualityLevelsRef.current : ['auto']).map((q: any) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`bg-gradient-to-r ${getYearBadgeColor(course.year)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>{course.year}</div>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">{course.level || 'All'}</span>
                {isFree && <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">FREE</span>}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.lessonTitle || course.title}</h1>
              <p className="text-lg text-gray-600 mb-4">by {instructorName}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="w-5 h-5 mr-2 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{course.duration || course.timeDuration || 'N/A'}</p>
                    <p className="text-xs">Duration</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <UsersIcon className="w-5 h-5 mr-2 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{Array.isArray(course.students) ? course.students.length : (course.students || 0)}</p>
                    <p className="text-xs">Students</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <StarIcon className="w-5 h-5 mr-2 text-yellow-600 fill-current" />
                  <div>
                    <p className="font-semibold text-gray-900">{course.rating || 0}</p>
                    <p className="text-xs">Rating</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpenIcon className="w-5 h-5 mr-2 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{course.category || 'General'}</p>
                    <p className="text-xs">Category</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">About This Course</h2>
                <p className="text-gray-700 mb-4">{course.description || course.fullDescription || ''}</p>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {course.schedule || 'TBA'}
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Topics Covered</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(course.topics || []).map((topic: any, index: number) => <div key={index} className="flex items-start space-x-2"><CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-gray-700">{topic}</span></div>)}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
              <ul className="space-y-2">
                {(course.requirements || []).map((req: any, index: number) => <li key={index} className="flex items-start space-x-2"><span className="text-blue-600 mt-1">•</span><span className="text-gray-700">{req}</span></li>)}
              </ul>
            </motion.div>
          </div>
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-2">Price</p>
                <p className={`text-4xl font-bold ${isFree ? 'text-green-600' : 'text-gray-900'}`}>{priceLabel}</p>
              </div>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition">{isFree ? 'Enroll Free' : 'Buy Now'}</button>
                {!isFree && <button className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"><ShoppingCartIcon className="w-5 h-5" /><span>Add to Cart</span></button>}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">This course includes:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start space-x-2"><CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" /><span>Full lifetime access</span></li>
                  <li className="flex items-start space-x-2"><CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" /><span>Certificate of completion</span></li>
                  <li className="flex items-start space-x-2"><CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" /><span>Access on mobile and desktop</span></li>
                  <li className="flex items-start space-x-2"><CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" /><span>Downloadable resources</span></li>
                  <li className="flex items-start space-x-2"><CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" /><span>Live Q&amp;A sessions</span></li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>;
}