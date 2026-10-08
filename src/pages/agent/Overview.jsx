import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import brokerService from "../../services/brokerService";

const Overview = () => {
    const { agent } = useAuth();

    const [dashboardData, setDashboardData] = useState({
        totalProperties: 0,
        activeLeads: 0,
        unreadMessages: 0,
        pendingTours: 0,
        totalViews: 0,
        closedDeals: 0,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        setError("");

        /* ==============================
           Get current logged-in user
        ============================== */

        const storedUser = localStorage.getItem("authUser");
        const token = localStorage.getItem("accessToken");

        //console.log(localStorage.getItem("accessToken"));

        //console.log(localStorage.getItem("authUser"));

        //console.log(storedUser.userId);
        

        const user = storedUser ? JSON.parse(storedUser) : null;

        // const brokerId = user?.id;

        //console.log("Broker ID:", brokerId);

        if (!token) {
            setError("You are not logged in. Please login again.");
            return;
        }

        let currentUser = agent;

        /*
         * If AuthContext does not contain the user yet,
         * get the current logged-in user from localStorage.
         */
        if (!currentUser && storedUser) {
            try {
                currentUser = JSON.parse(storedUser);
            } catch (parseError) {
                console.error(
                    "Unable to parse logged-in user:",
                    parseError
                );
            }
        }

        /* ==============================
           Get broker ID dynamically
        ============================== */

        const brokerId =
            user?.id ||
            user?.userId;

        if (!brokerId) {
            setError(
                "Broker information is not available. Please login again."
            );
            return;
        }

        setLoading(true);

        try {

            /*
             * The token is NOT manually passed here.
             *
             * axiosInstance automatically gets:
             *
             * localStorage.getItem("token")
             *
             * and sends:
             *
             * Authorization: Bearer <current-token>
             */

            const response =
                await brokerService.brokerDashboard(brokerId);

            const data = response?.data || {};
               console.log("overview======" + data);
            setDashboardData({
                totalProperties:
                    data.totalProperties ?? 0,

                activeLeads:
                    data.activeLeads ?? 0,

                unreadMessages:
                    data.unreadMessages ?? 0,

                pendingTours:
                    data.pendingTours ?? 0,

                totalViews:
                    data.totalViews ?? 0,

                closedDeals:
                    data.closedDeals ?? 0,
            });

        } catch (err) {

            console.error(
                "Failed to load broker dashboard:",
                err
            );

            const message =
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Failed to load broker dashboard.";

            setError(message);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, [agent?.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    <p className="font-semibold">
                        Failed to load dashboard
                    </p>

                    <p className="mt-1 text-sm">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={loadDashboard}
                        className="mt-3 rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">

            <h1 className="mb-6 text-2xl font-bold">
                Dashboard
            </h1>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

                <div className="rounded-lg bg-white p-5 shadow">
                    <p className="text-sm text-gray-500">
                        Total Properties
                    </p>

                    <h2 className="mt-2 text-3xl font-bold">
                        {dashboardData.totalProperties}
                    </h2>
                </div>

                <div className="rounded-lg bg-white p-5 shadow">
                    <p className="text-sm text-gray-500">
                        Active Leads
                    </p>

                    <h2 className="mt-2 text-3xl font-bold">
                        {dashboardData.activeLeads}
                    </h2>
                </div>

                <div className="rounded-lg bg-white p-5 shadow">
                    <p className="text-sm text-gray-500">
                        Unread Messages
                    </p>

                    <h2 className="mt-2 text-3xl font-bold">
                        {dashboardData.unreadMessages}
                    </h2>
                </div>

                <div className="rounded-lg bg-white p-5 shadow">
                    <p className="text-sm text-gray-500">
                        Pending Tours
                    </p>

                    <h2 className="mt-2 text-3xl font-bold">
                        {dashboardData.pendingTours}
                    </h2>
                </div>

                <div className="rounded-lg bg-white p-5 shadow">
                    <p className="text-sm text-gray-500">
                        Total Views
                    </p>

                    <h2 className="mt-2 text-3xl font-bold">
                        {dashboardData.totalViews}
                    </h2>
                </div>

                <div className="rounded-lg bg-white p-5 shadow">
                    <p className="text-sm text-gray-500">
                        Closed Deals
                    </p>

                    <h2 className="mt-2 text-3xl font-bold">
                        {dashboardData.closedDeals}
                    </h2>
                </div>

            </div>
        </div>
    );
};

export default Overview;

