import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  Smile,
  Search,
  MoreVertical,
  Phone,
  Video,
  Check,
  CheckCheck,
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  Mic,
  MicOff,
  Users,
  Shield,
  Lock,
  CornerUpLeft,
  Pin,
  ChevronDown,
  Maximize2,
  Minimize2,
  Sparkles,
  Download,
  Flame,
  User as UserIcon,
  Circle,
  Clock,
  Volume2,
} from 'lucide-react';
import { ChatMessage, ChatChannel, ChatSenderRole } from '../types';

interface TeamsChatBoxProps {
  currentUser: {
    id: string;
    username: string;
    role: string;
    avatarUrl?: string;
  };
}

// Initial Mock Channels & Direct Messages for UI Preview
const INITIAL_CHANNELS: ChatChannel[] = [
  {
    id: 'general-ops',
    name: 'General Operations',
    type: 'channel',
    description: 'Central task announcements, daily quotas, and system updates.',
    lastMessage: 'Today US Email Q1 files have been refreshed. Happy hunting!',
    lastMessageTime: '10:45 AM',
    unreadCount: 2,
    membersCount: 24,
    isPinned: true,
    badge: 'HQ',
  },
  {
    id: 'email-sms-queue',
    name: 'Email & SMS Dispatch',
    type: 'channel',
    description: 'Active worker coordination for bulk SMS and email campaigns.',
    lastMessage: 'Batch #402 US carrier emails allocated to worker pool.',
    lastMessageTime: '09:30 AM',
    unreadCount: 0,
    membersCount: 18,
    isPinned: true,
  },
  {
    id: 'payment-proofs',
    name: 'Payouts & Verification',
    type: 'channel',
    description: 'Task verification receipts and worker payout confirmations.',
    lastMessage: 'Batch #12 withdrawals processed via Nagad & Rocket.',
    lastMessageTime: 'Yesterday',
    unreadCount: 1,
    membersCount: 32,
  },
  {
    id: 'admin-helpdesk',
    name: 'Admin & Leader Support',
    type: 'direct',
    description: 'Direct priority channel with Senior Platform Administrators.',
    lastMessage: 'Hello! Let us know if you need quota or data adjustments.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    isOnline: true,
    badge: 'Support',
  },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'general-ops': [
    {
      id: 'm1',
      channelId: 'general-ops',
      senderId: 'admin_sys',
      senderName: 'DarkDevil Admin',
      senderRole: 'admin',
      type: 'text',
      text: '🔥 System Notice: All email sending data files for US Q1 have been uploaded to Cloudflare R2 storage. Ensure you submit task proofs before 11:59 PM.',
      timestamp: '09:00 AM',
      status: 'read',
      reactions: { '🔥': ['user_1', 'user_2'], '👍': ['user_3'] },
    },
    {
      id: 'm2',
      channelId: 'general-ops',
      senderId: 'leader_1',
      senderName: 'Siam (Ops Lead)',
      senderRole: 'leader',
      type: 'text',
      text: 'Attention all field workers: Please check your daily target before collecting batches. If your quota is exhausted, contact the helpdesk.',
      timestamp: '09:15 AM',
      status: 'read',
    },
    {
      id: 'm3',
      channelId: 'general-ops',
      senderId: 'worker_8',
      senderName: 'Rahim_Worker',
      senderRole: 'worker',
      type: 'text',
      text: 'Thanks sir! Just started the 200 SMS batch submission.',
      timestamp: '09:20 AM',
      status: 'read',
      reactions: { '👏': ['admin_sys'] },
    },
    {
      id: 'm4',
      channelId: 'general-ops',
      senderId: 'admin_sys',
      senderName: 'DarkDevil Admin',
      senderRole: 'admin',
      type: 'text',
      text: 'Today US Email Q1 files have been refreshed. Happy hunting!',
      timestamp: '10:45 AM',
      status: 'read',
    },
  ],
  'email-sms-queue': [
    {
      id: 'm201',
      channelId: 'email-sms-queue',
      senderId: 'leader_1',
      senderName: 'Siam (Ops Lead)',
      senderRole: 'leader',
      type: 'text',
      text: 'Batch #402 US carrier emails allocated to worker pool. Pick your jobs from the task panel.',
      timestamp: '09:30 AM',
      status: 'read',
    },
  ],
  'payment-proofs': [
    {
      id: 'm301',
      channelId: 'payment-proofs',
      senderId: 'admin_sys',
      senderName: 'Finance Admin',
      senderRole: 'admin',
      type: 'text',
      text: 'Batch #12 withdrawals processed via Nagad & Rocket. Check your balance.',
      timestamp: 'Yesterday',
      status: 'read',
    },
  ],
  'admin-helpdesk': [
    {
      id: 'm401',
      channelId: 'admin-helpdesk',
      senderId: 'admin_sys',
      senderName: 'Admin Support',
      senderRole: 'admin',
      type: 'text',
      text: 'Hello! Let us know if you need quota or data adjustments.',
      timestamp: 'Yesterday',
      status: 'read',
    },
  ],
};

