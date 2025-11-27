import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { ArrowLeftIcon, PlayIcon, BookOpenIcon, Users, Clock, Tag, Grid3X3Icon } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '../context/CartContext'

type Course = {
  _id?: string
  lessonTitle: string
  thumbnail?: string
  year: string
  sourceType: 'youtube' | 'zoom' | 'teams'
  sourceUrl: string
  duration?: string
  price?: string
  description?: string
  status?: string
  locked?: boolean
  month?: {
    _id?: string
    name?: string
    title?: string
    price?: number
    currency?: string
    batchYear?: string
  }
}

type VideoPlayerProps = {
  sourceType: 'youtube' | 'zoom' | 'teams'
  sourceUrl: string
  title: string
}

function VideoPlayer({ sourceType, sourceUrl, title }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const ytPlayerRef = useRef<any>(null)
  const playerContainerIdRef = useRef<string>(`yt-player-${Math.random().toString(36).slice(2)}`)
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
    // init youtube player if needed
    if (sourceType !== 'youtube') return
    const id = extractYouTubeId(sourceUrl)
    if (!id) return

    let pollInterval: any = null

    const onPlayerStateChange = (e: any) => {
      // YT states: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering
      const state = e.data
      try {
        if (state === 1) { // playing
          // nothing special here
        } else if (state === 2) { // paused
          // paused
        } else if (state === 0) { // ended
          // prevent related videos UI by resetting to 0 and pausing
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
            controls: 0, // hide default controls
            disablekb: 1, // disable keyboard to prevent seeking
            rel: 0, // related videos from same channel only
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
        console.error('YT player init failed', e)
      }
    }

    if ((window as any).YT && (window as any).YT.Player) {
      createPlayer()
    } else {
      // load API
      const existing = document.getElementById('youtube-iframe-api')
      if (!existing) {
        const s = document.createElement('script')
        s.src = 'https://www.youtube.com/iframe_api'
        s.id = 'youtube-iframe-api'
        document.body.appendChild(s)
      }
      ;(window as any).onYouTubeIframeAPIReady = () => {
        createPlayer()
      }
    }

    const startPoll = () => {
      pollInterval = setInterval(() => {
        try {
          if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
            const t = ytPlayerRef.current.getCurrentTime()
            if (t > lastTimeRef.current + 0.6 && !seekingProgrammaticRef.current) {
              // reset to previous
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

    // start polling shortly after player setup
    setTimeout(startPoll, 800)

    return () => {
      try {
        if (ytPlayerRef.current && ytPlayerRef.current.destroy) ytPlayerRef.current.destroy()
        ytPlayerRef.current = null
      } catch (e) {
        // ignore
      }
      if (pollInterval) clearInterval(pollInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceType, sourceUrl])

  useEffect(() => {
    // for HTML5 videos prevent seeking by resetting to lastTime
    const v = videoRef.current
    if (!v) return
    const onTime = () => {
      lastTimeRef.current = v.currentTime
    }
    const onSeeking = () => {
      // if seeking forward/backward, reset to last known time
      v.currentTime = lastTimeRef.current
    }
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('seeking', onSeeking)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('seeking', onSeeking)
    }
  }, [sourceType])

  const handlePlay = async () => {
    if (sourceType === 'youtube') {
      try {
        if (ytPlayerRef.current && ytPlayerRef.current.playVideo) {
          ytPlayerRef.current.playVideo()
          setPlaying(true)
        }
      } catch (e) {
        console.error(e)
      }
    } else {
      if (videoRef.current) {
        await videoRef.current.play()
        setPlaying(true)
      }
    }
  }

  const handleStop = () => {
    if (sourceType === 'youtube') {
      try {
        if (ytPlayerRef.current && ytPlayerRef.current.pauseVideo) {
          ytPlayerRef.current.pauseVideo()
          ytPlayerRef.current.seekTo && ytPlayerRef.current.seekTo(0)
        }
      } catch (e) {
        console.error(e)
      }
      setPlaying(false)
    } else {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }
      setPlaying(false)
    }
  }


  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      <div ref={containerRef} className={`relative aspect-video bg-gray-900 flex items-center justify-center`}>
        {
          sourceType === 'youtube' ? (
            <div id={playerContainerIdRef.current} className="w-full h-full" />
          ) : (sourceUrl && (sourceUrl.endsWith('.mp4') || sourceUrl.includes('.mp4'))) ? (
            <video ref={videoRef} src={sourceUrl} className="w-full h-full object-cover" playsInline />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white">
              <div className="text-center">
                <div className="mb-4 text-5xl">{sourceType === 'zoom' ? '🎥' : '👥'}</div>
                <p className="text-lg font-medium mb-2">{sourceType === 'zoom' ? 'Zoom Session' : 'Teams Meeting'}</p>
                <p className="text-sm text-gray-400 mb-4 max-w-sm">Click to open {sourceType} session</p>
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                  <PlayIcon className="w-5 h-5" />
                  <span>Open {sourceType.charAt(0).toUpperCase() + sourceType.slice(1)}</span>
                </a>
              </div>
            </div>
          )
        }

        {/* Controls overlay - Play, Stop, Fullscreen, Quality (no seek) */}
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
  )
}


export default function BatchDetailPage() {
  const { year } = useParams<{ year: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const cart = useCart()
  const [viewingCourseId, setViewingCourseId] = useState<string | null>(null)

  useEffect(() => {
    loadCourses()
  }, [year])

  async function loadCourses() {
    setLoading(true)
    try {
      const svc = await import('../services/courseService')
      const month = searchParams.get('month') || undefined
      const res = await svc.getCourses(year, month)
      if (res.courses) {
        setCourses(res.courses)
        if (res.courses.length > 0) {
          setSelectedCourse(res.courses[0])
        }
      }
    } catch (err: any) {
      console.error('Failed to load courses:', err)
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  if (!year) {
    return (
      <div className="min-h-screen w-full bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Batch Not Found</h1>
          <button onClick={() => navigate('/classes')} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Back to Classes
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-lg font-bold">{year} Batch</div>
            <div className="text-gray-600">{courses.length} courses available</div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Year {year} Courses</h1>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading courses...</div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Courses Found</h2>
            <p className="text-gray-600">No courses are available for this batch yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Video Player */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {selectedCourse && (
                    <div key={selectedCourse._id}>
                    {selectedCourse.locked ? (
                      <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <h3 className="text-2xl font-bold mb-4">This content is locked</h3>
                        <p className="text-gray-600 mb-6">You need to purchase the month to access this course.</p>
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => {
                            // add month to cart and go to checkout
                            if (selectedCourse.month && selectedCourse.month._id) {
                              const m = selectedCourse.month
                              const item = {
                                id: `${m._id}`,
                                name: `${m.name} - ${m.title || ''}`,
                                batchYear: m.batchYear || year || '',
                                monthId: String(m._id),
                                price: m.price || 0,
                                currency: m.currency || 'LKR'
                              }
                              cart.addItem(item)
                              navigate('/checkout')
                            } else {
                              navigate(`/batch/${year}/months`)
                            }
                          }} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md">Buy Month</button>
                          <button onClick={() => navigate(`/batch/${year}/months`)} className="px-4 py-2 border rounded">View Month</button>
                        </div>
                      </div>
                    ) : (
                      <VideoPlayer sourceType={selectedCourse.sourceType} sourceUrl={selectedCourse.sourceUrl} title={selectedCourse.lessonTitle} />
                    )}

                    {/* Course Info */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md p-6">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedCourse.lessonTitle}</h2>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {selectedCourse.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-600">Duration</p>
                              <p className="font-semibold text-gray-900">{selectedCourse.duration}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Tag className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-xs text-gray-600">Price</p>
                            <p className="font-semibold text-gray-900">{selectedCourse.price || 'TBA'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Grid3X3Icon className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-xs text-gray-600">Platform</p>
                            <p className="font-semibold text-gray-900 capitalize">{selectedCourse.sourceType}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Status</p>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${ (selectedCourse.status || 'Active') === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {selectedCourse.status || 'Active'}
                          </span>
                        </div>
                      </div>

                      {selectedCourse.description && (
                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">About This Course</h3>
                          <p className="text-gray-700">{selectedCourse.description}</p>
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Course Sidebar */}
            <div>
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Grid3X3Icon className="w-5 h-5" />
                  Courses ({courses.length})
                </h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {courses.map((course) => (
                    <motion.button
                      key={course._id}
                      onClick={() => setSelectedCourse(course)}
                      whileHover={{ scale: 1.02 }}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedCourse?._id === course._id ? 'bg-blue-100 border-2 border-blue-600' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <PlayIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{course.lessonTitle}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${ course.sourceType === 'youtube' ? 'bg-red-100 text-red-800' : course.sourceType === 'zoom' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                              {course.sourceType.charAt(0).toUpperCase() + course.sourceType.slice(1)}
                            </span>
                          </div>
                          {course.price && <p className="text-xs text-gray-600 mt-1">{course.price}</p>}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
