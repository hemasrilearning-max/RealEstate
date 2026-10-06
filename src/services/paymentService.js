import axiosInstance from "../utils/axiosInstance";

const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

const RAZORPAY_KEY_ID =
  import.meta.env.VITE_RAZORPAY_KEY_ID;

/**
 * Load Razorpay Checkout script only once.
 */
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () =>
        resolve(true)
      );

      existingScript.addEventListener("error", () =>
        reject(
          new Error(
            "Failed to load Razorpay Checkout."
          )
        )
      );

      return;
    }

    const script = document.createElement("script");

    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    script.onload = () => resolve(true);

    script.onerror = () =>
      reject(
        new Error(
          "Failed to load Razorpay Checkout."
        )
      );

    document.body.appendChild(script);
  });
};

/**
 * Create payment/order in backend.
 *
 * POST /api/payments
 *
 * Body:
 * {
 *   propertyId: number
 * }
 */
const createPayment = async (propertyId) => {
  if (!propertyId) {
    throw new Error("Property ID is required.");
  }

  const response = await axiosInstance.post(
    "/api/payments",
    {
      propertyId: Number(propertyId),
    }
  );

  return response.data;
};

/**
 * Verify Razorpay payment through backend.
 *
 * POST /api/payments/verify
 */
const verifyPayment = async ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  if (
    !razorpayOrderId ||
    !razorpayPaymentId ||
    !razorpaySignature
  ) {
    throw new Error(
      "Razorpay payment verification details are incomplete."
    );
  }

  const response = await axiosInstance.post(
    "/api/payments/verify",
    {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    }
  );

  return response.data;
};

/**
 * Get current buyer's payment history.
 *
 * GET /api/payments/my
 */
const getMyPayments = async () => {
  const response = await axiosInstance.get(
    "/api/payments/my"
  );

  return response.data;
};

/**
 * Get one payment by ID.
 *
 * GET /api/payments/{paymentId}
 */
const getPaymentById = async (paymentId) => {
  if (!paymentId) {
    throw new Error("Payment ID is required.");
  }

  const response = await axiosInstance.get(
    `/api/payments/${paymentId}`
  );

  return response.data;
};

/**
 * Open Razorpay Checkout.
 *
 * Backend amount is in INR.
 * Razorpay expects paise.
 */
const openCheckout = async ({
  payment,
  user,
  property,
  onSuccess,
  onFailure,
}) => {
  if (!payment?.razorpayOrderId) {
    throw new Error(
      "Razorpay order ID was not returned by the server."
    );
  }

  if (!RAZORPAY_KEY_ID) {
    throw new Error(
      "Razorpay key is not configured in the frontend."
    );
  }

  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error(
      "Razorpay Checkout is not available."
    );
  }

  const amountInRupees = Number(payment.amount);

  if (
    !Number.isFinite(amountInRupees) ||
    amountInRupees <= 0
  ) {
    throw new Error(
      "Invalid payment amount received from the server."
    );
  }

  const options = {
    key: RAZORPAY_KEY_ID,

    amount: Math.round(
      amountInRupees * 100
    ),

    currency: "INR",

    name: "HomeSpace",

    description:
      property?.title ||
      "Property Purchase",

    order_id: payment.razorpayOrderId,

    prefill: {
      name:
        user?.name ||
        user?.firstName ||
        "",

      email:
        user?.email ||
        "",

      contact:
        user?.phone ||
        "",
    },

    notes: {
      propertyId: String(
        payment.propertyId ||
          property?.id ||
          ""
      ),

      paymentId: String(
        payment.id || ""
      ),
    },

    theme: {
      color: "#7c3aed",
    },

    handler: async (razorpayResponse) => {
      try {
        const verifiedPayment =
          await verifyPayment({
            razorpayOrderId:
              razorpayResponse.razorpay_order_id,

            razorpayPaymentId:
              razorpayResponse.razorpay_payment_id,

            razorpaySignature:
              razorpayResponse.razorpay_signature,
          });

        if (onSuccess) {
          onSuccess(verifiedPayment);
        }
      } catch (error) {
        if (onFailure) {
          onFailure(error);
        }
      }
    },

    modal: {
      ondismiss: () => {
        if (onFailure) {
          onFailure(
            new Error(
              "Payment window was closed."
            )
          );
        }
      },
    },
  };

  const razorpay =
    new window.Razorpay(options);

  razorpay.on(
    "payment.failed",
    (response) => {
      const description =
        response?.error?.description ||
        "Razorpay payment failed.";

      if (onFailure) {
        onFailure(
          new Error(description)
        );
      }
    }
  );

  razorpay.open();
};

const paymentService = {
  createPayment,
  verifyPayment,
  getMyPayments,
  getPaymentById,
  openCheckout,
  loadRazorpayScript,
};

export default paymentService;