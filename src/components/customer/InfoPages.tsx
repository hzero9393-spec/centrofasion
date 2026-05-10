'use client';

import React, { useState } from 'react';
import { useNavigation } from '@/stores/navigation';
import { useAuth } from '@/stores/auth';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Truck,
  RefreshCw,
  ShieldCheck,
  Search,
  HelpCircle,
  FileText,
  Package,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Send,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/* ════════════════════════════════════════════════════════════════
   Shared Page Shell
   ════════════════════════════════════════════════════════════════ */
function PageShell({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  const { goBack } = useNavigation();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
      <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] mb-6 transition-colors">
        <ChevronLeft className="size-4" />
        Back
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary)]/10 flex items-center justify-center">
            <Icon className="size-5 text-[var(--theme-primary)]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--theme-text)]">{title}</h1>
        </div>
        <p className="text-sm text-[var(--theme-text-muted)] ml-[52px]">{subtitle}</p>
      </div>

      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   FAQ Page
   ════════════════════════════════════════════════════════════════ */
const faqData = [
  {
    category: 'Orders & Shipping',
    items: [
      { q: 'How do I place an order?', a: 'Browse our collection, select the items you love, choose your size and color, add them to your cart, and proceed to checkout. Enter your delivery details and confirm your order. You will receive an order confirmation via SMS on your registered mobile number.' },
      { q: 'How can I track my order?', a: 'Go to the "Track Order" page from the Support section in footer, or navigate to Profile > My Orders. Enter your order number or click on any order to see its real-time status — from Packing to Shipping to Delivered.' },
      { q: 'What are the delivery timelines?', a: 'Standard delivery takes 3-7 business days depending on your location. Metro cities usually get delivery within 2-4 days. During sale periods or festive seasons, delivery may take 1-2 extra days. You will receive SMS updates at every stage.' },
      { q: 'Do you charge for delivery?', a: 'Delivery is FREE for all orders above ₹499. For orders below ₹499, a flat shipping fee of ₹49 is charged. We also offer express delivery (1-2 days) for an additional ₹99 in select cities.' },
      { q: 'Can I change my delivery address after placing an order?', a: 'Yes, you can request an address change before your order is shipped. Go to Profile > My Orders, select the order, and contact us. Once the order is shipped, the address cannot be changed.' },
    ],
  },
  {
    category: 'Returns & Exchange',
    items: [
      { q: 'What is your return policy?', a: 'We offer a 7-day return/exchange policy from the date of delivery. Items must be unused, unwashed, and in their original condition with all tags attached. Some items like innerwear, socks, and customized products are non-returnable.' },
      { q: 'How do I initiate a return?', a: 'Go to Profile > My Orders, select the delivered order you want to return, and click "Return". Select the reason for return and submit. Our team will review your request within 24 hours and arrange a pickup.' },
      { q: 'When will I get my refund?', a: 'After we receive and inspect your returned item, the refund is processed within 5-7 business days. The amount will be credited back to your original payment method. For COD orders, refund is processed to your bank account or as store credit.' },
      { q: 'Can I exchange for a different size/color?', a: 'Yes! During the return process, select "Exchange" instead of "Refund". Choose the new size or color you want. Exchange is subject to availability. If the item is unavailable, a full refund will be processed.' },
    ],
  },
  {
    category: 'Payments & Pricing',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery (COD), UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and popular wallets. All online payments are secured with 256-bit encryption.' },
      { q: 'Is COD available?', a: 'Yes, Cash on Delivery is available for orders up to ₹5,000. For orders above ₹5,000, online payment is mandatory. COD orders may require phone verification before dispatch.' },
      { q: 'How do I apply a coupon code?', a: 'During checkout, you will see a "Apply Coupon" field. Enter your coupon code and click Apply. The discount will be reflected in your order total. Only one coupon can be used per order.' },
      { q: 'Are the prices inclusive of GST?', a: 'Yes, all product prices displayed on our website are inclusive of GST. There are no hidden charges. What you see is what you pay (plus applicable delivery charges).' },
    ],
  },
  {
    category: 'Products & Sizing',
    items: [
      { q: 'How do I find my correct size?', a: 'Every product page has a detailed Size Guide with measurements in inches/cm. We recommend measuring yourself and comparing with our chart for the best fit. If you are between sizes, we suggest going one size up for a comfortable fit.' },
      { q: 'Are the product images accurate?', a: 'We strive to show product images as accurately as possible. However, there may be slight variations in color due to screen settings and photography lighting. We mention the actual color name in the product description.' },
      { q: 'What fabrics do you use?', a: 'We use premium quality fabrics including 100% Cotton, Polyester blends, Linen, Denim, Silk blends, and more. Each product page lists the fabric composition in the description section.' },
    ],
  },
];

