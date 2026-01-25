import React from "react";

type PricingPlan = {
  name: string;
  price: string;
  accent?: "purple" | "green";
  badge: string;
  features: string[];
  featured?: boolean;
};

const PLANS: PricingPlan[] = [
  {
    name: "Starter",
    price: "Coming Soon",
    badge: "+",
    features: ["Niche features", "Balanced models", "Free passcodes"],
  },
  {
    name: "Pro",
    price: "Coming Soon",
    accent: "green",
    badge: "★",
    featured: true,
    features: ["Auto features", "Investment solutions", "Asset features"],
  },
  {
    name: "Enterprise",
    price: "Coming Soon",
    accent: "purple",
    badge: "🔒",
    features: [
      "Advanced generation",
      "AI features",
      "Storage container",
      "Balance and success",
    ],
  },
];

const Pricing: React.FC = () => {
  return (
    <section className="py-20 px-6 md:px-12 relative overflow-hidden">
      {/* Header */}
      <div className="text-center mb-16 space-y-4 relative z-10">
        <h2 className="text-3xl md:text-5xl font-medium font-display text-gray-900">
          Simple, Transparent Pricing
        </h2>
        <p className="text-gray-600 text-lg">
          Select which personalized solution fits best.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 items-center">
        {PLANS.map((plan) => {
          const isPurple = plan.accent === "purple";
          const isGreen = plan.accent === "green";

          const colorClasses = {
            green:
              "border-green-200 bg-linear-to-br from-accent-secondary/20 to-bg-accent-secondary rounded-3xl",
            purple:
              "border-purple-100 bg-linear-to-br from-accent-primary/20 to-bg-accent-primary rounded-3xl",
            default: "border-gray-100 ",
          };

          return (
            <div className={`${colorClasses[plan.accent || "default"]}`}>
              <div
                key={plan.name}
                className={`
                glass-panel
                p-8
                flex
                flex-col
                items-start
                gap-6
                transition-all
                duration-300
                
                ${
                  plan.featured
                    ? "shadow-2xl shadow-green-100/50 h-[30rem] hover:scale-[1.02]"
                    : "hover:shadow-xl h-[28rem] shadow-purple-100/50"
                }
                  `}
              >
                {/* Header */}
                <div className="w-full flex justify-between items-center">
                  <h3 className="text-3xl font-normal font-display text-gray-900">
                    {plan.name}
                  </h3>

                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${
                      isGreen
                        ? "bg-green-200 text-green-700"
                        : "bg-purple-100 text-purple-600"
                    }
                      `}
                  >
                    {plan.badge}
                  </div>
                </div>
                <hr className="w-full border-gray-200" />

                {/* Features */}
                <ul className="space-y-3 text-gray-600 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <div
                        className={`
                        w-1.5 h-1.5 rounded-full
                        ${isGreen ? "bg-green-500" : "bg-purple-400"}
                        `}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={`
                  w-full py-3 rounded-xl font-semibold transition-colors shadow-lg
                  ${
                    plan.featured
                      ? "bg-[#001f3f] text-white hover:bg-gray-900 shadow-gray-400/20"
                      : isGreen
                        ? "bg-[#001f3f] text-white hover:bg-gray-900 shadow-gray-400/20"
                        : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                  }
                  `}
                >
                  {plan.price}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-7xl  mx-auto mt-20 p-8 flex items-center justify-between rounded-2xl bg-linear-to-r from-accent-primary to-purple-700 shadow-2xl relative z-10">
        <h3 className="text-2xl md:text-3xl font-meium font-display text-white">
          Start tracking your finances today – It&apos;s free!
        </h3>
        <button className="px-8 py-3 rounded-xl bg-white text-accent-primary font-bold hover:bg-gray-50 transition-colors shadow-lg">
          Get Started Free
        </button>
      </div>
    </section>
  );
};

export default Pricing;
