import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { deleteScheduledPost } from '../lib/api.js';
import { PLATFORM_MAP } from '../lib/platforms.js';

const PLATFORM_COLORS = {
  instagram: 'bg-pink-100 text-pink-700',
  tiktok: 'bg-gray-100 text-gray-700',
  facebook: 'bg-blue-100 text-blue-700',
  youtube: 'bg-red-100 text-red-700',
  x: 'bg-gray-100 text-gray-700',
  linkedin: 'bg-blue-100 text-blue-600',
};

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

export default function CalendarView() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const posts = state.scheduledPosts;

  async function handleDelete(id) {
    await deleteScheduledPost(id);
    dispatch({
      type: 'SET_SCHEDULED_POSTS',
      posts: posts.filter(p => p.id !== id),
    });
  }

  if (!posts.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 py-20">
        <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <h2 className="text-[17px] font-bold text-dark mb-1.5">No scheduled posts yet</h2>
        <p className="text-muted text-[13px] max-w-xs">
          Create content and schedule it — your posts will appear here.
        </p>
        <button
          onClick={() => navigate('/app/create')}
          className="btn-primary mt-5"
        >
          + Create Post
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-[18px] font-bold text-dark mb-4">Scheduled Posts</h2>
      <div className="space-y-3">
        {posts.map(post => (
          <div key={post.id} className="card p-4 flex gap-3 items-start">
            {post.image_url && (
              <img
                src={post.image_url}
                alt=""
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-border"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-dark font-semibold line-clamp-2 mb-1.5">
                {post.caption}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {(Array.isArray(post.platforms) ? post.platforms : []).map(p => {
                  const meta = PLATFORM_MAP[p];
                  return (
                    <span
                      key={p}
                      className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${PLATFORM_COLORS[p] || 'bg-light text-muted'}`}
                    >
                      {meta && <meta.Icon size={9} style={{ color: meta.color }} />}
                      {meta ? meta.name : p}
                    </span>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted">{formatDate(post.scheduled_at)}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  post.status === 'posted' ? 'bg-green-100 text-green-600'
                  : post.status === 'cancelled' ? 'bg-red-100 text-red-500'
                  : 'bg-yellow-50 text-yellow-600'
                }`}
              >
                {post.status}
              </span>
              {post.status === 'pending' && (
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-[11px] text-muted hover:text-red-500 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
