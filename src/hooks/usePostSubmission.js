// usePostSubmission.js
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";

export function usePostSubmission() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const handleBusinessCreationSuccess = async (businessData) => {
    console.log('Starting business creation success handler');
    
    try {
      // 1. Prepare updated user data
      const updatedUser = {
        ...user,
        hasBusiness: true,
        business: businessData,
        owned_businesses: [...(user.owned_businesses || []), businessData]
      };
      console.log('Updated user data:', updatedUser);

      // 2. Update context
      console.log('Updating user context...');
      await updateUser(updatedUser);
      
      // 3. Verify localStorage
      const storedUser = JSON.parse(localStorage.getItem("user"));
      console.log('LocalStorage user:', storedUser);

      // 4. Navigate with state
      console.log('Navigating to dashboard...');
      navigate('/dashboard', {
        replace: true,
        state: { 
          fromBusinessCreation: true,
          timestamp: Date.now() // Ensures fresh render
        }
      });

    } catch (error) {
      console.error('Post-submission error:', error);
      // Fallback to simple navigation if something fails
      navigate('/dashboard', { replace: true });
    }
  };

  return { handleBusinessCreationSuccess };
}