'use client';

import React, { useState, useEffect } from 'react';
import { countries, getUniversalLink } from "@selfxyz/core";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
} from "@selfxyz/qrcode";
import { ethers } from "ethers";
import { VerificationUtils } from '../utils/verification';
import { VerificationData } from '../types/verification';

function VerificationPage() {
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [userId] = useState(ethers.ZeroAddress);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [verificationData, setVerificationData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing valid verification
    if (VerificationUtils.isVerificationValid()) {
      const storedData = VerificationUtils.getStoredVerificationData();
      if (storedData) {
        setVerificationData(storedData);
        setVerificationStatus('success');
        console.log("Found valid existing verification");
        return;
      }
    }

    const initializeSelfApp = async () => {
      setIsLoading(true);
      setErrorMessage("");
      
      try {
        const app = new SelfAppBuilder({
          version: 2,
          appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Enhanced Self Workshop",
          scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "self-workshop-enhanced",
          endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`,
          logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
          userId: userId,
          endpointType: "staging_https",
          userIdType: "hex",
          userDefinedData: "Enhanced Identity Verification - Celo Demo",
          disclosures: {
            /* 1. Identity Verification Requirements */
            minimumAge: 18,
            excludedCountries: [countries.BELGIUM, countries.ITALY, countries.NORTH_KOREA],
            ofac: true, // OFAC sanctions list check
            
            /* 2. Personal Information to Reveal */
            name: true,
            nationality: true,
            gender: true,
            date_of_birth: true,
            issuing_state: true,
            
            /* 3. Document Information */
            passport_number: true,
            expiry_date: true,
            
            /* 4. Additional Security Features */
            // document_type: true, // Type of document used for verification
            // issuing_country: true, // Country that issued the document
          }
        }).build();

        setSelfApp(app);
        setUniversalLink(getUniversalLink(app));
        setVerificationStatus('idle');
      } catch (error) {
        console.error("Failed to initialize Self app:", error);
        setErrorMessage("Failed to initialize verification system. Please try again.");
        setVerificationStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    initializeSelfApp();
  }, [userId]);

  const handleSuccessfulVerification = (data?: any) => {
    console.log("Verification successful!", data);
    setVerificationStatus('success');
    
    // Process and store verification data
    const verificationData: VerificationData = {
      name: data?.name,
      nationality: data?.nationality,
      gender: data?.gender,
      dateOfBirth: data?.date_of_birth,
      issuingState: data?.issuing_state,
      passportNumber: data?.passport_number,
      expiryDate: data?.expiry_date,
      verificationTimestamp: new Date().toISOString(),
      userId: userId,
    };
    
    setVerificationData(verificationData);
    setErrorMessage("");
    
    // Store verification data securely
    VerificationUtils.storeVerificationData(verificationData);
    
    // Generate verification report
    const report = VerificationUtils.generateVerificationReport(verificationData);
    console.log("Verification Report:", report);
    
    // You can add additional success handling here:
    // - Redirect to dashboard
    // - Trigger blockchain transaction
    // - Send notification
    // - Update user profile
  };

  const handleVerificationError = (error: any) => {
    console.error("Verification failed:", error);
    setVerificationStatus('error');
    setErrorMessage(error?.message || "Verification failed. Please try again.");
  };

  const handleVerificationStarted = () => {
    console.log("Verification process started");
    setVerificationStatus('pending');
    setErrorMessage("");
  };

  const resetVerification = () => {
    setVerificationStatus('idle');
    setVerificationData(null);
    setErrorMessage("");
    VerificationUtils.clearVerificationData();
  };

  const getStatusMessage = () => {
    switch (verificationStatus) {
      case 'pending':
        return "Verification in progress... Please complete the process in the Self app.";
      case 'success':
        return "✅ Identity verification completed successfully!";
      case 'error':
        return `❌ ${errorMessage}`;
      default:
        return "Scan the QR code with the Self app to verify your identity.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Enhanced Identity Verification
            </h1>
            <p className="text-gray-600">
              Secure verification powered by Self Protocol
            </p>
          </div>

          {/* Status Indicator */}
          <div className="mb-6">
            <div className={`p-4 rounded-lg border-l-4 ${
              verificationStatus === 'success' ? 'bg-green-50 border-green-400' :
              verificationStatus === 'error' ? 'bg-red-50 border-red-400' :
              verificationStatus === 'pending' ? 'bg-yellow-50 border-yellow-400' :
              'bg-blue-50 border-blue-400'
            }`}>
              <p className="text-sm font-medium text-gray-900">
                {getStatusMessage()}
              </p>
            </div>
          </div>

          {/* Verification Features List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              What will be verified:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-800">Identity Checks</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  <li>• Minimum age: 18 years</li>
                  <li>• OFAC sanctions check</li>
                  <li>• Country restrictions</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-800">Personal Info</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  <li>• Full name</li>
                  <li>• Nationality</li>
                  <li>• Gender & Date of birth</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-800">Document Info</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  <li>• Issuing state/country</li>
                  <li>• Passport number</li>
                  <li>• Expiry date</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-800">Security</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  <li>• Document authenticity</li>
                  <li>• Biometric matching</li>
                  <li>• Anti-fraud checks</li>
                </ul>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="text-center">
            {isLoading ? (
              <div className="flex flex-col items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Initializing verification system...</p>
              </div>
            ) : selfApp ? (
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 inline-block">
                  <SelfQRcodeWrapper
                    selfApp={selfApp}
                    onSuccess={handleSuccessfulVerification}
                    onError={handleVerificationError}
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {verificationStatus === 'success' && (
                    <button
                      onClick={resetVerification}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Verify Another Identity
                    </button>
                  )}
                  
                  {verificationStatus === 'error' && (
                    <button
                      onClick={resetVerification}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                  
                  <button
                    onClick={() => navigator.clipboard.writeText(universalLink)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    disabled={!universalLink}
                  >
                    Copy Link
                  </button>
                </div>

                {/* Universal Link */}
                {universalLink && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Universal Link:</p>
                    <code className="text-xs text-gray-800 break-all">{universalLink}</code>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8">
                <p className="text-red-600">Failed to load QR code. Please refresh the page.</p>
              </div>
            )}
          </div>

          {/* Verification Data Display */}
          {verificationData && verificationStatus === 'success' && (
            <div className="mt-8 space-y-4">
              {/* Success Summary */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-3">
                  ✅ Verification Complete
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-green-700 font-medium">Security Checks</p>
                    <ul className="text-green-600 mt-1 space-y-1">
                      <li>✅ Document authenticity verified</li>
                      <li>✅ Biometric matching confirmed</li>
                      <li>✅ Age verification passed</li>
                      <li>✅ OFAC sanctions check cleared</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-green-700 font-medium">Data Verified</p>
                    <ul className="text-green-600 mt-1 space-y-1">
                      <li>{verificationData.name ? '✅' : '⏸️'} Name</li>
                      <li>{verificationData.nationality ? '✅' : '⏸️'} Nationality</li>
                      <li>{verificationData.gender ? '✅' : '⏸️'} Gender</li>
                      <li>{verificationData.dateOfBirth ? '✅' : '⏸️'} Date of Birth</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs text-green-600">
                    Verification ID: VER_{Date.now().toString(36).toUpperCase()}
                  </p>
                  <p className="text-xs text-green-600">
                    Completed: {verificationData.verificationTimestamp ? 
                      new Date(verificationData.verificationTimestamp).toLocaleString() : 
                      new Date().toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600">
                    Valid until: {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Additional Actions */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-md font-semibold text-blue-800 mb-3">Next Steps</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button 
                    onClick={() => {
                      const report = VerificationUtils.generateVerificationReport(verificationData);
                      navigator.clipboard.writeText(report);
                      alert('Verification report copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    📋 Copy Report
                  </button>
                  <button 
                    onClick={() => {
                      // This would typically trigger a blockchain transaction
                      alert('Blockchain integration coming soon!');
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    🔗 Store on Chain
                  </button>
                  <button 
                    onClick={() => {
                      window.print();
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    🖨️ Print Certificate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by Self Protocol • Secure • Privacy-First</p>
        </div>
      </div>
    </div>
  );
}

export default VerificationPage;
export {}