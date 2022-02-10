// store.js

import { createLogger } from 'redux-logger';
import {applyMiddleware, createStore, compose, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import {createWrapper, HYDRATE} from 'next-redux-wrapper';
import forumReducer from '@/reducers'

// create your reducer
const combinedReducer = combineReducers(forumReducer)

const reducer = (state, action) => {
  switch (action.type) {
    case HYDRATE:
      const nextState= {...state, ...action.payload};
      if (state.account) {
        nextState.account = state.account
      }
      if (state.chainstate) {
        nextState.chainstate = state.chainstate
      }
      if (state.moderation) {
        nextState.moderation = state.moderation
      }
      return nextState
    default:
      return combinedReducer(state, action);
  }
};

const makeConfiguredStore = reducer => {
    const middleware = [];
    const enhancers = [];

    // Thunk Middleware
    middleware.push(thunk);

    // Logging Middleware
    if (process.browser) {
      const logger = createLogger({
          level: 'info',
          collapsed: true
      });
      middleware.push(logger);
    }

    enhancers.push(applyMiddleware(...middleware));
    const enhancer = compose(...enhancers);
  return createStore(reducer, undefined, enhancer);
}

// create a makeStore function
const makeStore = () => {
  const isServer = typeof window === 'undefined';

  if (isServer) {
    return makeConfiguredStore(reducer);
  } else {
    // we need it only on client side
    const {persistStore, persistReducer} = require('redux-persist');
    const storage = require('redux-persist/lib/storage').default;

    const persistConfig = {
      key: 'nextjs',
      whitelist: [
        'account',
        'accounts',], // make sure it does not clash with server keys
      storage,
    };

    const persistedReducer = persistReducer(persistConfig, reducer);
    const store = makeConfiguredStore(persistedReducer);

    store.__persistor = persistStore(store); // Nasty hack

    return store;
  }
}

// export an assembled wrapper
export const wrapper = createWrapper(makeStore);