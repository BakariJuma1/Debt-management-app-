// usePostSubmission.js
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";

export function usePostSubmission() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();


  const handleBusinessCreationSuccess = async (businessData, shouldRedirect = true) => {
    console.log('Starting business creation success handler');
    
    try {
      const updatedUser = {
        ...user,
        hasBusiness: true,
        business: businessData,
        owned_businesses: [...(user.owned_businesses || []), businessData]
      };
      console.log('Updated user data:', updatedUser);

      await updateUser(updatedUser);

      const storedUser = JSON.parse(localStorage.getItem("user"));
      console.log('LocalStorage user:', storedUser);

      // Only redirect if shouldRedirect is true
      if (shouldRedirect) {
        console.log('Navigating to dashboard...');
        navigate('/dashboard', {
          replace: true,
          state: { 
            fromBusinessCreation: true,
            timestamp: Date.now()
          }
        });
      }

    } catch (error) {
      console.error('Post-submission error:', error);
      if (shouldRedirect) {
        navigate('/dashboard', { replace: true });
      }
    }
  };

  return { handleBusinessCreationSuccess };
}