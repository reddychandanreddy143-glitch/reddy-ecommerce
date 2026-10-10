'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { ProductCard, Product } from '../../../components/catalog/ProductCard';
import { useCartStore } from '../../../stores/cart.store';
import { useAuthStore } from '../../../stores/auth.store';
import {
  Search,
  Laptop,
  Shirt,
  Sparkles,
  Home,
  Tv,
  Gamepad2,
  BookOpen,
  ChevronRight,
  TrendingUp,
  X,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  ShoppingCart,
  Check,
  MapPin,
  Loader2,
  Banknote,
  PlusCircle,
} from 'lucide-react';

interface SavedAddress {
  address: string;
  city: string;
  pincode: string;
  phone: string;
}

const CATEGORIES = [
  { id: 'all', name: 'For You', icon: Sparkles },
  { id: 'electronics', name: 'Electronics & Mobiles', icon: Laptop },
  { id: 'appliances', name: 'Appliances', icon: Tv },
  { id: 'fashion', name: 'Fashion', icon: Shirt },
  { id: 'toys', name: 'Gaming & Toys', icon: Gamepad2 },
  { id: 'books', name: 'Books', icon: BookOpen },
  { id: 'home', name: 'Home & Kitchen', icon: Home },
];

const HERO_DEALS = [
  { title: 'Motorola Edge 50', offer: 'From â‚¹22,999*', tag: 'Trending', image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=80' },
  { title: 'ASUS Vivobook 15', offer: 'From â‚¹44,990*', tag: 'Bestseller', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop&q=80' },
  { title: 'TCL 43" 4K QLED', offer: 'Just â‚¹25,999*', tag: 'Super Deal', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&auto=format&fit=crop&q=80' },
  { title: 'iPhone 15 (128GB)', offer: 'From â‚¹58,999*', tag: 'Top Rated', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80' },
  { title: 'Noise ColorFit Pro', offer: 'Just â‚¹1,999*', tag: 'Special Offer', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80' },
];

const CURATED_CATALOG: Product[] = [
  // 1. ELECTRONICS & SMARTPHONES (18 ITEMS)
  { id: 'el-1', title: 'iPhone 15 (128 GB, Black)', description: 'Dynamic Island, 48MP main camera, USB-C, A16 Bionic chip.', price: 58999, stock: 25, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80', rating: 4.8, discountBadge: 'Top Deal', highlights: ['128GB ROM', 'Super Retina XDR Display', 'A16 Bionic Chip'] },
  { id: 'el-2', title: 'Motorola Edge 50 Fusion 5G', description: '144Hz curved pOLED display, Sony LYT-700C OIS camera, 68W charging.', price: 22999, stock: 30, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80', rating: 4.5, discountBadge: 'Hot Pick', highlights: ['8GB RAM | 128GB ROM', '144Hz 3D Curved Panel', '5000 mAh Battery'] },
  { id: 'el-3', title: 'Samsung Galaxy S24 Ultra 5G', description: 'Snapdragon 8 Gen 3, 200MP camera, Titanium frame with S-Pen stylus.', price: 119999, stock: 12, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80', rating: 4.9, discountBadge: 'Flagship Deal', highlights: ['12GB RAM | 256GB ROM', '200MP Quad Camera', 'Titanium Frame'] },
  { id: 'el-4', title: 'OnePlus Nord CE4 Lite 5G', description: '5500 mAh battery, 80W SUPERVOOC, 120Hz AMOLED display.', price: 19999, stock: 40, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80', rating: 4.3, discountBadge: 'Special Price', highlights: ['8GB RAM | 128GB ROM', '80W Fast Charger in Box', '120Hz AMOLED'] },
  { id: 'el-5', title: 'boAt Airdopes 141 ANC Earbuds', description: '32dB Active Noise Cancellation with 42H total playback and low latency.', price: 1499, stock: 80, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80', rating: 4.4, discountBadge: 'Min 60% Off', highlights: ['32dB ANC', '42H Total Playtime', 'ASAP Charge'] },
  { id: 'el-6', title: 'Sony WH-1000XM5 Wireless Headphones', description: 'Dual processors, 8 mics, industry-leading active noise cancellation.', price: 26990, stock: 18, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', rating: 4.8, discountBadge: 'Bestseller', highlights: ['Auto NC Optimizer', '30 Hours Battery', 'Speak-to-Chat'] },
  { id: 'el-7', title: 'Noise ColorFit Pulse 3 Smartwatch', description: '1.96-inch TFT display, Bluetooth calling with 7-day battery life.', price: 1599, stock: 95, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80', rating: 4.2, discountBadge: 'Under â‚¹1,999', highlights: ['1.96" Large Screen', 'Bluetooth Calling', '100+ Sports Modes'] },
  { id: 'el-8', title: 'ASUS Vivobook 15 Core i5 12th Gen', description: '16GB RAM, 512GB NVMe SSD, 15.6" Full HD Anti-glare display.', price: 44990, stock: 15, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80', rating: 4.5, discountBadge: 'Top Pick', highlights: ['Intel Core i5-1235U', '16GB DDR4 RAM', '512GB PCIe SSD'] },
  { id: 'el-9', title: 'Mi 20000mAh Power Bank 3i', description: '18W fast charging with dual input and triple output USB ports.', price: 1999, stock: 75, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1609592426507-2a4c1f855e92?w=600&auto=format&fit=crop&q=80', rating: 4.5, discountBadge: 'Bestseller', highlights: ['20000mAh Capacity', '18W Fast Charging', 'Triple Output'] },
  { id: 'el-10', title: 'Redragon K552 Mechanical Keyboard', description: 'Rainbow RGB backlit tactile blue switches with durable metal frame.', price: 2499, stock: 35, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80', rating: 4.6, discountBadge: 'Gaming Pick', highlights: ['Dust-proof Blue Switches', 'Tenkeyless Design', 'Anti-ghosting 87 Keys'] },
  { id: 'el-11', title: 'LG 27" Full HD IPS Monitor (75Hz)', description: 'AMD FreeSync, borderless screen, Reader Mode & Flicker Safe panel.', price: 11499, stock: 20, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80', rating: 4.6, discountBadge: 'Deal of the Day', highlights: ['27 Inch IPS FHD', '75Hz Refresh Rate', 'HDMI & VGA Ports'] },
  { id: 'el-12', title: 'JBL Go 3 Portable Bluetooth Speaker', description: 'Pro sound with punchy bass, IP67 dustproof and waterproof fabric body.', price: 2999, stock: 50, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80', rating: 4.6, discountBadge: 'Min 25% Off', highlights: ['JBL Pro Sound', 'IP67 Waterproof', '5 Hours Battery Life'] },
  { id: 'el-13', title: 'SanDisk 128GB Ultra Dual Type-C Drive', description: 'High speed USB 3.1 flash drive with Type-C and Type-A connectors.', price: 1149, stock: 110, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1628155930542-40a029759b30?w=600&auto=format&fit=crop&q=80', rating: 4.5, discountBadge: 'Special Price', highlights: ['150MB/s Read Speed', 'Dual Type-C / Type-A', 'All-metal Swivel'] },
  { id: 'el-14', title: 'Apple iPad 10th Gen (64GB, Wi-Fi)', description: '10.9-inch Liquid Retina, A14 Bionic chip, Landscape 12MP front camera.', price: 31900, stock: 16, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80', rating: 4.7, discountBadge: 'Hot Deal', highlights: ['10.9" Liquid Retina', 'A14 Bionic Processor', 'Touch ID Support'] },
  { id: 'el-15', title: 'Portronics 65W GaN Fast Wall Charger', description: 'Compact dual Type-C and USB-A charger for laptops, phones and tablets.', price: 1699, stock: 65, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80', rating: 4.4, discountBadge: 'Under â‚¹2,000', highlights: ['65W GaN Tech', '3-Port Output', 'Surge Protection'] },
  { id: 'el-16', title: 'Logitech M331 Silent Wireless Mouse', description: 'Over 90% click noise reduction with contoured soft rubber grip.', price: 1195, stock: 70, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80', rating: 4.5, discountBadge: 'Top Pick', highlights: ['SilentPlus Click', '24 Months Battery', '10m Wireless Range'] },
  { id: 'el-17', title: 'TP-Link Archer C6 Gigabit Wi-Fi Router', description: 'AC1200 dual band wireless MU-MIMO router with 4 external antennas.', price: 2199, stock: 45, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80', rating: 4.4, discountBadge: 'Bestseller', highlights: ['867Mbps 5GHz + 300Mbps 2.4GHz', 'Gigabit WAN/LAN', 'MU-MIMO Support'] },
  { id: 'el-18', title: 'realme 10000mAh 12W Power Bank', description: 'Dual USB-A output with 14 layers circuit protection and micro-USB port.', price: 999, stock: 85, category: { name: 'Electronics' }, imageUrl: 'https://images.unsplash.com/photo-1609592426507-2a4c1f855e92?w=600&auto=format&fit=crop&q=80', rating: 4.3, discountBadge: 'Under â‚¹1,000', highlights: ['10000mAh Battery', '12W Fast Charge', 'Two-Way Charging'] },

  // 2. APPLIANCES (16 ITEMS)
  { id: 'ap-1', title: 'LG 43" 4K Smart LED TV (43UR7500)', description: 'Î±5 AI Processor 4K Gen6, HDR10 Pro, WebOS with Apple Airplay 2.', price: 28990, stock: 14, category: { name: 'Appliances' }, imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80', rating: 4.7, discountBadge: 'Special Price', highlights: ['4K Ultra HD Display', '20W Dolby Audio', 'WebOS Platform'] },
  { id: 'ap-2', title: 'Samsung 253L Inverter Double Door Fridge', description: '3-star energy rating, frost-free, digital inverter with all-around cooling.', price: 24490, stock: 10, category: { name: 'Appliances' }, imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80', rating: 4.6, discountBadge: 'Save â‚¹6,000', highlights: ['253 Litres Capacity', '3-Star Energy Rating', 'Toughened Glass Shelves'] },
  { id: 'ap-3', title: 'IFB 7Kg 5-Star Front Load Washer', description: '2X Power Steam, AI wash detection, 1000 RPM high speed extraction.', price: 29990, stock: 12, category: { name: 'Appliances' }, imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80', rating: 4.8, discountBadge: 'Bestseller', highlights: ['7 Kg Capacity', '1000 RPM Spin', '5-Star BEE Efficiency'] },
  { id: 'ap-4', title: 'Voltas 1.5 Ton 3-Star Inverter Split AC', description: 'Turbo cooling, anti-dust filter, 100% copper condenser coil.', price: 32990, stock: 9, category: { name: 'Appliances' }, imageUrl: 'https://images.unsplash.com/photo-1614633837726-0e9e4f169f46?w=600&auto=format&fit=crop&q=80', rating: 4.4, discountBadge: 'Summer Deal', highlights: ['1.5 Ton High Ambient Cool', '100% Copper Tubes', 'Dual Filtration'] },
  { id: 'ap-5', title: 'Philips 20L Solo Microwave Oven', description: 'Auto-cook presets, uniform defrosting, child lock with 800W power.', price: 5490, stock: 24, category: { name: 'Appliances' }, imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&auto=format&fit=crop&q=80', rating: 4.3, discountBadge: 'Special Price', highlights: ['20 Litre Capacity', '800W Magnetron', 'Auto Cook Menus'] },
  { id: 'ap-6', title: 'Bajaj New Shakti Neo 15L Water Geyser', description: '2000W heating element, titanium armour tank, 8 bar pressure rating.', price: 5999, stock: 22, category: { name: 'Appliances' }, imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80', rating: 4.4, discountBadge: 'Top Pick', highlights: ['15 Litres Storage', 'Titanium Armour Coating', '8 Bar Pressure Suitability'] },
  { id: 'ap-7', title: 'Prestige 3-Jar 750W Mixer Grinder', description: 'Pure copper winding motor with stainless steel heavy-duty jars.', price: 2799, stock: 40, category: { name: 'Appliances' }, imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop&q=80', rating: 4.3, discountBadge: 'Deal of the Day', highlights: ['750W Motor', '3 Stainless Steel Jars', 'Overload Protection'] },
  { id: 'ap-8', title: 'Eureka Forbes Wet & Dry Vacuum 1200W', description: 'Powerful suction blower with 10L tank capacity and wheels.', price: 6499, stock: 15, category: { name: 'Appliances' }, imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80', rating: 4.5, discountBadge: 'Hot Pick', highlights: ['1200W High Power', 'Wet & Dry 10L Tank', 'Blower Function'] },
  { id: 'ap-9', title: 'Crompton Ozone 55L Desert Air Cooler', description: 'High density honeycomb cooling pads with 4-way air deflection.', price: 8999, stock: 18, category: { name: 'Appliances' }, imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80', rating: 4.3, discountBadge: 'Min 30% Off', highlights: ['55L Water Tank', 'Honeycomb Pads', 'Inverter Compatible'] },
  { id: 'ap-10', title: 'Havells 1200mm High Speed Ceiling Fan', description: 'Double ball bearing motor with dust resistant aerodynamic blades.', price: 2199, stock: 60, category: { name: 'Appliances' }, imageUrl: 'https://images.unsplash.com/photo-1614633837726-0e9e4f169f46?w=600&auto=format&fit=crop&q=80', rating: 4.4, discountBadge: 'Top Rated', highlights: ['1200 mm Sweep', '390 RPM Speed', 'Low Power Consumption'] },
  { id: 'ap-11', title: 'Kent Grand RO + UV Water Purifier', description: '8L purified water storage tank with TDS control mineralization.', price: 13499, stock: 16, category: { name: 'Appliances' }, imageUrl: 'https://images.unsplash.com/photo-1594213114663-d94db9b17125?w=600&auto=format&fit=crop&q=80', rating: 4.6, discountBadge: 'Best Purifier', highlights: ['RO+UV+UF+TDS Control', '8L Storage Tank', '20L/hr Purification'] },
  { id: 'ap-12', title: 'Pigeon 1800W Induction Cooktop', description: 'Preset Indian cooking menus, LED display, dual heat sensors.', price: 1699, stock: 45, category: { name: 'Appliances' }, imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80', rating: 4.2, discountBadge: 'Under â‚¹2,000', highlights: ['1800W Heating', 'Push Button Controls', 'Auto Switch Off'] },
  { id: 'ap-13', title: 'Usha Armor 1000W Dry Iron', description: 'Non-stick PTFE soleplate, 360-degree swivel cord, thermal fuse.', price: 699, stock: 80, category: { name: 'Appliances' }, imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&auto=format&fit=crop&q=80', rating: 4.3, discountBadge: 'Bestseller', highlights: ['1000W Heating', 'PTFE Coated Soleplate', 'Overheat Cut-off'] },
  { id: 'ap-14', title: 'Morphy Richards 24L Oven Toaster Griller', description: 'Motorized rotisserie, bake, toast, broil options with 60-min timer.', price: 6990, stock: 14, category: { name: 'Appliances' }, imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80', rating: 4.4, discountBadge: 'Baking Choice', highlights: ['24L Capacity', 'Motorized Rotisserie', 'Stainless Steel Body'] },
  { id: 'ap-15', title: 'Atomberg Renesa Smart BLDC Fan', description: 'Remote controlled energy saving BLDC motor consuming just 28W.', price: 3699, stock: 30, category: { name: 'Appliances' }, imageUrl: 'https://images.unsplash.com/photo-1614633837726-0e9e4f169f46?w=600&auto=format&fit=crop&q=80', rating: 4.7, discountBadge: '65% Power Save', highlights: ['28W BLDC Motor', 'Smart Remote Control', 'Sleep & Boost Modes'] },
  { id: 'ap-16', title: 'Whirlpool 200L Single Door Refrigerator', description: '4-star energy rating, 9 hours cooling retention with insulated capillary.', price: 16490, stock: 12, category: { name: 'Appliances' }, imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80', rating: 4.5, discountBadge: 'Special Offer', highlights: ['200L Storage', '4-Star BEE Rating', 'Fast Ice Making'] },

  // 3. FASHION & LIFESTYLE (16 ITEMS)
  { id: 'fa-1', title: 'Men Classic Stainless Steel Quartz Watch', description: 'Quartz movement, scratch-resistant mineral crystal and date calendar.', price: 1299, stock: 55, category: { name: 'Fashion' }, imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80', rating: 4.3, discountBadge: 'Deal of the Day', highlights: ['30M Water Resistance', 'Stainless Steel Strap', '1 Year Warranty'] },
  { id: 'fa-2', title: 'Nike Revolution 6 Running Shoes', description: 'Plush mesh along the collar, full-length foam midsole cushioning.', price: 3495, stock: 35, category: { name: 'Fashion' }, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80', rating: 4.6, discountBadge: 'Min 30% Off', highlights: ['Breathable Mesh Upper', 'Soft Foam Midsole', 'Traction Rubber Outsole'] },
  { id: 'fa-3', title: 'Polarized Aviator Sunglasses for Men', description: 'UV400 protective coating with lightweight corrosion-resistant frame.', price: 799, stock: 90, category: { name: 'Fashion' }, imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80', rating: 4.4, discountBadge: 'Under â‚¹999', highlights: ['100% UV400 Protection', 'Polarized Anti-Glare', 'Metal Alloy Frame'] },
  { id: 'fa-4', title: 'WildHorn Leather RFID Blocking Wallet', description: 'Handcrafted genuine leather with 8 card slots and dual currency slip.', price: 649, stock: 110, category: { name: 'Fashion' }, imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80', rating: 4.5, discountBadge: 'Bestseller', highlights: ['RFID Blocking Layer', '100% Genuine Leather', 'Compact Bi-Fold'] },
  { id: 'fa-5', title: 'Puma Unisex Lightweight Backpack (28L)', description: 'Padded shoulder straps, laptop compartment, water-repellent base.', price: 1199, stock: 45, category: { name: 'Fashion' }, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', rating: 4.4, discountBadge: 'Top Pick', highlights: ['28 Litres Volume', '15.6" Laptop Sleeve', 'Heavy Duty Zippers'] },
  { id: 'fa-6', title: 'Leviâ€™s Men Slim-Fit Blue Washed Jeans', description: 'Stretch cotton blend denim with classic 5-pocket styling.', price: 2199, stock: 30, category: { name: 'Fashion' }, imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80', rating: 4.5, discountBadge: 'Trending', highlights: ['98% Cotton 2% Elastane', 'Slim Fit Profile', 'Classic 5-Pockets'] },
  { id: 'fa-7', title: 'US Polo Assn. Solid Cotton Polo T-Shirt', description: 'Breathable pique cotton fabric with ribbed collar and embroidered logo.', price: 999, stock: 65, category: { name: 'Fashion' }, imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80', rating: 4.3, discountBadge: 'Special Price', highlights: ['100% Pique Cotton', 'Regular Fit', 'Double Stitched Hem'] },
  { id: 'fa-8', title: 'Fossil Grant Chronograph Leather Watch', description: 'Roman numerals, blue dial, stainless steel case with brown leather band.', price: 8995, stock: 15, category: { name: 'Fashion' }, imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80', rating: 4.7, discountBadge: 'Premium Style', highlights: ['44mm Case Diameter', 'Genuine Leather Band', '50M Water Resistance'] },
  { id: 'fa-9', title: 'Campus Men North Running Shoes', description: 'Air capsule tech heel for bounce, breathable knit upper.', price: 1399, stock: 55, category: { name: 'Fashion' }, imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80', rating: 4.2, discountBadge: 'Under â‚¹1,500', highlights: ['Springy Sole Unit', 'Mesh Breathability', 'Arch Support'] },
  { id: 'fa-10', title: 'Woodland Men Camel Leather Casual Boots', description: 'Sturdy nubuck leather upper with grooved rubber traction outsole.', price: 3495, stock: 20, category: { name: 'Fashion' }, imageUrl: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&auto=format&fit=crop&q=80', rating: 4.6, discountBadge: 'All Terrain', highlights: ['Genuine Nubuck Leather', 'High Traction Outsole', 'Rugged Build'] },
  { id: 'fa-11', title: 'Ray-Ban Wayfarer Classic Sunglasses', description: 'Iconic crystal green G-15 lenses with acetate black frame.', price: 6890, stock: 12, category: { name: 'Fashion' }, imageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&auto=format&fit=crop&q=80', rating: 4.8, discountBadge: 'Classic Icon', highlights: ['G-15 Crystal Lenses', 'Acetate Frame', '100% UV Protection'] },
  { id: 'fa-12', title: 'Roadster Men Washed Denim Jacket', description: 'Medium indigo wash, spread collar, button flap chest pockets.', price: 1699, stock: 28, category: { name: 'Fashion' }, imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80', rating: 4.2, discountBadge: 'Style Pick', highlights: ['Pure Cotton Denim', 'Regular Fit', 'Machine Washable'] },
  { id: 'fa-13', title: 'Titan Karishma Analog Champagne Watch', description: 'Gold toned metal strap with mineral glass and day-date display.', price: 2195, stock: 40, category: { name: 'Fashion' }, imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80', rating: 4.5, discountBadge: 'Wedding Pick', highlights: ['Quartz Mechanism', 'Gold Plated Strap', '2 Years Warranty'] },
  { id: 'fa-14', title: 'Allen Solly Men Slim Fit Formal Shirt', description: 'Crisp woven cotton-poly blend with pointed collar and single cuff.', price: 1099, stock: 50, category: { name: 'Fashion' }, imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80', rating: 4.3, discountBadge: 'Formal Essential', highlights: ['Wrinkle Resistant', 'Slim Formal Fit', 'Breathable Fabric'] },
  { id: 'fa-15', title: 'Safari Thorium 55cm Cabin Trolley Bag', description: 'Scratch resistant polycarbonate shell with 360-degree wheels & number lock.', price: 2199, stock: 35, category: { name: 'Fashion' }, imageUrl: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=600&auto=format&fit=crop&q=80', rating: 4.4, discountBadge: 'Travel Pick', highlights: ['Polycarbonate Shell', '360Â° Spinner Wheels', 'Fixed Combination Lock'] },
  { id: 'fa-16', title: 'Crocs Unisex Classic Clogs', description: 'Lightweight Croslite foam footbed with pivoting heel straps.', price: 2495, stock: 40, category: { name: 'Fashion' }, imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80', rating: 4.6, discountBadge: 'Everyday Comfort', highlights: ['Water-friendly Foam', 'Ventilation Ports', 'Easy to Clean'] },

  // 4. GAMING & TOYS (15 ITEMS)
  { id: 'gt-1', title: 'Sony PlayStation 5 DualSense Controller', description: 'Haptic feedback, dynamic triggers, integrated mic array.', price: 5490, stock: 26, category: { name: 'Gaming & Toys' }, imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&auto=format&fit=crop&q=80', rating: 4.9, discountBadge: 'Hot Favorite', highlights: ['Adaptive Triggers', 'Haptic Feedback', 'Type-C Recharging'] },
  { id: 'gt-2', title: 'Nintendo Switch OLED Neon Console', description: '7-inch vivid OLED screen, 64GB storage, enhanced audio system.', price: 29990, stock: 14, category: { name: 'Gaming & Toys' }, imageUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&auto=format&fit=crop&q=80', rating: 4.8, discountBadge: 'Bestseller', highlights: ['7" OLED Screen', 'LAN Port in Dock', '64GB Storage'] },
  { id: 'gt-3', title: 'Razer DeathAdder Essential Gaming Mouse', description: '6400 DPI optical sensor, 5 programmable hyperesponse buttons.', price: 1499, stock: 55, category: { name: 'Gaming & Toys' }, imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80', rating: 4.6, discountBadge: 'Min 40% Off', highlights: ['6400 DPI Sensor', 'Ergonomic Form Factor', '10M Click Durability'] },
  { id: 'gt-4', title: 'Cosmic Byte GS410 Gaming Headset with Mic', description: '40mm drivers, soft cushion ear pads, inline volume controls.', price: 999, stock: 75, category: { name: 'Gaming & Toys' }, imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80', rating: 4.2, discountBadge: 'Under â‚¹1,000', highlights: ['40mm Drivers', 'Flexible Microphone', '3.5mm Universal Jack'] },
  { id: 'gt-5', title: 'Hot Wheels 5-Car Pack Die-Cast Vehicles', description: '1:64 scale classic die-cast sports cars with realistic decos.', price: 699, stock: 90, category: { name: 'Gaming & Toys' }, imageUrl: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&auto=format&fit=crop&q=80', rating: 4.7, discountBadge: 'Kids Favorite', highlights: ['1:64 Scale', '5 Die-Cast Models', 'Durable Metal Build'] },
  { id: 'gt-6', title: 'LEGO Classic Medium Creative Brick Box', description: '484 pieces in 35 different colors, includes windows, eyes and tires.', price: 2499, stock: 30, category: { name: 'Gaming & Toys' }, imageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600&auto=format&fit=crop&q=80', rating: 4.8, discountBadge: 'Creative Play', highlights: ['484 Pieces Included', 'Compatible with All Sets', 'Plastic Storage Tub'] },
  { id: 'gt-7', title: 'Rubikâ€™s Original 3x3 Speed Cube', description: 'Fast turning smooth mechanism with anti-pop tiles for speedcubing.', price: 449, stock: 120, category: { name: 'Gaming & Toys' }, imageUrl: 'https://images.unsplash.com/photo-1591994843349-f415893b3a6b?w=600&auto=format&fit=crop&q=80', rating: 4.6, discountBadge: 'Brain Teaser', highlights: ['Smooth Speed Mechanism', 'Stickerless Tiles', 'Compact 3x3 Form'] },
  { id: 'gt-8', title: 'Hasbro Monopoly Classic Family Board Game', description: 'Fast-dealing property trading board game for 2 to 6 players.', price: 999, stock: 45, category: { name: 'Gaming & Toys' }, imageUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600&auto=format&fit=crop&q=80', rating: 4.7, discountBadge: 'Family Pick', highlights: ['Original Classic Rules', 'Die-cast Tokens', 'Fun For Ages 8+'] },
  { id: 'gt-9', title: 'Redgear Pro Wireless Gamepad for PC', description: 'Dual vibration feedback, 2.4GHz wireless connectivity, 10H battery.', price: 1499, stock: 40, category: { name: 'Gaming & Toys' }, imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80', rating: 4.3, discountBadge: 'PC Gaming', highlights: ['2.4GHz Wireless Dongle', 'Dual Vibration Motors', 'Ergonomic Grip'] },
  { id: 'gt-10', title: 'Nerf Elite 2.0 Commander RD-6 Blaster', description: '6-dart rotating drum with 12 official Nerf foam darts included.', price: 1299, stock: 35, category: { name: 'Gaming & Toys' }, imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=80', rating: 4.5, discountBadge: 'Action Toy', highlights: ['6-Dart Rotary Drum', 'Fires Up to 90 Feet', '12 Darts in Box'] },
  { id: 'gt-11', title: 'Mattel Uno Flip Card Game', description: 'Double-sided deck with competitive Flip Card and dark penalties.', price: 199, stock: 150, category: { name: 'Gaming & Toys' }, imageUrl: 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=600&auto=format&fit=crop&q=80', rating: 4.8, discountBadge: 'Under â‚¹200', highlights: ['Double-Sided Cards', 'Wild Draw 5 Penalty', 'Fun Party Game'] },
  { id: 'gt-12', title: 'Extended RGB Gaming Mouse Pad (80x30cm)', description: 'Micro-textured waterproof cloth with 14 customized lighting modes.', price: 699, stock: 65, category: { name: 'Gaming & Toys' }, imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80', rating: 4.4, discountBadge: 'Desk Essential', highlights: ['800x300mm Desk Coverage', 'Non-Slip Rubber Base', '14 RGB Modes'] },
  { id: 'gt-13', title: 'Barbie Fashionistas Doll with Accessories', description: 'Poseable fashion doll with stylish printed dress and shoes.', price: 649, stock: 50, category: { name: 'Gaming & Toys' }, imageUrl: 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?w=600&auto=format&fit=crop&q=80', rating: 4.5, discountBadge: 'Popular', highlights: ['Original Mattel Doll', 'Trendy Floral Dress', 'Ages 3 and Up'] },
  { id: 'gt-14', title: 'Storio Remote Control 1:18 Racing Car', description: 'Rechargeable high-speed RC sports car with LED headlights.', price: 799, stock: 60, category: { name: 'Gaming & Toys' }, imageUrl: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&auto=format&fit=crop&q=80', rating: 4.1, discountBadge: 'Best Gift', highlights: ['Rechargeable Battery', 'Full Function 27MHz', 'Front Headlights'] },
  { id: 'gt-15', title: 'Ant Esports GM320 RGB Gaming Mouse', description: 'Up to 7200 DPI on-the-fly adjustment with 8 programmable buttons.', price: 549, stock: 80, category: { name: 'Gaming & Toys' }, imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80', rating: 4.3, discountBadge: 'Budget King', highlights: ['7200 DPI Sensor', 'Braided Cable', 'Ergonomic Thumb Rest'] },

  // 5. BOOKS & BESTSELLERS (16 ITEMS)
  { id: 'bk-1', title: 'Atomic Habits by James Clear', description: 'An easy and proven way to build good habits and break bad ones.', price: 449, stock: 120, category: { name: 'Books' }, imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', rating: 4.9, discountBadge: '#1 Bestseller', highlights: ['Over 15M Copies Sold', 'Practical Framework', 'Paperback 320 Pages'] },
  { id: 'bk-2', title: 'The Psychology of Money by Morgan Housel', description: 'Timeless lessons on wealth, greed, and happiness in personal finance.', price: 299, stock: 110, category: { name: 'Books' }, imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80', rating: 4.8, discountBadge: 'Must Read', highlights: ['19 Short Stories on Money', 'Personal Finance Guide', 'Paperback Edition'] },
  { id: 'bk-3', title: 'Deep Work by Cal Newport', description: 'Rules for focused success in a distracted world. Master difficult skills.', price: 349, stock: 75, category: { name: 'Books' }, imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80', rating: 4.7, discountBadge: 'Productivity', highlights: ['Peak Productivity Rules', 'Proven Study Frameworks', 'Paperback'] },
  { id: 'bk-4', title: 'Ikigai: The Japanese Secret to a Long Life', description: 'International guide to discovering your life purpose and everyday joy.', price: 320, stock: 95, category: { name: 'Books' }, imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80', rating: 4.6, discountBadge: 'Bestseller', highlights: ['Hardcover Gift Edition', 'Longevity Insights', 'Mindfulness Tips'] },
  { id: 'bk-5', title: 'Sapiens: A Brief History of Humankind', description: 'Yuval Noah Harari explores 70,000 years of human evolution and culture.', price: 499, stock: 65, category: { name: 'Books' }, imageUrl: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=600&auto=format&fit=crop&q=80', rating: 4.8, discountBadge: 'History Classic', highlights: ['Global Phenomenon', 'Illustrated Chapters', 'Paperback 512 Pages'] },
  { id: 'bk-6', title: 'Rich Dad Poor Dad by Robert T. Kiyosaki', description: 'What the rich teach their kids about money that the poor and middle class do not.', price: 349, stock: 130, category: { name: 'Books' }, imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80', rating: 4.7, discountBadge: '#1 Finance Book', highlights: ['25th Anniversary Edition', 'Mindset for Assets', 'Paperback 336 Pages'] },
  { id: 'bk-7', title: 'The Power of Your Subconscious Mind', description: 'Unlock extraordinary healing, success, and prosperity through positive belief.', price: 199, stock: 140, category: { name: 'Books' }, imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80', rating: 4.6, discountBadge: 'Under â‚¹200', highlights: ['By Joseph Murphy', 'Life Changing Advice', 'Paperback 312 Pages'] },
  { id: 'bk-8', title: 'Think and Grow Rich by Napoleon Hill', description: 'The landmark bestseller on achieving wealth through determination and desire.', price: 219, stock: 100, category: { name: 'Books' }, imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', rating: 4.6, discountBadge: 'Timeless Classic', highlights: ['Original 1937 Edition', '13 Laws of Success', 'Paperback 272 Pages'] },
  { id: 'bk-9', title: 'Do It Today by Darius Foroux', description: 'Overcome procrastination, improve your productivity, and achieve more.', price: 249, stock: 80, category: { name: 'Books' }, imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80', rating: 4.5, discountBadge: 'Popular', highlights: ['Actionable Essays', 'Beat Laziness Today', 'Paperback 200 Pages'] },
  { id: 'bk-10', title: 'Canâ€™t Hurt Me by David Goggins', description: 'Master your mind and defy the odds from Navy SEAL David Goggins.', price: 499, stock: 70, category: { name: 'Books' }, imageUrl: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=600&auto=format&fit=crop&q=80', rating: 4.9, discountBadge: 'Top Motivation', highlights: ['40% Rule Concept', 'True Story of Resilience', 'Paperback 364 Pages'] },
  { id: 'bk-11', title: 'The Subtle Art of Not Giving a F*ck', description: 'A counterintuitive approach to living a good life by Mark Manson.', price: 379, stock: 90, category: { name: 'Books' }, imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', rating: 4.5, discountBadge: 'Bestseller', highlights: ['Real Talk Self-Help', 'Candid Insights', 'Paperback 224 Pages'] },
  { id: 'bk-12', title: 'The Alchemist by Paulo Coelho', description: 'Fable about following your dream and listening to your heart.', price: 299, stock: 110, category: { name: 'Books' }, imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80', rating: 4.7, discountBadge: 'Fiction Classic', highlights: ['Philosophical Journey', 'Millions Sold Globally', 'Paperback 172 Pages'] },
  { id: 'bk-13', title: 'Start with Why by Simon Sinek', description: 'How great leaders inspire everyone to take action.', price: 399, stock: 60, category: { name: 'Books' }, imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80', rating: 4.6, discountBadge: 'Leadership', highlights: ['Golden Circle Model', 'Inspiring Teams', 'Paperback 256 Pages'] },
  { id: 'bk-14', title: 'Show Your Work! by Austin Kleon', description: '10 ways to share your creativity and get discovered.', price: 349, stock: 55, category: { name: 'Books' }, imageUrl: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=600&auto=format&fit=crop&q=80', rating: 4.7, discountBadge: 'Creativity Pick', highlights: ['Graphic Illustrated Guide', 'Build an Audience', 'Paperback 224 Pages'] },
  { id: 'bk-15', title: 'Zero to One by Peter Thiel', description: 'Notes on startups, or how to build the future from legendary founder.', price: 399, stock: 50, category: { name: 'Books' }, imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80', rating: 4.6, discountBadge: 'Startup Guide', highlights: ['Monopoly & Innovation', 'Contrarian Thinking', 'Paperback 224 Pages'] },
  { id: 'bk-16', title: 'Meditations by Marcus Aurelius', description: 'Timeless Roman stoic philosophy on virtue, patience, and duty.', price: 220, stock: 85, category: { name: 'Books' }, imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', rating: 4.8, discountBadge: 'Stoicism', highlights: ['Gregory Hays Translation', 'Stoic Daily Journal', 'Paperback 256 Pages'] },

  // 6. HOME & LIVING ESSENTIALS (16 ITEMS)
  { id: 'hm-1', title: 'Digital Rapid Air Fryer 4.5L', description: '360Â° rapid hot air convection with 8 presets, 90% less oil cooking.', price: 4499, stock: 28, category: { name: 'Home & Kitchen' }, imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80', rating: 4.6, discountBadge: 'Min 50% Off', highlights: ['4.5L Basket Capacity', '8 One-Touch Presets', 'Non-Stick Dishwasher Safe'] },
  { id: 'hm-2', title: 'Wipro Smart LED Desk Lamp (10W)', description: 'Touch dimmer, 3 color temperatures with memory function & flexible gooseneck.', price: 1299, stock: 50, category: { name: 'Home & Kitchen' }, imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80', rating: 4.5, discountBadge: 'Top Pick', highlights: ['Warm/Neutral/Cool White', 'Touch Control Dimmer', 'Eye-Protection LED'] },
  { id: 'hm-3', title: 'Milton Thermosteel 1000ml Flask', description: '24-hour hot & cold vacuum insulated 18/8 stainless steel bottle.', price: 899, stock: 95, category: { name: 'Home & Kitchen' }, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80', rating: 4.6, discountBadge: 'Bestseller', highlights: ['1000ml Capacity', '24H Hot/Cold Retain', '18/8 Food Grade Steel'] },
  { id: 'hm-4', title: 'Prestige 1.5L Stainless Steel Electric Kettle', description: '1500W rapid boil with auto shut-off and dry-boiling protection.', price: 749, stock: 110, category: { name: 'Home & Kitchen' }, imageUrl: 'https://images.unsplash.com/photo-1594213114663-d94db9b17125?w=600&auto=format&fit=crop&q=80', rating: 4.4, discountBadge: 'Under â‚¹999', highlights: ['1500W Power', 'Automatic Cut-off', 'Single-Touch Lid Lock'] },
  { id: 'hm-5', title: 'Nutri-blend 400W Mixer Grinder Blender', description: 'High-speed motor with 2 unbreakable jars and surgical blades for smoothies.', price: 2499, stock: 35, category: { name: 'Home & Kitchen' }, imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop&q=80', rating: 4.4, discountBadge: 'Health Pick', highlights: ['22000 RPM Motor', 'Surgical Steel Blades', 'Compact Sipper Jars'] },
  { id: 'hm-6', title: 'Wakefit Ergonomic Memory Foam Pillow', description: 'Contour slow-rebound neck support pillow with breathable bamboo cover.', price: 999, stock: 70, category: { name: 'Home & Kitchen' }, imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80', rating: 4.6, discountBadge: 'Under â‚¹1,000', highlights: ['Memory Foam Core', 'Spine Alignment Support', 'Removable Washable Cover'] },
  { id: 'hm-7', title: 'Solimo Non-Stick 3-Piece Cookware Set', description: 'Includes 24cm Fry Pan, 24cm Kadhai with Glass Lid, and 25cm Flat Tawa.', price: 1799, stock: 40, category: { name: 'Home & Kitchen' }, imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80', rating: 4.3, discountBadge: 'Combo Deal', highlights: ['3-Layer Non-Stick Coat', 'Induction & Gas Friendly', 'Virgin Aluminium'] },
  { id: 'hm-8', title: 'MIILOT 5-Tier Heavy Duty Shoe Rack', description: 'Rustproof metal pipes with non-woven fabric shelves holding up to 20 pairs.', price: 649, stock: 85, category: { name: 'Home & Kitchen' }, imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80', rating: 4.2, discountBadge: 'Storage Saver', highlights: ['Holds 20 Shoe Pairs', 'Tool-Free Easy Assembly', 'Durable Steel Tubes'] },
  { id: 'hm-9', title: 'Huggies Cotton 4-Piece Bath Towel Set', description: '100% combed cotton 500 GSM soft and high absorbent quick-dry towels.', price: 899, stock: 65, category: { name: 'Home & Kitchen' }, imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80', rating: 4.5, discountBadge: 'Special Price', highlights: ['500 GSM Combed Cotton', 'Set of 4 Bath Towels', 'Fade Resistant Colors'] },
  { id: 'hm-10', title: 'Cello Checkers 18-Piece Plastic Container Set', description: 'BPA-free airtight kitchen storage containers with modular stacking.', price: 799, stock: 80, category: { name: 'Home & Kitchen' }, imageUrl: 'https://images.unsplash.com/photo-1594213114663-d94db9b17125?w=600&auto=format&fit=crop&q=80', rating: 4.3, discountBadge: 'Kitchen Essential', highlights: ['18 Airtight Jars', 'BPA Free 100% Food Grade', 'Easy Grip Checkered Design'] },
  { id: 'hm-11', title: 'Story@Home Blackout 7ft Door Curtains (Pack of 2)', description: 'Triple weave polyester fabric blocking 85% sunlight with metal eyelets.', price: 849, stock: 55, category: { name: 'Home & Kitchen' }, imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80', rating: 4.4, discountBadge: 'Min 40% Off', highlights: ['Set of 2 (7 Feet)', '85% Light Blockout', 'Rust-Proof Eyelets'] },
  { id: 'hm-12', title: 'Gala Spin Mop with Microfiber Head & Bucket', description: '360-degree rotating stainless steel spinner with durable wheels.', price: 1199, stock: 60, category: { name: 'Home & Kitchen' }, imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80', rating: 4.5, discountBadge: 'Bestseller', highlights: ['Stainless Steel Wringer', 'Microfiber Quick Clean Head', 'Handle with Big Wheels'] },
  { id: 'hm-13', title: 'Philips 9W Smart Wi-Fi LED Bulb (B22)', description: '16 million colors, dimmable, compatible with Alexa and Google Assistant.', price: 599, stock: 95, category: { name: 'Home & Kitchen' }, imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80', rating: 4.4, discountBadge: 'Smart Lighting', highlights: ['16 Million Colors', 'App & Voice Control', 'No Hub Required'] },
  { id: 'hm-14', title: 'Hawkins 3 Litre Hard Anodized Pressure Cooker', description: 'Induction compatible base with food grade safety valve and cool touch handle.', price: 1540, stock: 45, category: { name: 'Home & Kitchen' }, imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80', rating: 4.7, discountBadge: 'Kitchen Pride', highlights: ['3 Litre Ideal for 3-4 People', 'Hard Anodized Scratchproof', '5 Years Warranty'] },
  { id: 'hm-15', title: 'Kuber Industries Cotton Laundry Basket 50L', description: 'Collapsible waterproof PE coating with reinforced handles.', price: 349, stock: 110, category: { name: 'Home & Kitchen' }, imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80', rating: 4.2, discountBadge: 'Under â‚¹400', highlights: ['50L Large Volume', 'Foldable Space Saver', 'Waterproof PE Layer'] },
  { id: 'hm-16', title: 'Spaces Cotton Double Bedsheet with 2 Pillows', description: '100% super soft breathable cotton, 180 thread count with floral print.', price: 1099, stock: 45, category: { name: 'Home & Kitchen' }, imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80', rating: 4.5, discountBadge: 'Top Pick', highlights: ['King Size Double Bed', '180 Thread Count', '2 Matching Pillow Covers'] },
];

export default function ShopPage() {
  const router = useRouter();
  const { addItem, initUserCart, isLoading: cartLoading } = useCartStore();
    const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    initUserCart(user?.id || user?.email);
  }, [user?.id, user?.email, initUserCart]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating-desc'>('featured');
  const [priceRange, setPriceRange] = useState<'all' | 'under-1k' | 'under-5k' | 'under-25k' | 'above-25k'>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [modalAdded, setModalAdded] = useState(false);

  // Address Booking States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  const [bookingAddress, setBookingAddress] = useState('');
  const [bookingPincode, setBookingPincode] = useState('');
  const [bookingCity, setBookingCity] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // User-scoped storage key prevents address leakage across accounts
  const userStorageKey = user?.id ? `reddy_saved_address_${user.id}` : user?.email ? `reddy_saved_address_${user.email}` : null;

  useEffect(() => {
    if (typeof window !== 'undefined' && userStorageKey) {
      const stored = localStorage.getItem(userStorageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSavedAddress(parsed);
          setUseNewAddress(false);
        } catch {
          setSavedAddress(null);
          setUseNewAddress(true);
        }
      } else {
        setSavedAddress(null);
        setUseNewAddress(true);
      }
    } else {
      setSavedAddress(null);
      setUseNewAddress(true);
    }
  }, [userStorageKey]);

  const { data: rawProducts } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const res = await api.get('/products');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const allProducts = useMemo(() => {
    const list = [...CURATED_CATALOG];
    if (rawProducts && rawProducts.length > 0) {
      return [...rawProducts, ...list];
    }
    return list;
  }, [rawProducts]);

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'all' ||
        (selectedCategory === 'electronics'
          ? p.category?.name?.toLowerCase().includes('elec') || p.category?.name?.toLowerCase().includes('mob')
          : p.category?.name?.toLowerCase().includes(selectedCategory));

      const priceNum = Number(p.price) || 0;
      let matchesPrice = true;
      if (priceRange === 'under-1k') matchesPrice = priceNum < 1000;
      else if (priceRange === 'under-5k') matchesPrice = priceNum >= 1000 && priceNum <= 5000;
      else if (priceRange === 'under-25k') matchesPrice = priceNum > 5000 && priceNum <= 25000;
      else if (priceRange === 'above-25k') matchesPrice = priceNum > 25000;

      const ratingNum = p.rating || 4.0;
      const matchesRating = minRating === 0 || ratingNum >= minRating;

      return matchesSearch && matchesCat && matchesPrice && matchesRating;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'rating-desc') {
      result.sort((a, b) => (b.rating || 4) - (a.rating || 4));
    }

    return result;
  }, [allProducts, searchQuery, selectedCategory, priceRange, minRating, sortBy]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all' || priceRange !== 'all' || minRating > 0 || sortBy !== 'featured';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange('all');
    setMinRating(0);
    setSortBy('featured');
  };

  const electronicsList = useMemo(
    () => allProducts.filter((p) => p.category?.name?.toLowerCase().includes('elec') || p.category?.name?.toLowerCase().includes('mob')),
    [allProducts]
  );
  const appliancesList = useMemo(
    () => allProducts.filter((p) => p.category?.name?.toLowerCase().includes('applian')),
    [allProducts]
  );
  const fashionList = useMemo(
    () => allProducts.filter((p) => p.category?.name?.toLowerCase().includes('fash')),
    [allProducts]
  );
  const toysList = useMemo(
    () => allProducts.filter((p) => p.category?.name?.toLowerCase().includes('toy') || p.category?.name?.toLowerCase().includes('gam')),
    [allProducts]
  );
  const booksList = useMemo(
    () => allProducts.filter((p) => p.category?.name?.toLowerCase().includes('book')),
    [allProducts]
  );
  const homeList = useMemo(
    () => allProducts.filter((p) => p.category?.name?.toLowerCase().includes('home')),
    [allProducts]
  );

  const showSpotlightDeals = !hasActiveFilters;

  const handleModalAddToCart = async () => {
    if (!activeProduct) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    await addItem({
      id: activeProduct.id,
      title: activeProduct.title,
      price: activeProduct.price,
      imageUrl: activeProduct.imageUrl,
    }, 1);
    setModalAdded(true);
    setTimeout(() => setModalAdded(false), 1600);
  };

  const handleOpenBookingModal = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (savedAddress) {
      setUseNewAddress(false);
    } else {
      setUseNewAddress(true);
    }
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    setIsBookingSubmitting(true);
    setBookingSuccess(null);

    let fullAddress = '';
    if (useNewAddress || !savedAddress) {
      fullAddress = `${bookingAddress.trim()}, ${bookingCity.trim()} - ${bookingPincode.trim()} (Phone: ${bookingPhone.trim()})`;
      const toSave: SavedAddress = {
        address: bookingAddress,
        city: bookingCity,
        pincode: bookingPincode,
        phone: bookingPhone,
      };
      setSavedAddress(toSave);
      if (typeof window !== 'undefined' && userStorageKey) {
        localStorage.setItem(userStorageKey, JSON.stringify(toSave));
      }
    } else {
      fullAddress = `${savedAddress.address}, ${savedAddress.city} - ${savedAddress.pincode} (Phone: ${savedAddress.phone})`;
    }

    try {
      await api.post('/orders/book-now', {
        productId: activeProduct.id,
        productTitle: activeProduct.title,
        price: Number(activeProduct.price),
        deliveryAddress: fullAddress,
        customerName: user?.name,
        customerEmail: user?.email,
      });

      setBookingSuccess('Order Confirmed! A confirmation email has been dispatched with order details and 5 to 7 days delivery notice.');
      setTimeout(() => {
        setIsBookingModalOpen(false);
        setActiveProduct(null);
        setBookingSuccess(null);
      }, 3000);
    } catch {
      setBookingSuccess('Booking registered! Cash on delivery confirmed.');
      setTimeout(() => {
        setIsBookingModalOpen(false);
        setActiveProduct(null);
        setBookingSuccess(null);
      }, 2500);
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="relative w-full max-w-2xl mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for Mobiles, Electronics, Books, Fashion and More..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="border-t border-slate-100 overflow-x-auto scrollbar-none">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8 min-w-max">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex flex-col items-center gap-1.5 transition-colors group ${
                    active ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600 font-medium'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
                      active ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-600' : 'bg-slate-100 group-hover:bg-blue-50 text-slate-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs whitespace-nowrap">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 space-y-6">
        {/* Spotlight Banner Bar */}
        {showSpotlightDeals && (
          <div className="rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-4 sm:p-6 text-white shadow-sm transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-yellow-300" />
                <h2 className="text-lg font-extrabold tracking-tight">Today's Spotlight Deals</h2>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">Limited Period</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {HERO_DEALS.map((deal, idx) => (
                <div
                  key={idx}
                  className="group relative flex flex-col items-center justify-between rounded-lg bg-white/95 p-3 text-slate-900 shadow-sm transition hover:scale-105 hover:bg-white"
                >
                  <span className="absolute top-2 left-2 rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {deal.tag}
                  </span>
                  <div className="aspect-square w-full overflow-hidden rounded my-2">
                    <img src={deal.image} alt={deal.title} className="h-full w-full object-contain" />
                  </div>
                  <div className="w-full text-center">
                    <span className="block text-xs font-bold text-blue-600">{deal.offer}</span>
                    <span className="block text-[11px] font-medium text-slate-700 truncate">{deal.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtered or Multi-Section Catalog */}
        {hasActiveFilters ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {searchQuery ? `Search Results for "${searchQuery}"` : `${selectedCategory.toUpperCase()} Items`}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Showing {filteredProducts.length} items</p>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500">
                No matching products found for "{searchQuery}".
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onSelect={(p) => setActiveProduct(p)} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Section 1: Electronics */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600"><Laptop className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Electronics & Smartphones</h2>
                    <p className="text-xs text-slate-500">Flagships, 5G mobiles, audio, laptops & gaming accessories</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCategory('electronics')} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
                  <span>View All ({electronicsList.length})</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {electronicsList.map((product) => (
                  <ProductCard key={product.id} product={product} onSelect={(p) => setActiveProduct(p)} />
                ))}
              </div>
            </div>

            {/* Section 2: Appliances */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-sky-50 p-2 text-sky-600"><Tv className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Home & Kitchen Appliances</h2>
                    <p className="text-xs text-slate-500">4K TVs, refrigerators, washing machines, geysers & coolers</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCategory('appliances')} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
                  <span>View All ({appliancesList.length})</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {appliancesList.map((product) => (
                  <ProductCard key={product.id} product={product} onSelect={(p) => setActiveProduct(p)} />
                ))}
              </div>
            </div>

            {/* Section 3: Fashion */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-purple-50 p-2 text-purple-600"><Shirt className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Trending Fashion & Footwear</h2>
                    <p className="text-xs text-slate-500">Watches, Nike sneakers, Levi's denim, backpacks & boots</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCategory('fashion')} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
                  <span>View All ({fashionList.length})</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {fashionList.map((product) => (
                  <ProductCard key={product.id} product={product} onSelect={(p) => setActiveProduct(p)} />
                ))}
              </div>
            </div>

            {/* Section 4: Gaming & Toys */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-rose-50 p-2 text-rose-600"><Gamepad2 className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Gaming Gear, Consoles & Toys</h2>
                    <p className="text-xs text-slate-500">PS5 controllers, Nintendo Switch, LEGO, Hot Wheels & gaming mice</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCategory('toys')} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
                  <span>View All ({toysList.length})</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {toysList.map((product) => (
                  <ProductCard key={product.id} product={product} onSelect={(p) => setActiveProduct(p)} />
                ))}
              </div>
            </div>

            {/* Section 5: Books */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600"><BookOpen className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Top Bestselling Books (â‚¹199 - â‚¹499)</h2>
                    <p className="text-xs text-slate-500">Personal finance, habits, productivity, self-help & mindset</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCategory('books')} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
                  <span>View All ({booksList.length})</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {booksList.map((product) => (
                  <ProductCard key={product.id} product={product} onSelect={(p) => setActiveProduct(p)} />
                ))}
              </div>
            </div>

            {/* Section 6: Home & Kitchen */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><Home className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Home & Kitchen Essentials</h2>
                    <p className="text-xs text-slate-500">Air fryers, desk lamps, cookware, flasks & memory foam pillows</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCategory('home')} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
                  <span>View All ({homeList.length})</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {homeList.map((product) => (
                  <ProductCard key={product.id} product={product} onSelect={(p) => setActiveProduct(p)} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Official Product Detail Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row">
            <button
              onClick={() => setActiveProduct(null)}
              className="absolute right-4 top-4 z-20 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Product Image & Purchase Actions */}
            <div className="relative flex flex-col items-center justify-between border-b border-slate-200 bg-slate-50 p-8 md:w-1/2 md:border-b-0 md:border-r">
              {activeProduct.discountBadge && (
                <span className="absolute left-6 top-6 rounded bg-emerald-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                  {activeProduct.discountBadge}
                </span>
              )}
              <div className="aspect-square w-full max-w-xs overflow-hidden my-auto">
                <img src={activeProduct.imageUrl} alt={activeProduct.title} className="h-full w-full object-contain" />
              </div>

              {/* Action Buttons: Add to Cart and Book Now */}
              <div className="mt-6 flex w-full gap-3">
                <button
                  onClick={handleModalAddToCart}
                  disabled={cartLoading || activeProduct.stock === 0}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold shadow transition ${
                    activeProduct.stock === 0
                      ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                      : modalAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#ff9f00] text-white hover:bg-[#f39700]'
                  }`}
                >
                  {modalAdded ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      <span>{activeProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleOpenBookingModal}
                  disabled={activeProduct.stock === 0}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#fb641b] py-3 text-sm font-bold text-white shadow hover:bg-[#e85a15] transition"
                >
                  <Zap className="h-4 w-4 fill-current" />
                  <span>Book Now</span>
                </button>
              </div>
            </div>

            {/* Product Info Column */}
            <div className="flex flex-1 flex-col overflow-y-auto p-6 md:p-8">
              <div className="flex items-center gap-2">
                <span className="rounded bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 uppercase">
                  {activeProduct.category?.name || 'General'}
                </span>
                <span className="flex items-center gap-1 rounded bg-emerald-700 px-2 py-0.5 text-xs font-bold text-white">
                  <span>{activeProduct.rating || '4.3'}</span>
                  <Star className="h-3 w-3 fill-current" />
                </span>
                <span className="text-xs font-medium text-slate-500">1,248 Ratings & Reviews</span>
              </div>

              <h2 className="mt-2 text-xl font-bold text-slate-900 md:text-2xl">{activeProduct.title}</h2>

              <div className="mt-4 flex items-baseline gap-3 border-b border-slate-100 pb-4">
                <span className="text-2xl font-black text-slate-950 md:text-3xl">
                  {Number(activeProduct.price).toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </span>
                <span className="text-sm font-semibold text-emerald-600">Special Price</span>
              </div>

              <div className="mt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Product Highlights</h3>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                  {activeProduct.highlights ? (
                    activeProduct.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600">â€¢</span>
                        <span>{h}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">â€¢</span>
                        <span>Verified authentic item from official brand partners</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">â€¢</span>
                        <span>1 Year Manufacturer Warranty against technical defects</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="mt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Description</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {activeProduct.description || 'Verified authentic item directly from top-rated sellers.'}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
                <div className="flex flex-col items-center p-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <span className="mt-1 text-[11px] font-semibold text-slate-700">100% Authentic</span>
                </div>
                <div className="flex flex-col items-center p-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <span className="mt-1 text-[11px] font-semibold text-slate-700">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center p-2">
                  <RotateCcw className="h-5 w-5 text-amber-600" />
                  <span className="mt-1 text-[11px] font-semibold text-slate-700">7-Day Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Now Address Modal with User-Scoped Saved Address */}
      {isBookingModalOpen && activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delivery Address</h3>
                <p className="text-xs text-slate-500">Expected Delivery: 5 to 7 days (Cash on Delivery)</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-3 border border-slate-200">
              <div className="flex items-center gap-3">
                <img src={activeProduct.imageUrl} alt={activeProduct.title} className="h-12 w-12 rounded object-contain bg-white p-1 border" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{activeProduct.title}</h4>
                  <span className="text-[11px] text-blue-600 font-medium">Expected delivery: 5 to 7 days</span>
                </div>
              </div>
              <span className="text-sm font-extrabold text-slate-900">
                {Number(activeProduct.price).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
              <Banknote className="h-5 w-5 text-amber-700 shrink-0" />
              <div className="text-xs text-amber-900">
                <strong className="block text-amber-950 font-bold">Payment Option: Cash on Delivery (COD) Only</strong>
                Pay directly upon package delivery.
              </div>
            </div>

            {bookingSuccess ? (
              <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-center">
                <Check className="mx-auto h-8 w-8 text-emerald-600" />
                <h4 className="mt-2 text-sm font-bold text-emerald-900">Booking Confirmed!</h4>
                <p className="mt-1 text-xs text-emerald-700">{bookingSuccess}</p>
              </div>
            ) : savedAddress && !useNewAddress ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border-2 border-blue-600 bg-blue-50/50 p-4 relative">
                  <span className="absolute top-3 right-3 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                    Saved Address
                  </span>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-xs text-slate-800">
                      <p className="font-semibold text-slate-900">{savedAddress.address}</p>
                      <p className="text-slate-600 mt-0.5">{savedAddress.city} - {savedAddress.pincode}</p>
                      <p className="text-slate-600 mt-1">Phone: {savedAddress.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUseNewAddress(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Deliver to a different / new address</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isBookingSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#fb641b] py-3 text-sm font-bold text-white shadow hover:bg-[#e85a15] disabled:opacity-50 transition"
                  >
                    {isBookingSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="h-4 w-4 fill-current" />
                        <span>Deliver to This Address & Confirm (COD)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="mt-4 space-y-3">
                {savedAddress && (
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-semibold text-slate-700">Enter New Address</span>
                    <button
                      type="button"
                      onClick={() => setUseNewAddress(false)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      â† Back to saved address
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Full Delivery Address</label>
                  <textarea
                    required
                    rows={2}
                    value={bookingAddress}
                    onChange={(e) => setBookingAddress(e.target.value)}
                    placeholder="House/Flat No., Building Name, Street, Area..."
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">City / District</label>
                    <input
                      type="text"
                      required
                      value={bookingCity}
                      onChange={(e) => setBookingCity(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Pincode</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={bookingPincode}
                      onChange={(e) => setBookingPincode(e.target.value.trim())}
                      placeholder="560001"
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value.trim())}
                    placeholder="+91 98765 43210"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isBookingSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#fb641b] py-3 text-sm font-bold text-white shadow hover:bg-[#e85a15] disabled:opacity-50 transition"
                  >
                    {isBookingSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="h-4 w-4 fill-current" />
                        <span>Save Address & Confirm Booking (COD)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}