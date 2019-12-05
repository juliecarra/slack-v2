import * as actionTypes from "../actions/types";
import { combineReducers } from "redux";

//User reducers
const initialUserState = {
  currentUser: null,
  isLoading: true
};

const user_reducer = (state = initialUserState, action) => {
  if (action.type === actionTypes.SET_USER) {
    return {
      currentUser: action.payload.currentUser,
      isLoading: false
    };
  } else if (action.type === actionTypes.CLEAR_USER) {
    return {
      ...state,
      isLoading: false
    };
  } else return state;
};

//Channel reducers

const initialChannelState = {
  currentChannel: null,
  isPrivateChannel: false
};

const channel_reducer = (state = initialChannelState, action) => {
  if (action.type === actionTypes.SET_CURRENT_CHANNEL)
    return {
      ...state,
      currentChannel: action.payload.currentChannel
    };
  if (action.type === actionTypes.SET_PRIVATE_CHANNEL) {
    return {
      ...state,
      isPrivateChannel: action.payload.isPrivateChannel
    };
  }
  if (action.type === actionTypes.SET_USER_POSTS) {
    return {
      ...state,
      userPosts: action.payload.userPosts
    };
  } else {
    return state;
  }
};

const initialSidebarThemeState = {
  sidebarTheme: "#3F0F3F"
};
const sidebarTheme_reducer = (state = initialSidebarThemeState, action) => {
  if (action.type === actionTypes.SET_USER_THEMES) {
    return {
      ...state,
      sidebarTheme: action.payload.sidebarTheme
    };
  } else {
    return state;
  }
};

export default combineReducers({
  user: user_reducer,
  channel: channel_reducer,
  theme: sidebarTheme_reducer
});
