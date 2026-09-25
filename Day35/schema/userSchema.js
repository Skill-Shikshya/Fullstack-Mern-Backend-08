import z from "zod"

const userSchema = z.object({
   name: z.string({required_error: "name is required"}).min(3, "name should atleast 3 char long"),
   email: z.email(),
   // age: z.coerce.number(),
   // password: z.string().min(8, "Password too small"),
   // confirmPassword: z.string().min(8, "Password too small")
})


// .superRefine((data, ctx) => {
//    if(data.password !== data.confirmPassword){
//       ctx.addIssue({
//          message: "password did not match",
//          path: ["confirmPassword"]
//       })
//    }
//
//    if(data.age > data.name.length) {
//       ctx.addIssue({
//          message: "age too high",
//          path: ["age"]
//       })
//    }
// })
//
// const result = userSchema.safeParse({
//    name: "hello",
//    email: "test@gmail.com",
//    age: "200",
//    password: "12345679",
//    confirmPassword: "12345679"
// });
//
//
// if(result.success){
//    console.log(result.data)
// }else{
//    console.error(result.error?.flatten().fieldErrors)
// }


export default userSchema
