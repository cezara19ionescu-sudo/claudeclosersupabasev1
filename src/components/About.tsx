import React from 'react';

export function AboutCloserSection() {
  return (
    <div className="my-8 px-5">
      <div className="bg-gradient-to-br from-[#1a4d4d] to-[#2d5a5a] rounded-3xl p-6 text-white text-center shadow-xl shadow-teal-900/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <img src="https://i.imgur.com/OBYrlgU.png" alt="Closer" className="h-10 mx-auto object-contain mb-3 relative z-10" referrerPolicy="no-referrer" />
        <h3 className="text-lg font-black font-serif mb-2 relative z-10">Trusted professionals in your area</h3>
        <p className="text-[12px] opacity-80 leading-relaxed font-medium relative z-10">We verify every professional on Closer so you can hire with peace of mind. Your local community, empowered.</p>
      </div>
    </div>
  );
}
