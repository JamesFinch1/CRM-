import {z} from 'zod';
export const leadSchema=z.object({name:z.string().trim().min(1).max(120),phone:z.string().trim().min(7).max(30),email:z.string().email().max(254).optional().or(z.literal('')),service:z.string().trim().max(160).optional(),source:z.string().trim().max(80).default('Website'),notes:z.string().trim().max(4000).optional(),estimatedValue:z.coerce.number().min(0).max(10000000).optional(),consentBasis:z.string().trim().max(100).optional()});
export const loginSchema=z.object({email:z.string().email(),password:z.string().min(8).max(200)});
export const statusSchema=z.object({status:z.enum(['new','queued','calling','qualified','booked','won','lost','do_not_contact'])});
