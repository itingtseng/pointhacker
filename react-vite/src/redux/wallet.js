import { createSelector } from "reselect";

// Action Types
const LOAD_USER_WALLET = 'wallets/load_user_wallet';
const ADD_CARD_TO_WALLET = 'wallets/add_card_to_wallet';
const REMOVE_CARD_FROM_WALLET = 'wallets/remove_card_from_wallet';
const UPDATE_WALLET = 'wallets/update_wallet';

// Action Creators
export const loadUserWallet = (wallet) => ({
  type: LOAD_USER_WALLET,
  wallet,
});

export const addCardToWallet = (card) => ({
  type: ADD_CARD_TO_WALLET,
  card,
});

export const removeCardFromWallet = (cardId) => ({
  type: REMOVE_CARD_FROM_WALLET,
  cardId,
});

export const updateWallet = (wallet) => ({
  type: UPDATE_WALLET,
  wallet,
});

// Thunks
export const thunkGetUserWallet = () => async (dispatch) => {
  try {
    const res = await fetch('/api/wallets/session');
    if (res.ok) {
      const data = await res.json();
      dispatch(loadUserWallet(data)); // Corrected to use loadUserWallet
    } else {
      const errorText = await res.text(); // Get error text if JSON fails
      console.error("Unexpected response:", errorText);
      throw new Error("Failed to fetch user's wallet");
    }
  } catch (error) {
    console.error("Error fetching user's wallet:", error);
    throw error;
  }
};


export const thunkAddCardToWallet = (cardData) => async (dispatch) => {
  try {
    const res = await fetch('/api/wallets/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cardData),
    });

    if (res.ok) {
      const data = await res.json();
      dispatch(addCardToWallet(data));
    } else if (res.status === 409) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Card already exists in wallet");
    } else {
      throw new Error('Failed to add card to wallet');
    }
  } catch (error) {
    console.error('Error adding card to wallet:', error.message);
    throw error;
  }
};


export const thunkRemoveCardFromWallet = (cardId) => async (dispatch) => {
  try {
    const res = await fetch(`/api/wallets/cards/${cardId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      dispatch(removeCardFromWallet(cardId));
    } else {
      throw new Error('Failed to remove card from wallet');
    }
  } catch (error) {
    console.error('Error removing card from wallet:', error);
  }
};

export const thunkUpdateWallet = (cardId, walletData) => async (dispatch) => {
  try {
    const res = await fetch(`/api/wallets/cards/${cardId}`, { // Correct endpoint
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(walletData),
    });

    if (res.ok) {
      const data = await res.json();
      dispatch(updateWallet(data)); // Update state with returned data
    } else {
      throw new Error(`Failed to update card with ID: ${cardId}`);
    }
  } catch (error) {
    console.error(`Error updating card with ID ${cardId}:`, error);
  }
};



// Selectors
export const selectWallet = (state) => state.wallet.singleWallet;

export const selectWalletCards = createSelector(
  [selectWallet],
  (wallet) => (wallet ? wallet.cards : [])
);

// Reducer
const initialState = {
  singleWallet: null,
};

function walletReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_USER_WALLET:
      return { ...state, singleWallet: action.wallet };
    case ADD_CARD_TO_WALLET: {
      if (!state.singleWallet) return state;
      return {
        ...state,
        singleWallet: {
          ...state.singleWallet,
          cards: [...state.singleWallet.cards, action.card],
        },
      };
    }
    case REMOVE_CARD_FROM_WALLET: {
      if (!state.singleWallet) return state;
      return {
        ...state,
        singleWallet: {
          ...state.singleWallet,
          cards: state.singleWallet.cards.filter(
            (card) => card.id !== action.cardId
          ),
        },
      };
    }
    case UPDATE_WALLET:
      return {
        ...state,
        singleWallet:
          state.singleWallet && state.singleWallet.id === action.wallet.id
            ? action.wallet
            : state.singleWallet,
      };
    default:
      return state;
  }
}

export default walletReducer