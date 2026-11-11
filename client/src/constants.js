export const P = ['Aman', 'Shubham', 'Chandan'];
export const K = { Aman: 'A', Shubham: 'S', Chandan: 'C' };
export const T = [
  ['Water tank 💧', 'before 9 am'],
  ['Morning cook 🍳', 'ready by 10:30 am'],
  ['Morning plates 🍽️', 'before 11 am'],
  ['Evening cook 🍲', 'ready by 8:30 pm'],
  ['Night plates 🍽️', 'before 11 pm'],
  ['Cleaning 🧹', 'before 11 am'],
];
export const D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const FINE = 10;

export const ds = d =>
  d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
export const di = d => (d.getDay() + 6) % 7; // Mon=0 … Sun=6
export const fmt = s => s.slice(5).split('-').reverse().join('/'); // 2026-11-11 -> 11/11
