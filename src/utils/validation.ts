import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8)
});

export const loginSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  password: z.string().min(1)
}).refine(data => data.email || data.username, {
  message: "Either email or username must be provided"
});

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided"
});

export const receiptItemSchema = z.tuple([
  z.string(),
  z.number().nullable(),
  z.number()
]);

export const receiptSchema = z.object({
  store_name: z.string(),
  custom_store_name: z.string().nullable().optional(),
  use_custom_store_name: z.boolean().default(false),
  address1: z.string().nullable().optional(),
  address2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zip: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  purchase_date: z.string(),
  purchase_time: z.string(),
  receipt_items: z.array(receiptItemSchema),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  european_format: z.boolean().default(false),
  suppress_dollar_sign: z.boolean().default(true),
  blurry_receipt: z.boolean().default(false),
  current_typeface: z.string().default('font-sans'),
  is_restaurant: z.boolean().default(false),
  store_name_box: z.boolean().default(true),
  store_address_box: z.boolean().default(true),
  store_phone_box: z.boolean().default(true),
  store_box: z.boolean().default(true),
  purchase_date_box: z.boolean().default(true),
  total_spent_box: z.boolean().default(true),
  is_favorite: z.boolean().default(false)
});

export const receiptUpdateSchema = receiptSchema.partial();
