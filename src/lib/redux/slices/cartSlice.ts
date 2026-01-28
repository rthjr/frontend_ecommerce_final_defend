import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
}

interface Address {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface CartState {
  items: CartItem[];
  shippingAddress: Address | null;
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isOpen: boolean; // For cart drawer
}

const initialState: CartState = {
  items: [],
  shippingAddress: null,
  paymentMethod: 'PayPal',
  itemsPrice: 0,
  shippingPrice: 0,
  taxPrice: 0,
  totalPrice: 0,
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;
      const existItem = state.items.find((x) => x.productId === item.productId);

      if (existItem) {
        state.items = state.items.map((x) =>
          x.productId === existItem.productId ? item : x
        );
      } else {
        state.items = [...state.items, item];
      }
      cartSlice.caseReducers.calculatePrices(state);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((x) => x.productId !== action.payload);
      cartSlice.caseReducers.calculatePrices(state);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((x) => x.productId === productId);
      if (item) {
        item.quantity = quantity;
      }
      cartSlice.caseReducers.calculatePrices(state);
    },
    saveShippingAddress: (state, action: PayloadAction<Address>) => {
      state.shippingAddress = action.payload;
    },
    savePaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.itemsPrice = 0;
      state.shippingPrice = 0;
      state.taxPrice = 0;
      state.totalPrice = 0;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    calculatePrices: (state) => {
      state.itemsPrice = Number(
        state.items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)
      );
      state.shippingPrice = state.itemsPrice > 100 ? 0 : 10;
      state.taxPrice = Number((0.15 * state.itemsPrice).toFixed(2));
      state.totalPrice = Number(
        (state.itemsPrice + state.shippingPrice + state.taxPrice).toFixed(2)
      );
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
  setCartOpen,
} = cartSlice.actions;

export default cartSlice.reducer;
