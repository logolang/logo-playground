import { createStore, combineReducers, AnyAction, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import thunk from "redux-thunk";

import { reducers as galleryReducers } from "./gallery/reducers.gallery";
import { GalleryState, defaultGalleryState } from "./gallery/state.gallery";

export interface AppState {
  gallery: GalleryState;
}

export type GetState = () => AppState;

export const defaultAppState: AppState = {
  gallery: defaultGalleryState
};

export const store = createStore<AppState, AnyAction, {}, {}>(
  combineReducers({
    gallery: galleryReducers
  }),
  defaultAppState,
  composeWithDevTools(applyMiddleware(thunk))
);
