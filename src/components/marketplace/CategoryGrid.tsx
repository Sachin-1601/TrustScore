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
    { name: "Fitness", icon: Dumbbell, desc: "Strength, pilates, athletics & mobility", count: "1,240+ creators" },
    { name: "Beauty", icon: Sparkles, desc: "Skincare routines, cruelty-free & glam", count: "890+ creators" },
    { name: "Fashion", icon: Shirt, desc: "Streetwear, capsule styling & vintage", count: "1,450+ creators" },
    { name: "Travel", icon: Plane, desc: "Eco stays, hiking & solo itineraries", count: "720+ creators" },
    { name: "Food", icon: Utensils, desc: "Farm-to-table recipes & bakery reviews", count: "1,100+ creators" },
    { name: "Gaming", icon: Gamepad2, desc: "Indie reviews, speedruns & cozy gaming", count: "650+ creators" },
    { name: "Technology", icon: Cpu, desc: "AI tools, developer vlogs & desk tech", count: "980+ creators" },
    { name: "Lifestyle", icon: Coffee, desc: "Home aesthetic, minimalism & wellness", count: "1,520+ creators" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <Link
            key={cat.name}
            href={`/creators?category=${cat.name}`}
            className="group relative bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs"
          >
            <div className="relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-blue-600 group-hover:scale-105 transition-all flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                  {cat.desc}
                </p>
              </div>
            </div>

            <div className="relative pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span>{cat.count}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-blue-600 transition-all" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

