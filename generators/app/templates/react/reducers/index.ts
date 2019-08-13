import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';
// import { globalReducer } from './global';
// import { rewardsReducer } from './rewards';

export default history =>
    combineReducers({
        router: connectRouter(history)
        // global: globalReducer,
        // rewards: rewardsReducer
    });
