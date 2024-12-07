const express = require("express");
const mongoose = require("mongoose");
const middleware = require("./middleware");
const jwt = require("jsonwebtoken");
const AdminData = require("./models/AdminModel");
const cors = require("cors");
const { Pesticides } = require("./models/Products");
const { Fertilizer } = require("./models/Products");
const { Seeds } = require("./models/Products");
const Stock = require("./models/Stock");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;

mongoose
  .connect(
    "mongodb+srv://maheshdara222:Mahesh123@cluster0.tpshh2b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    let exist = await AdminData.findOne({ username });
    console.log(username, "data");
    if (!exist) {
      return res.status(400).send("User Not Found");
    }
    if (exist.password !== password) {
      return res.status(400).send("Invalid Credentials");
    }
    let payload = {
      user: {
        id: exist.id,
      },
    };
    jwt.sign(payload, "jwtSecret", { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      return res.json({ token }); // Send token as JSON object
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
});

// products post get services

app.post("/pesticidesinvoice", async (req, res) => {
  const customer = new Pesticides(req.body);
  try {
    for (const product of customer.products) {
      const stock = await Stock.findOne({
        "subproducts.name": product.productName,
      });

      if (stock) {
        const isPesticideProduct = stock.productname === "pesticides";

        if (isPesticideProduct) {
          const subproduct = stock.subproducts.find(
            (sub) => sub.name === product.productName
          );

          if (subproduct) {
            subproduct.quantity -= product.quantity;

            if (subproduct.quantity < 0) {
              return res.status(400).json({
                message: `Insufficient stock for ${product.productName}`,
              });
            }

            await stock.save();
            return res
              .status(200)
              .json({ message: "Invoice Added sucessfully" });
          } else {
            return res.status(400).json({
              message: `Subproduct ${product.productName} not found in stock`,
            });
          }
        } else {
          return res.status(400).json({
            message: `The specific product is not in "pesticides". The products are related to ${stock.productname}`,
          });
        }
      } else {
        return res.status(400).json({
          message: `Stock for product ${product.productName} not found`,
        });
      }
    }

    const savedCustomer = await customer.save();
    res.status(201).json(savedCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/fertilizerinvoice", async (req, res) => {
  const customer = new Fertilizer(req.body);
  try {
    for (const product of customer.products) {
      const stock = await Stock.findOne({
        "subproducts.name": product.productName,
      });

      if (stock) {
        const isFertilizerProduct = stock.productname === "fertilizer";

        if (isFertilizerProduct) {
          const subproduct = stock.subproducts.find(
            (sub) => sub.name === product.productName
          );

          if (subproduct) {
            subproduct.quantity -= product.quantity;

            if (subproduct.quantity < 0) {
              return res.status(400).json({
                message: `Insufficient stock for ${product.productName}`,
              });
            }

            await stock.save();
          } else {
            return res.status(400).json({
              message: `Subproduct ${product.productName} not found in stock`,
            });
          }
        } else {
          return res.status(400).json({
            message: `The specific product is not in "pesticides". The products are related to ${stock.productname}`,
          });
        }
      } else {
        return res.status(400).json({ message: `Product not found in stock` });
      }
    }
    const savedCustomer = await customer.save();
    res.status(201).json(savedCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/seedsinvoice", async (req, res) => {
  const customer = new Seeds(req.body);
  try {
    for (const product of customer.products) {
      const stock = await Stock.findOne({
        "subproducts.name": product.productName,
      });

      if (stock) {
        const isSeedsProduct = stock.productname === "seeds";

        if (isSeedsProduct) {
          const subproduct = stock.subproducts.find(
            (sub) => sub.name === product.productName
          );

          if (subproduct) {
            subproduct.quantity -= product.quantity;

            if (subproduct.quantity < 0) {
              return res.status(400).json({
                message: `Insufficient stock for ${product.productName}`,
              });
            }

            await stock.save();
          } else {
            return res.status(400).json({
              message: `Subproduct ${product.productName} not found in stock`,
            });
          }
        } else {
          return res.status(400).json({
            message: `The specific product is not in "pesticides". The products are related to ${stock.productname}`,
          });
        }
      } else {
        return res.status(400).json({ message: `Product not found in stock` });
      }
    }
    const savedCustomer = await customer.save();
    res.status(201).json(savedCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/pescidesinvoicedata", async (req, res) => {
  try {
    const customers = await Pesticides.find();
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.get("/fertilizerinvoicedata", async (req, res) => {
  try {
    const customers = await Fertilizer.find();
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.get("/seedsinvoiceedata", async (req, res) => {
  try {
    const customers = await Seeds.find();
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//stock post get put services

app.post("/stock", async (req, res) => {
  const { productname, subproductname, quantity } = req.body;
  const quantityNumber = Number(quantity);

  try {
    let stock = await Stock.findOne({ productname });

    if (!stock) {
      stock = new Stock({ productname, subproducts: [] });
    }

    let subproduct = stock.subproducts.find((sp) => sp.name === subproductname);

    if (subproduct) {
      subproduct.quantity += quantityNumber; // Replace quantity, not add
    } else {
      stock.subproducts.push({ name: subproductname, quantity });
    }

    const savedStock = await stock.save();
    res.status(201).json(savedStock);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

app.put(
  "/editstock/:productname/:subproduct/:subproductId",
  async (req, res) => {
    const { productname, subproductId } = req.params;
    const { subproductname, quantity } = req.body;

    try {
      let stock = await Stock.findOne({ productname });

      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }

      let subproduct = stock.subproducts.id(subproductId);

      if (!subproduct) {
        return res.status(404).json({ message: "Subproduct not found" });
      }

      subproduct.name = subproductname;
      subproduct.quantity = quantity;

      const updatedStock = await stock.save();
      res.status(200).json(updatedStock);
    } catch (err) {
      console.error("Error:", err.message);
      res.status(400).json({ message: err.message });
    }
  }
);

app.get("/stock", async (req, res) => {
  try {
    const customers = await Stock.find();
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/stock/:productname/subproduct/:subproductId", async (req, res) => {
  const { productname, subproductId } = req.params;

  try {
    let stock = await Stock.findOne({ productname });

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    stock.subproducts = stock.subproducts.filter(
      (sp) => sp._id.toString() !== subproductId
    );

    const savedStock = await stock.save();
    res.status(200).json(savedStock);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