function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFAQ = (id: string) => setOpenIndex(openIndex === id ? null : id);

  const filteredFAQ = faqData
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <PageShell title="Frequently Asked Questions" subtitle="Find answers to common questions about orders, shipping, returns, and more" icon={HelpCircle}>
      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--theme-text-muted)]" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for answers..."
          className="h-11 pl-10 rounded-xl border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-text)]"
        />
      </div>

      {filteredFAQ.length === 0 ? (
        <div className="text-center py-12">
          <HelpCircle className="size-12 text-[var(--theme-border)] mx-auto mb-3" />
          <p className="text-[var(--theme-text-muted)]">No results found for &ldquo;{searchQuery}&rdquo;</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredFAQ.map((category) => (
            <div key={category.category}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--theme-primary)] mb-4">{category.category}</h2>
              <div className="space-y-2">
                {category.items.map((item, idx) => {
                  const id = `${category.category}-${idx}`;
                  const isOpen = openIndex === id;
                  return (
                    <div key={id} className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)] overflow-hidden transition-colors hover:border-[var(--theme-text-muted)]/30">
                      <button onClick={() => toggleFAQ(id)} className="flex items-center justify-between w-full px-5 py-4 text-left transition-colors">
                        <span className="text-sm font-medium text-[var(--theme-text)] pr-4">{item.q}</span>
                        <ChevronDown className={`size-4 shrink-0 text-[var(--theme-text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 pt-0 animate-fade-up">
                          <div className="h-px bg-[var(--theme-border)] mb-4" />
                          <p className="text-sm text-[var(--theme-text-secondary)] leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Still have questions */}
      <div className="mt-10 rounded-2xl bg-[var(--theme-surface)] p-6 text-center">
        <MessageCircle className="size-8 text-[var(--theme-primary)] mx-auto mb-3" />
        <h3 className="text-base font-semibold text-[var(--theme-text)] mb-1">Still have questions?</h3>
        <p className="text-sm text-[var(--theme-text-muted)] mb-4">Our support team is here to help you with anything.</p>
        <Button onClick={() => useNavigation.getState().navigate('contact')} className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)] text-white rounded-xl px-6">
          Contact Us
        </Button>
      </div>
    </PageShell>
  );
}

/* ════════════════════════════════════════════════════════════════
   Returns & Exchange Page
   ════════════════════════════════════════════════════════════════ */
function ReturnsPage() {
  const { navigate } = useNavigation();
  const { isCustomerLoggedIn } = useAuth();

  return (
    <PageShell title="Returns & Exchange" subtitle="Hassle-free returns and exchanges within 7 days of delivery" icon={RefreshCw}>
      {/* Return Policy Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] p-6 sm:p-8 mb-8 text-white">
        <h2 className="text-xl font-bold mb-2">7-Day Easy Returns</h2>
        <p className="text-sm text-white/80 max-w-lg">Not satisfied with your purchase? Return or exchange within 7 days of delivery. No questions asked — we want you to love every item you buy from us.</p>
      </div>

      {/* Steps */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[var(--theme-text)] mb-4">How to Return / Exchange</h2>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Select Your Order', desc: 'Go to Profile > My Orders and select the order you want to return or exchange. Click on the "Return" button.', icon: Package },
            { step: '2', title: 'Choose Reason', desc: 'Select the reason for your return — wrong size, defective item, color mismatch, or simply changed your mind.', icon: AlertCircle },
            { step: '3', title: 'Choose Return or Exchange', desc: 'Want a refund? Select "Refund". Want a different size or color? Select "Exchange" and choose your preferred option.', icon: RefreshCw },
            { step: '4', title: 'Schedule Pickup', desc: 'Our logistics partner will pick up the item from your doorstep within 48 hours. Keep the item packed and ready.', icon: Truck },
            { step: '5', title: 'Get Resolution', desc: 'Once we receive and verify the returned item, your refund or exchange will be processed within 5-7 business days.', icon: CheckCircle2 },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center text-sm font-bold text-[var(--theme-primary)]">{item.step}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[var(--theme-text)]">{item.title}</h3>
                <p className="text-sm text-[var(--theme-text-muted)] mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Eligibility */}
      <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] overflow-hidden mb-8">
        <div className="p-5 border-b border-[var(--theme-border)]">
          <h2 className="text-base font-bold text-[var(--theme-text)]">Return Eligibility</h2>
        </div>
        <div className="p-5">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-green-600 flex items-center gap-2 mb-3"><CheckCircle2 className="size-4" /> Eligible for Return</h3>
              <ul className="space-y-2 text-sm text-[var(--theme-text-secondary)]">
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">+</span> Wrong size or fit issue</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">+</span> Defective or damaged item</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">+</span> Color or product mismatch</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">+</span> Item received in wrong condition</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">+</span> Changed your mind (within 7 days)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-500 flex items-center gap-2 mb-3"><XCircle className="size-4" /> Not Eligible for Return</h3>
              <ul className="space-y-2 text-sm text-[var(--theme-text-secondary)]">
                <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">-</span> Items worn, washed, or altered</li>
                <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">-</span> Tags removed or packaging damaged</li>
                <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">-</span> Innerwear, socks, and intimate items</li>
                <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">-</span> Items purchased on final sale/clearance</li>
                <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">-</span> Return requested after 7 days</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Timeline */}
      <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] overflow-hidden mb-8">
        <div className="p-5 border-b border-[var(--theme-border)]">
          <h2 className="text-base font-bold text-[var(--theme-text)]">Refund Timeline</h2>
        </div>
        <div className="p-5">
          <div className="space-y-4">
            {[
              { label: 'Return Request Submitted', time: 'Day 0', active: true },
              { label: 'Item Picked Up', time: 'Day 1-2', active: true },
              { label: 'Quality Check at Warehouse', time: 'Day 3-4', active: true },
              { label: 'Refund Initiated', time: 'Day 5', active: true },
              { label: 'Amount Credited to Account', time: 'Day 5-7', active: true },
            ].map((item, i, arr) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[var(--theme-primary)]" />
                  {i < arr.length - 1 && <div className="w-0.5 h-8 bg-[var(--theme-border)]" />}
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm text-[var(--theme-text)]">{item.label}</span>
                  <span className="text-xs text-[var(--theme-text-muted)] bg-[var(--theme-surface)] px-2.5 py-1 rounded-lg">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      {isCustomerLoggedIn() ? (
        <Button onClick={() => navigate('profile', { tab: 'orders' })} className="w-full h-12 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)] text-white rounded-xl text-sm font-bold">
          Go to My Orders to Return
        </Button>
      ) : (
        <Button onClick={() => navigate('login')} className="w-full h-12 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)] text-white rounded-xl text-sm font-bold">
          Login to View Your Orders
        </Button>
      )}
    </PageShell>
  );
}

/* ════════════════════════════════════════════════════════════════
   Contact Us Page
   ════════════════════════════════════════════════════════════════ */
function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <PageShell title="Contact Us" subtitle="We'd love to hear from you. Get in touch with our team for any queries." icon={MessageCircle}>
      {/* Contact Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Phone, label: 'Call Us', value: '+91 98765 43210', sub: 'Mon-Sat, 10AM-8PM IST' },
          { icon: Mail, label: 'Email Us', value: 'support@clothfasion.com', sub: 'Reply within 24 hours' },
          { icon: MapPin, label: 'Visit Us', value: 'Mumbai, Maharashtra', sub: 'India - 400001' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary)]/10 flex items-center justify-center mx-auto mb-3">
              <item.icon className="size-5 text-[var(--theme-primary)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--theme-text)]">{item.label}</h3>
            <p className="text-sm text-[var(--theme-primary)] font-medium mt-1">{item.value}</p>
            <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Business Hours */}
      <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="size-4 text-[var(--theme-primary)]" />
          <h2 className="text-base font-bold text-[var(--theme-text)]">Business Hours</h2>
        </div>
        <div className="space-y-2 text-sm">
          {[
            ['Monday - Friday', '10:00 AM - 8:00 PM'],
            ['Saturday', '10:00 AM - 6:00 PM'],
            ['Sunday', 'Closed (Email support available)'],
          ].map(([day, time]) => (
            <div key={day} className="flex items-center justify-between py-2 border-b border-[var(--theme-border)] last:border-0">
              <span className="text-[var(--theme-text)]">{day}</span>
              <span className="text-[var(--theme-text-muted)]">{time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-5">
        <h2 className="text-base font-bold text-[var(--theme-text)] mb-4">Send us a Message</h2>

        {submitted ? (
          <div className="text-center py-8 animate-fade-up">
            <CheckCircle2 className="size-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[var(--theme-text)]">Message Sent!</h3>
            <p className="text-sm text-[var(--theme-text-muted)] mt-1">We will get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--theme-text)] mb-1.5 block">Full Name</label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="h-10 rounded-xl border-[var(--theme-border)] bg-[var(--theme-surface)]" />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--theme-text)] mb-1.5 block">Email Address</label>
                <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="h-10 rounded-xl border-[var(--theme-border)] bg-[var(--theme-surface)]" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--theme-text)] mb-1.5 block">Subject</label>
              <Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What is this about?" className="h-10 rounded-xl border-[var(--theme-border)] bg-[var(--theme-surface)]" />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--theme-text)] mb-1.5 block">Message</label>
              <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Describe your query in detail..." rows={5} className="w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent resize-none" />
            </div>
            <Button type="submit" className="w-full h-11 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)] text-white rounded-xl text-sm font-bold">
              <Send className="size-4 mr-2" />
              Send Message
            </Button>
          </form>
        )}
      </div>
    </PageShell>
  );
}

/* ════════════════════════════════════════════════════════════════
   Track Order Page
   ════════════════════════════════════════════════════════════════ */
function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [tracking, setTracking] = useState(false);
  const [found, setFound] = useState(false);
  const { navigate } = useNavigation();
  const { isCustomerLoggedIn } = useAuth();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setTracking(true);
    setTimeout(() => {
      setTracking(false);
      setFound(true);
    }, 1500);
  };

  return (
    <PageShell title="Track Your Order" subtitle="Enter your order number to get real-time delivery updates" icon={Search}>
      {/* Search Form */}
      <form onSubmit={handleTrack} className="flex gap-3 mb-8">
        <Input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="Enter Order Number (e.g. CF-12345)" className="flex-1 h-11 rounded-xl border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-text)]" />
        <Button type="submit" disabled={tracking} className="h-11 px-6 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)] text-white rounded-xl text-sm font-bold">
          {tracking ? 'Tracking...' : 'Track Order'}
        </Button>
      </form>

      {found && (
        <div className="animate-fade-up space-y-6">
          {/* Order Info */}
          <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-bold text-[var(--theme-text)]">Order #{orderNumber}</p>
                <p className="text-xs text-[var(--theme-text-muted)]">Placed on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600">In Transit</span>
            </div>
            <div className="h-px bg-[var(--theme-border)] mb-4" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-[var(--theme-text-muted)]">Items:</span> <span className="text-[var(--theme-text)] font-medium">2 Products</span></div>
              <div><span className="text-[var(--theme-text-muted)]">Total:</span> <span className="text-[var(--theme-text)] font-medium">₹1,499</span></div>
              <div><span className="text-[var(--theme-text-muted)]">Shipping:</span> <span className="text-green-500 font-medium">FREE</span></div>
              <div><span className="text-[var(--theme-text-muted)]">Est. Delivery:</span> <span className="text-[var(--theme-text)] font-medium">2-3 days</span></div>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-5">
            <h2 className="text-base font-bold text-[var(--theme-text)] mb-5">Shipment Progress</h2>
            <div className="space-y-0">
              {[
                { label: 'Order Confirmed', time: 'Jan 15, 2025 - 10:30 AM', done: true },
                { label: 'Packed & Ready to Ship', time: 'Jan 15, 2025 - 04:00 PM', done: true },
                { label: 'Shipped from Warehouse', time: 'Jan 16, 2025 - 09:15 AM', done: true },
                { label: 'In Transit — Mumbai Hub', time: 'Jan 16, 2025 - 02:45 PM', done: true, current: true },
                { label: 'Out for Delivery', time: 'Expected: Jan 17, 2025', done: false },
                { label: 'Delivered', time: 'Expected: Jan 17, 2025', done: false },
              ].map((step, i, arr) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${step.done ? 'bg-[var(--theme-primary)] border-[var(--theme-primary)]' : 'bg-[var(--theme-card)] border-[var(--theme-border)]'}`}>
                      {step.done && <CheckCircle2 className="size-2.5 text-white" />}
                    </div>
                    {i < arr.length - 1 && <div className={`w-0.5 h-12 ${step.done ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-border)]'}`} />}
                  </div>
                  <div className="pb-8">
                    <p className={`text-sm font-medium ${step.current ? 'text-[var(--theme-primary)]' : step.done ? 'text-[var(--theme-text)]' : 'text-[var(--theme-text-muted)]'}`}>
                      {step.label}
                      {step.current && <span className="ml-2 text-xs bg-[var(--theme-primary)]/10 px-2 py-0.5 rounded-full">Current</span>}
                    </p>
                    <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Partner */}
          <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-5">
            <h2 className="text-base font-bold text-[var(--theme-text)] mb-3">Delivery Partner</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface)] flex items-center justify-center">
                  <Truck className="size-5 text-[var(--theme-primary)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--theme-text)]">Express Delivery Partners</p>
                  <p className="text-xs text-[var(--theme-text-muted)]">Tracking ID: EXP78901234IN</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!found && !tracking && (
        <div className="text-center py-8">
          <Package className="size-12 text-[var(--theme-border)] mx-auto mb-3" />
          <p className="text-sm text-[var(--theme-text-muted)]">Enter your order number above to track your shipment</p>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8 rounded-xl bg-[var(--theme-surface)] p-4 text-center">
        <p className="text-sm text-[var(--theme-text-muted)]">
          {isCustomerLoggedIn() ? (
            <>
              Want to see all your orders?{' '}
              <button onClick={() => navigate('profile', { tab: 'orders' })} className="text-[var(--theme-primary)] font-medium hover:underline">Go to My Orders</button>
            </>
          ) : (
            <>
              Have an account?{' '}
              <button onClick={() => navigate('login')} className="text-[var(--theme-primary)] font-medium hover:underline">Login to see all orders</button>
            </>
          )}
        </p>
      </div>
    </PageShell>
  );
}

