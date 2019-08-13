import { IRootState } from '@<%= c_project_name %>/types/common';
import { combineEpics } from 'redux-observable';
// import commonEpic from './common';

// export default combineEpics<any, any, IRootState>(...commonEpic);
export default combineEpics<any, any, IRootState>();
