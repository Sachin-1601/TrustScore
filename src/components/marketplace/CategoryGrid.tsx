"use client";

import React from "react";
import Link from "next/link";
import {
  Dumbbell,
  Sparkles,
  Shirt,
  Plane,
  Utensils,
  Gamepad2,
  Cpu,
  Coffee,
  ArrowRight,
} from "lucide-react";

export function CategoryGrid() {
  const categories = [
    { name: "Fitness", icon: Dumbbell, desc: "Strength, pilates, athletics & mobility", color: "from-blue-600/20 to-blue-900/10", count: "1,240+ creators" },
    { name: "Beauty", icon: Sparkles, desc: "Skincare routines, cruelty-free & glam", color: "from-pink-600/20 to-pink-900/10", count: "890+ creators" },
    { name: "Fashion", icon: Shirt, desc: "Streetwear, capsule styling & vintage", color: "from-amber-600/20 to-amber-900/10", count: "1,450+ creators" },
    { name: "Travel", icon: Plane, desc: "Eco stays, hiking & solo itineraries", color: "from-teal-600/20 to-teal-900/10", count: "720+ creators" },
    { name: "Food", icon: Utensils, desc: "Farm-to-table recipes & bakery reviews", color: "from-orange-600/20 to-orange-900/10", count: "1,100+ creators" },
    { name: "Gaming", icon: Gamepad2, desc: "Indie reviews, speedruns & cozy gaming", color: "from-purple-600/20 to-purple-900/10", count: "650+ creators" },
    { name: "Technology", icon: Cpu, desc: "AI tools, developer vlogs & desk tech", color: "from-cyan-600/20 to-cyan-900/10", count: "980+ creators" },
    { name: "Lifestyle", icon: Coffee, desc: "Home aesthetic, minimalism & wellness", color: "from-emerald-600/20 to-emerald-900/10", count: "1,520+ creators" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <Link
            key={cat.name}
            href={`/creators?category=${cat.name}`}
            className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none`} />

            <div className="relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-blue-400 group-hover:text-blue-300 group-hover:scale-105 transition-all flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>

              <div>
                <h4 className="font-bold text-slate-100 text-sm group-hover:text-blue-400 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                  {cat.desc}
                </p>
              </div>
            </div>

            <div className="relative pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span>{cat.count}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
