import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { storage } from '../../utils/storage';
import { CourseItem } from '../../types/course';

const BOOKMARKS_KEY = 'lf_bookmarks';
const ENROLLED_KEY = 'lf_enrolled';

interface CourseState {
  bookmarks: CourseItem[];
  enrolled: number[];
  bookmarksLoaded: boolean;
}

const initialState: CourseState = {
  bookmarks: [],
  enrolled: [],
  bookmarksLoaded: false,
};

export const loadPersistedCourseData = createAsyncThunk(
  'courses/loadPersisted',
  async () => {
    const [bookmarks, enrolled] = await Promise.all([
      storage.getData(BOOKMARKS_KEY),
      storage.getData(ENROLLED_KEY),
    ]);
    return {
      bookmarks: (bookmarks as CourseItem[]) ?? [],
      enrolled: (enrolled as number[]) ?? [],
    };
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    toggleBookmark: (state, action: PayloadAction<CourseItem>) => {
      const course = action.payload;
      const idx = state.bookmarks.findIndex((b) => b.id === course.id);
      if (idx >= 0) {
        state.bookmarks.splice(idx, 1);
      } else {
        state.bookmarks.push(course);
      }
      storage.setData(BOOKMARKS_KEY, state.bookmarks);
    },
    enrollCourse: (state, action: PayloadAction<number>) => {
      if (!state.enrolled.includes(action.payload)) {
        state.enrolled.push(action.payload);
        storage.setData(ENROLLED_KEY, state.enrolled);
      }
    },
    unenrollCourse: (state, action: PayloadAction<number>) => {
      state.enrolled = state.enrolled.filter((id) => id !== action.payload);
      storage.setData(ENROLLED_KEY, state.enrolled);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadPersistedCourseData.fulfilled, (state, action) => {
      state.bookmarks = action.payload.bookmarks;
      state.enrolled = action.payload.enrolled;
      state.bookmarksLoaded = true;
    });
  },
});

export const { toggleBookmark, enrollCourse, unenrollCourse } = courseSlice.actions;
export default courseSlice.reducer;
