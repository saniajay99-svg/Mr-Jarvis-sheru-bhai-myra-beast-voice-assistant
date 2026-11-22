import React, { useState } from 'react';
import { X, Phone, PhoneCall, Delete, User, Heart, ShieldAlert, BookOpen } from 'lucide-react';
import { soundEffects, speechManager } from '../utils/audio';

interface DialerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DialerModal: React.FC<DialerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    soundEffects.playBeep();
    if (phoneNumber.length < 15) {
      setPhoneNumber(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    soundEffects.playBeep();
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleCall = (numberToCall: string, name?: string) => {
    if (!numberToCall) return;
    soundEffects.playSuccessChime();
    speechManager.speak(`Master Ajay Boss, connecting call to ${name || numberToCall} on your vivo V17 right now!`);
    
    // Trigger real telephone dialer link
    window.location.href = `tel:${numberToCall}`;
  };

  const speedDials = [
    { name: 'Shiv Kumar', icon: User, number: '+919876543211', color: 'from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/40' },
    { name: 'Ladu', icon: Heart, number: '+919876543210', color: 'from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-500/40' },
    { name: 'Family Home', icon: BookOpen, number: '+919876543212', color: 'from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30' },
    { name: 'Emergency', icon: ShieldAlert, number: '112', color: 'from-red-500/20 to-rose-500/20 text-red-300 border-red-500/30' },
  ];

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b101d] border-2 border-amber-500/40 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl shadow-amber-500/10 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 to-slate-900">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-chakra font-bold text-base text-amber-200">
                Direct Phone Dialer
              </h3>
              <p className="text-[11px] text-slate-400">
                Aijay Boss Quick Connect & Calling Engine
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playBeep();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Quick Speed Dial Row */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Aijay Boss Speed Dial:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {speedDials.map((sd, i) => {
                const Icon = sd.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleCall(sd.number, sd.name)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border bg-gradient-to-r ${sd.color} hover:scale-102 transition-all text-xs font-semibold`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{sd.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number Display Input */}
          <div className="relative">
            <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-center text-xl font-mono font-bold tracking-widest text-amber-300 min-h-[50px] flex items-center justify-center">
              {phoneNumber || <span className="text-slate-600 font-normal text-sm">Enter phone number...</span>}
            </div>
            {phoneNumber && (
              <button
                onClick={handleDelete}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                title="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-2">
            {digits.map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-amber-400/50 hover:bg-slate-800 text-slate-100 font-chakra font-bold text-lg active:scale-95 transition-all"
              >
                {d}
              </button>
            ))}
          </div>

          {/* Call Trigger Button */}
          <button
            disabled={!phoneNumber}
            onClick={() => handleCall(phoneNumber)}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              phoneNumber
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            Direct Call for Aijay Boss
          </button>
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-slate-800 bg-slate-950/60 text-center text-[10px] text-slate-500">
          Triggers system telephone app via tel: protocol on mobile/desktop
        </div>
      </div>
    </div>
  );
};
