import { createContext, useContext, useReducer } from 'react';

const PLATFORMS = ['instagram', 'tiktok', 'facebook', 'youtube', 'x', 'linkedin'];

const initial = {
  nav: 'create',
  step: 'prompt',
  prompt: '',
  brandName: 'Ripple',
  theme: 'Candy',

  // Generation state
  genStage: 0,
  genLabel: 'Starting...',
  error: null,

  // Results
  captions: [],
  selectedCaption: 0,
  platforms: Object.fromEntries(PLATFORMS.map(p => [p, true])),
  platformContent: {},
  imageUrl: '',
  imagePrompt: '',
  videoPrompt: '',
  suggestedHashtags: [],

  // Review / preview
  previewPlatform: 'instagram',

  // Schedule
  when: 'optimal',
  scheduledPosts: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_NAV': return { ...state, nav: action.nav };
    case 'SET_STEP': return { ...state, step: action.step, error: null };
    case 'SET_PROMPT': return { ...state, prompt: action.prompt };
    case 'SET_BRAND': return { ...state, brandName: action.brandName };

    case 'GEN_STAGE': return { ...state, genStage: action.stage, genLabel: action.label };
    case 'GEN_CAPTIONS': return { ...state, captions: action.captions };
    case 'GEN_IMAGE': return { ...state, imageUrl: action.imageUrl };
    case 'GEN_PLATFORMS': return { ...state, platformContent: action.platforms };
    case 'GEN_COMPLETE':
      return {
        ...state,
        step: 'review',
        captions: action.captions,
        platformContent: action.platforms,
        imageUrl: action.imageUrl,
        imagePrompt: action.imagePrompt,
        videoPrompt: action.videoPrompt,
        suggestedHashtags: action.suggestedHashtags || [],
        genStage: 4,
        error: null,
      };
    case 'GEN_ERROR': return { ...state, step: 'prompt', error: action.message };

    case 'SELECT_CAPTION': return { ...state, selectedCaption: action.index };
    case 'SET_IMAGE_URL': return { ...state, imageUrl: action.imageUrl };
    case 'SET_PREVIEW_PLATFORM': return { ...state, previewPlatform: action.platform };
    case 'TOGGLE_PLATFORM':
      return {
        ...state,
        platforms: { ...state.platforms, [action.platform]: !state.platforms[action.platform] },
      };
    case 'SET_WHEN': return { ...state, when: action.when };

    case 'RESET':
      return { ...initial, scheduledPosts: state.scheduledPosts };

    case 'SET_SCHEDULED_POSTS': return { ...state, scheduledPosts: action.posts };
    case 'ADD_SCHEDULED_POST':
      return { ...state, scheduledPosts: [...state.scheduledPosts, action.post] };

    default: return state;
  }
}

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}
