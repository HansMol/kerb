import { z } from 'zod'

export const MAKES = [
  'Audi', 'BMW', 'Citroën', 'Ferrari', 'Ford', 'Honda', 'Hyundai',
  'Jaguar', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 'Mazda',
  'Mercedes-Benz', 'Mini', 'Nissan', 'Peugeot', 'Porsche', 'Range Rover',
  'Renault', 'SEAT', 'Skoda', 'Tesla', 'Toyota', 'Vauxhall', 'Volkswagen',
  'Volvo', 'Other',
] as const

export const BODY_TYPES = ['Hatchback', 'Saloon', 'Estate', 'SUV', 'Coupe', 'Convertible', 'MPV', 'Van', 'Pickup'] as const
export const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Plug-in Hybrid', 'Electric', 'LPG'] as const
export const DOORS      = ['2', '3', '4', '5'] as const
export const DOOR_OPTS  = [{ value: '2', label: '2 doors' }, { value: '3', label: '3 doors' }, { value: '4', label: '4 doors' }, { value: '5', label: '5 doors' }]

// Shared between the single-listing form (dashboard/listings/new) and the
// bulk CSV upload endpoint (api/listings/bulk-upload) — one set of rules,
// no drift between what a hand-filled listing accepts and what a CSV row does.
export const listingSchema = z.object({
  make:         z.enum(MAKES, { error: 'Select a make' }),
  model:        z.string().min(1, 'Model is required'),
  year:         z.number({ error: 'Enter a valid year' })
                  .min(1990, 'Year must be 1990 or later')
                  .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  mileage:      z.number({ error: 'Enter a valid mileage' }).min(0),
  colour:       z.string().min(1, 'Colour is required'),
  bodyType:     z.enum(BODY_TYPES, { error: 'Select a body type' }),
  doors:        z.enum(DOORS, { error: 'Select number of doors' }),
  fuelType:     z.enum(FUEL_TYPES, { error: 'Select a fuel type' }),
  transmission: z.enum(['Manual', 'Automatic'] as const, { error: 'Select transmission' }),
  engineSize:   z.string().optional(),
  variant:      z.string().optional(),
  price:        z.number({ error: 'Enter a valid price' }).min(500, 'Price must be at least £500'),
  status:       z.enum(['draft', 'live'] as const),
  description:  z.string().min(20, 'Please write at least 20 characters'),
})

export type ListingFormData = z.infer<typeof listingSchema>
