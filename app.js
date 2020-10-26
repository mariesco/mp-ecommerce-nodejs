var express = require("express");
var exphbs = require("express-handlebars");
const bodyParser = require('body-parser');
const mercadopago = require("mercadopago");

var app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

mercadopago.configure({
    integrator_id: "dev_24c65fb163bf11ea96500242ac130004",
    access_token:
        "APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398",
});

let preference = {
    external_reference: "martinriesco16@gmail.com",
    items: [],
    payer: {
        name: "Lalo",
        surname: "Landa",
        email: "test_user_63274575@testuser.com",
        phone: {
            area_code: "11",
            number: 22223333,
        },
        address: {
            zip_code: "1111",
            street_name: "False",
            street_number: 123,
        },
    },
    notification_url: `https://mariesco-mp-ecommerce-nodejs.herokuapp.com/notifications`,
    back_urls: {
        success: `https://mariesco-mp-ecommerce-nodejs.herokuapp.com/success`,
        pending: `https://mariesco-mp-ecommerce-nodejs.herokuapp.com/pending`,
        failure: `https://mariesco-mp-ecommerce-nodejs.herokuapp.com/failure`,
    },
    auto_return: "approved",
    payment_methods: {
        installments: 6,
        excluded_payment_methods: [
            {
                id: "amex",
            },
        ],
        excluded_payment_types: [
            {
                id: "atm",
            },
        ],
    },
};

app.get("/", function (req, res) {
    console.log('este es el console.log del home')
    res.render("home");
});

app.get("/detail", function (req, res) {
    let { query } = req;
    preference.items.push({
        id: "1234",
        title: query.title,
        description: "Dispositivo móvil de Tienda e-commerce",
        quantity: parseInt(query.unit),
        unit_price: parseFloat(query.price),
        picture_url: `https://mariesco-mp-ecommerce-nodejs.herokuapp.com/${query.img}`,
    });
    res.render("detail", req.query);
});

app.post("/mpago", function (req, res) {
    mercadopago.preferences
        .create(preference)
        .then(function (response) {
            res.redirect(response.response.init_point);
        })
        .catch(function (error) {
            console.log(error);
            res.redirect("/");
        });
});

app.get("/failure", function (req, res) {
    res.render("failure");
});

app.get("/pending", function (req, res) {
    res.render("pending");
});

app.get("/success", function (req, res) {
    res.render("success", req.query);
});

app.post("notifications", function (req, res) {
    mercadopago.ipn.manage(req).then(function (data) {
        res.render('jsonOutput', {
          result: data
        });
      }).catch(function (error) {
        res.render('500', {
          error: error
        });
      });
    res.sendStatus(200);
});

app.use(express.static("assets"));

app.use("/assets", express.static(__dirname + "/assets"));

app.listen(PORT, () => console.log("corriendo en puerto ", PORT));
