export type ReceiptItem = [string, number | null, number];

export interface Receipt {
  id?: string;
  user_id: string;
  receipt_name?: string | null;
  store_name: string;
  custom_store_name?: string | null;
  use_custom_store_name: boolean;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  phone?: string | null;
  purchase_date: string;
  purchase_time: string;
  receipt_items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  european_format: boolean;
  suppress_dollar_sign: boolean;
  blurry_receipt: boolean;
  current_typeface: string;
  is_restaurant: boolean;
  store_name_box: boolean;
  store_address_box: boolean;
  store_phone_box: boolean;
  store_box: boolean;
  purchase_date_box: boolean;
  total_spent_box: boolean;
  is_favorite: boolean;
  created_at?: string;
  updated_at?: string;
}
