import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import userService from '../services/userService'
import orderService from '../services/orderService'
import payhereService from '../services/payhereService'

export default function CheckoutPage() {
  const cart = useCart()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [nic, setNic] = useState('')
  const [batch, setBatch] = useState('')
  const [bankRef, setBankRef] = useState('')
  const [bankSlipFile, setBankSlipFile] = useState<File | null>(null)
  const [bankSlipPreview, setBankSlipPreview] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'bank'|'cash'|'online'>('bank')

  const canSubmit = cart.count > 0 && name && email && (paymentMethod !== 'bank' || (bankRef && bankSlipFile))

  useEffect(() => {
    // try to autofill from authenticated profile
    let mounted = true
    async function loadProfile() {
      try {
        const prof = await userService.getProfile()
        if (!mounted) return
        if (prof && prof.user) {
          setName(prev => prev || prof.user.name || '')
          setEmail(prev => prev || prof.user.email || '')
          setPhone(prev => prev || prof.user.phone || '')
          setAddress(prev => prev || prof.user.address || '')
          setNic(prev => prev || prof.user.nic || '')
        }
      } catch (err) {
        // ignore if not authenticated or error
      }
    }
    loadProfile()

    // derive batch from cart if possible
    if (!batch && cart.items.length > 0) {
      // prefer first item's batchYear
      const b = cart.items[0].batchYear || ''
      if (b) setBatch(b)
    }

    return () => { mounted = false }
  }, [])

  const handleFillProfile = async () => {
    try {
      const prof = await userService.getProfile()
      if (prof && prof.user) {
        setName(prof.user.name || '')
        setEmail(prof.user.email || '')
        setPhone(prof.user.phone || '')
        setAddress(prof.user.address || '')
        setNic(prof.user.nic || '')
      } else {
        toast.error('No profile data available')
      }
    } catch (err) {
      toast.error('Unable to fetch profile (not logged in?)')
    }
  }

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!canSubmit) return toast.error('Please fill required details and add items to cart')
    // prepare payment details (for bank transfer, include ref and slip data)
    let paymentDetails: any = { method: paymentMethod }
    if (paymentMethod === 'bank') {
      paymentDetails.reference = bankRef
      if (bankSlipFile) {
        try {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const fr = new FileReader()
            fr.onload = () => resolve(String(fr.result || ''))
            fr.onerror = (err) => reject(err)
            fr.readAsDataURL(bankSlipFile)
          })
          paymentDetails.slipName = bankSlipFile.name
          paymentDetails.slipData = dataUrl
        } catch (err) {
          console.error('Failed to read slip file', err)
        }
      }
    }

    // simulate order creation
    const order = {
      id: `ORD-${Date.now()}`,
      items: cart.items,
      total: cart.total,
      customer: { name, email, phone, address, nic, batch },
      payment: paymentDetails,
      paymentMethod,
      createdAt: new Date()
    }
    // persist to backend
    try {
      const res = await orderService.createOrder(order)
      if (!(res && res.success)) {
        // fallback to localStorage when API doesn't succeed
        const ordersRaw = localStorage.getItem('orders')
        const orders = ordersRaw ? JSON.parse(ordersRaw) : []
        orders.push(order)
        localStorage.setItem('orders', JSON.stringify(orders))
        cart.clear()
        toast.success('Order placed (saved locally)')
        navigate('/dashboard')
        return
      }

      const createdOrder = res.order;

      if (paymentMethod === 'online') {
        // create payhere payload from server and redirect user
        try {
          const p = await payhereService.createCheckout(createdOrder._id, {
            return_url: `${window.location.origin}/checkout/return`,
            cancel_url: `${window.location.origin}/checkout/cancel`
          })
          if (p && p.success && p.action && p.fields) {
            // create form and submit
            const form = document.createElement('form')
            form.method = 'POST'
            form.action = p.action
            for (const k in p.fields) {
              const inp = document.createElement('input')
              inp.type = 'hidden'
              inp.name = k
              inp.value = p.fields[k]
              form.appendChild(inp)
            }
            document.body.appendChild(form)
            form.submit()
            return
          } else {
            toast.error('Failed to initiate online payment')
            return
          }
        } catch (err) {
          console.error('PayHere create error', err)
          toast.error('Failed to initiate online payment')
          return
        }
      }

      // non-online flows: clear cart and navigate to dashboard
      cart.clear()
      toast.success('Order placed')
      navigate('/dashboard')
      return
    } catch (err) {
      console.error(err)
      toast.error('Failed to create order')
    }
  }

  const handleSlipChange = (f?: File | null) => {
    if (!f) {
      setBankSlipFile(null)
      setBankSlipPreview(null)
      return
    }
    setBankSlipFile(f)
    // generate preview (image/pdf will create data url)
    const fr = new FileReader()
    fr.onload = () => setBankSlipPreview(String(fr.result || ''))
    fr.readAsDataURL(f)
  }

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).then(() => {
        toast.success('Account number copied')
      }).catch(() => {
        toast.error('Unable to copy')
      })
    } else {
      try {
        // fallback
        const ta = document.createElement('textarea')
        ta.value = text
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        toast.success('Account number copied')
      } catch (err) {
        toast.error('Copy not supported')
      }
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-2xl font-bold mb-4">Checkout</h1>
          <div className="bg-white rounded-xl shadow-md p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded" />
              </div>
              <div className="flex items-center justify-end">
                <button type="button" onClick={handleFillProfile} className="text-sm text-blue-600 hover:underline">Autofill from profile</button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Permanent / postal address" className="w-full p-3 border rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">NIC</label>
                <input value={nic} onChange={(e) => setNic(e.target.value)} placeholder="National ID number" className="w-full p-3 border rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Batch</label>
                <input value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="e.g. 2025" className="w-full p-3 border rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="pm" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} />
                    <span>Bank Transfer</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="pm" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                    <span>Cash</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="pm" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
                    <span>Card Payment</span>
                  </label>
                </div>
              </div>

              {paymentMethod === 'bank' && (
                <div className="p-3 bg-gray-50 border border-gray-100 rounded space-y-3">
                  <p className="text-sm font-medium text-gray-700">Bank Transfer — submit slip & reference</p>
                  <div>
                    <label className="block text-sm text-gray-600">Reference Number *</label>
                    <input value={bankRef} onChange={(e) => setBankRef(e.target.value)} placeholder="e.g. TXN123456" className="w-full p-3 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Upload Bank Transfer Slip (image or PDF) *</label>
                    <input type="file" accept="image/*,.pdf" onChange={(e) => handleSlipChange(e.target.files ? e.target.files[0] : null)} className="mt-2" />
                    {bankSlipPreview && (
                      <div className="mt-2 flex items-start gap-3">
                        {bankSlipPreview.startsWith('data:image') ? (
                          <img src={bankSlipPreview} alt="slip preview" className="w-28 h-20 object-cover rounded border" />
                        ) : (
                          <a href={bankSlipPreview} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">Open uploaded file</a>
                        )}
                        <button type="button" onClick={() => handleSlipChange(null)} className="text-sm text-red-600">Remove</button>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">We will verify your payment using this slip. Keep a copy for your records.</div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Back</button>
                <button type="submit" disabled={!canSubmit} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded">Place Order</button>
              </div>
            </form>

            <div>
              <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
              <div className="space-y-3">
                {cart.items.map(i => (
                  <div key={i.monthId} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{i.name}</div>
                      <div className="text-xs text-gray-500">{i.batchYear}</div>
                    </div>
                    <div className="font-semibold">{i.price ? `LKR ${i.price}` : 'Free'}</div>
                  </div>
                ))}
              </div>

              <div className="border-t mt-4 pt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">Total</div>
                <div className="font-semibold">LKR {cart.total}</div>
              </div>

              {/* Bank Details - eye-catching card */}
              <div className="mt-6">
                <div className="rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs opacity-80">Bank Transfer Details</div>
                      <div className="text-lg font-bold">HNB Bank</div>
                       <div className="font-semibold">Uhana Branch</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-80">Account Name</div>
                      <div className="font-semibold">Gangitha Kaluthara</div>
                    </div>
                  </div>
                  <div className="bg-white p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">Account Number</div>
                      <div className="font-mono text-lg">123456789</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => copyToClipboard('123456789')} className="px-3 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm">Copy</button>
                      <button type="button" onClick={() => toast('Use this Bank Details when you make the transfer and Submit Payment Slip with reference number')} className="px-3 py-2 border rounded-md text-sm">How to pay</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
