import { useState, useEffect, useCallback } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import JSZip from "jszip";

const GOOGLE_CLIENT_ID =
  "772781954408-rrb2duvl9e512a1ba6fbhjvjo9vhqj30.apps.googleusercontent.com";

const GOOGLE_API_KEY = "AIzaSyC38M52oH2yCkQjKF7PLlSC9jk3xpOGsPg";

// Google Drive API scopes needed
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";

interface GoogleDriveIntegrationProps {
  onFileLoaded: (content: string, filename: string) => void;
  onCancel: () => void;
}

function GoogleDriveIntegrationContent({
  onFileLoaded,
  onCancel,
}: GoogleDriveIntegrationProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isPickerLoaded, setIsPickerLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoAuthenticating, setIsAutoAuthenticating] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Fetch user info from Google
  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const email = data.email;
        setUserEmail(email);
        localStorage.setItem("googleDriveUserEmail", email);
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  };

  // Save token to localStorage
  const saveToken = (token: string, expiresIn: number) => {
    localStorage.setItem("googleDriveAccessToken", token);
    const expiryTime = Date.now() + expiresIn * 1000;
    localStorage.setItem("googleDriveTokenExpiry", expiryTime.toString());
    // Store that user has previously authenticated
    localStorage.setItem("googleDriveHasAuthenticated", "true");
    setAccessToken(token);
    // Fetch user info
    fetchUserInfo(token);
  };

  // Check if token is expired or about to expire (within 5 minutes)
  const isTokenExpired = (expiryTime: number): boolean => {
    return expiryTime <= Date.now() + 5 * 60 * 1000;
  };

  // Load Google Picker API
  useEffect(() => {
    const loadPickerApi = () => {
      gapi.load("picker", () => {
        setIsPickerLoaded(true);
      });
    };

    // Load gapi script if not already loaded
    if (typeof gapi === "undefined") {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = loadPickerApi;
      document.body.appendChild(script);
    } else {
      loadPickerApi();
    }
  }, []);

  // Manual login (user clicks button)
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      saveToken(tokenResponse.access_token, tokenResponse.expires_in || 3600);
      setIsAutoAuthenticating(false);
    },
    onError: (error) => {
      console.error("Login failed:", error);
      setIsAutoAuthenticating(false);
      if (!isAutoAuthenticating) {
        alert("Login failed. Please try again.");
      }
    },
    scope: SCOPES,
  });

  // Silent login handler
  const handleSilentAuth = useCallback((tokenResponse: any) => {
    saveToken(tokenResponse.access_token, tokenResponse.expires_in || 3600);
    setIsAutoAuthenticating(false);
  }, []);

  const handleSilentAuthError = useCallback((error: any) => {
    console.error("Silent authentication failed:", error);
    setIsAutoAuthenticating(false);
    // Clear stored tokens if silent auth fails
    localStorage.removeItem("googleDriveAccessToken");
    localStorage.removeItem("googleDriveTokenExpiry");
    setAccessToken(null);
  }, []);

  // Silent login (automatic re-authentication)
  const silentLogin = useGoogleLogin({
    onSuccess: handleSilentAuth,
    onError: handleSilentAuthError,
    scope: SCOPES,
    prompt: "", // Empty prompt allows silent re-authentication if user is signed in to Google
  });

  // Auto-authenticate on mount if user was previously signed in
  useEffect(() => {
    const savedToken = localStorage.getItem("googleDriveAccessToken");
    const tokenExpiry = localStorage.getItem("googleDriveTokenExpiry");
    const hasAuthenticated = localStorage.getItem(
      "googleDriveHasAuthenticated"
    );
    const savedEmail = localStorage.getItem("googleDriveUserEmail");

    if (savedToken && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry, 10);

      if (!isTokenExpired(expiryTime)) {
        // Token is still valid
        setAccessToken(savedToken);
        // Restore saved email
        if (savedEmail) {
          setUserEmail(savedEmail);
        }
      } else if (hasAuthenticated === "true") {
        // Token expired but user was previously authenticated, try silent login
        setIsAutoAuthenticating(true);
        silentLogin();
      } else {
        // Clear expired token
        localStorage.removeItem("googleDriveAccessToken");
        localStorage.removeItem("googleDriveTokenExpiry");
      }
    } else if (hasAuthenticated === "true") {
      // User was previously authenticated but no token, try silent login
      setIsAutoAuthenticating(true);
      silentLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up automatic token refresh before expiry
  useEffect(() => {
    if (!accessToken) return;

    const tokenExpiry = localStorage.getItem("googleDriveTokenExpiry");
    if (!tokenExpiry) return;

    const expiryTime = parseInt(tokenExpiry, 10);
    const timeUntilExpiry = expiryTime - Date.now();

    // Refresh token 5 minutes before it expires
    const refreshTime = timeUntilExpiry - 5 * 60 * 1000;

    if (refreshTime > 0) {
      const refreshTimer = setTimeout(() => {
        setIsAutoAuthenticating(true);
        silentLogin();
      }, refreshTime);

      return () => clearTimeout(refreshTimer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const downloadFile = async (fileId: string, fileName: string) => {
    if (!accessToken) return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download file from Google Drive");
      }

      const blob = await response.blob();

      // Check if it's a ZIP file
      if (fileName.toLowerCase().endsWith(".zip")) {
        await extractPurchaseHistoryFromZip(blob);
      } else if (fileName.toLowerCase().endsWith(".json")) {
        const text = await blob.text();
        onFileLoaded(text, fileName);
      } else {
        alert("Please select either a JSON file or a ZIP file.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file from Google Drive. Please try again.");
      setIsProcessing(false);
    }
  };

  const extractPurchaseHistoryFromZip = async (blob: Blob) => {
    try {
      const zip = await JSZip.loadAsync(blob);

      // Search for Purchase History.json in the ZIP
      let purchaseHistoryFile = null;

      // Try common paths
      const possiblePaths = [
        "Purchase History.json",
        "Takeout/Google Play Store/Purchase History.json",
        "Google Play Store/Purchase History.json",
      ];

      for (const path of possiblePaths) {
        if (zip.files[path]) {
          purchaseHistoryFile = zip.files[path];
          break;
        }
      }

      // If not found in common paths, search all files
      if (!purchaseHistoryFile) {
        for (const [filename, file] of Object.entries(zip.files)) {
          if (
            filename.toLowerCase().endsWith("purchase history.json") &&
            !file.dir
          ) {
            purchaseHistoryFile = file;
            break;
          }
        }
      }

      if (purchaseHistoryFile) {
        const content = await purchaseHistoryFile.async("text");
        onFileLoaded(content, purchaseHistoryFile.name);
      } else if (Object.keys(zip.files).includes("archive_browser.html")) {
        alert(
          "Your selected ZIP file appears to contain `archive_browser.html`. Please select the other ZIP file with a similar name that contains your Purchase History."
        );
        setIsProcessing(false);
      } else {
        alert("Could not find Purchase History.json in the ZIP file.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error extracting ZIP:", error);
      alert("Failed to extract Purchase History.json from ZIP file.");
      setIsProcessing(false);
    }
  };

  const openPicker = () => {
    if (!isPickerLoaded || !accessToken) return;

    // Get the last browsed folder from localStorage
    const lastFolderId = localStorage.getItem("googleDriveLastFolderId");

    // Create a view that shows ALL files (no MIME type restriction)
    const allFilesView = new google.picker.DocsView().setIncludeFolders(true);

    // If we have a saved folder, set it as the initial location
    if (lastFolderId) {
      allFilesView.setParent(lastFolderId);
    }

    const picker = new google.picker.PickerBuilder()
      .addView(allFilesView)
      .setOAuthToken(accessToken)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setTitle("Select Purchase History.json or Takeout ZIP")
      .setCallback((data: google.picker.ResponseObject) => {
        if (data.action === google.picker.Action.PICKED) {
          const file = data.docs[0];

          // Save the parent folder ID for next time
          if (file.parentId) {
            localStorage.setItem("googleDriveLastFolderId", file.parentId);
          }

          downloadFile(file.id, file.name);
        }
      })
      .build();

    picker.setVisible(true);
  };

  const logout = () => {
    setAccessToken(null);
    setUserEmail(null);
    localStorage.removeItem("googleDriveAccessToken");
    localStorage.removeItem("googleDriveTokenExpiry");
    localStorage.removeItem("googleDriveHasAuthenticated");
    localStorage.removeItem("googleDriveLastFolderId");
    localStorage.removeItem("googleDriveUserEmail");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card bg-base-200 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Google Drive Integration</h2>

          {isAutoAuthenticating ? (
            <div className="flex flex-col items-center py-8">
              <span className="loading loading-spinner loading-lg mb-4"></span>
              <p className="text-center">Authenticating with Google...</p>
            </div>
          ) : !accessToken ? (
            <>
              <p className="mb-4">
                Sign in with Google to access your Google Drive and select your
                Purchase History file from Google Takeout.
              </p>
              <p className="text-sm text-base-content/70 mb-4">
                Stay signed in to Google for automatic re-authentication.
              </p>
              <div className="card-actions justify-center">
                <button onClick={() => login()} className="btn btn-primary">
                  Sign in with Google
                </button>
              </div>
            </>
          ) : (
            <>
              {userEmail && (
                <div className="alert alert-success mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Signed in as {userEmail}</span>
                </div>
              )}
              <p className="mb-4">
                Click below to browse your Google Drive and select either:
              </p>
              <ul className="list-disc list-inside mb-4 text-sm">
                <li>Purchase History.json file</li>
                <li>Google Takeout ZIP file</li>
              </ul>
              <div className="card-actions justify-center gap-2">
                <button
                  onClick={openPicker}
                  className="btn btn-primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Processing...
                    </>
                  ) : (
                    "Browse Google Drive"
                  )}
                </button>
                <button
                  onClick={logout}
                  className="btn btn-ghost"
                  disabled={isProcessing}
                >
                  Sign Out
                </button>
              </div>
            </>
          )}

          <div className="card-actions justify-center mt-4">
            <button
              onClick={onCancel}
              className="btn btn-ghost"
              disabled={isProcessing}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GoogleDriveIntegration(
  props: GoogleDriveIntegrationProps
) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleDriveIntegrationContent {...props} />
    </GoogleOAuthProvider>
  );
}
