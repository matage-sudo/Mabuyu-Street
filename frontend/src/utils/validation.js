import { z } from 'zod';

export const orderSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters long.'),
  phone: z.string().regex(/^(?:\+254|0)[17]\d{8}$/, 'Please enter a valid Kenyan phone number (e.g., 0712345678).'),
  deliveryAddress: z.string().min(5, 'Please provide a clear delivery location or address.'),
  notes: z.string().optional(),
});