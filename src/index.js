import 'core-js/fn/map';

import React from 'react';
import { render } from 'react-dom';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { Provider } from 'react-redux';
import golos from 'golos-lib-js';

import App from './containers/app';
import { configureStore } from './store';

import './semantic/dist/semantic.min.css';
import './index.css';

golos.importNativeLib().then(() => {
    const { persistor, store } = configureStore();

    const node = (
        <Provider store={store}>
            <PersistGate
                persistor={persistor}>
                <App />
            </PersistGate>
        </Provider>
    );

    render(node, document.getElementById('root'));
});
