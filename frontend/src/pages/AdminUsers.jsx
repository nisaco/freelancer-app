import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await axios.delete(`${API_BASE}/admin/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u._id !== id));
      toast.success("User deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDFDFF] dark:bg-[#0B0F1A] pb-20">
        <Navbar />
        <div className="living-bg"><div className="orb orb-1 opacity-20" /><div className="orb orb-2 opacity-20" /></div>

        <div className="max-w-7xl mx-auto px-6 pt-10">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">
                User <span className="text-blue-600">Management</span>
              </h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
                Monitor and manage all accounts
              </p>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search username or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600 dark:text-white"
              />
              <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-2 rounded-xl text-sm outline-none dark:text-white"
              >
                <option value="all">All Roles</option>
                <option value="client">Clients</option>
                <option value="artisan">Artisans</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 font-black uppercase text-gray-300 animate-pulse">Loading Users...</div>
          ) : (
            <div className="bg-white dark:bg-white/5 rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Role</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Activity</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Joined</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {filteredUsers.map((user) => (
                      <motion.tr 
                        key={user._id} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                              className="w-10 h-10 rounded-full object-cover bg-gray-200"
                              alt="avatar"
                            />
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white text-sm">{user.username}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                            user.role === 'artisan' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.isVerified ? (
                            <span className="text-green-500 text-xs font-bold flex items-center gap-1">
                              ● Verified
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs font-bold flex items-center gap-1">
                              ○ Unverified
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {user.transactionCount} Jobs
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Active: {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-medium text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleDelete(user._id)}
                            className="text-red-500 hover:text-red-700 text-xs font-black uppercase tracking-widest"
                          >
                            Delete
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length === 0 && (
                <div className="p-12 text-center text-gray-400 text-sm font-bold">No users found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminUsers;