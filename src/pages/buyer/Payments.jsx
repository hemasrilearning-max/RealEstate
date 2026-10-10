import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
  Receipt,
  ShieldCheck,
  Wallet,
  ArrowLeft,
  Home,
  X,
  Printer,
  FileText,
  User,
  MapPin,
  Calendar,
  Hash,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import axiosInstance from "../../utils/axiosInstance";

import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";


/* ============================================================
   HELPERS
============================================================ */

function formatCurrency(amount) {
  const value = Number(amount || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeStatus(status) {
  return String(status || "")
    .trim()
    .toUpperCase();
}

function getStatusLabel(status) {
  const normalized = normalizeStatus(status);

  if (normalized === "SUCCESS") {
    return "Successful";
  }

  if (normalized === "PENDING") {
    return "Pending";
  }

  if (
    normalized === "FAILED" ||
    normalized === "FAILURE"
  ) {
    return "Failed";
  }

  if (normalized === "REFUNDED") {
    return "Refunded";
  }

  return status || "Unknown";
}

function getBuyerName(user) {
  if (!user) {
    return "Buyer";
  }

  const fullName = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    fullName ||
    user.name ||
    user.username ||
    user.email ||
    "Buyer"
  );
}

function getBuyerEmail(user) {
  return (
    user?.email ||
    "-"
  );
}

function getBuyerId(user) {
  return (
    user?.userId ||
    user?.id ||
    "-"
  );
}


/* ============================================================
   PROPERTY HELPERS
============================================================ */

function getPropertyName(property) {
  if (!property) {
    return "Property";
  }

  return (
    property.title ||
    property.name ||
    property.propertyName ||
    `Property #${property.id || "-"}`
  );
}

function getPropertyAddress(property) {
  if (!property) {
    return "";
  }

  const location = property.location;

  if (
    typeof location === "string" &&
    location.trim()
  ) {
    return location;
  }

  const locationObject =
    location &&
    typeof location === "object"
      ? location
      : {};

  const address =
    property.address ||
    locationObject.address ||
    "";

  const locality =
    property.locality ||
    locationObject.locality ||
    locationObject.area ||
    "";

  const city =
    property.city ||
    locationObject.city ||
    "";

  const state =
    property.state ||
    locationObject.state ||
    "";

  const pincode =
    property.pincode ||
    locationObject.pincode ||
    "";

  return [
    address,
    locality,
    city,
    state,
    pincode,
  ]
    .filter(Boolean)
    .join(", ");
}

function getPropertyLocation(property) {
  if (!property) {
    return "-";
  }

  const address =
    getPropertyAddress(property);

  return (
    address ||
    property.locationName ||
    property.city ||
    "-"
  );
}


/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function BuyerPayments() {
  const navigate = useNavigate();

  const {
    properties,
  } = useData();

  const {
    user,
  } = useAuth();

  const [
    payments,
    setPayments,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    selectedPayment,
    setSelectedPayment,
  ] = useState(null);

  const [
    invoice,
    setInvoice,
  ] = useState(null);

  const [
    transaction,
    setTransaction,
  ] = useState(null);

  const [
    invoiceLoading,
    setInvoiceLoading,
  ] = useState(false);

  const [
    invoiceError,
    setInvoiceError,
  ] = useState("");


  /* ==========================================================
     LOAD PAYMENTS
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const loadPayments =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await axiosInstance.get(
              "/api/payments/my"
            );

          if (!mounted) {
            return;
          }

          const paymentData =
            Array.isArray(response.data)
              ? response.data
              : response.data?.content ||
                response.data?.payments ||
                [];

          const mappedPayments =
            paymentData.map(
              (payment) => {
                const status =
                  normalizeStatus(
                    payment.status
                  );

                return {
                  id: `PAY-${payment.id}`,

                  paymentId:
                    payment.id,

                  type:
                    "Property Payment",

                  propertyId:
                    payment.propertyId,

                  property:
                    `Property #${
                      payment.propertyId ||
                      "-"
                    }`,

                  amount:
                    Number(
                      payment.amount || 0
                    ),

                  method:
                    payment.paymentMethod ||
                    "Razorpay",

                  status,

                  statusLabel:
                    getStatusLabel(
                      status
                    ),

                  date:
                    formatDate(
                      payment.createdAt
                    ),

                  createdAt:
                    payment.createdAt,

                  razorpayOrderId:
                    payment.razorpayOrderId,

                  razorpayPaymentId:
                    payment.razorpayPaymentId,
                };
              }
            );

          setPayments(
            mappedPayments
          );
        } catch (requestError) {
          console.error(
            "Unable to load payments:",
            requestError
          );

          if (mounted) {
            setError(
              requestError.response?.data
                ?.message ||
                requestError.message ||
                "Unable to load payments."
            );
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadPayments();

    return () => {
      mounted = false;
    };
  }, []);


  /* ==========================================================
     TOTALS
  ========================================================== */

  const totalPaid =
    useMemo(() => {
      return payments
        .filter(
          (payment) =>
            normalizeStatus(
              payment.status
            ) === "SUCCESS"
        )
        .reduce(
          (total, payment) =>
            total +
            Number(
              payment.amount || 0
            ),
          0
        );
    }, [payments]);

  const pendingAmount =
    useMemo(() => {
      return payments
        .filter(
          (payment) =>
            normalizeStatus(
              payment.status
            ) === "PENDING"
        )
        .reduce(
          (total, payment) =>
            total +
            Number(
              payment.amount || 0
            ),
          0
        );
    }, [payments]);

  const verifiedPayments =
    useMemo(() => {
      return payments.filter(
        (payment) =>
          normalizeStatus(
            payment.status
          ) === "SUCCESS"
      ).length;
    }, [payments]);


  /* ==========================================================
     FIND PROPERTY
  ========================================================== */

  const findProperty = (
    propertyId
  ) => {
    if (!propertyId) {
      return null;
    }

    return (
      properties.find(
        (property) =>
          String(property.id) ===
          String(propertyId)
      ) || null
    );
  };


  /* ==========================================================
     RECEIPT / INVOICE
  ========================================================== */

  const handleReceipt = async (
    payment
  ) => {
    if (!payment?.paymentId) {
      return;
    }

    try {
      setSelectedPayment(
        payment
      );

      setInvoice(null);
      setTransaction(null);
      setInvoiceError("");
      setInvoiceLoading(true);

      /*
       * --------------------------------------------------------
       * GET REAL INVOICE
       * --------------------------------------------------------
       *
       * GET /api/invoices/payment/{paymentId}
       *
       * Gives:
       * - invoice ID
       * - invoice number
       * - amount
       * - payment ID
       * - buyer ID
       * - property ID
       * - issued date
       */

      let invoiceResponse = null;

      try {
        invoiceResponse =
          await axiosInstance.get(
            `/api/invoices/payment/${payment.paymentId}`
          );
      } catch (invoiceRequestError) {
        /*
         * If an invoice does not exist yet,
         * try creating it.
         *
         * Backend already supports:
         * POST /api/invoices/payment/{paymentId}
         *
         * This is only attempted for a
         * successful payment.
         */

        if (
          normalizeStatus(
            payment.status
          ) === "SUCCESS"
        ) {
          try {
            invoiceResponse =
              await axiosInstance.post(
                `/api/invoices/payment/${payment.paymentId}`
              );
          } catch (createInvoiceError) {
            console.error(
              "Unable to get/create invoice:",
              createInvoiceError
            );

            throw (
              invoiceRequestError
            );
          }
        } else {
          throw (
            invoiceRequestError
          );
        }
      }

      /*
       * --------------------------------------------------------
       * GET TRANSACTIONS
       * --------------------------------------------------------
       *
       * GET /api/transactions/my
       *
       * Find the transaction belonging
       * to this payment.
       */

      let transactionData =
        null;

      try {
        const transactionResponse =
          await axiosInstance.get(
            "/api/transactions/my"
          );

        const transactions =
          Array.isArray(
            transactionResponse.data
          )
            ? transactionResponse.data
            : transactionResponse.data
                ?.content ||
              transactionResponse.data
                ?.transactions ||
              [];

        transactionData =
          transactions.find(
            (item) =>
              String(
                item.paymentId
              ) ===
              String(
                payment.paymentId
              )
          ) || null;
      } catch (transactionRequestError) {
        /*
         * Transaction information is useful,
         * but should not stop the invoice
         * from opening.
         */

        console.warn(
          "Unable to load transaction:",
          transactionRequestError
        );
      }

      setInvoice(
        invoiceResponse?.data ||
          null
      );

      setTransaction(
        transactionData
      );
    } catch (requestError) {
      console.error(
        "Unable to load invoice:",
        requestError
      );

      setInvoiceError(
        requestError.response?.data
          ?.message ||
          requestError.response?.data
            ?.error ||
          requestError.message ||
          "Unable to load invoice."
      );
    } finally {
      setInvoiceLoading(
        false
      );
    }
  };


  /* ==========================================================
     CLOSE INVOICE
  ========================================================== */

  const closeInvoice = () => {
    setSelectedPayment(null);
    setInvoice(null);
    setTransaction(null);
    setInvoiceError("");
  };


  /* ==========================================================
     PRINT
  ========================================================== */

  const handlePrint = () => {
    window.print();
  };


  /* ==========================================================
     SELECTED PROPERTY
  ========================================================== */

  const selectedProperty =
    selectedPayment
      ? findProperty(
          selectedPayment.propertyId
        )
      : null;


  /* ==========================================================
     BUYER DETAILS
  ========================================================== */

  const buyerName =
    getBuyerName(user);

  const buyerEmail =
    getBuyerEmail(user);

  const buyerId =
    getBuyerId(user);


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/buyer/dashboard"
                    )
                  }
                  className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
                  aria-label="Back"
                >
                  <ArrowLeft
                    size={20}
                  />
                </button>

                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Payments
                  </h1>

                  <p className="text-sm text-gray-500">
                    View your property payment
                    history
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/buyer/dashboard"
                  )
                }
                className="hidden items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:flex"
              >
                <Home size={16} />
                Dashboard
              </button>
            </div>
          </div>
        </div>


        {/* ====================================================
            MAIN
        ==================================================== */}

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Total Paid
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      totalPaid
                    )}
                  </h2>
                </div>

                <div className="rounded-lg bg-gray-100 p-3">
                  <Wallet
                    size={20}
                    className="text-gray-700"
                  />
                </div>
              </div>
            </div>


            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Pending
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      pendingAmount
                    )}
                  </h2>
                </div>

                <div className="rounded-lg bg-gray-100 p-3">
                  <CreditCard
                    size={20}
                    className="text-gray-700"
                  />
                </div>
              </div>
            </div>


            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Successful Payments
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    {verifiedPayments}
                  </h2>
                </div>

                <div className="rounded-lg bg-gray-100 p-3">
                  <CheckCircle2
                    size={20}
                    className="text-gray-700"
                  />
                </div>
              </div>
            </div>


            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Secure Payments
                  </p>

                  <h2 className="mt-2 text-lg font-bold text-gray-900">
                    Razorpay
                  </h2>
                </div>

                <div className="rounded-lg bg-gray-100 p-3">
                  <ShieldCheck
                    size={20}
                    className="text-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-medium">
                  Unable to load payments
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>
              </div>
            </div>
          )}


          {/* ==================================================
              PAYMENT HISTORY
          ================================================== */}

          <div className="mt-6 rounded-xl border border-gray-200 bg-white">

            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Payment History
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Your property payment transactions
                  </p>
                </div>

                <CreditCard
                  size={20}
                  className="text-gray-500"
                />
              </div>
            </div>


            {loading ? (
              <div className="flex min-h-[250px] items-center justify-center">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />

                  Loading payments...
                </div>
              </div>
            ) : payments.length === 0 ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center px-5 text-center">
                <div className="rounded-full bg-gray-100 p-4">
                  <CreditCard
                    size={24}
                    className="text-gray-500"
                  />
                </div>

                <h3 className="mt-4 font-semibold text-gray-900">
                  No payments found
                </h3>

                <p className="mt-1 max-w-md text-sm text-gray-500">
                  Your completed property payments
                  will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {payments.map(
                  (payment) => {
                    const status =
                      normalizeStatus(
                        payment.status
                      );

                    const property =
                      findProperty(
                        payment.propertyId
                      );

                    const propertyName =
                      getPropertyName(
                        property
                      );

                    return (
                      <div
                        key={
                          payment.paymentId
                        }
                        className="p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                          <div className="flex min-w-0 items-start gap-4">

                            <div className="rounded-lg bg-gray-100 p-3">
                              <Receipt
                                size={20}
                                className="text-gray-700"
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-gray-900">
                                  {propertyName}
                                </h3>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                    status ===
                                    "SUCCESS"
                                      ? "bg-green-50 text-green-700"
                                      : status ===
                                        "PENDING"
                                      ? "bg-yellow-50 text-yellow-700"
                                      : "bg-red-50 text-red-700"
                                  }`}
                                >
                                  {
                                    payment.statusLabel
                                  }
                                </span>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                                <span>
                                  {
                                    payment.id
                                  }
                                </span>

                                <span>
                                  {
                                    payment.date
                                  }
                                </span>

                                <span>
                                  {
                                    payment.method
                                  }
                                </span>
                              </div>
                            </div>
                          </div>


                          <div className="flex items-center justify-between gap-5 lg:justify-end">

                            <div className="text-left lg:text-right">
                              <p className="text-lg font-bold text-gray-900">
                                {formatCurrency(
                                  payment.amount
                                )}
                              </p>

                              {payment.razorpayPaymentId && (
                                <p className="mt-1 max-w-[220px] truncate text-xs text-gray-400">
                                  {
                                    payment.razorpayPaymentId
                                  }
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleReceipt(
                                  payment
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                              <Receipt
                                size={16}
                              />

                              Receipt

                              <ArrowUpRight
                                size={15}
                              />
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </main>
      </div>


      {/* ======================================================
          INVOICE MODAL
      ====================================================== */}

      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeInvoice();
            }
          }}
        >
          <div className="max-h-[95vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* ================================================
                MODAL HEADER
            ================================================= */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 print:hidden">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  <FileText
                    size={20}
                    className="text-gray-700"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Payment Invoice
                  </h2>

                  <p className="text-xs text-gray-500">
                    Transaction and payment details
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">

                {!invoiceLoading &&
                  invoice && (
                    <button
                      type="button"
                      onClick={
                        handlePrint
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      <Printer
                        size={16}
                      />
                      Print
                    </button>
                  )}

                <button
                  type="button"
                  onClick={
                    closeInvoice
                  }
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Close invoice"
                >
                  <X size={20} />
                </button>
              </div>
            </div>


            {/* ================================================
                MODAL BODY
            ================================================= */}

            <div className="max-h-[calc(95vh-73px)] overflow-y-auto">

              {invoiceLoading ? (
                <div className="flex min-h-[400px] items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Loader2
                      size={28}
                      className="animate-spin"
                    />

                    <p className="text-sm">
                      Loading invoice details...
                    </p>
                  </div>
                </div>
              ) : invoiceError ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">
                  <div className="rounded-full bg-red-50 p-4">
                    <AlertCircle
                      size={28}
                      className="text-red-600"
                    />
                  </div>

                  <h3 className="mt-4 font-semibold text-gray-900">
                    Unable to load invoice
                  </h3>

                  <p className="mt-2 max-w-md text-sm text-gray-500">
                    {invoiceError}
                  </p>

                  <button
                    type="button"
                    onClick={
                      closeInvoice
                    }
                    className="mt-5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              ) : invoice ? (
                <div
                  id="invoice-document"
                  className="bg-white px-6 py-8 sm:px-10"
                >

                  {/* ==========================================
                      INVOICE HEADER
                  =========================================== */}

                  <div className="flex flex-col gap-6 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">

                    <div>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-gray-900 p-2.5">
                          <Home
                            size={22}
                            className="text-white"
                          />
                        </div>

                        <div>
                          <h1 className="text-2xl font-bold text-gray-900">
                            HomeSpace
                          </h1>

                          <p className="text-sm text-gray-500">
                            Real Estate
                          </p>
                        </div>
                      </div>

                      <p className="mt-5 text-sm text-gray-500">
                        Payment Invoice
                      </p>
                    </div>


                    <div className="text-left sm:text-right">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Invoice Number
                      </p>

                      <p className="mt-1 text-xl font-bold text-gray-900">
                        {
                          invoice.invoiceNumber ||
                          "-"
                        }
                      </p>

                      <p className="mt-2 text-sm text-gray-500">
                        Issued:{" "}
                        {formatDateTime(
                          invoice.issuedAt
                        )}
                      </p>
                    </div>
                  </div>


                  {/* ==========================================
                      PAYMENT STATUS
                  =========================================== */}

                  <div className="mt-6 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        size={22}
                        className="text-green-600"
                      />

                      <div>
                        <p className="font-semibold text-green-800">
                          Payment Successful
                        </p>

                        <p className="text-sm text-green-700">
                          Your property payment has been
                          successfully processed.
                        </p>
                      </div>
                    </div>

                    <p className="text-lg font-bold text-green-800">
                      {formatCurrency(
                        invoice.amount
                      )}
                    </p>
                  </div>


                  {/* ==========================================
                      BUYER + PROPERTY
                  =========================================== */}

                  <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">

                    {/* BUYER */}

                    <div className="rounded-xl border border-gray-200 p-5">
                      <div className="flex items-center gap-2">
                        <User
                          size={18}
                          className="text-gray-600"
                        />

                        <h3 className="font-semibold text-gray-900">
                          Buyer Details
                        </h3>
                      </div>

                      <div className="mt-4 space-y-3 text-sm">

                        <div>
                          <p className="text-gray-500">
                            Full Name
                          </p>

                          <p className="mt-1 font-medium text-gray-900">
                            {buyerName}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">
                            Email
                          </p>

                          <p className="mt-1 font-medium text-gray-900">
                            {buyerEmail}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">
                            Buyer ID
                          </p>

                          <p className="mt-1 font-medium text-gray-900">
                            {buyerId}
                          </p>
                        </div>
                      </div>
                    </div>


                    {/* PROPERTY */}

                    <div className="rounded-xl border border-gray-200 p-5">
                      <div className="flex items-center gap-2">
                        <MapPin
                          size={18}
                          className="text-gray-600"
                        />

                        <h3 className="font-semibold text-gray-900">
                          Property Details
                        </h3>
                      </div>

                      <div className="mt-4 space-y-3 text-sm">

                        <div>
                          <p className="text-gray-500">
                            Property Name
                          </p>

                          <p className="mt-1 font-medium text-gray-900">
                            {getPropertyName(
                              selectedProperty
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">
                            Property ID
                          </p>

                          <p className="mt-1 font-medium text-gray-900">
                            {invoice.propertyId ||
                              selectedPayment.propertyId ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">
                            Location
                          </p>

                          <p className="mt-1 font-medium text-gray-900">
                            {getPropertyLocation(
                              selectedProperty
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>


                  {/* ==========================================
                      TRANSACTION DETAILS
                  =========================================== */}

                  <div className="mt-6 rounded-xl border border-gray-200 p-5">

                    <div className="flex items-center gap-2">
                      <Hash
                        size={18}
                        className="text-gray-600"
                      />

                      <h3 className="font-semibold text-gray-900">
                        Transaction Details
                      </h3>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                      <div>
                        <p className="text-xs text-gray-500">
                          Transaction Reference
                        </p>

                        <p className="mt-1 break-all text-sm font-medium text-gray-900">
                          {
                            transaction?.transactionReference ||
                            "-"
                          }
                        </p>
                      </div>


                      <div>
                        <p className="text-xs text-gray-500">
                          Transaction Type
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {
                            transaction?.transactionType
                              ? String(
                                  transaction.transactionType
                                )
                                  .replaceAll(
                                    "_",
                                    " "
                                  )
                              : "PROPERTY PURCHASE"
                          }
                        </p>
                      </div>


                      <div>
                        <p className="text-xs text-gray-500">
                          Transaction ID
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {transaction?.id ||
                            "-"}
                        </p>
                      </div>


                      <div>
                        <p className="text-xs text-gray-500">
                          Payment ID
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {invoice.paymentId ||
                            selectedPayment.paymentId ||
                            "-"}
                        </p>
                      </div>


                      <div>
                        <p className="text-xs text-gray-500">
                          Transaction Date
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {formatDateTime(
                            transaction?.createdAt ||
                              selectedPayment.createdAt
                          )}
                        </p>
                      </div>


                      <div>
                        <p className="text-xs text-gray-500">
                          Payment Status
                        </p>

                        <p className="mt-1 text-sm font-medium text-green-700">
                          {
                            selectedPayment.statusLabel
                          }
                        </p>
                      </div>
                    </div>
                  </div>


                  {/* ==========================================
                      PAYMENT DETAILS
                  =========================================== */}

                  <div className="mt-6 rounded-xl border border-gray-200 p-5">

                    <div className="flex items-center gap-2">
                      <CreditCard
                        size={18}
                        className="text-gray-600"
                      />

                      <h3 className="font-semibold text-gray-900">
                        Payment Details
                      </h3>
                    </div>

                    <div className="mt-5 space-y-4">

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-gray-500">
                          Amount
                        </span>

                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(
                            invoice.amount
                          )}
                        </span>
                      </div>


                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-gray-500">
                          Payment Method
                        </span>

                        <span className="text-sm font-medium text-gray-900">
                          {
                            selectedPayment.method
                          }
                        </span>
                      </div>


                      <div className="flex items-start justify-between gap-4">
                        <span className="text-sm text-gray-500">
                          Razorpay Order ID
                        </span>

                        <span className="max-w-[60%] break-all text-right text-sm font-medium text-gray-900">
                          {
                            selectedPayment.razorpayOrderId ||
                            "-"
                          }
                        </span>
                      </div>


                      <div className="flex items-start justify-between gap-4">
                        <span className="text-sm text-gray-500">
                          Razorpay Payment ID
                        </span>

                        <span className="max-w-[60%] break-all text-right text-sm font-medium text-gray-900">
                          {
                            selectedPayment.razorpayPaymentId ||
                            "-"
                          }
                        </span>
                      </div>
                    </div>
                  </div>


                  {/* ==========================================
                      TOTAL
                  =========================================== */}

                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-gray-700">
                        Total Paid
                      </span>

                      <span className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          invoice.amount
                        )}
                      </span>
                    </div>
                  </div>


                  {/* ==========================================
                      FOOTER
                  =========================================== */}

                  <div className="mt-8 border-t border-gray-200 pt-5 text-center">
                    <p className="text-sm font-medium text-gray-700">
                      Thank you for your payment.
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      This invoice was generated from your
                      HomeSpace property transaction.
                    </p>
                  </div>

                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}


      {/* ======================================================
          PRINT STYLES
      ====================================================== */}

      <style>
        {`
          @media print {
            body {
              background: white !important;
            }

            body * {
              visibility: hidden !important;
            }

            #invoice-document,
            #invoice-document * {
              visibility: visible !important;
            }

            #invoice-document {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 30px !important;
              box-shadow: none !important;
            }

            @page {
              size: A4;
              margin: 10mm;
            }
          }
        `}
      </style>
    </>
  );
}
