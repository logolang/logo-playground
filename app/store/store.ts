import { createStore, combineReducers, AnyAction, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import thunk from "redux-thunk";

import { GalleryState, defaultGalleryState } from "./gallery/state.gallery";
import { reducers as galleryReducers } from "./gallery/reducers.gallery";
import { PlaygroundState, defaultPlaygroundState } from "./playground/state.playground";
import { reducers as playgroundReducers } from "./playground/reducers.playground";

export interface AppState {
  gallery: GalleryState;
  playground: PlaygroundState;
}

export type GetState = () => AppState;

export const defaultAppState: AppState = {
  gallery: defaultGalleryState,
  playground: defaultPlaygroundState
};

export const store = createStore<AppState, AnyAction, {}, {}>(
  combineReducers({
    gallery: galleryReducers,
    playground: playgroundReducers
  }),
  defaultAppState,
  composeWithDevTools(applyMiddleware(thunk))
);
