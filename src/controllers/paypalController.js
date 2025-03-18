const paypal = require("@paypal/paypal-server-sdk");
const client = require("../config/paypal");

const {
  savePayment,
  updatePayment,
} = require("../controllers/paymentController");

const ordersController = new paypal.OrdersController(client);

const createOrder = async (req, res, next) => {
  const { name, email, type = "PayPal",featureType } = req.body;
  const collect = {
    body: {
      intent: "CAPTURE",
      purchaseUnits: [
        {
          amount: {
            currencyCode: "USD",
            value: "100",
          },
        },
      ],
    },
    prefer: "return=minimal",
  };

  try {
    const { body, ...httpResponse } = await ordersController.ordersCreate(
      collect
    );

    const paymentData = {
      paymentId: JSON.parse(body).id,
      status: JSON.parse(body).status,
      amount: collect.body.purchaseUnits[0].amount.value,
      currency: collect.body.purchaseUnits[0].amount.currencyCode,
      type: type,
      Name: name,
      Email: email,
      featureType
    };

    await savePayment(paymentData);

    res.status(httpResponse.statusCode).json(JSON.parse(body));
  } catch (error) {
    next(error);
  }
};

const captureOrder = async (req, res, next) => {
  const { orderID } = req.params;

  try {
    const { body, ...httpResponse } = await ordersController.ordersCapture({
      id: orderID,
      prefer: "return=minimal",
    });

    const parsedBody = JSON.parse(body);
    const id = parsedBody.id;
    const paymentData = { status: parsedBody.status };

    await updatePayment(id, paymentData);

    res.status(httpResponse.statusCode).json(parsedBody);
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, captureOrder };