/* ════════════════════════════════════════════════════════════════
   Privacy Policy Page
   ════════════════════════════════════════════════════════════════ */
function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy" subtitle="Last updated: January 2025" icon={ShieldCheck}>
      <div className="space-y-8 text-sm text-[var(--theme-text-secondary)] leading-relaxed">
        {[
          {
            title: '1. Information We Collect',
            content: `When you use ClothFasion, we collect the following information:\n\nPersonal Information: Your name, mobile number, email address, delivery address, and PIN code when you create an account or place an order.\n\nPayment Information: We do NOT store your payment details. All payments are processed through secure third-party payment gateways (Razorpay, PayU) that comply with PCI DSS standards.\n\nUsage Data: We collect information about how you interact with our website, including pages visited, products viewed, search queries, and device information (browser type, IP address, screen resolution).\n\nCommunications: We record your communications with our support team to improve our services and resolve issues effectively.`,
          },
          {
            title: '2. How We Use Your Information',
            content: `We use your information for the following purposes:\n\n• Order Processing: To process, fulfill, and deliver your orders\n• Account Management: To create and manage your account, track orders, and process returns\n• Communication: To send order updates, delivery notifications, and promotional offers (with your consent)\n• Customer Support: To respond to your queries, complaints, and feedback\n• Improvement: To analyze usage patterns and improve our website, products, and services\n• Security: To detect and prevent fraud, unauthorized access, and ensure platform security\n• Legal Compliance: To comply with applicable laws and regulations`,
          },
          {
            title: '3. Data Sharing',
            content: `We do NOT sell, rent, or share your personal data with third parties for marketing purposes. We only share data with:\n\n• Logistics Partners: To deliver your orders (name, address, phone number)\n• Payment Gateways: To process payments securely (no card details stored)\n• Analytics Tools: Anonymized data for website analytics and improvement\n• Legal Authorities: When required by law or to protect our rights`,
          },
          {
            title: '4. Data Security',
            content: `We take data security seriously:\n\n• All data transmission is encrypted using SSL/TLS (256-bit encryption)\n• Passwords are hashed and never stored in plain text\n• Regular security audits and vulnerability assessments\n• Access controls and authentication mechanisms\n• Secure data centers with 24/7 monitoring`,
          },
          {
            title: '5. Cookies & Tracking',
            content: `We use cookies and similar technologies to:\n\n• Remember your login session and preferences\n• Analyze website traffic and user behavior\n• Show personalized product recommendations\n• Enable shopping cart functionality\n\nYou can control cookie settings through your browser. Disabling cookies may affect some website features.`,
          },
          {
            title: '6. Your Rights',
            content: `You have the right to:\n\n• Access: Request a copy of your personal data\n• Correction: Update or correct your personal information\n• Deletion: Request deletion of your account and data\n• Opt-out: Unsubscribe from promotional communications\n• Portability: Request your data in a portable format\n\nTo exercise any of these rights, contact us at privacy@clothfasion.com`,
          },
          {
            title: '7. Data Retention',
            content: `We retain your personal data as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law (e.g., financial records for tax purposes, retained for up to 7 years).`,
          },
          {
            title: '8. Children\'s Privacy',
            content: `ClothFasion is not intended for children under 13 years of age. We do not knowingly collect personal information from children. If we discover that a child under 13 has provided us with personal data, we will delete it immediately.`,
          },
          {
            title: '9. Changes to This Policy',
            content: `We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. We recommend reviewing this page periodically. Continued use of our services after changes constitutes acceptance of the updated policy.`,
          },
          {
            title: '10. Contact Us',
            content: `For any privacy-related concerns or questions, please contact:\n\nEmail: privacy@clothfasion.com\nPhone: +91 98765 43210\nAddress: ClothFasion Pvt. Ltd., Mumbai, Maharashtra, India - 400001`,
          },
        ].map((section) => (
          <section key={section.title}>
            <h2 className="text-base font-bold text-[var(--theme-text)] mb-3">{section.title}</h2>
            <div className="whitespace-pre-line pl-0">{section.content}</div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

/* ════════════════════════════════════════════════════════════════
   Terms of Service Page
   ════════════════════════════════════════════════════════════════ */
function TermsPage() {
  return (
    <PageShell title="Terms of Service" subtitle="Last updated: January 2025" icon={FileText}>
      <div className="space-y-8 text-sm text-[var(--theme-text-secondary)] leading-relaxed">
        {[
          {
            title: '1. Acceptance of Terms',
            content: `By accessing and using ClothFasion (website and mobile platforms), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our services. These terms apply to all visitors, users, and customers of ClothFasion.`,
          },
          {
            title: '2. Account Registration',
            content: `To place orders, you need to create an account using your mobile number and a 6-digit PIN.\n\n• You must provide accurate and complete information\n• You are responsible for maintaining the confidentiality of your PIN\n• You must be at least 18 years old to create an account\n• You must notify us immediately of any unauthorized use of your account\n• One person can have only one account. Duplicate accounts may be suspended`,
          },
          {
            title: '3. Products & Pricing',
            content: `• All product prices are inclusive of GST and displayed in Indian Rupees (₹)\n• Prices are subject to change without prior notice\n• We reserve the right to modify or discontinue any product\n• Product images are for representation; actual colors may vary slightly\n• We make every effort to ensure accurate product descriptions, but we do not guarantee that all information is error-free\n• Maximum order value is ₹50,000 per transaction`,
          },
          {
            title: '4. Orders & Payment',
            content: `• Placing an order constitutes an offer to purchase\n• We reserve the right to cancel any order for suspected fraud, pricing errors, or stock issues\n• Payment must be made through our supported methods: UPI, Cards, Net Banking, Wallets, or COD\n• COD orders have a maximum limit of ₹5,000\n• An order confirmation SMS/email constitutes acceptance of your order\n• We may request additional verification for large or suspicious orders`,
          },
          {
            title: '5. Shipping & Delivery',
            content: `• We deliver across India. Delivery timelines vary by location (3-7 business days standard)\n• Free shipping on orders above ₹499; ₹49 for orders below ₹499\n• We are not responsible for delays caused by natural disasters, strikes, or other force majeure events\n• Risk of loss transfers to you upon delivery to your specified address\n• If delivery fails after 3 attempts, the order will be returned to our warehouse and a refund processed`,
          },
          {
            title: '6. Returns & Refunds',
            content: `• Returns accepted within 7 days of delivery for eligible items\n• Items must be unused, unwashed, with original tags and packaging\n• Refunds processed within 5-7 business days after receiving the return\n• Shipping charges are non-refundable unless the return is due to a defective product\n• For detailed return policy, visit our Returns & Exchange page`,
          },
          {
            title: '7. Intellectual Property',
            content: `All content on ClothFasion — including logos, images, text, graphics, and software — is the property of ClothFasion Pvt. Ltd. and is protected by intellectual property laws.\n\n• You may NOT reproduce, distribute, or use our content without permission\n• Product images cannot be used for commercial purposes\n• The ClothFasion brand name and logo are registered trademarks`,
          },
          {
            title: '8. Prohibited Activities',
            content: `Users are prohibited from:\n\n• Using the platform for unlawful purposes\n• Attempting to gain unauthorized access to our systems\n• Scraping, crawling, or data mining our website\n• Posting false reviews or ratings\n• Creating multiple accounts for fraudulent orders\n• Using automated tools or bots to purchase products\n• Reselling products at inflated prices without authorization`,
          },
          {
            title: '9. Limitation of Liability',
            content: `ClothFasion is provided on an "as is" basis. We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability for any claim shall not exceed the amount you paid for the specific product or service in question.`,
          },
          {
            title: '10. Governing Law & Disputes',
            content: `These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra. We encourage users to contact our support team first to resolve any issues before taking legal action.`,
          },
          {
            title: '11. Changes to Terms',
            content: `We may modify these Terms of Service at any time. Changes will be effective when posted on this page. Your continued use of ClothFasion after changes are posted constitutes acceptance of the modified terms. We will notify major changes via email or SMS.`,
          },
        ].map((section) => (
          <section key={section.title}>
            <h2 className="text-base font-bold text-[var(--theme-text)] mb-3">{section.title}</h2>
            <div className="whitespace-pre-line">{section.content}</div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

/* ════════════════════════════════════════════════════════════════
   Shipping Policy Page
   ════════════════════════════════════════════════════════════════ */
function ShippingPage() {
  return (
    <PageShell title="Shipping Policy" subtitle="Everything you need to know about our delivery services" icon={Truck}>
      {/* Shipping Tiers */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {[
          { name: 'Standard Delivery', time: '3-7 Business Days', price: 'FREE above ₹499 / ₹49', icon: Truck, highlight: false },
          { name: 'Express Delivery', time: '1-2 Business Days', price: '₹99 (Select Cities)', icon: Package, highlight: true },
        ].map((tier) => (
          <div key={tier.name} className={`rounded-2xl border-2 p-5 ${tier.highlight ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/5' : 'border-[var(--theme-border)] bg-[var(--theme-card)]'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier.highlight ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-surface)]'}`}>
                <tier.icon className={`size-5 ${tier.highlight ? 'text-white' : 'text-[var(--theme-text-muted)]'}`} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--theme-text)]">{tier.name}</h3>
                {tier.highlight && <span className="text-[10px] font-semibold bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] px-2 py-0.5 rounded-full">FAST</span>}
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-[var(--theme-text)]"><span className="text-[var(--theme-text-muted)]">Time:</span> {tier.time}</p>
              <p className="text-[var(--theme-text)]"><span className="text-[var(--theme-text-muted)]">Cost:</span> {tier.price}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Coverage */}
      <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-5 mb-8">
        <h2 className="text-base font-bold text-[var(--theme-text)] mb-3">Delivery Coverage</h2>
        <p className="text-sm text-[var(--theme-text-secondary)] mb-4">We deliver to over 19,000+ pin codes across India. Here's the estimated delivery timeline by region:</p>
        <div className="space-y-2">
          {[
            { region: 'Metro Cities (Mumbai, Delhi, Bangalore, etc.)', time: '2-3 Business Days' },
            { region: 'Tier 1 Cities (Hyderabad, Pune, Chennai, etc.)', time: '3-4 Business Days' },
            { region: 'Tier 2 & 3 Cities', time: '4-6 Business Days' },
            { region: 'Rural & Remote Areas', time: '5-7 Business Days' },
          ].map((item) => (
            <div key={item.region} className="flex items-center justify-between py-2.5 border-b border-[var(--theme-border)] last:border-0 text-sm">
              <span className="text-[var(--theme-text)]">{item.region}</span>
              <span className="text-[var(--theme-primary)] font-medium text-xs bg-[var(--theme-primary)]/10 px-2.5 py-1 rounded-lg">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Process */}
      <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-5 mb-8">
        <h2 className="text-base font-bold text-[var(--theme-text)] mb-4">How Delivery Works</h2>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Order Placed', desc: 'Your order is confirmed and assigned to our warehouse for processing.' },
            { step: '2', title: 'Quality Check & Packing', desc: 'Our team inspects your items for quality and packs them securely to prevent damage during transit.' },
            { step: '3', title: 'Handed to Courier', desc: 'Package is picked up by our logistics partner and you receive a tracking number via SMS.' },
            { step: '4', title: 'In Transit', desc: 'Your package travels through our logistics network. Track it in real-time from the Track Order page.' },
            { step: '5', title: 'Out for Delivery', desc: 'Package arrives at your local hub and is out for delivery. You receive an SMS with delivery details.' },
            { step: '6', title: 'Delivered!', desc: 'Package delivered to your doorstep. Please check the items and raise any concerns within 48 hours.' },
          ].map((item) => (
            <div key={item.step} className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center text-xs font-bold text-[var(--theme-primary)] shrink-0 mt-0.5">{item.step}</div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--theme-text)]">{item.title}</h3>
                <p className="text-sm text-[var(--theme-text-muted)] mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Notes */}
      <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-5 mb-8">
        <h2 className="text-base font-bold text-[var(--theme-text)] mb-3">Important Notes</h2>
        <ul className="space-y-3 text-sm text-[var(--theme-text-secondary)]">
          {[
            'Delivery to PO Box addresses is not available.',
            'We attempt delivery up to 3 times. After failed attempts, the order is returned to our warehouse.',
            'Please ensure someone is available at the delivery address to receive the package.',
            'During festive seasons (Diwali, Holi, etc.), delivery may take 2-3 extra days.',
            'For bulk orders (5+ items), please allow an extra 1-2 days for processing.',
            'COD orders may require phone verification before dispatch.',
            'Orders placed after 2 PM will be processed the next business day.',
          ].map((note, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[var(--theme-primary)] mt-0.5 shrink-0">•</span>
              {note}
            </li>
          ))}
        </ul>
      </div>

      {/* Contact */}
      <div className="rounded-xl bg-[var(--theme-surface)] p-4 text-center text-sm text-[var(--theme-text-muted)]">
        Have shipping queries? <button onClick={() => useNavigation.getState().navigate('contact')} className="text-[var(--theme-primary)] font-medium hover:underline">Contact our support team</button>
      </div>
    </PageShell>
  );
}

/* ════════════════════════════════════════════════════════════════
   Support Hub Page (Main Support Page)
   ════════════════════════════════════════════════════════════════ */
function SupportPage() {
  const { navigate } = useNavigation();

  const cards = [
    { icon: HelpCircle, title: 'FAQ', desc: 'Browse commonly asked questions and find quick answers', page: 'faq' as const, color: 'bg-blue-500/10 text-blue-500' },
    { icon: RefreshCw, title: 'Returns & Exchange', desc: 'Learn about our 7-day return and exchange policy', page: 'returns' as const, color: 'bg-orange-500/10 text-orange-500' },
    { icon: MessageCircle, title: 'Contact Us', desc: 'Get in touch with our support team via phone, email, or chat', page: 'contact' as const, color: 'bg-green-500/10 text-green-500' },
    { icon: Search, title: 'Track Order', desc: 'Track your order status and estimated delivery time', page: 'track-order' as const, color: 'bg-purple-500/10 text-purple-500' },
    { icon: ShieldCheck, title: 'Privacy Policy', desc: 'Understand how we collect, use, and protect your data', page: 'privacy' as const, color: 'bg-teal-500/10 text-teal-500' },
    { icon: FileText, title: 'Terms of Service', desc: 'Read our terms, conditions, and usage policies', page: 'terms' as const, color: 'bg-pink-500/10 text-pink-500' },
    { icon: Truck, title: 'Shipping Policy', desc: 'Delivery timelines, charges, and coverage details', page: 'shipping' as const, color: 'bg-amber-500/10 text-amber-500' },
  ];

  return (
    <PageShell title="Support Center" subtitle="How can we help you today? Choose a topic below or search for answers." icon={HelpCircle}>
      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--theme-text-muted)]" />
        <button
          onClick={() => navigate('faq')}
          className="w-full text-left h-11 pl-10 pr-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)] text-sm text-[var(--theme-text-muted)] hover:border-[var(--theme-text-muted)] transition-colors cursor-pointer"
        >
          Type your question or browse topics...
        </button>
      </div>

      {/* Support Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => navigate(card.page)}
            className="flex items-start gap-4 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-5 text-left transition-all duration-200 hover:border-[var(--theme-text-muted)]/30 hover:shadow-md group"
          >
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110`}>
              <card.icon className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-[var(--theme-text)] group-hover:text-[var(--theme-primary)] transition-colors">{card.title}</h3>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5 leading-relaxed">{card.desc}</p>
            </div>
            <ChevronRight className="size-4 text-[var(--theme-text-muted)] mt-1 shrink-0 group-hover:text-[var(--theme-primary)] group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>

      {/* Emergency Contact */}
      <div className="mt-8 rounded-2xl bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] p-6 text-white">
        <h2 className="text-lg font-bold mb-1">Need Immediate Help?</h2>
        <p className="text-sm text-white/80 mb-4">Our support team is available Mon-Sat, 10AM-8PM IST</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white/15 rounded-xl px-4 py-2.5">
            <Phone className="size-4" />
            <span className="text-sm font-medium">+91 98765 43210</span>
          </div>
          <div className="flex items-center gap-2 bg-white/15 rounded-xl px-4 py-2.5">
            <Mail className="size-4" />
            <span className="text-sm font-medium">support@clothfasion.com</span>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/* ════════════════════════════════════════════════════════════════
   Exports
   ════════════════════════════════════════════════════════════════ */
export { FAQPage, ReturnsPage, ContactPage, TrackOrderPage, PrivacyPage, TermsPage, ShippingPage, SupportPage };
