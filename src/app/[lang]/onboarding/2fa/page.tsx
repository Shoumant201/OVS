"use client";

import { useState } from "react";
import { ShieldCheck, Mail, Ban } from "lucide-react";
import ENDPOINTS from "@/services/Endpoints";
import axiosInstance from "@/services/axiosInstance";
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";

export default function TwoFAPage() {
  const [loading, setLoading] = useState("false");
  
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);


// ...

const handleSubmit = async () => {



    const token = Cookies.get("token") as string;
    const decoded = jwtDecode<{id: string }>(token);
    const user_id = decoded?.id;


  if (!user_id) {
    return;
  }

  try {
    await axiosInstance.post(ENDPOINTS.AUTH.SETUP_2FA, {
      user_id,
      is_2faenabled: is2FAEnabled,
    });

    await axiosInstance.post(ENDPOINTS.AUTH.ENABLE_ONBOARDING, {
      user_id,
      onboarding: true,
    });
    Cookies.remove("token");
    window.location.href = "/login";
  } catch (err) {
    console.error("2FA setup failed", err);
  }
};


  return (
    <div className="max-w-md mx-auto py-12 px-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-gray-200">
        <div className="text-center">
          <ShieldCheck className="mx-auto text-[#26C6B0]" size={40} />
          <h2 className="text-2xl font-bold mt-2">
            Secure Your Voting Access
          </h2>
          <p className="text-gray-600 mt-1 text-sm">
            Choose how you'd like to receive your one-time verification codes.
          </p>
        </div>

        <div className="space-y-4">
          <label
            htmlFor="email"
            className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition hover:border-[#26C6B0] ${
                is2FAEnabled === true ? "border-[#26C6B0] bg-purple-50" : "border-gray-300"
            }`}
          >
            <input
              type="radio"
              id="email"
              name="2fa"
              value="true"
              checked={is2FAEnabled === true}
              onChange={() => setIs2FAEnabled(true)}
              className="hidden"
            />
            <Mail className="text-[#26C6B0]" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-gray-500">
                Get codes delivered to your email.
              </p>
            </div>
          </label>

          <label
            htmlFor="none"
            className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition hover:border-gray-400 ${
                is2FAEnabled === false ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          >
            <input
              type="radio"
              id="none"
              name="2fa"
              value="false"
              checked={is2FAEnabled === false}
              onChange={() => setIs2FAEnabled(false)}
              className="hidden"
            />
            <Ban className="text-red-500" />
            <div>
              <p className="font-medium text-red-600">No 2FA</p>
              <p className="text-sm text-gray-500">
                Not recommended – your account may be less secure.
              </p>
            </div>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-[#26C6B0] hover:bg-purple-600 transition text-white py-3 rounded-xl font-semibold"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
