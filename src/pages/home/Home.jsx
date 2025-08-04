import React, { useEffect, useCallback } from "react";
import {
  ClipboardList,
  Bell,
  PieChart,
  Shield,
  Smartphone,
  FileText,
  Users,
  ArrowRight,
  Check,
  TrendingUp,
  Calendar,
  ChevronRight,
  BadgeCheck,
  DownloadCloud,
  UserCheck,
  Receipt
} from "lucide-react";

const FEATURES = [
  {
    icon: <ClipboardList className="w-6 h-6 text-white" />,
    title: "Customer Debt Tracking",
    description: "Track all customer credits in one place with payment deadlines and balances.",
    bgColor: "bg-gradient-to-br from-blue-600 to-blue-500",
  },
  {
    icon: <Bell className="w-6 h-6 text-white" />,
    title: "Automated Reminders",
    description: "Automatic SMS/WhatsApp reminders to customers before payment is due.",
    bgColor: "bg-gradient-to-br from-indigo-600 to-indigo-500",
  },
  {
    icon: <PieChart className="w-6 h-6 text-white" />,
    title: "Business Insights",
    description: "See which customers pay fastest and who owes the most at a glance.",
    bgColor: "bg-gradient-to-br from-purple-600 to-purple-500",
  },
  {
    icon: <Receipt className="w-6 h-6 text-white" />,
    title: "Digital Receipts",
    description: "Generate and send professional receipts for all credit transactions.",
    bgColor: "bg-gradient-to-br from-emerald-600 to-emerald-500",
  },
  {
    icon: <DownloadCloud className="w-6 h-6 text-white" />,
    title: "Offline Mode",
    description: "Works even without internet - syncs when connection returns.",
    bgColor: "bg-gradient-to-br from-rose-600 to-rose-500",
  },
  {
    icon: <UserCheck className="w-6 h-6 text-white" />,
    title: "Role-Based Access",
    description: "Owner, manager, and sales staff accounts with different permissions.",
    bgColor: "bg-gradient-to-br from-amber-600 to-amber-500",
  },
];

const STATS = [
  { icon: <TrendingUp className="w-8 h-8 text-blue-600" />, value: "78%", label: "faster payments" },
  { icon: <Users className="w-8 h-8 text-blue-600" />, value: "2,500+", label: "kenyan businesses" },
  { icon: <Calendar className="w-8 h-8 text-blue-600" />, value: "24/7", label: "access anywhere" },
];

const Index = () => {
  const handleScroll = useCallback(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-up");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document
      .querySelectorAll(".feature-card, .stat-item, .fade-in")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-white py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2 fade-in">
              <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <BadgeCheck className="w-4 h-4 mr-2" /> Used by 2,500+ Kenyan businesses
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Stop chasing payments, <span className="text-blue-600">start growing</span> your business
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                The complete solution for Kenyan traders to manage customer credit - replace your paper books with automated tracking, reminders, and insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  Try Free PaySync <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                {["No paperwork", "Works offline", "MPESA integrated"].map((text, i) => (
                  <span key={i} className="inline-flex items-center text-gray-500">
                    <Check className="w-5 h-5 mr-2 text-blue-500" /> {text}
                  </span>
                ))}
              </div>
            </div>
            <div className="md:w-1/2 fade-in">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="bg-white rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Customer Debt Overview</h3>
                    <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">Today</span>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    {[
                      { name: "Wanjiku Groceries", amount: "Ksh 24,500", due: "Due today" },
                      { name: "lga Hardware", amount: "Ksh 18,200", due: "Due in 2 days" },
                      { name: "Kings Butchery", amount: "Ksh 32,000", due: "Overdue by 1 week" },
                    ].map((customer, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors">
                        <div className="flex justify-between">
                          <div className="font-medium">{customer.name}</div>
                          <div className="font-bold">{customer.amount}</div>
                        </div>
                        <div className={`text-sm mt-1 ${customer.due.includes("Overdue") ? "text-red-600" : "text-gray-500"}`}>
                          {customer.due}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="text-sm text-blue-800 mb-1">Total Outstanding</div>
                    <div className="font-bold text-blue-900 text-xl">Ksh 74,700</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Cloud */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-gray-500 text-sm mb-8">Trusted by businesses across Kenya</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
            {["Nakuru", "Eldoret", "Kisumu", "Mombasa", "Nairobi"].map((location, i) => (
              <div key={i} className="text-gray-600 font-medium hover:text-gray-800 transition-colors">
                {location} Traders
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Designed for <span className="text-blue-600">Kenyan SME traders</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple enough for your first day, powerful enough for your growing business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Record Customer Credit",
                description: "Instead of your paper book, create digital records with customer details and terms.",
                icon: <FileText className="w-8 h-8 text-blue-600" />
              },
              {
                step: "2",
                title: "Automatic Tracking",
                description: "The system tracks all due dates and sends reminders to customers automatically.",
                icon: <Bell className="w-8 h-8 text-blue-600" />
              },
              {
                step: "3",
                title: "Get Paid Faster",
                description: "Customers receive SMS reminders and you get alerts for overdue payments.",
                icon: <TrendingUp className="w-8 h-8 text-blue-600" />
              }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:border-blue-200 transition-colors">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
                  {item.icon}
                </div>
                <div className="text-sm font-medium text-blue-600 mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for <span className="text-blue-600">your business needs</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              All the tools you need to manage credit safely and efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="feature-card bg-white p-8 rounded-xl border border-gray-200 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group"
              >
                <div className={`${feature.bgColor} w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 shadow-md`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Roles Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perfect for <span className="text-blue-600">your whole team</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Different access levels for owners, managers and sales staff.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                role: "Owner",
                access: "Full access to all features and reports",
                icon: <Shield className="w-8 h-8 text-blue-600" />
              },
              {
                role: "Manager",
                access: "Can view all debts but not delete records",
                icon: <UserCheck className="w-8 h-8 text-blue-600" />
              },
              {
                role: "Sales Staff",
                access: "Can only add new credit sales to approved customers",
                icon: <Users className="w-8 h-8 text-blue-600" />
              }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-8 border border-gray-200 hover:border-blue-200 transition-colors shadow-sm hover:shadow-md">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.role}</h3>
                <p className="text-gray-600">{item.access}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="stat-item p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100 uppercase text-sm font-medium tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Kenyan <span className="text-blue-600">traders say</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium inline-block mb-4">
                  Hardware Store Owner
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Isaac Juma</h3>
                <p className="text-gray-600 mb-4">Kakamega</p>
                <div className="text-blue-600 font-medium">78% fewer late payments</div>
              </div>
              <div className="md:w-2/3">
                <blockquote className="text-lg md:text-xl text-gray-700 mb-6">
                  "Before this system, I was losing over Ksh 15,000 monthly from forgotten customer debts. Now I get automatic reminders and my customers pay on time. In just 3 months, I've recovered Ksh 42,000 that would have been lost."
                </blockquote>
                <div className="flex flex-wrap gap-4">
                  {["No more paper records", "SMS reminders work great", "Easy to use"].map((item, i) => (
                    <span key={i} className="inline-flex items-center bg-white px-3 py-1 rounded-full text-sm shadow-sm">
                      <Check className="w-4 h-4 mr-1 text-blue-500" /> {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to transform your credit management?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of Kenyan businesses getting paid faster with our system.
          </p>
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-10 rounded-lg text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mx-auto">
            Ready to start today <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-gray-400 text-sm mt-6">
            <Check className="w-4 h-4 inline mr-2" /> No setup fees • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;