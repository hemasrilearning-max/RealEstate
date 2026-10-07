import axiosInstance from "../utils/axiosInstance";

/* ===================== DASHBOARD / ANALYTICS ===================== */

const brokerDashboard = async (brokerId) => {
  const response = await axiosInstance.get(
    `/api/broker/dashboard/stats/${brokerId}`
  );
  return response.data;
};

const brokerAnalytics = async (brokerId) => {
  if (!brokerId) throw new Error("Broker ID is required.");
  const response = await axiosInstance.get(
    `/api/broker/analytics/${brokerId}`
  );
  return response.data;
};

/* ===================== PROPERTIES ===================== */

const brokerProperties = async (brokerId) => {
  const response = await axiosInstance.get(
    `/api/broker/properties/${brokerId}`
  );
  return response.data;
};

/* ===================== CLIENTS ===================== */

const brokerClients = async (brokerId) => {
  const response = await axiosInstance.get(
    `/api/broker/clients/${brokerId}`
  );
  return response.data;
};

/* ===================== LEADS ===================== */

const brokerLeads = async (brokerId) => {
  const response = await axiosInstance.get(
    `/api/broker/leads/${brokerId}`
  );
  return response.data;
};

/* ===================== CONVERSATIONS (same idea as owner) ===================== */

/** List conversations / message requests for broker */
const brokerConversations = async (brokerId) => {
  const response = await axiosInstance.get(
    `/api/broker/conversations/${brokerId}`
  );
  return response.data;
};

const brokerPendingConversations = async (brokerId) => {
  const response = await axiosInstance.get(
    `/api/broker/conversations/${brokerId}/pending`
  );
  return response.data;
};

const acceptBrokerConversation = async (brokerId, conversationId) => {
  const response = await axiosInstance.post(
    `/api/broker/conversations/${brokerId}/${conversationId}/accept`
  );
  return response.data;
};

const rejectBrokerConversation = async (brokerId, conversationId) => {
  const response = await axiosInstance.post(
    `/api/broker/conversations/${brokerId}/${conversationId}/reject`
  );
  return response.data;
};

const brokerConversationMessages = async (brokerId, conversationId) => {
  const response = await axiosInstance.get(
    `/api/broker/conversations/${brokerId}/${conversationId}/messages`
  );
  return response.data;
};

/* ===================== MESSAGES (legacy paths still work) ===================== */

const brokerMessages = async (brokerId) => {
  const response = await axiosInstance.get(
    `/api/broker/messages/${brokerId}`
  );
  return response.data;
};

const createBrokerMessage = async (brokerId, messageData) => {
  const response = await axiosInstance.post(
    `/api/broker/messages/${brokerId}`,
    messageData
  );
  return response.data;
};

const markBrokerMessageAsRead = async (brokerId, messageId) => {
  const response = await axiosInstance.patch(
    `/api/broker/messages/${brokerId}/${messageId}/read`
  );
  return response.data;
};

const brokerMessagesByProperty = async (brokerId, propertyId) => {
  const response = await axiosInstance.get(
    `/api/broker/messages/${brokerId}/property/${propertyId}`
  );
  return response.data;
};

const brokerMessagesByConversation = async (brokerId, conversationId) => {
  const response = await axiosInstance.get(
    `/api/broker/messages/${brokerId}/conversation/${conversationId}`
  );
  return response.data;
};

const brokerMessagesByType = async (brokerId, recipientType) => {
  const response = await axiosInstance.get(
    `/api/broker/messages/${brokerId}/by-type`,
    { params: { recipientType } }
  );
  return response.data;
};

const brokerUnreadMessages = async (brokerId) => {
  const response = await axiosInstance.get(
    `/api/broker/messages/${brokerId}/unread`
  );
  return response.data;
};

/** Alias – same as brokerConversations */
const brokerMessageRequests = async (brokerId) => {
  const response = await axiosInstance.get(
    `/api/broker/conversations/${brokerId}`
  );
  return response.data;
};

const acceptBrokerMessageRequest = async (brokerId, conversationId) => {
  const response = await axiosInstance.post(
    `/api/broker/conversations/${brokerId}/${conversationId}/accept`
  );
  return response.data;
};

const rejectBrokerMessageRequest = async (brokerId, conversationId) => {
  const response = await axiosInstance.post(
    `/api/broker/conversations/${brokerId}/${conversationId}/reject`
  );
  return response.data;
};

/* ===================== TOURS ===================== */

const brokerTours = async (brokerId) => {
  const response = await axiosInstance.get(
    `/api/broker/tours/${brokerId}`
  );
  return response.data;
};

const brokerToursPaged = async (brokerId, page = 0, size = 10) => {
  const response = await axiosInstance.get(
    `/api/broker/tours/${brokerId}/paged`,
    { params: { page, size } }
  );
  return response.data;
};

const brokerPendingTours = async (brokerId) => {
  const response = await axiosInstance.get(
    `/api/broker/tours/${brokerId}/pending`
  );
  return response.data;
};

const brokerTourById = async (brokerId, tourId) => {
  const response = await axiosInstance.get(
    `/api/broker/tours/${brokerId}/${tourId}`
  );
  return response.data;
};

