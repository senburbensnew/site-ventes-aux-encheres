export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Bid {
  id: number;
  auction_id: number;
  user_id: number;
  amount: number;
  created_at: string;
  user: Pick<User, 'id' | 'name'>;
}

export interface Auction {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  start_price: number;
  current_price: number;
  status: 'pending' | 'active' | 'ended';
  end_at: string;
  user_id: number;
  user: Pick<User, 'id' | 'name'>;
  bids?: Bid[];
  bids_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}
