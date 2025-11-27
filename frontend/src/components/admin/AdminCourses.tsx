import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, EditIcon, TrashIcon, EyeIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import * as monthSvc from '../../services/monthService';

type Course = {
  _id?: string;
  lessonTitle: string;
  thumbnail?: string;
  year: string;
  month?: string;
  sourceType: 'youtube' | 'zoom' | 'teams';
  sourceUrl: string;
  duration?: string;
  price?: string;
  description?: string;
  instructor?: any;
  status?: string;
};

type Batch = {
  _id?: string;
  year: string;
  title?: string;
  status?: string;
};

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [months, setMonths] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('');

  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [current, setCurrent] = useState<Course | null>(null);
  const [form, setForm] = useState<Partial<Course>>({
    lessonTitle: '',
    year: '',
    sourceType: 'youtube',
    sourceUrl: '',
    duration: '',
    price: 'Free',
    description: '',
    thumbnail: ''
  });

  useEffect(() => {
    loadBatches();
    loadCourses();
    const onBatchUpdated = () => loadBatches();
    const onCourseUpdated = () => loadCourses();
    const onMonthsUpdated = () => loadMonthsFor(form?.year || selectedYear);
    window.addEventListener('batches-updated', onBatchUpdated);
    window.addEventListener('courses-updated', onCourseUpdated);
    window.addEventListener('months-updated', onMonthsUpdated);
    return () => {
      window.removeEventListener('batches-updated', onBatchUpdated);
      window.removeEventListener('courses-updated', onCourseUpdated);
      window.removeEventListener('months-updated', onMonthsUpdated);
    };
  }, []);

  // whenever the course form's year changes, reload months for that year
  useEffect(() => {
    if (form && form.year) {
      loadMonthsFor(form.year as string);
    } else {
      setMonths([]);
    }
  }, [form && form.year]);

  async function loadBatches() {
    try {
      const svc = await import('../../services/batchService');
      const res = await svc.getBatches();
      setBatches(res || []);
    } catch (err: any) {
      console.error('Failed to load batches:', err);
    }
  }

  async function loadMonthsFor(year?: string) {
    if (!year) return setMonths([])
    try {
      const res = await monthSvc.getMonths(year)
      setMonths(res.months || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function loadCourses() {
    setLoading(true);
    try {
      const svc = await import('../../services/courseService');
      const res = await svc.getCourses(selectedYear || undefined);
      setCourses(res.courses || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setCurrent(null);
    setForm({ lessonTitle: '', year: selectedYear || '', month: '', sourceType: 'youtube', sourceUrl: '', duration: '', price: 'Free', description: '', thumbnail: '' });
    setModalOpen(true);
  }

  function openEdit(course: Course) {
    setCurrent(course);
    setForm(course);
    setModalOpen(true);
  }

  function openView(course: Course) {
    setCurrent(course);
    setViewOpen(true);
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    try {
      if (!form.lessonTitle || !form.year || !form.sourceType || !form.sourceUrl) {
        toast.error('Please fill required fields');
        return;
      }

      const svc = await import('../../services/courseService');
      if (current && current._id) {
        await svc.updateCourse(current._id, form);
        toast.success('Course updated');
      } else {
        await svc.createCourse(form);
        toast.success('Course created');
      }
      setModalOpen(false);
      window.dispatchEvent(new CustomEvent('courses-updated'));
      loadCourses();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to save course');
    }
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    if (!confirm('Delete this course?')) return;
    try {
      const svc = await import('../../services/courseService');
      await svc.deleteCourse(id);
      toast.success('Course deleted');
      window.dispatchEvent(new CustomEvent('courses-updated'));
      loadCourses();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to delete');
    }
  }

  const filteredCourses = selectedYear ? courses.filter((c) => c.year === selectedYear) : courses;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Courses</h1>
          <p className="text-gray-600">Create and manage courses for year batches</p>
        </div>
        <button onClick={openNew} className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition">
          <PlusIcon className="w-5 h-5" />
          <span>New Course</span>
        </button>
      </div>

      {loading && <div className="mb-4 text-sm text-gray-600">Loading courses...</div>}

      {/* Batch Filter */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Batch Year</label>
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          <option value="">All Batches</option>
          {batches.map((b) => (
            <option key={b._id} value={b.year}>
              {b.year}
            </option>
          ))}
        </select>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Lesson Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Batch Year</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Source</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-sm text-gray-600">
                    No courses found
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course, index) => (
                  <motion.tr key={course._id || index} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{course.lessonTitle}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700">{course.year}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                        {course.sourceType === 'youtube' ? 'YouTube' : course.sourceType === 'zoom' ? 'Zoom' : 'Teams'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-semibold">{course.price}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${ (course.status || 'Active') === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {course.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => openView(course)} className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition" title="View">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(course)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(course._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">{current ? 'Edit Course' : 'Create Course'}</h2>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={submit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lesson Title *
                    </label>
                    <input
                      required
                      value={form.lessonTitle || ''}
                      onChange={(e) => setForm({ ...form, lessonTitle: e.target.value })}
                      placeholder="e.g., Introduction to React"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year Batch *
                    </label>
                    <select
                      required
                      value={form.year || ''}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Batch</option>
                      {batches.map((b) => (
                        <option key={b._id} value={b.year}>
                          {b.year}
                        </option>
                      ))}
                    </select>
                  </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Month (optional)</label>
                      <select value={form.month || ''} onChange={(e) => setForm({ ...form, month: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select Month</option>
                        {months.map((m) => (
                          <option key={m._id} value={m._id}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source Type *
                    </label>
                    <select
                      required
                      value={form.sourceType || 'youtube'}
                      onChange={(e) => setForm({ ...form, sourceType: e.target.value as any })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="zoom">Zoom</option>
                      <option value="teams">Teams</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      value={form.duration || ''}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      placeholder="e.g., 8 hours"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <input
                      value={form.price || ''}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="e.g., Rs. 5000 or Free"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thumbnail Image URL
                    </label>
                    <input
                      value={form.thumbnail || ''}
                      onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source URL *
                  </label>
                  <input
                    required
                    value={form.sourceUrl || ''}
                    onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                    placeholder={form.sourceType === 'youtube' ? 'https://youtube.com/...' : form.sourceType === 'zoom' ? 'https://zoom.us/...' : 'https://teams.microsoft.com/...'}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    placeholder="Course description"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition">
                    {current ? 'Save Changes' : 'Create Course'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {viewOpen && current && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setViewOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Course: {current.lessonTitle}</h2>
                <button onClick={() => setViewOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {current.thumbnail && (
                  <div className="mb-4">
                    <img src={current.thumbnail} alt="Thumbnail" className="w-full max-w-md h-auto rounded-lg" />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Lesson Title</p>
                    <p className="text-gray-900 font-medium">{current.lessonTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Batch Year</p>
                    <p className="text-gray-900 font-medium">{current.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Source Type</p>
                    <p className="text-gray-900 font-medium">{current.sourceType === 'youtube' ? 'YouTube' : current.sourceType === 'zoom' ? 'Zoom' : 'Teams'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="text-gray-900 font-medium">{current.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="text-gray-900 font-medium">{current.duration || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-gray-900 font-medium">{current.status || 'Active'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-gray-900">{current.description || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Source URL</p>
                  <a href={current.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {current.sourceUrl}
                  </a>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setViewOpen(false);
                      openEdit(current);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold"
                  >
                    Edit
                  </button>
                  <button onClick={() => setViewOpen(false)} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
