import 'core-js/fn/map'

import React from 'react'
import { render } from 'react-dom'
import { PersistGate } from 'redux-persist/lib/integration/react'
import { Provider } from 'react-redux'
import tt from 'counterpart';

import App from './containers/app'
import { configureStore } from './store';

const { persistor, store } = configureStore()

import './semantic/dist/semantic.min.css';
import './index.css'

tt.registerTranslations('en', require('./locales/en.json'));
tt.registerTranslations('ru', require('./locales/ru-RU.json'));

tt.setLocale('ru');
tt.setFallbackLocale('en');

const node = (
  <Provider store={store}>
    <PersistGate
      persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
)

render(node, document.getElementById('root'))
