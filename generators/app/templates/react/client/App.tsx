// import {} from '@<%= c_project_name %>/api';
import { Config } from '@<%= c_project_name %>/config';
import epics from '@<%= c_project_name %>/epics';
import createRootReducer from '@<%= c_project_name %>/reducers';
import { IEpicDependency, IRootState } from '@<%= c_project_name %>/types/common';
import { ConnectedRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import * as Cookies from 'js-cookie';
import * as React from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createEpicMiddleware } from 'redux-observable';
import Pages from './pages';

(() => {
    if (Config.appEnv === 'development') {
        Cookies.set('AccessToken', '');
    }
})();

const history = createBrowserHistory();

const routeMiddleware = routerMiddleware(history);

const epicMiddleware = createEpicMiddleware<any, any, IRootState, IEpicDependency>({
    dependencies: {}
});

const initialState = {} as IRootState;

const store = createStore(
    createRootReducer(history),
    initialState,
    composeWithDevTools(applyMiddleware(routeMiddleware, epicMiddleware))
);

epicMiddleware.run(epics);

export default () => (
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <Pages />
        </ConnectedRouter>
    </Provider>
);
