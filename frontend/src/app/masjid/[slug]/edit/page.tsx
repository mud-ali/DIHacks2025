'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import { fetchMasjidById } from "@/utils/api";

interface MasjidFormData {
  id: number;
  name: string;
  address: string;
  calculationMethod?: string;
  phone?: string;
  email?: string;
  services?: string[];
}

export default function EditMasjid() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [formData, setFormData] = useState<MasjidFormData>({
    id: 0,
    name: "",
    address: "",
    calculationMethod: "",
    phone: "",
    email: "",
    services: [],
  });

  const [serviceInput, setServiceInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [supportedCalculationMethods, setSupportedCalculationMethods] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(`/masjid/${slug}/edit`));
      return;
    }

    if (isAuthenticated && slug) {
      fetchMasjidAndCheckAdmin();
      fetchCalculationMethods();
    }
  }, [isAuthenticated, authLoading, slug, router]);

  const fetchMasjidAndCheckAdmin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchMasjidById(slug);
      const masjid = data.data[0];
      
      if (!masjid) {
        setError("Masjid not found");
        return;
      }

      // Check admin status
      try {
        const adminResponse = await api.get(`/api/masjid/${masjid.id}/admin-check`);
        const adminStatus = adminResponse.data.isAdmin || false;
        
        if (!adminStatus) {
          setError("You don't have permission to edit this masjid");
          return;
        }
        
        setIsAdmin(true);
      } catch (adminError) {
        setError("You don't have permission to edit this masjid");
        return;
      }

      // Set form data
      setFormData({
        id: masjid.id,
        name: masjid.name || "",
        address: masjid.address || "",
        calculationMethod: masjid.calculationMethod || "",
        phone: masjid.phone || "",
        email: masjid.email || "",
        services: masjid.services || [],
      });

    } catch (error) {
      console.error("Error fetching masjid details:", error);
      setError("Failed to load masjid details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCalculationMethods = async () => {
    try {
      const response = await api.get("/api/calculationmethods");
      setSupportedCalculationMethods(response.data.methods || []);
    } catch (error) {
      console.error("Failed to fetch calculation methods:", error);
      setSupportedCalculationMethods([
        "Muslim World League",
        "Islamic Society of North America",
        "Egyptian General Authority of Survey",
        "Umm Al-Qura University, Makkah",
        "University of Islamic Sciences, Karachi"
      ]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "id" ? parseFloat(value) || 0 : value,
    }));
  };

  const addService = () => {
    if (serviceInput.trim() && !formData.services?.includes(serviceInput.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...(prev.services || []), serviceInput.trim()]
      }));
      setServiceInput("");
    }
  };

  const removeService = (serviceToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services?.filter(service => service !== serviceToRemove) || []
    }));
  };

  const handleServiceKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addService();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await api.put(`/api/masjid/${formData.id}`, formData);
      setMessage({ type: "success", text: "Masjid updated successfully!" });
      
      // Redirect back to masjid detail page after a short delay
      setTimeout(() => {
        router.push(`/masjid/${slug}`);
      }, 2000);
      
    } catch (error) {
      console.error("Error updating masjid:", error);
      setMessage({
        type: "error",
        text: "Failed to update masjid. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading if auth is still loading
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <span className="text-slate-300">Loading...</span>
        </div>
      </div>
    );
  }

  // Show error if not authenticated or not admin
  if (!isAuthenticated || error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <Header />
        <BackButton href={`/masjid/${slug}`} label="Back to Masjid" />

        <div className="max-w-2xl mx-auto text-center mt-20">
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-red-300 mb-4">Access Denied</h1>
            <p className="text-red-200 mb-6">{error || "You don't have permission to edit this masjid."}</p>
            <button
              onClick={() => router.push(`/masjid/${slug}`)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
            >
              Back to Masjid
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <Header />
      <BackButton href={`/masjid/${slug}`} label="Back to Masjid" />

      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Edit Masjid
          </h1>
          <p className="text-slate-300 text-center mb-8">
            Update your masjid information
          </p>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-900/50 border border-green-700 text-green-300"
                  : "bg-red-900/50 border border-red-700 text-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-slate-700/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Masjid Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-400 transition-all"
                    placeholder="Enter masjid name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-400 transition-all"
                    placeholder="Enter full address"
                  />
                </div>

                <div>
                  <label
                    htmlFor="calculationMethod"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Prayer Calculation Method
                  </label>
                  <select
                    id="calculationMethod"
                    name="calculationMethod"
                    value={formData.calculationMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white transition-all"
                  >
                    <option value="">Select calculation method</option>
                    {supportedCalculationMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-slate-700/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">Contact Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-400 transition-all"
                    placeholder="e.g., +1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-400 transition-all"
                    placeholder="e.g., info@masjid.com"
                  />
                </div>
              </div>
            </div>

            {/* Services & Facilities Section */}
            <div className="bg-slate-700/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">Services & Facilities</h2>
              
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="serviceInput"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Add Services/Facilities
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="serviceInput"
                      value={serviceInput}
                      onChange={(e) => setServiceInput(e.target.value)}
                      onKeyPress={handleServiceKeyPress}
                      className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-400 transition-all"
                      placeholder="e.g., Prayer Hall, Parking, Wudu Facilities"
                    />
                    <button
                      type="button"
                      onClick={addService}
                      className="px-4 py-3 bg-emerald-600/50 hover:bg-emerald-600 border border-emerald-500 rounded-lg transition-all text-emerald-300 hover:text-white"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {formData.services && formData.services.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Current Services:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.services.map((service, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600/20 border border-emerald-600/30 rounded-full text-emerald-300 text-sm"
                        >
                          {service}
                          <button
                            type="button"
                            onClick={() => removeService(service)}
                            className="text-emerald-400 hover:text-red-400 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push(`/masjid/${slug}`)}
                className="flex-1 px-6 py-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
              >
                {isSaving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Saving Changes...
                  </div>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