const createBrokerTour = async (brokerId, tourData) => {
  const response = await axiosInstance.post(
    `/api/broker/tours/${brokerId}`,
    tourData
  );
  return response.data;
};

const updateBrokerTour = async (brokerId, tourId, tourData) => {
  const response = await axiosInstance.put(
    `/api/broker/tours/${brokerId}/${tourId}`,
    tourData
  );
  return response.data;
};

const updateBrokerTourStatus = async (brokerId, tourId, status) => {
  const response = await axiosInstance.patch(
    `/api/broker/tours/${brokerId}/${tourId}/status`,
    { status }
  );
  return response.data;
};

const deleteBrokerTour = async (brokerId, tourId) => {
  const response = await axiosInstance.delete(
    `/api/broker/tours/${brokerId}/${tourId}`
  );
  return response.data;
};

/* ===================== TRANSACTIONS ===================== */

const brokerTransactions = async (brokerId) => {
  const response = await axiosInstance.get(
    `/api/broker/transactions/${brokerId}`
  );
  return response.data;
};

/* ===================== REVIEWS ===================== */

const brokerReviews = async (brokerId) => {
  const response = await axiosInstance.get(
    `/api/broker/reviews/${brokerId}`
  );
  return response.data;
};

const brokerReviewsPaged = async (brokerId, page = 0, size = 10) => {
  const response = await axiosInstance.get(
    `/api/broker/reviews/${brokerId}/paged`,
    { params: { page, size } }
  );
  return response.data;
};

const brokerReviewById = async (brokerId, reviewId) => {
  const response = await axiosInstance.get(
    `/api/broker/reviews/${brokerId}/${reviewId}`
  );
  return response.data;
};

const createBrokerReview = async (brokerId, reviewData) => {
  const response = await axiosInstance.post(
    `/api/broker/reviews/${brokerId}`,
    reviewData
  );
  return response.data;
};

const updateBrokerReviewStatus = async (brokerId, reviewId, status) => {
  const response = await axiosInstance.patch(
    `/api/broker/reviews/${brokerId}/${reviewId}/status`,
    { status }
  );
  return response.data;
};

const deleteBrokerReview = async (brokerId, reviewId) => {
  const response = await axiosInstance.delete(
    `/api/broker/reviews/${brokerId}/${reviewId}`
  );
  return response.data;
};

/* ===================== PROFILE (users APIs) ===================== */

const getBrokerProfile = async (brokerId) => {
  if (!brokerId) throw new Error("Broker ID is required.");
  const response = await axiosInstance.get(`/api/users/${brokerId}`);
  return response.data;
};

const updateBrokerProfile = async (brokerId, profileData) => {
  if (!brokerId) throw new Error("Broker ID is required.");
  const response = await axiosInstance.put(
    `/api/users/${brokerId}`,
    profileData
  );
  return response.data;
};

const getBrokerProfilePhoto = async (brokerId) => {
  if (!brokerId) throw new Error("Broker ID is required.");
  const response = await axiosInstance.get(
    `/api/users/${brokerId}/profile-photo`,
    { responseType: "blob" }
  );
  return response.data;
};

const updateBrokerProfilePhoto = async (file) => {
  if (!file) throw new Error("Please select an image.");
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post(
    "/api/users/me/profile-photo",
    formData
  );
  return response.data;
};

const getBrokerProfilePhotoUrl = (brokerId) => {
  if (!brokerId) return null;
  return `/api/users/${brokerId}/profile-photo`;
};

const deleteBrokerProfilePhoto = async (brokerId) => {
  if (!brokerId) throw new Error("Broker ID is required.");
  const response = await axiosInstance.delete(
    `/api/users/${brokerId}/profile-photo`
  );
  return response.data;
};

const changeBrokerPassword = async (currentPassword, newPassword) => {
  const response = await axiosInstance.put(
    `/api/users/me/change-password`,
    { currentPassword, newPassword }
  );
  return response.data;
};

export default {
  brokerDashboard,
  brokerAnalytics,
  brokerProperties,
  brokerClients,
  brokerLeads,

  /* Conversations (owner-style) */
  brokerConversations,
  brokerPendingConversations,
  acceptBrokerConversation,
  rejectBrokerConversation,
  brokerConversationMessages,

  /* Messages */
  brokerMessages,
  createBrokerMessage,
  markBrokerMessageAsRead,
  brokerMessagesByProperty,
  brokerMessagesByConversation,
  brokerMessagesByType,
  brokerUnreadMessages,
  brokerMessageRequests,
  acceptBrokerMessageRequest,
  rejectBrokerMessageRequest,

  /* Tours */
  brokerTours,
  brokerToursPaged,
  brokerPendingTours,
  brokerTourById,
  createBrokerTour,
  updateBrokerTour,
  updateBrokerTourStatus,
  deleteBrokerTour,

  brokerTransactions,

  /* Reviews */
  brokerReviews,
  brokerReviewsPaged,
  brokerReviewById,
  createBrokerReview,
  updateBrokerReviewStatus,
  deleteBrokerReview,

  /* Profile */
  getBrokerProfile,
  updateBrokerProfile,
  getBrokerProfilePhoto,
  updateBrokerProfilePhoto,
  getBrokerProfilePhotoUrl,
  deleteBrokerProfilePhoto,
  changeBrokerPassword,
};
