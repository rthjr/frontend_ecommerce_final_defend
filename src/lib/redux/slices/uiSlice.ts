import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isCartDrawerOpen: boolean;
  isMobileMenuOpen: boolean;
  toast: { message: string; type: 'success' | 'error' } | null;
}

const initialState: UIState = {
  isCartDrawerOpen: false,
  isMobileMenuOpen: false,
  toast: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCartDrawer: (state) => {
      state.isCartDrawerOpen = !state.isCartDrawerOpen;
    },
    setCartDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isCartDrawerOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' }>) => {
      state.toast = action.payload;
    },
    hideToast: (state) => {
      state.toast = null;
    },
  },
});

export const {
  toggleCartDrawer,
  setCartDrawerOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  showToast,
  hideToast,
} = uiSlice.actions;

export default uiSlice.reducer;
