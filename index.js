const express = require("express");
const bodyParser = require("body-parser");
const pool = require("./config/db"); // Import the database connection
const jwt = require("jsonwebtoken");
const { generateToken, verifyToken } = require("./config/token"); // Import the stoken generation functions
const claimMD = require("./controllers/ClaimMDInsert");
const { decode } = require("base-64");
const bcrypt = require("bcryptjs");
const payers = require("./config/config");
const { Sequelize } = require("sequelize");
const syncModels = require("./model/sync.model");
const { connectDB } = require("./config/db");
const { connectMainDB } = require("./config/dbConnection");

(async () => {
  try {
    await connectDB();
    console.log("DB is connected");

    await connectMainDB();
    console.log("Main DB is connected");

    await syncModels();
    console.log("Models synced");
  } catch (error) {
    console.error("Error while connecting to databases:", error);
  }
})();

const app = express();
const port = 3000;
const loginRouter = require("./routes/login");
app.use(express.json());
app.use(bodyParser.json());
app.use("/r/Insuranceeligibility", claimMD);
//Login
app.route("/r/login").post(loginRouter.login);
app.route("/r/register").post(loginRouter.register);
app.route("/r/register").put(loginRouter.updateNpi);
// syncModels();xa

// Function to decode base64-encoded password
async function hashPassword(password) {
  const saltRounds = 10; // Number of salt rounds for hashing

  // Generate salt and hash the password
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

app.post("/register", async (req, res) => {
  const { firstname, email, phonenumber, password, lastname, username } =
    req.body;

  try {
    // Hash the passwordsa
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10a

    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO public.users(firstname, email, phonenumber, password, lastname, "RowData", username) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [
        firstname,
        email,
        phonenumber,
        hashedPassword,
        lastname,
        JSON.stringify(req.body),
        username,
      ]
    );
    client.release();
    res.status(201).json({ success: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Error registering user" });
  }
});

// Login endpoint to generate JWT token
app.post("/tokenGenerate", async (req, res) => {
  const { username, password } = req.body;
  console.log("Request body " + JSON.stringify(req.body));

  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM public.users WHERE username = $1",
      [username]
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      "your_secret_key"
    ); // Generate token
    res.json({ token });
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Insurance Eligibility." });
  // console.log("Payer List "+ JSON.stringify(payers[0]));
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
