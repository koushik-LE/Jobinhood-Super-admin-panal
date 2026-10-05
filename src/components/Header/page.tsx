'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '../ui/avatar';
import MobileHeader from '../constant/MobileHeader';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { IconBell, IconSettings, IconLogout, IconPencil, IconTrash } from '@tabler/icons-react'; // IconBell, IconSettings are defined but not used here
import { showToast } from '@/components/constant/custom-toast';
import type { RootState } from '@/redux/store';
import { setLogedinUser } from '@/redux/constSlice';
import Image from 'next/image';
import type { LoggedInUser } from '../Models/header-user';
import { Button, type ButtonProps } from '@/components/ui/button';
import editicon from '@/assets/edit.svg';
import logo from '@/assets/logo.png';

type UserDataForPopup = {
  id: string;
  name: string;
  email: string;
  fileStorage?: {
    data: string;
    fileType: string;
    fileStorageId: string;
    updatedAt?: number | string;
  } | null;
};

interface PopupMessageProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (file: File) => void;
  onUpload: (file: File) => void;
  userData: UserDataForPopup | null;
  profilePicture: File | null;
  setProfilePicture: (file: File | null) => void;
  onDelete: () => void;
  isLoading: boolean;
}

const PopupMessage: React.FC<PopupMessageProps> = ({
  isOpen,
  onClose,
  onEdit,
  onUpload,
  userData,
  profilePicture,
  setProfilePicture,
  onDelete,
  isLoading,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 7 * 1024 * 1024) {
        // 7MB size limit
        showToast('error', 'File size exceeds 7MB');
        e.target.value = ''; // Reset the file input
        return;
      }
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.svg', '.eps', '.ico'];
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/svg+xml',
        'image/x-eps',
        'image/vnd.microsoft.icon',
        'image/x-icon',
      ];
      const fileName = file.name.toLowerCase();
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
      const isExtensionAllowed = allowedExtensions.includes(fileExtension);
      const isMimeTypeAllowed = allowedMimeTypes.includes(file.type);
      if (!isExtensionAllowed && !isMimeTypeAllowed) {
        showToast('error', 'Only .jpg, .jpeg, .png, .svg, .eps, .ico files are allowed.');
        e.target.value = '';
        setProfilePicture(null);
        return;
      }
      setProfilePicture(file);
    }
  };

  const handleApplyClick = () => {
    if (!profilePicture) {
      showToast('info', 'Please select a picture first.');
      return;
    }

    if (userData?.fileStorage?.fileStorageId) {
      onEdit(profilePicture);
    } else {
      onUpload(profilePicture);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#171717] bg-opacity-70">
      <div className="relative bg-[#171717] rounded-lg shadow-xl p-10 w-96 h-128">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
        >
          &times;
        </button>
        <p className="text-black font-normal dark:text-black-400 text-left text-xl mb-10">
          Profile Picture
        </p>
        <div className="flex justify-center mb-10 p-3">
          {/* <label htmlFor="file-upload" className="cursor-pointer"> */}
          <Avatar className="h-52 w-52 text-9xl">
            {profilePicture ? (
              <Image
                src={URL.createObjectURL(profilePicture)}
                alt="Profile"
                height={80}
                width={80}
                className="h-full w-full rounded-full object-cover"
                key={`${profilePicture.name}-${profilePicture.size}-${profilePicture.lastModified}`}
              />
            ) : userData?.fileStorage?.data ? (
              <Image
                src={`data:${userData.fileStorage.fileType};base64,${userData.fileStorage.data}`}
                alt="Profile"
                height={80}
                width={80}
                className="h-full w-full rounded-full object-cover"
                // FIX: Ensure updatedAt is not undefined before concatenating.
                // If it's undefined, provide a fallback string directly.
                key={`${userData.fileStorage.fileStorageId}-${userData.fileStorage.updatedAt ?? 'popup-default'}`}
              />
            ) : (
              <AvatarFallback>{userData?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
            )}
          </Avatar>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.svg,.eps,.ico,image/jpeg,image/png,image/svg+xml,image/x-eps,image/x-icon,image/vnd.microsoft.icon"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          {/* </label> */}
        </div>

        {profilePicture ? (
          <Button
            onClick={handleApplyClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-1 py-2 px-4 bg-blue90 hover:bg-blue90 hover:bg-opacity-50 
                       text-black text-lg font-normal rounded-3xl transition-colors disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Save'
            )}
          </Button>
        ) : userData?.fileStorage?.data ? (
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isLoading}
              className="w-full flex items-center gap-1 py-2 px-4
              bg-blue90 text-lg font-normal hover:bg-blue90 hover:bg-opacity-50 text-black rounded-3xl transition-colors"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Image src={editicon} alt="Edit Icon" width={18} height={18} />
                  Change
                </>
              )}
            </Button>
            <Button
              onClick={onDelete}
              disabled={isLoading}
              className="w-full flex items-center gap-1 py-2 px-4
              bg-blue90 text-lg font-normal hover:bg-blue90 hover:bg-opacity-50 text-black rounded-3xl transition-colors"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <IconTrash size={18} />
                  Remove
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="w-full flex items-center justify-center gap-1 py-2 px-4 bg-blue90 hover:bg-blue90 
                      text-black text-lg font-normal rounded-3xl transition-colors disabled:cursor-not-allowed"
          >
            Add Profile Picture
          </Button>
        )}
      </div>
    </div>
  );
};

