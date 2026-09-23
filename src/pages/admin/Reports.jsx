import { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  Users,
  Building2,
  CreditCard,
  IndianRupee,
  BarChart3,
} from "lucide-react";

export default function Reports() {
  const [reportType, setReportType] = useState("Overview");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [generated, setGenerated] = useState(false);

  const reports = [
    {
      id: 1,
      name: "Monthly Overview Report",
      type: "Overview",
      date: "Sep 20, 2026",
      status: "Generated",
    },
    {
      id: 2,
      name: "Property Report",
      type: "Properties",
      date: "Sep 18, 2026",
      status: "Generated",
    },
    {
      id: 3,
      name: "Transaction Report",
      type: "Transactions",
      date: "Sep 15, 2026",
      status: "Generated",
    },
  ];

  const handleGenerateReport = () => {
    setGenerated(true);
  };

  const handleExport = () => {
    const data = [
      ["Report", "Value"],
      ["Total Users", "1248"],
      ["Total Properties", "856"],
      ["Transactions", "342"],
      ["Revenue", "1850000"],
    ];

    const csvContent = data
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "admin-report.csv";
    link.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row
        md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Generate and download system reports
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2
          px-4 py-2.5 rounded-lg
          border border-gray-300
          text-gray-700 hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>

      </div>

      {/* Report Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2
        lg:grid-cols-4 gap-4 mb-6">

        <div className="bg-white border rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Users
              </p>

              <p className="text-2xl font-bold mt-1">
                1,248
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg
              bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>

          </div>

        </div>

        <div className="bg-white border rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Properties
              </p>

              <p className="text-2xl font-bold mt-1">
                856
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg
              bg-purple-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>

          </div>

        </div>

        <div className="bg-white border rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Transactions
              </p>

              <p className="text-2xl font-bold mt-1">
                342
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg
              bg-green-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>

          </div>

        </div>

        <div className="bg-white border rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Revenue
              </p>

              <p className="text-2xl font-bold mt-1">
                ₹18.5L
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg
              bg-amber-100 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-amber-600" />
            </div>

          </div>

        </div>

      </div>

      {/* Generate Report */}
      <div className="bg-white border rounded-xl p-6 mb-6">

        <div className="flex items-center gap-3 mb-5">

          <div className="w-10 h-10 rounded-lg
            bg-purple-100 flex items-center justify-center">

            <BarChart3 className="w-5 h-5 text-purple-600" />

          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Generate Report
            </h2>

            <p className="text-sm text-gray-500">
              Select report type and date range
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Report Type */}
          <div>

            <label className="block text-sm font-medium
              text-gray-700 mb-1">
              Report Type
            </label>

            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border border-gray-300
              rounded-lg px-3 py-2.5
              focus:outline-none focus:ring-2
              focus:ring-purple-500"
            >
              <option value="Overview">
                Overview
              </option>

              <option value="Users">
                Users
              </option>

              <option value="Properties">
                Properties
              </option>

              <option value="Transactions">
                Transactions
              </option>

              <option value="Payments">
                Payments
              </option>

              <option value="Reviews">
                Reviews
              </option>
            </select>

          </div>

          {/* From Date */}
          <div>

            <label className="block text-sm font-medium
              text-gray-700 mb-1">
              From Date
            </label>

            <div className="relative">

              <Calendar
                className="absolute left-3 top-1/2
                -translate-y-1/2 w-4 h-4 text-gray-400"
              />

              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-gray-300
                rounded-lg pl-10 pr-3 py-2.5
                focus:outline-none focus:ring-2
                focus:ring-purple-500"
              />

            </div>

          </div>

          {/* To Date */}
          <div>

            <label className="block text-sm font-medium
              text-gray-700 mb-1">
              To Date
            </label>

            <div className="relative">

              <Calendar
                className="absolute left-3 top-1/2
                -translate-y-1/2 w-4 h-4 text-gray-400"
              />

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-gray-300
                rounded-lg pl-10 pr-3 py-2.5
                focus:outline-none focus:ring-2
                focus:ring-purple-500"
              />

            </div>

          </div>

        </div>

        <div className="flex justify-end mt-5">

          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-2
            bg-purple-600 text-white
            px-5 py-2.5 rounded-lg
            hover:bg-purple-700"
          >
            <FileText className="w-4 h-4" />
            Generate Report
          </button>

        </div>

        {generated && (
          <div className="mt-4 p-3 rounded-lg
            bg-green-50 text-green-700 text-sm">
            {reportType} report generated successfully.
          </div>
        )}

      </div>

      {/* Recent Reports */}
      <div className="bg-white border rounded-xl">

        <div className="p-5 border-b">

          <h2 className="text-lg font-semibold text-gray-900">
            Recent Reports
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Previously generated reports
          </p>

        </div>

        <div className="divide-y">

          {reports.map((report) => (

            <div
              key={report.id}
              className="p-5 flex flex-col md:flex-row
              md:items-center md:justify-between gap-4
              hover:bg-gray-50"
            >

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-lg
                  bg-gray-100 flex items-center justify-center">

                  <FileText className="w-5 h-5 text-gray-600" />

                </div>

                <div>

                  <p className="font-medium text-gray-900">
                    {report.name}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {report.type} • {report.date}
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-3">

                <span className="text-xs font-medium
                  text-green-600 bg-green-50
                  px-3 py-1 rounded-full">
                  {report.status}
                </span>

                <button
                  onClick={handleExport}
                  className="p-2 rounded-lg
                  text-gray-600 hover:bg-gray-100"
                  title="Download Report"
                >
                  <Download className="w-4 h-4" />
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}