const EMOJI_LIST = ['👍', '❤️', '🔥', '👏', '🎉', '😊', '🚀', '✅', '💯', '🙏', '⚡', '💼'];

export const TeamsChatBox: React.FC<TeamsChatBoxProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState<string | null>('general-ops');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'channels' | 'direct' | 'unread'>('all');
  const [channels, setChannels] = useState<ChatChannel[]>(INITIAL_CHANNELS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const activeMessages = activeChannelId ? messages[activeChannelId] || [] : [];

  // Total unread count for bubble badge
  const totalUnread = channels.reduce((acc, c) => acc + c.unreadCount, 0);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && activeChannelId) {
      scrollToBottom();
      // Mark as read
      setChannels((prev) =>
        prev.map((c) => (c.id === activeChannelId ? { ...c, unreadCount: 0 } : c))
      );
    }
  }, [isOpen, activeChannelId, activeMessages.length]);

  // Voice recording mock timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  const mapRole = (roleStr: string): ChatSenderRole => {
    const lower = (roleStr || '').toLowerCase();
    if (lower.includes('admin')) return 'admin';
    if (lower.includes('sub')) return 'sub_leader';
    if (lower.includes('lead')) return 'leader';
    return 'worker';
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeChannelId) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      channelId: activeChannelId,
      senderId: currentUser.id || 'user_curr',
      senderName: currentUser.username || 'You',
      senderRole: mapRole(currentUser.role),
      senderAvatar: currentUser.avatarUrl,
      type: 'text',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            text: replyingTo.text,
          }
        : undefined,
    };

    setMessages((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMsg],
    }));

    // Update last message in channels list
    setChannels((prev) =>
      prev.map((c) =>
        c.id === activeChannelId
          ? {
              ...c,
              lastMessage: inputText.trim(),
              lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : c
      )
    );

    setInputText('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);

    // Simulate double-check read update after a brief delay
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeChannelId]: (prev[activeChannelId] || []).map((m) =>
          m.id === newMsg.id ? { ...m, status: 'delivered' } : m
        ),
      }));
    }, 600);
  };

  const handleSendVoiceNote = () => {
    if (!activeChannelId) return;
    setIsRecording(false);
    const duration = recordingSeconds || 4;

    const newMsg: ChatMessage = {
      id: `msg_audio_${Date.now()}`,
      channelId: activeChannelId,
      senderId: currentUser.id || 'user_curr',
      senderName: currentUser.username || 'You',
      senderRole: mapRole(currentUser.role),
      type: 'audio',
      text: `Voice Note (${duration}s)`,
      mediaUrl: '#',
      mediaSize: `${duration} sec`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setMessages((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMsg],
    }));

    setChannels((prev) =>
      prev.map((c) =>
        c.id === activeChannelId
          ? {
              ...c,
              lastMessage: `🎤 Voice Note (${duration}s)`,
              lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : c
      )
    );
  };

  const handleAttachMock = (type: 'image' | 'file') => {
    if (!activeChannelId) return;
    setShowAttachmentMenu(false);

    const isImg = type === 'image';
    const newMsg: ChatMessage = {
      id: `msg_media_${Date.now()}`,
      channelId: activeChannelId,
      senderId: currentUser.id || 'user_curr',
      senderName: currentUser.username || 'You',
      senderRole: mapRole(currentUser.role),
      type: isImg ? 'image' : 'file',
      text: isImg ? 'Screenshot_Task_Proof.png' : 'Worker_Dispatch_Log.pdf',
      mediaUrl: isImg ? 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80' : '#',
      mediaName: isImg ? 'Screenshot_Task_Proof.png' : 'Worker_Dispatch_Log.pdf',
      mediaSize: isImg ? '340 KB' : '1.2 MB',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setMessages((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMsg],
    }));

    setChannels((prev) =>
      prev.map((c) =>
        c.id === activeChannelId
          ? {
              ...c,
              lastMessage: isImg ? '📷 Photo' : '📄 Document',
              lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : c
      )
    );
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (!activeChannelId) return;
    const userId = currentUser.id || 'curr_user';

    setMessages((prev) => {
      const channelMsgs = prev[activeChannelId] || [];
      return {
        ...prev,
        [activeChannelId]: channelMsgs.map((m) => {
          if (m.id !== messageId) return m;
          const currentReactions = { ...(m.reactions || {}) };
          const userList = currentReactions[emoji] || [];
          if (userList.includes(userId)) {
            // remove
            currentReactions[emoji] = userList.filter((u) => u !== userId);
            if (currentReactions[emoji].length === 0) delete currentReactions[emoji];
          } else {
            // add
            currentReactions[emoji] = [...userList, userId];
          }
          return { ...m, reactions: currentReactions };
        }),
      };
    });
  };

  const filteredChannels = channels.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === 'channels') return c.type === 'channel';
    if (filterType === 'direct') return c.type === 'direct';
    if (filterType === 'unread') return c.unreadCount > 0;
    return true;
  });

  const getRoleBadge = (role: ChatSenderRole) => {
    if (role === 'admin') {
      return (
        <span className="text-[9px] px-1 py-0.2 rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 font-medium">
          ADMIN
        </span>
      );
    }
    if (role === 'leader' || role === 'sub_leader') {
      return (
        <span className="text-[9px] px-1 py-0.2 rounded bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 font-medium">
          LEADER
        </span>
      );
    }
    return (
      <span className="text-[9px] px-1 py-0.2 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 font-medium">
        WORKER
      </span>
    );
  };

  const getSenderColor = (role: ChatSenderRole) => {
    if (role === 'admin') return 'text-[#F59E0B]';
    if (role === 'leader' || role === 'sub_leader') return 'text-[#38BDF8]';
    return 'text-[#22C55E]';
  };

  return (
    <>
      {/* ========================================================
          1. FLOATING CHAT BUBBLE TRIGGER (Bottom Right)
      ======================================================== */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 group">
          {/* Subtle Label Tooltip on Hover */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#161B22] border border-[#30363D] text-[#E6EDF3] text-[11px] shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span className="font-medium">Teams Chat</span>
            <span className="text-[9.5px] text-[#8B949E] font-mono">Firebase</span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-[#00A884] to-[#25D366] hover:brightness-110 active:scale-95 shadow-xl flex items-center justify-center text-[#0B1014] transition-all cursor-pointer border border-[#22C55E]/40"
            title="Open Teams Chat"
          >
            <MessageSquare className="w-6 h-6 text-[#0B1014] fill-current" />

            {/* Unread Counter Badge */}
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-medium flex items-center justify-center border-2 border-[#0D1117] animate-bounce">
                {totalUnread}
              </span>
            )}

            {/* Online Green Pulsing Indicator */}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#22C55E] border-2 border-[#0D1117]"></span>
          </button>
        </div>
      )}

      {/* ========================================================
          2. FLOATING WHATSAPP CHATBOX WINDOW
      ======================================================== */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 ease-out shadow-2xl flex flex-col font-sans ${
            isExpanded
              ? 'bottom-2 right-2 sm:bottom-4 sm:right-4 w-[calc(100vw-16px)] sm:w-[540px] h-[calc(100vh-24px)] sm:h-[680px] max-h-[92vh]'
              : 'bottom-2 right-2 sm:bottom-5 sm:right-5 w-[calc(100vw-16px)] sm:w-[410px] h-[580px] max-h-[88vh]'
          } rounded-[12px] bg-[#0B1014] border border-[#222E35] overflow-hidden text-[#E6EDF3]`}
        >
          {/* ========================================================
              TOP WHATSAPP HEADER
          ======================================================== */}
          <div className="bg-[#1F2C34] border-b border-[#222E35] px-3 py-2 flex items-center justify-between shrink-0">
            {/* Left Header info */}
            <div className="flex items-center gap-2 min-w-0">
              {activeChannelId && (
                <button
                  type="button"
                  onClick={() => setActiveChannelId(null)}
                  className="sm:hidden p-1 rounded hover:bg-[#2A3942] text-[#8B949E] hover:text-[#E6EDF3] cursor-pointer"
                  title="Back to chats"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              {/* Avatar / Icon */}
              <div
                onClick={() => setShowChannelInfo(!showChannelInfo)}
                className="relative w-8 h-8 rounded-full bg-[#111B21] border border-[#30363D] flex items-center justify-center text-[#25D366] shrink-0 cursor-pointer hover:opacity-90"
              >
                {activeChannel.type === 'channel' ? (
                  <Users className="w-4 h-4 text-[#38BDF8]" />
                ) : (
                  <UserIcon className="w-4 h-4 text-[#25D366]" />
                )}
                {activeChannel.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-[#1F2C34]"></span>
                )}
              </div>

              {/* Title & Status */}
              <div
                onClick={() => setShowChannelInfo(!showChannelInfo)}
                className="min-w-0 cursor-pointer select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[12.5px] font-medium text-[#E6EDF3] truncate">
                    {activeChannelId ? activeChannel.name : 'Teams Chat'}
                  </span>
                  {activeChannel.badge && (
                    <span className="text-[8.5px] font-mono px-1 py-0.2 rounded bg-[#00A884]/20 text-[#25D366] border border-[#00A884]/30">
                      {activeChannel.badge}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[#8B949E] truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
                  <span>
                    {activeChannel.type === 'channel'
                      ? `${activeChannel.membersCount || 12} members • Firebase Sync`
                      : 'Active Now'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Header Action Icons */}
            <div className="flex items-center gap-1 shrink-0 text-[#8B949E]">
              <button
                type="button"
                onClick={() => setShowChannelInfo(!showChannelInfo)}
                title="Channel Details & Members"
                className="p-1 rounded hover:bg-[#2A3942] hover:text-[#E6EDF3] transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded hover:bg-[#2A3942] hover:text-[#E6EDF3] transition-colors cursor-pointer hidden sm:block"
                title={isExpanded ? 'Minimize Window' : 'Expand Window'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-[#2A3942] hover:text-[#EF4444] transition-colors cursor-pointer"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ========================================================
              MAIN CHAT CONTAINER (Split: Left Channels, Right Messages)
          ======================================================== */}
          <div className="flex-1 min-h-0 flex relative overflow-hidden bg-[#0B1014]">
            {/* ----------------------------------------------------
                VIEW A: CHANNELS & THREADS LIST (WhatsApp Chats List)
            ----------------------------------------------------- */}
            <div
              className={`${
                activeChannelId ? 'hidden sm:flex' : 'flex'
              } flex-col w-full sm:w-[155px] md:w-[170px] border-r border-[#222E35] bg-[#111B21] shrink-0`}
            >
              {/* Search Bar in Chats List */}
              <div className="p-1.5 border-b border-[#222E35]">
                <div className="relative">
                  <Search className="w-3 h-3 text-[#8B949E] absolute left-2 top-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chats..."
                    className="w-full h-[24px] pl-6 pr-2 rounded-[4px] bg-[#202C33] text-[10px] text-[#E6EDF3] placeholder-[#8B949E] border border-transparent focus:border-[#00A884] focus:outline-none"
                  />
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-1 mt-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {(['all', 'channels', 'direct', 'unread'] as const).map((ft) => (
                    <button
                      key={ft}
                      type="button"
                      onClick={() => setFilterType(ft)}
                      className={`text-[9px] px-1.5 py-0.5 rounded-full capitalize font-medium shrink-0 transition-colors cursor-pointer ${
                        filterType === ft
                          ? 'bg-[#00A884] text-[#0B1014]'
                          : 'bg-[#202C33] text-[#8B949E] hover:text-[#E6EDF3]'
                      }`}
                    >
                      {ft}
                    </button>
                  ))}
                </div>
              </div>

              {/* Channels List Items */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#222E35]/60">
                {filteredChannels.map((c) => {
                  const isActive = c.id === activeChannelId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setActiveChannelId(c.id);
                        setShowChannelInfo(false);
                      }}
                      className={`px-2 py-2 flex items-start gap-1.5 cursor-pointer transition-colors ${
                        isActive ? 'bg-[#2A3942]' : 'hover:bg-[#202C33]'
                      }`}
                    >
                      <div className="relative shrink-0 mt-0.5">
                        <div className="w-6 h-6 rounded-full bg-[#202C33] border border-[#30363D] flex items-center justify-center text-[10px]">
                          {c.type === 'channel' ? (
                            <Users className="w-3 h-3 text-[#38BDF8]" />
                          ) : (
                            <UserIcon className="w-3 h-3 text-[#25D366]" />
                          )}
                        </div>
                        {c.isOnline && (
                          <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10.5px] font-medium text-[#E6EDF3] truncate">
                            {c.name}
                          </span>
                          <span className="text-[8.5px] font-mono text-[#8B949E] shrink-0 ml-1">
                            {c.lastMessageTime || ''}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-[9.5px] text-[#8B949E] truncate leading-tight">
                            {c.lastMessage || 'No messages yet'}
                          </p>

                          {c.unreadCount > 0 && (
                            <span className="min-w-[14px] h-[14px] px-1 rounded-full bg-[#25D366] text-[#0B1014] text-[8.5px] font-medium flex items-center justify-center shrink-0 ml-1">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Firebase Sync indicator */}
              <div className="p-1.5 border-t border-[#222E35] bg-[#0E131F] flex items-center justify-between text-[9px] text-[#8B949E]">
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#F59E0B]" />
                  <span>Firebase Live</span>
                </div>
                <span className="text-[#22C55E] font-mono">Synced</span>
              </div>
            </div>

            {/* ----------------------------------------------------
                VIEW B: ACTIVE WHATSAPP CHAT CONVERSATION AREA
            ----------------------------------------------------- */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0B141A] relative">
              {/* WhatsApp Subtle Chat Background Texture / Overlay */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#25D366 1px, transparent 1px)`,
                  backgroundSize: '16px 16px',
                }}
              ></div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2 relative z-10">
                {/* Security / Encryption Notice Badge */}
                <div className="mx-auto max-w-[280px] p-1.5 rounded-[6px] bg-[#182229] border border-[#222E35] text-center text-[9.5px] text-[#F59E0B] flex items-center justify-center gap-1.5 shadow-sm">
                  <Lock className="w-3 h-3 text-[#F59E0B] shrink-0" />
                  <span>Messages are synced securely via Firebase database.</span>
                </div>

                {/* Date Divider */}
                <div className="flex items-center justify-center my-1.5">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#182229] text-[#8B949E] border border-[#222E35]">
                    TODAY
                  </span>
                </div>

                {/* Message Bubbles */}
                {activeMessages.map((m) => {
                  const isOutgoing = m.senderId === currentUser.id || m.senderName === currentUser.username;

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col group ${isOutgoing ? 'items-end' : 'items-start'}`}
                    >
                      {/* Message Bubble Container */}
                      <div
                        className={`relative max-w-[85%] rounded-[8px] p-2 text-[11px] shadow-sm ${
                          isOutgoing
                            ? 'bg-[#005C4B] text-[#E6EDF3] rounded-tr-none'
                            : 'bg-[#202C33] text-[#E6EDF3] rounded-tl-none border border-[#222E35]'
                        }`}
                      >
                        {/* Sender Info (For incoming messages in channels) */}
                        {!isOutgoing && (
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className={`text-[10px] font-medium ${getSenderColor(m.senderRole)}`}>
                              {m.senderName}
                            </span>
                            {getRoleBadge(m.senderRole)}
                          </div>
                        )}

                        {/* Replying Quote Box (if replied) */}
                        {m.replyTo && (
                          <div className="mb-1 p-1 rounded bg-black/20 border-l-2 border-[#38BDF8] text-[9.5px] text-[#C9D1D9]">
                            <span className="font-medium text-[#38BDF8] block">
                              {m.replyTo.senderName}
                            </span>
                            <span className="truncate block opacity-80">{m.replyTo.text}</span>
                          </div>
                        )}

                        {/* Image Attachment Rendering */}
                        {m.type === 'image' && m.mediaUrl && (
                          <div className="mb-1 rounded-[4px] overflow-hidden border border-black/20">
                            <img
                              src={m.mediaUrl}
                              alt="attachment"
                              className="max-h-36 w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {m.mediaName && (
                              <div className="p-1 bg-black/40 text-[9.5px] text-[#C9D1D9] font-mono flex items-center justify-between">
                                <span className="truncate">{m.mediaName}</span>
                                <span>{m.mediaSize}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* File Attachment Rendering */}
                        {m.type === 'file' && (
                          <div className="mb-1 p-1.5 rounded bg-black/20 border border-white/10 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#F59E0B] shrink-0" />
                            <div className="min-w-0 flex-1 font-mono text-[9.5px]">
                              <div className="truncate text-[#E6EDF3] font-medium">{m.mediaName}</div>
                              <div className="text-[#8B949E]">{m.mediaSize}</div>
                            </div>
                            <button
                              type="button"
                              className="p-1 rounded hover:bg-black/30 text-[#38BDF8] cursor-pointer"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Audio / Voice note rendering */}
                        {m.type === 'audio' && (
                          <div className="mb-1 p-1.5 rounded bg-black/20 border border-white/10 flex items-center gap-2 min-w-[160px]">
                            <div className="w-6 h-6 rounded-full bg-[#00A884] flex items-center justify-center text-[#0B1014]">
                              <Volume2 className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1">
                              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-[#38BDF8] w-1/2"></div>
                              </div>
                              <div className="text-[9px] font-mono text-[#8B949E] mt-0.5">
                                {m.mediaSize || '0:04'}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Message Text Body */}
                        {m.type === 'text' && (
                          <div className="leading-relaxed whitespace-pre-wrap break-words">{m.text}</div>
                        )}

                        {/* Message Timestamp & Delivery Ticks */}
                        <div className="flex items-center justify-end gap-1 mt-0.5 text-[8.5px] text-[#8B949E] font-mono">
                          <span>{m.timestamp}</span>
                          {isOutgoing && (
                            <>
                              {m.status === 'read' ? (
                                <CheckCheck className="w-3 h-3 text-[#38BDF8]" />
                              ) : m.status === 'delivered' ? (
                                <CheckCheck className="w-3 h-3 text-[#8B949E]" />
                              ) : (
                                <Check className="w-3 h-3 text-[#8B949E]" />
                              )}
                            </>
                          )}
                        </div>

                        {/* Reaction Badges */}
                        {m.reactions && Object.keys(m.reactions).length > 0 && (
                          <div className="absolute -bottom-2 right-2 flex items-center gap-0.5">
                            {Object.entries(m.reactions).map(([em, users]) => (
                              <button
                                key={em}
                                type="button"
                                onClick={() => handleReaction(m.id, em)}
                                className="px-1 py-0.2 rounded-full bg-[#182229] border border-[#222E35] text-[9.5px] flex items-center gap-0.5 hover:scale-110 transition-transform cursor-pointer shadow-xs"
                              >
                                <span>{em}</span>
                                {users.length > 1 && (
                                  <span className="text-[8px] font-mono text-[#8B949E]">{users.length}</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quick Hover Reaction Bar */}
                      <div
                        className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-0.5 px-1 ${
                          isOutgoing ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setReplyingTo(m)}
                          className="text-[9.5px] text-[#8B949E] hover:text-[#38BDF8] flex items-center gap-0.5 cursor-pointer"
                        >
                          <CornerUpLeft className="w-2.5 h-2.5" />
                          <span>Reply</span>
                        </button>
                        <div className="flex items-center gap-0.5 bg-[#182229] border border-[#222E35] rounded-full px-1 py-0.2">
                          {['👍', '❤️', '🔥'].map((em) => (
                            <button
                              key={em}
                              type="button"
                              onClick={() => handleReaction(m.id, em)}
                              className="text-[10px] hover:scale-125 transition-transform cursor-pointer"
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* ----------------------------------------------------
                  REPLY PREVIEW BANNER
              ----------------------------------------------------- */}
              {replyingTo && (
                <div className="p-1.5 bg-[#182229] border-t border-[#222E35] flex items-center justify-between text-[10px] text-[#C9D1D9]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <CornerUpLeft className="w-3 h-3 text-[#38BDF8] shrink-0" />
                    <div className="min-w-0">
                      <span className="font-medium text-[#38BDF8]">{replyingTo.senderName}</span>
                      <p className="truncate text-[#8B949E]">{replyingTo.text}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="p-1 text-[#8B949E] hover:text-[#EF4444] cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* ----------------------------------------------------
                  EMOJI PICKER POPUP TRAY
              ----------------------------------------------------- */}
              {showEmojiPicker && (
                <div className="p-2 bg-[#1F2C34] border-t border-[#222E35] grid grid-cols-6 gap-1 text-[16px] animate-fadeIn">
                  {EMOJI_LIST.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        setInputText((prev) => prev + em);
                      }}
                      className="p-1 rounded hover:bg-[#2A3942] transition-colors cursor-pointer text-center"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}

              {/* ----------------------------------------------------
                  ATTACHMENT OPTIONS TRAY
              ----------------------------------------------------- */}
              {showAttachmentMenu && (
                <div className="p-2 bg-[#1F2C34] border-t border-[#222E35] flex items-center justify-around text-[10px] animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => handleAttachMock('image')}
                    className="flex flex-col items-center gap-1 text-[#8B949E] hover:text-[#38BDF8] cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#0284C7]/20 border border-[#0284C7]/40 flex items-center justify-center text-[#38BDF8]">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <span>Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAttachMock('file')}
                    className="flex flex-col items-center gap-1 text-[#8B949E] hover:text-[#F59E0B] cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B]">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span>Document</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsRecording(true);
                      setShowAttachmentMenu(false);
                    }}
                    className="flex flex-col items-center gap-1 text-[#8B949E] hover:text-[#22C55E] cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E]">
                      <Mic className="w-3.5 h-3.5" />
                    </div>
                    <span>Voice Note</span>
                  </button>
                </div>
              )}

              {/* ----------------------------------------------------
                  WHATSAPP INPUT FOOTER
              ----------------------------------------------------- */}
              <div className="p-2 bg-[#1F2C34] border-t border-[#222E35] flex items-center gap-1.5">
                {isRecording ? (
                  // Voice Recording Bar
                  <div className="flex-1 flex items-center justify-between px-2.5 py-1 rounded-[6px] bg-[#111B21] border border-[#EF4444]/40">
                    <div className="flex items-center gap-2 text-[#EF4444] text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping"></span>
                      <Mic className="w-3.5 h-3.5" />
                      <span className="font-mono">Recording 0:0{recordingSeconds}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setIsRecording(false)}
                        className="text-[10px] text-[#8B949E] hover:text-[#EF4444] px-1.5 py-0.5 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSendVoiceNote}
                        className="p-1 rounded bg-[#25D366] text-[#0B1014] hover:bg-[#25D366]/90 cursor-pointer"
                        title="Send Voice Note"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Normal Text Message Input
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmojiPicker(!showEmojiPicker);
                        setShowAttachmentMenu(false);
                      }}
                      className={`p-1.5 rounded hover:bg-[#2A3942] transition-colors cursor-pointer ${
                        showEmojiPicker ? 'text-[#25D366]' : 'text-[#8B949E] hover:text-[#E6EDF3]'
                      }`}
                      title="Emojis"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowAttachmentMenu(!showAttachmentMenu);
                        setShowEmojiPicker(false);
                      }}
                      className={`p-1.5 rounded hover:bg-[#2A3942] transition-colors cursor-pointer ${
                        showAttachmentMenu ? 'text-[#38BDF8]' : 'text-[#8B949E] hover:text-[#E6EDF3]'
                      }`}
                      title="Attach File"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 h-[30px] px-2.5 rounded-[6px] bg-[#2A3942] text-[11px] text-[#E6EDF3] placeholder-[#8B949E] border border-transparent focus:border-[#00A884] focus:outline-none"
                    />

                    {inputText.trim() ? (
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        className="w-7 h-7 rounded-full bg-[#00A884] hover:bg-[#25D366] text-[#0B1014] flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                        title="Send message"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsRecording(true)}
                        className="w-7 h-7 rounded-full bg-[#2A3942] hover:bg-[#374955] text-[#8B949E] hover:text-[#25D366] flex items-center justify-center transition-colors cursor-pointer"
                        title="Record Voice Note"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ----------------------------------------------------
                VIEW C: SLIDE-OVER CHANNEL / GROUP INFO DRAWER
            ----------------------------------------------------- */}
            {showChannelInfo && (
              <div className="absolute inset-y-0 right-0 w-full sm:w-[260px] bg-[#111B21] border-l border-[#222E35] z-30 flex flex-col p-3 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-[#222E35]">
                  <span className="text-[12px] font-medium text-[#E6EDF3]">Channel Information</span>
                  <button
                    type="button"
                    onClick={() => setShowChannelInfo(false)}
                    className="text-[#8B949E] hover:text-[#E6EDF3] text-[13px] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-full bg-[#202C33] border border-[#30363D] mx-auto flex items-center justify-center text-[#25D366]">
                    <Users className="w-6 h-6 text-[#38BDF8]" />
                  </div>
                  <div className="text-[12px] font-medium text-[#E6EDF3]">{activeChannel.name}</div>
                  <div className="text-[10px] text-[#8B949E] leading-relaxed">
                    {activeChannel.description}
                  </div>
                </div>

                {/* Info KPIs */}
                <div className="p-2 rounded-[6px] bg-[#0E131F] border border-[#21262D] space-y-1 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8B949E]">Storage Provider:</span>
                    <span className="text-[#F59E0B] font-mono">Firebase Firestore</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8B949E]">Media Storage:</span>
                    <span className="text-[#38BDF8] font-mono">Firebase Storage</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8B949E]">Encryption:</span>
                    <span className="text-[#22C55E]">End-to-End Synced</span>
                  </div>
                </div>

                {/* Member Preview */}
                <div className="space-y-1.5 flex-1 overflow-y-auto">
                  <div className="text-[10px] uppercase tracking-wider text-[#8B949E] font-medium">
                    Active Participants (4)
                  </div>
                  <div className="space-y-1 text-[10.5px]">
                    <div className="p-1.5 rounded bg-[#182229] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                        <span>DarkDevil Admin</span>
                      </div>
                      <span className="text-[9px] text-[#EF4444] font-medium">ADMIN</span>
                    </div>

                    <div className="p-1.5 rounded bg-[#182229] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                        <span>Siam (Ops Lead)</span>
                      </div>
                      <span className="text-[9px] text-[#38BDF8] font-medium">LEADER</span>
                    </div>

                    <div className="p-1.5 rounded bg-[#182229] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                        <span>{currentUser.username} (You)</span>
                      </div>
                      <span className="text-[9px] text-[#22C55E] font-medium">{currentUser.role}</span>
                    </div>

                    <div className="p-1.5 rounded bg-[#182229] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#8B949E]"></span>
                        <span>Rahim_Worker</span>
                      </div>
                      <span className="text-[9px] text-[#8B949E]">WORKER</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
