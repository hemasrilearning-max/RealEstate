import axiosInstance from "../utils/axiosInstance";

const login = async (loginData) => {

    const response = await axiosInstance.post(
        "/api/auth/login",
        loginData
    );

    return response.data;
};

const register = async (registerData) => {
console.log("Sending registration:", registerData);
    const response = await axiosInstance.post(
        "/api/users",
        registerData
    );

    return response.data;
};



const sendOtp = async (email,name) => {

    const response = await axiosInstance.post(
        "/api/auth/generate-otp",
        {
           "email" : email,
            "recipientName": name,
            "purpose":"REGISTRATION"
        }
    );

    return response.data;
};



const verifyOtp = async (email, otp) => {
  
    const response = await axiosInstance.post(
        "/api/auth/verify-otp",
        {
            "email":email,
            "otp": otp,
            "purpose": "REGISTRATION"
        }
    );

    return response.data;
};

const passwordVerifyOtp = async (email, otp) => {
   
    const response = await axiosInstance.post(
        "/api/auth/verify-otp",
        {
            "email":email,
            "otp": otp,
            "purpose": "PASSWORD_RESET"
        }
    );

    return response.data;
};

const checkEmail = async (email) => {

    const response = await axiosInstance.post(
        "/api/auth/check-email",
        {
            email,
        }
    );

    return response.data;
};

// const resetPassword = async(email,otp,newPassword) => {

//     const response = await axiosInstance.post("/api/auth/reset-password", 
//         {
//            "email": email,
//             "otp": otp,
//             "newPassword": newPassword,
//         }
//     );

// };

const resetPassword = async(email,newPassword) => {
    
    const response = await axiosInstance.post("/api/auth/reset-password", 
        {
           
            "email" : email,
            "newPassword": newPassword,
        }
    );

};

const forgotPassword = async(email) => {

    const response = await axiosInstance.post("/api/auth/forgot-password", 
        {
           "email": email
           
        }
    );

};


export default {
    login,
    register,
    sendOtp,
    verifyOtp,
    checkEmail,
    forgotPassword,
    resetPassword,
    passwordVerifyOtp,
};
