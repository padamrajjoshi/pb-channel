"use client";

import React, { useState, useEffect } from "react";
import { 
  MessageSquareText, 
  Search, 
  Filter, 
  Loader2, 
  Star, 
  User, 
  Send,
  Hotel,
  CornerDownRight,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

import { api, handleApiError } from "@/lib/api";
import { useProperties } from "@/hooks/useProperties";

export default function GuestReviewsPage() {
  const { properties = [], isLoading: propsLoading } = useProperties();
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reply States
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [isReplying, setIsReplying] = useState<{ [key: string]: boolean }>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [minRating, setMinRating] = useState<number>(0);

  useEffect(() => {
    if (properties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, selectedPropertyId]);

  useEffect(() => {
    if (!selectedPropertyId) return;

    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/hotels/${selectedPropertyId}/reviews`);
        const payload = response.data.reviews || response.data || [];
        setReviews(Array.isArray(payload) ? payload : [payload]);
      } catch (err: any) {
        setError(handleApiError(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [selectedPropertyId]);

  const filteredReviews = reviews.filter(rev => {
    const searchMatch = 
      !searchTerm || 
      (rev.reviewer?.name || rev.guestName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (rev.reservationId || "").toString().includes(searchTerm) ||
      (rev.content?.headline || (typeof rev.title === 'string' ? rev.title : "")).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rev.content?.positive || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rev.content?.negative || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const score = parseFloat(rev.scoring?.review_score || rev.score) || 10;
    const ratingMatch = score >= minRating;
    
    return searchMatch && ratingMatch;
  });

  const handleReply = async (reviewId: string, channelId: number) => {
    const text = replyText[reviewId];
    if (!text || !text.trim() || !selectedPropertyId) return;

    setIsReplying(prev => ({ ...prev, [reviewId]: true }));
    try {
        await api.post(`/hotels/${selectedPropertyId}/reviews/reply`, {
            channelId: channelId,
            reviewId: reviewId,
            replyText: text.trim()
        });
        
        // Remove text
        setReplyText(prev => ({ ...prev, [reviewId]: "" }));
        // In a real scenario we might re-poll the reviews here or optimistically update
        alert("Reply submitted successfully to OTA platform.");
    } catch (err: any) {
        alert(handleApiError(err));
    } finally {
        setIsReplying(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md text-[10px] font-bold border border-blue-500/20 uppercase tracking-widest flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              Central OTA Interactivity
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <MessageSquareText className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            Guest Reviews
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Manage and respond to live Booking.com and Expedia guest feedback.</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-1.5 flex transition-all shadow-sm">
          {propsLoading ? (
            <div className="w-64 h-10 bg-muted animate-pulse rounded-xl" />
          ) : (
            <select
              onChange={(e) => setSelectedPropertyId(e.target.value ? parseInt(e.target.value) : null)}
              className="bg-transparent text-foreground px-4 py-2 text-sm font-bold focus:outline-none min-w-[200px]"
              value={selectedPropertyId || ""}
            >
              <option value="" className="bg-card">Select Property...</option>
              {properties.map((p: any) => (
                <option key={p.id} value={p.id} className="bg-card">{p.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Constraints & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by guest name, reservation, or keyword..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium text-sm placeholder:text-muted-foreground/40 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl shadow-sm">
             <Filter className="w-4 h-4 text-muted-foreground" />
             <select 
               value={minRating}
               onChange={(e) => setMinRating(Number(e.target.value))}
               className="bg-transparent border-none text-sm font-bold focus:outline-none cursor-pointer pr-2"
             >
                <option value={0}>All Ratings</option>
                <option value={9}>9+ Excellent</option>
                <option value={7}>7+ Good</option>
                <option value={5}>5+ Average</option>
                <option value={1}>Below Average</option>
             </select>
          </div>
          {searchTerm && (
             <button 
               onClick={() => setSearchTerm("")}
               className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
             >
                Clear Search
             </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 flex flex-col items-center justify-center min-h-[100px] gap-2">
            <span className="font-bold">Failed to load OTA interactions.</span>
            <span className="text-xs">{error}</span>
        </div>
      )}

      {/* Grid Canvas */}
      {isLoading ? (
        <div className="h-[400px] flex flex-col items-center justify-center gap-4 text-muted-foreground bg-card border border-border rounded-3xl shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="font-bold text-xs uppercase tracking-widest">Polling Live OTA Feeds...</p>
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="space-y-6">
          {filteredReviews.map((rev, idx) => {
            const reviewKey = rev.reviewId || rev.id || `rev-${idx}`;
            const score = parseFloat(rev.scoring?.review_score || rev.score) || 10;
            return (
            <motion.div 
               key={reviewKey}
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.05 }}
               className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
               <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                  {/* Left Metadata Block */}
                  <div className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-8">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-muted rounded-2xl border border-border flex items-center justify-center text-muted-foreground shadow-sm">
                           <User className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="font-bold text-lg">{rev.reviewer?.name || rev.guestName || "Anonymous Guest"}</h3>
                           <p className="text-xs text-muted-foreground font-mono">Res: #{rev.reservationId || rev.id}</p>
                        </div>
                     </div>
                     
                     <div className="space-y-4">
                        <div>
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Overall Score</p>
                           <div className="flex items-center gap-2">
                              <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tighter">
                                 {score}
                              </span>
                              <span className="text-muted-foreground/60 font-bold">/ 10</span>
                           </div>
                        </div>
                        
                        <div className="flex gap-1">
                           {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                 key={star} 
                                 className={cn("w-4 h-4", star <= (score/2) ? "fill-blue-500 text-blue-500" : "fill-muted text-muted")} 
                              />
                           ))}
                        </div>
                        
                        <div className="pt-4 mt-4 border-t border-border">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1">
                              Origin Source
                           </p>
                           <span className="px-2 py-1 bg-muted border border-border rounded text-xs font-bold text-muted-foreground shadow-sm">
                              Channel ID: {rev.channelId || "Generic"}
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Right Content Block */}
                  <div className="flex-1 flex flex-col">
                     <div className="flex-1">
                        <h4 className="text-xl font-bold mb-3">
                           {rev.content?.headline || (typeof rev.title === 'string' ? rev.title : (rev.title?.message || rev.title?.text || "Wonderful stay, highly recommended"))}
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                           {rev.content?.positive ? `Positive: ${rev.content.positive}\n` : ""}
                           {rev.content?.negative ? `Negative: ${rev.content.negative}` : ""}
                           {!rev.content?.positive && !rev.content?.negative ? (typeof rev.description === 'string' ? rev.description : rev.description?.text || rev.description?.message || "The customer did not leave a written description, only a scoring matrix was relayed from the OTA algorithm.") : ""}
                        </p>
                     </div>

                     {/* Reply Box Logic */}
                     <div className="mt-8 pt-6 border-t border-border space-y-4">
                        <h5 className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                           <CornerDownRight className="w-4 h-4" />
                           Platform Reply
                        </h5>
                        <div className="relative">
                           <textarea
                              value={replyText[reviewKey] || ""}
                              onChange={(e) => setReplyText({ ...replyText, [reviewKey]: e.target.value })}
                              placeholder="Type a thoughtful reply to display publicly on the OTA under this review..."
                              className="w-full min-h-[100px] bg-muted/30 border border-border rounded-2xl py-4 px-5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-y placeholder:text-muted-foreground/40 shadow-sm"
                           />
                           <button 
                              onClick={() => handleReply(reviewKey, rev.channelId)}
                              disabled={isReplying[reviewKey] || !replyText[reviewKey]?.trim()}
                              className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95"
                           >
                              {isReplying[reviewKey] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              Publish Reply
                           </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 text-right pr-2">Your response will be physically authored backward onto the OTA network instantly.</p>
                     </div>
                  </div>
               </div>
            </motion.div>
          )})}
        </div>
      ) : searchTerm || minRating > 0 ? (
        <div className="bg-card border border-dashed border-border p-16 rounded-3xl text-center text-muted-foreground flex flex-col items-center shadow-sm">
            <Search className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-xl font-bold mb-2">No Matches Found</h3>
            <p className="max-w-sm text-sm mx-auto leading-relaxed">Adjust your search or filters to locate specific guest feedback.</p>
            <button 
              onClick={() => { setSearchTerm(""); setMinRating(0); }}
              className="mt-6 text-blue-500 font-bold hover:underline"
            >
              Clear all filters
            </button>
        </div>
      ) : (
        <div className="bg-card border border-dashed border-border p-16 rounded-3xl text-center text-muted-foreground flex flex-col items-center shadow-sm">
            <MessageSquareText className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-xl font-bold mb-2">No Active Guest Reviews</h3>
            <p className="max-w-sm text-sm mx-auto leading-relaxed">No reviews have traversed the mapping interface for this property. Guests may have elected to leave scores privately or skipping feedback.</p>
        </div>
      )}
    </div>
  );
}
