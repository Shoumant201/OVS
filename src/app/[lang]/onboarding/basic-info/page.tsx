"use client";

import { useState } from "react";
import axiosInstance from "@/services/axiosInstance";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import ENDPOINTS from "@/services/Endpoints";

export default function BasicInfoPage() {
  const token = Cookies.get("token") as string;
  const decoded = jwtDecode<{ email: string, id: string }>(token);

  const [form, setForm] = useState({
    user_id: decoded.id,
    fullName: "",
    email: decoded.email,
    phone: "",
    dob: "",
    gender: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
    ethnicity: "",
    occupation: "",
    education: "",
    profileImage: "",
  });

  const [uploading, setUploading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/api/upload", formData);
      setForm({ ...form, profileImage: res.data.url });
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    const payload = {
        user_id: form.user_id,
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        dob: form.dob,
        gender: form.gender,
        country: form.country,
        state: form.state,
        city: form.city,
        postal_code: form.postalCode,
        ethnicity: form.ethnicity,
        occupation: form.occupation,
        education: form.education,
        profile_image: form.profileImage,
      };
    try {
      await axiosInstance.post(ENDPOINTS.AUTH.CREATE_USERPROFILE, payload);
      window.location.href = "/onboarding/2fa";
    } catch (err) {
      console.error("Failed to save info", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h2 className="text-3xl font-bold mb-6 text-center">🧍 Basic User Info</h2>

      <div className="flex flex-col items-center mb-6">
        {form.profileImage ? (
          <img
            src={form.profileImage}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover shadow-md"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          aria-label="image"
          onChange={handleImageUpload}
          className="mt-3"
        />
        {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <input name="fullName" placeholder="Full Name" onChange={handleChange} className="border p-3 rounded" />
        <input name="email" title="email" value={form.email} readOnly className="border p-3 rounded bg-gray-100 text-gray-500" />
        <input name="phone" placeholder="Phone Number" onChange={handleChange} className="border p-3 rounded" />
        <input name="dob" aria-label="DOB" type="date" onChange={handleChange} className="border p-3 rounded" />
        
        <select name="gender" title="Gender" onChange={handleChange} className="border p-3 rounded">
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <input name="country" placeholder="Country" onChange={handleChange} className="border p-3 rounded" />
        <input name="state" placeholder="State/Province/Region" onChange={handleChange} className="border p-3 rounded" />
        <input name="city" placeholder="City" onChange={handleChange} className="border p-3 rounded" />
        <input name="postalCode" placeholder="Postal Code" onChange={handleChange} className="border p-3 rounded" />
        <input name="ethnicity" placeholder="Ethnicity" onChange={handleChange} className="border p-3 rounded" />
        <select name="occupation" title="occupation" onChange={handleChange} className="w-full border p-2" value={form.occupation}>
            <option value="">Select Occupation</option>
            <option value="Student">Student</option>
            <option value="Employed - Full Time">Employed - Full Time</option>
            <option value="Employed - Part Time">Employed - Part Time</option>
            <option value="Self-Employed">Self-Employed</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Retired">Retired</option>
            <option value="Homemaker">Homemaker</option>
            <option value="Freelancer">Freelancer</option>
            <option value="Other">Other</option>
        </select>

        <select name="education" title="education" onChange={handleChange} className="w-full border p-2" value={form.education}>
            <option value="">Select Education Level</option>
            <option value="No Formal Education">No Formal Education</option>
            <option value="Primary School">Primary School</option>
            <option value="Secondary School">Secondary School</option>
            <option value="High School Diploma">High School Diploma</option>
            <option value="Associate Degree">Associate Degree</option>
            <option value="Bachelor’s Degree">Bachelor’s Degree</option>
            <option value="Master’s Degree">Master’s Degree</option>
            <option value="Doctorate (PhD)">Doctorate (PhD)</option>
            <option value="Other">Other</option>
        </select>

      </div>

      <button
        onClick={handleSubmit}
        className="w-full mt-6 bg-[#26C6B0] text-white py-3 rounded font-medium hover:bg-purple-600 transition"
      >
        Continue
      </button>
    </div>
  );
}
