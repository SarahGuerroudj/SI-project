import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Shield, Globe, Cpu, Star, Send, Layers, BarChart3, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated, openModal } = useAuth();

  return (
    <div className="animate-fade-in font-sans">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950 pt-32 pb-16 md:pt-20 md:pb-20">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 z-0"></div>
        <div className="absolute top-0 right-0 w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-lime-400/5 rounded-full blur-[60px] md:blur-[100px] -mr-20 -mt-20 md:-mr-40 md:-mt-40 z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-500/5 rounded-full blur-[60px] md:blur-[100px] -ml-10 -mb-10 md:-ml-20 md:-mb-20 z-0 pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 items-center -mt-0 md:-mt-16">
          <div className="space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-lime-400 text-xs font-medium tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
              The Future of Delivery
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight">
              ORGANIZE <span className="text-lime-400">EVERYTHING.</span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">DELIVER ANYTHING.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-lg leading-relaxed">
              A powerful AI-driven logistics hub that gives small businesses real-time visibility, smart routing, and effortless delivery management — so you never lose time, money, or customers again.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-4 bg-lime-400 hover:bg-lime-300 text-slate-900 rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)] hover:scale-105 flex items-center justify-center"
                >
                  Go to Dashboard <ArrowRight className="ml-2" size={20} />
                </Link>
              ) : (
                <button
                  onClick={openModal}
                  className="px-8 py-4 bg-lime-400 hover:bg-lime-300 text-slate-900 rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)] hover:scale-105 flex items-center justify-center text-center"
                >
                  Get Your Delivery System Under Control <ArrowRight className="ml-2" size={20} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-8 pt-8 border-t border-slate-800/50">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-white">99<span className="text-lime-400 text-lg">%</span></p>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">On-Time</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-white">50<span className="text-lime-400 text-lg">+</span></p>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Smart Routes</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-white">24<span className="text-lime-400 text-lg">/7</span></p>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Monitoring</p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            {/* Visual: Delivery Intelligence Hub */}
            <div className="relative z-10 w-full aspect-square bg-slate-900 rounded-[2rem] border border-slate-800 p-2 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 group overflow-hidden">
              {/* Decorative background grid */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50"></div>

              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl group-hover:bg-lime-400/20 transition-colors"></div>

              <div className="h-full flex flex-col p-8 relative">
                {/* Floating Cards Mockup */}
                <div className="flex-1 space-y-6 relative">

                  {/* Active Delivery Card */}
                  <div className="absolute top-0 right-[-20px] w-64 bg-slate-800/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-lg transform translate-x-4 group-hover:translate-x-0 transition-transform duration-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-lime-400">
                        <Zap size={16} fill="currentColor" />
                        <span className="text-xs font-bold uppercase">Optimizing</span>
                      </div>
                      <span className="text-xs text-slate-400">Just Now</span>
                    </div>
                    <div className="h-2 w-full bg-slate-700 rounded-full mb-2 overflow-hidden">
                      <div className="h-full bg-lime-400 w-2/3 animate-pulse"></div>
                    </div>
                    <p className="text-white text-sm font-medium">Route #402 Re-calculating</p>
                    <p className="text-xs text-slate-400">Traffic alert avoided • +5 mins saved</p>
                  </div>

                  {/* Stats Card */}
                  <div className="absolute bottom-8 left-[-10px] w-60 bg-white/5 backdrop-blur border border-white/10 p-5 rounded-xl shadow-xl">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
                        <BarChart3 size={24} />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Efficiency</p>
                        <p className="text-2xl font-bold text-white">+24%</p>
                      </div>
                    </div>
                  </div>

                  {/* Central Hub Visual */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-slate-950 border border-slate-700 rounded-full flex items-center justify-center shadow-2xl shadow-lime-900/20">
                    <div className="w-32 h-32 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center relative">
                      <div className="absolute inset-0 border border-lime-400/30 rounded-full animate-ping ml-0 mt-0"></div>
                      <Globe size={48} className="text-lime-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 bg-slate-900 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center">
            <div className="flex-1 space-y-6 md:space-y-8">
              <div className="relative">
                <h2 className="text-sm font-bold text-lime-400 uppercase tracking-widest mb-3">Our Mission</h2>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">Simplifying Logistics for <br className="hidden md:block" />Small Business</h3>
                <div className="w-20 h-1 bg-lime-400 rounded-full mb-8"></div>
              </div>

              <div className="prose prose-lg prose-invert text-slate-400 leading-relaxed">
                <p>
                  RouteMind’s mission is to empower small businesses with intelligent, accessible logistics tools that eliminate chaos, simplify delivery management, and create a faster, clearer, and more reliable experience for every customer.
                </p>
                <p>
                  We aim to transform complex operations into organized, automated workflows powered by AI — giving small businesses the ability to deliver with big-company precision, without big-company costs.
                </p>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                {[
                  "Real-time visibility into every shipment",
                  "Automated dispatch and routing",
                  "Customer-facing tracking pages"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="text-lime-400" size={20} />
                    <span className="text-slate-300 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 hover:border-lime-400/30 transition-colors">
                  <div className="w-12 h-12 bg-lime-400/10 rounded-xl flex items-center justify-center text-lime-400 mb-6">
                    <Cpu size={28} />
                  </div>
                  <h4 className="text-white font-bold text-xl mb-3">AI Intelligence</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Predictive algorithms that optimize routes and reduce delivery times automatically.</p>
                </div>

                <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 hover:border-blue-400/30 transition-colors mt-0 sm:mt-8">
                  <div className="w-12 h-12 bg-blue-400/10 rounded-xl flex items-center justify-center text-blue-400 mb-6">
                    <Layers size={28} />
                  </div>
                  <h4 className="text-white font-bold text-xl mb-3">Unified Workflow</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Manage orders, drivers, and payments from a single, intuitive dashboard.</p>
                </div>

                <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 hover:border-purple-400/30 transition-colors col-span-1 sm:col-span-2 md:col-span-1">
                  <div className="w-12 h-12 bg-purple-400/10 rounded-xl flex items-center justify-center text-purple-400 mb-6">
                    <Clock size={28} />
                  </div>
                  <h4 className="text-white font-bold text-xl mb-3">Real-Time Sync</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Instant updates for you and your customers, so everyone stays in the loop.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-slate-950 border-t border-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-sm font-bold text-lime-400 uppercase tracking-widest mb-2">Testimonials</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white">Trust, Delivered.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { name: "Sarah Jenkins", role: "Bakery Owner", text: "RouteMind chaos into clarity. I used to spend hours routing drivers manually. Now it takes seconds." },
              { name: "Mike Ross", role: "Furniture Logistics", text: "The real-time tracking is a game changer. My customers stopped calling 'where is my order' because they can see it!" },
              { name: "David Chen", role: "E-commerce Manager", text: "Big enterprise features at a price a startup can afford. It helped us scale from 10 to 100 daily deliveries seamlessly." }
            ].map((t, i) => (
              <div key={i} className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 hover:border-lime-400/30 transition-colors group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className="fill-lime-400 text-lime-400" />)}
                  </div>
                </div>
                <p className="text-slate-400 italic mb-6 leading-relaxed">
                  "{t.text}"
                </p>
                <div>
                  <p className="text-white font-bold">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 md:py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/5 rounded-full blur-[128px]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to regain control?</h2>
              <p className="text-slate-400 mb-8 max-w-md">Stop letting logistics run your business. Let RouteMind run your logistics. Contact us for a demo or custom integration.</p>

              <div className="space-y-4">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
                  <div className="p-3 bg-lime-400 rounded-full text-slate-900"><Send size={20} /></div>
                  <div>
                    <p className="text-white font-bold">Email Us</p>
                    <p className="text-slate-400 text-sm">hello@routemind.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700">
              <form className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Name*</label>
                  <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-lime-400 focus:outline-none transition-colors" placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Email*</label>
                  <input type="email" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-lime-400 focus:outline-none transition-colors" placeholder="Your email address" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Message*</label>
                  <textarea rows={4} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-lime-400 focus:outline-none transition-colors" placeholder="How can we help?" selected />
                </div>
                <button className="w-full py-4 bg-lime-400 hover:bg-lime-300 text-slate-900 font-bold rounded-xl transition-colors shadow-lg shadow-lime-400/10 mt-2">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-slate-900 text-center md:text-left">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <Zap className="text-lime-400 fill-lime-400" size={24} />
              <h1 className="text-2xl font-bold text-white">Route<span className="text-lime-400">Mind</span></h1>
            </div>
            <p className="text-slate-500 text-sm">
              Empowering small businesses with AI-driven logistics. Organize everything, deliver anything.
            </p>
          </div>
          <div>
            <h4 className="text-lime-400 font-bold uppercase text-xs tracking-widest mb-4">Product</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">API</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lime-400 font-bold uppercase text-xs tracking-widest mb-4">Company</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Direct Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lime-400 font-bold uppercase text-xs tracking-widest mb-4">Contact</h4>
            <p className="text-slate-400 text-sm mb-2">123 Logistics Way<br />Business Park, CA 90210</p>
            <p className="text-slate-400 text-sm">hello@routemind.com</p>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-12 pt-8 border-t border-slate-900 text-center text-slate-600 text-sm">
          &copy; 2025 RouteMind Inc. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
