'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { IconBell } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { NotificationPanel } from './notification-panel';
import type { RootState } from '@/redux/store';

const MobileHeader: React.FC = () => {
  const [isDrawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [isMenuOpen, setMenuOpen] = useState<boolean>(false);
  const [isToggled, setIsToggled] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<string>('Dashboard');
  const [open, setOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Message', variant: 'success' },
    { id: 2, title: 'Payment Failed', variant: 'error' },
  ]);
  const dispatch = useDispatch();

  const handleDrawerToggle = () => setDrawerOpen(!isDrawerOpen);
  const closeDrawer = () => setDrawerOpen(false);
  const handleMenuToggle = () => setMenuOpen(!isMenuOpen);

  const handleToggleNotifications = () => {
    setIsToggled(!isToggled);
    setShowNotifications(!showNotifications);
    setOpen(!open);
  };
  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    localStorage.setItem('selectedNavItem', item);
    closeDrawer();
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-20 bg-white dark:bg-gray-900 w-full shadow-md"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Sidebar Toggle */}
        <div className="flex items-center space-x-3">
          <FaBars
            size={25}
            className="text-black dark:text-white cursor-pointer"
            onClick={handleDrawerToggle}
          />
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-900 rounded" />
            <span className="font-bold text-black dark:text-white">Logo</span>
          </Link>
        </div>

        {/* Notification & Profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button className="relative" onClick={handleToggleNotifications}>
              <IconBell size={28} className="text-orange10" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1 py-0 animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {open && <NotificationPanel open={open} onClose={() => setOpen(false)} />}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button onClick={handleMenuToggle} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>SW</AvatarFallback>
              </Avatar>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg shadow-lg">
                <button className="w-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600">
                  Profile
                </button>
                <button className="w-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {isDrawerOpen && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 w-64 h-full backdrop-blur-lg bg-white/30 dark:bg-gray-900/30 border border-white/10 dark:border-gray-700/20 z-30 shadow-lg p-5"
        >
          {/* Header with Logo, Name & Close Button */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-300 dark:border-gray-700">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-900 rounded" />
              <span className="font-bold text-black dark:text-white">Logo</span>
            </Link>
            <span className="text-lg font-semibold text-black dark:text-white">Koushik</span>
            <FaTimes
              size={24}
              className="text-black dark:text-white cursor-pointer"
              onClick={closeDrawer}
            />
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-4 mt-4">
            {['Dashboard', 'Companies', 'Credits', 'Sales Report'].map(item => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className={`text-lg font-medium py-2 px-4 rounded-lg transition-all duration-300 ${
                  selectedItem === item
                    ? 'bg-blue-500 text-white dark:bg-blue-700'
                    : 'text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                onClick={() => handleItemClick(item)}
              >
                {item}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default MobileHeader;
