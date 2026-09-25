import z from "zod"

const UserSchema = z.object({
   name: z.string().max(10, "Name is required"),
   age: z.coerce.number().min(10, "Age is required"),
   address: z.string().optional(),
   email: z.email({required_error: "email is required"})
})

export default UserSchema