const Header: React.FC = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false); // Defined but not used
  const userData: LoggedInUser | null = useSelector(
    (state: RootState) => state.constantReducer.logedinUser
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const NavPage = process.env.NEXT_PUBLIC_SUPER_ADMIN_PAGES
    ? process.env.NEXT_PUBLIC_SUPER_ADMIN_PAGES.split(',')
    : [];
  const pageLinks = NavPage.map(page => ({
    label: page,
    link: `/${page.toLowerCase().replace(/\s+/g, '-')}`,
  }));

  const getRelevantSelectedItem = useCallback(() => {
    if (pathname) {
      const pathSegments = pathname.split('/').filter(Boolean);
      const matchedLink = pageLinks.find(linkItem =>
        pathSegments.includes(linkItem.link.substring(1))
      );
      return matchedLink?.label || 'Dashboard';
    }
    return 'Dashboard';
  }, [pathname, pageLinks]);

  const [selectedItem, setSelectedItem] = useState('');

  // Setting selectedItem from getRelevantSelectedItem on mount and path change
  useEffect(() => {
    setSelectedItem(getRelevantSelectedItem());
  }, [getRelevantSelectedItem]);

  const [notifications] = useState([
    // Defined but not used
    { id: 1, title: 'New Message', variant: 'success' },
    { id: 2, title: 'Payment Failed', variant: 'error' },
  ]);

  interface UserResponseData {
    data: LoggedInUser;
  }

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.post<UserResponseData>('/api/auth/logedInUser', {});
      const fetchedUserData = response.data.data;
      // Only dispatch if data has actually changed to avoid unnecessary re-renders
      if (JSON.stringify(fetchedUserData) !== JSON.stringify(userData)) {
        dispatch(setLogedinUser(fetchedUserData));
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      dispatch(setLogedinUser(null));
      showToast('error', 'Failed to load user data.');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, userData]); // Added userData to dependencies to make sure comparison is against latest state

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const handleProfilePictureUpload = async (file: File) => {
    try {
      setIsProfileLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      interface UploadResponse {
        data: LoggedInUser;
      }

      // FIX: Changed data: any to data: LoggedInUser for better type safety
      const response = await axios.post<UploadResponse>(
        '/api/profile/uploadProfilePicture',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.data.data) {
        await fetchUser(); // Re-fetch to get updated user data (including fileStorage)
        setProfileModalOpen(false);
        setProfilePictureFile(null);
        showToast('success', 'Profile picture uploaded successfully');
      } else {
        showToast('error', 'Profile picture upload failed: No data returned from server.');
      }
    } catch (error) {
      console.error('Profile picture upload failed:', error);
      showToast('error', 'Profile picture upload failed. Please try again.');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleEditProfilePicture = async (file: File) => {
    try {
      setIsProfileLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      interface EditResponse {
        data: LoggedInUser;
      }

      // FIX: Changed data: any to data: LoggedInUser for better type safety
      const response = await axios.put<EditResponse>('/api/profile/editProfilePicture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.data) {
        await fetchUser(); // Re-fetch to get updated user data (including fileStorage)
        setProfileModalOpen(false);
        setProfilePictureFile(null);
        showToast('success', 'Profile picture updated successfully');
      } else {
        showToast('error', 'Profile picture update failed: No data returned from server.');
      }
    } catch (error) {
      console.error('Profile picture update failed:', error);
      showToast('error', 'Profile picture update failed. Please try again.');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      setIsProfileLoading(true);
      const fileId = userData?.fileStorage?.fileStorageId;
      if (!fileId) {
        showToast('error', 'No profile picture to delete.');
        return;
      }

      const response = await axios.delete('/api/profile/deleteProfilePicture', {
        data: { id: fileId },
      });

      if (response.status === 200 || response.status === 204) {
        await fetchUser(); // Re-fetch to get updated user data (fileStorage should now be null/empty)
        setProfileModalOpen(false);
        setProfilePictureFile(null);
        showToast('success', 'Profile picture deleted successfully');
      } else {
        showToast('error', 'Failed to delete profile picture: Unexpected server response.');
      }
    } catch (error) {
      console.error('Failed to delete profile picture:', error);
      showToast('error', 'Failed to delete profile picture. Please try again.');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const SignoutModal: React.FC = () => (
    <div className="absolute right-0 mt-2 w-80 bg-blue150 dark:bg-gray-800 rounded-lg shadow-xl p-8 z-50">
      <p className="text-black dark:text-gray-400 text-center font-normal text-sm mb-3">
        {userData?.email || 'Loading...'}
      </p>
      <div className="flex justify-center mb-4">
        <div className="relative">
          <Avatar className="h-20 w-20">
            {userData?.fileStorage?.data ? (
              <Image
                src={`data:${userData.fileStorage.fileType};base64,${userData.fileStorage.data}`}
                width={96}
                height={96}
                alt="Profile"
                className="rounded-full object-cover"
                // FIX: Ensure updatedAt is not undefined before concatenating.
                // If it's undefined, provide a fallback string directly.
                key={`${userData.fileStorage.fileStorageId}-${userData.fileStorage.updatedAt ?? 'signout-default'}`}
              />
            ) : (
              <AvatarFallback className="w-20 h-20 bg-brown10 text-white text-6xl">
                {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            )}
          </Avatar>

          <button
            onClick={() => {
              setProfileModalOpen(true);
              setMenuOpen(false);
            }}
            className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-md hover:bg-gray-200"
          >
            <Image src={editicon} alt="Edit Icon" width={14} height={14} />
          </button>
        </div>
      </div>

      <h1 className="text-xl font-medium text-black text-center dark:text-white mb-4">
        Hi, {userData?.name || 'User'}
      </h1>
      <Button
        onClick={async () => {
          await fetch('/api/auth/sign-out', { method: 'POST' });
          router.push('/');
          setMenuOpen(false);
          dispatch(setLogedinUser(null));
        }}
        className="w-full flex items-center justify-center gap-1 p-6
          bg-white30 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
          text-black text-base font-normal dark:text-gray-200 rounded-md transition-colors"
      >
        <IconLogout size={18} />
        Sign out
      </Button>
    </div>
  );

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      {isMobile ? (
        <MobileHeader />
      ) : (
        <header className="fixed top-0 left-0 right-0 z-10 bg-[#171717] w-full pt-4 px-4">
          <div className="flex items-center justify-between relative">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Image src={logo} width={50} height={50} alt="logo" />
              <span className="font-bold dark:text-white">Jobinhood</span>
            </Link>

            <div className="flex items-center space-x-6">
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!isMenuOpen)}
                  className="text-black dark:text-white flex items-center"
                >
                  <Avatar className="h-8 w-8">
                    {userData?.fileStorage?.data ? (
                      <Image
                        src={`data:${userData.fileStorage.fileType};base64,${userData.fileStorage.data}`}
                        width={32}
                        height={32}
                        alt="Profile"
                        className="h-full w-full rounded-full object-cover"
                        // FIX: Ensure updatedAt is not undefined before concatenating.
                        // If it's undefined, provide a fallback string directly.
                        key={`${userData.fileStorage.fileStorageId}-${userData.fileStorage.updatedAt ?? 'header-default'}`}
                      />
                    ) : (
                      <AvatarFallback>
                        {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="ml-2 text-sm text-left">
                    <div className="font-semibold">{userData?.name || 'User'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Super Admin</div>
                  </div>
                </button>
                {isMenuOpen && <SignoutModal />}
              </div>
            </div>
          </div>

          <motion.nav className="flex flex-col md:flex-row items-center justify-between bg-[#171717] p-0 dark:border-gray-700 mt-4">
            <div className="flex space-x-8 justify-center px-0">
              {pageLinks.map(item => {
                const isActive = selectedItem === item.label;
                return (
                  <motion.div key={item.label} whileHover={{ scale: 1.1 }} className="relative">
                    <Link
                      href={item.link}
                      onClick={() => {
                        setSelectedItem(item.label);
                        localStorage.setItem('selectedNavItem', item.label);
                      }}
                    >
                      <div className="py-2 px-4 rounded-lg transition-all text-sm duration-200 dark:text-white">
                        {item.label}
                      </div>
                    </Link>
                    {isActive && (
                      <motion.div
                        layoutId="underline"
                        className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue10 to-blue70 dark:bg-gradient-to-r dark:from-[#F02AF3] dark:to-[#F02AF3]"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.nav>
        </header>
      )}

      <PopupMessage
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setProfilePictureFile(null);
        }}
        onUpload={handleProfilePictureUpload}
        onEdit={handleEditProfilePicture}
        onDelete={handleDeleteProfile}
        userData={userData}
        profilePicture={profilePictureFile}
        setProfilePicture={setProfilePictureFile}
        isLoading={isProfileLoading}
      />
    </motion.div>
  );
};

export default Header;
