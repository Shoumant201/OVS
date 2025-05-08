import swaggerJSDoc from "swagger-jsdoc"

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "My API",
    version: "1.0.0",
    description: "This is the API documentation for  our Online Voting System",
  },
  servers: [
    {
      url: "http://localhost:5001",
      description: "Online Voting System",
    },
  ],
}

const options = {
  swaggerDefinition,
  // Path to the API docs
  apis: ["./routes/*.js", "./routes/*.ts"], // wherever your route files are
}

const swaggerSpec = swaggerJSDoc(options)

export default swaggerSpec
