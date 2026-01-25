import React from "react";

const Highlights: React.FC = () => {
  const features = [
    {
      title: "Cashflow Tracking",
      desc: "Analyze your cash flow sources in real markets.",
      icon: "/LandingPage/wallet.png",
      bgClass: "from-purple-50 to-white",
      borderColor: "border-purple-100",
    },
    {
      title: "Investment Tracking",
      desc: "Oversee investments, grow and minimize your losses.",
      icon: "/LandingPage/trend.png",
      bgClass: "from-green-50 to-white",
      borderColor: "border-green-100",
    },
    {
      title: "Savings Goals",
      desc: "Define gamified smart savings goals.",
      icon: "/LandingPage/piggy-bank.png",
      bgClass: "from-orange-50 to-white",
      borderColor: "border-orange-100",
    },
    {
      title: "Analytics & Insights",
      desc: "Instant analysis of constantly advanced investor base.",
      icon: "/LandingPage/brain.png",
      bgClass: "from-blue-50 to-white",
      borderColor: "border-blue-100",
    },
  ];

  return (
    <section className="py-20 px-6 md:px-12 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-3xl border ${feature.borderColor} bg-linear-to-br ${feature.bgClass} shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex items-start sm:items-center gap-6 group cursor-default`}
            >
              <div className="w-20 h-20 shrink-0 transform group-hover:scale-110 transition-transform duration-500">
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>

              <div>
                <h3 className="text-xl font-bold font-display text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Highlights;
