/*
 * Copyright (C) 2017 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import { combineReducers } from 'redux'
// TODO: import { handleActions } from 'redux-actions'
// TODO: import { actionTypes } from './actions'
import { reduceNotifications } from '../shared/reduxNotifications'
import { createPaginatedReducer } from '../shared/reduxPagination'

const identity = (defaultState = null) => (
  state => (state === undefined ? defaultState : state)
)

export default combineReducers({
  courseId: identity(null),
  permissions: identity({}),
  masterCourseData: identity(null),
  atomFeedUrl: identity(null),
  announcements: createPaginatedReducer('announcements'),
  notifications: reduceNotifications,
})
