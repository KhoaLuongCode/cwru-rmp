# CSDS 393 CWRU-RMP


### Basic Intro
CWRU-RMP (Case Western Reserve University Rate My Professor) is a full-stack web application designed to help CWRU students evaluate and select professors based on peer feedback.


### Basic Instructions

**Setup the Application:**
   - Clone the repository and navigate to the project directory.
   - Run `npm install` to install the necessary dependencies.
   - Ensure you have proper credentials for the Supabase URL and API key (should be included already).
   - RUN `npm start` to start the application.

The app requires users to be logged in. Follow these steps to get started:

1. **Log-In and Sign-Up:**  
   - Use the **Log-In** link to sign in or sign up.  
   - You can sign up with your email, but note that emails might not be sent promptly due to limitations:  
     - Requires a 10-minute gap between emails.  
     - A maximum of 2 emails can be sent per hour.  
   - If the email system is not working, you can use this test account:  
     - **Email:** txl790@case.edu  
     - **Password:** 12345678  

2. **Account Limitations:**  
   - Only one user can be logged into the same account at a time.  
   - If multiple users log in to the same account, a bug may prevent logging out.  
   - The **Logout** button is located at the end of the profile page.  

3. **Submitting Feedback:**  
   - Use the **Submit** link to provide feedback for a professor.  

4. **Searching for Professors or Courses:**  
   - Use the **Search** link to search by professor or course.  
   - There’s a button to the left of the search bar to toggle between searching for professors or courses.  
   - After searching, click on the result buttons to navigate to the relevant page.  

5. **Interacting with Entries:**  
   - On a professor or course page, you can upvote or downvote specific entries:  
     - Each user has 1 vote per entry.  
     - Click the vote button again to cancel your vote.  
   - Use the **Report** button to report inappropriate entries:  
     - Note that reporting does not trigger any immediate action.  
     - Reported data is stored in the database and will be reviewed manually.  
6. **Profiles:**  
   - You can upload a profile picture:  
     - Note: There might be a size limit, and attempting too many uploads in a short time could trigger bugs.  
   - Your feedback and submission history are displayed here:  
     - You can remove individual entries from your history.  
     - **Editing entries is not currently supported.**  


### Known Bugs

While we strive to deliver a smooth user experience, there are a few known issues in the current version of CWRU-RMP:

1. **Entry Validation:**  
   - Input validation may still have edge cases we haven’t accounted for.  
   - Some UI feedback inconsistencies exist, such as toast notifications being replaced by simple alert pop-ups in certain scenarios.  

2. **Device Login Limitation:**  
   - A user can only be logged in on one device at a time.  
   - Logging in on two devices simultaneously (e.g., two laptops) causes a bug that prevents the user from logging out entirely.  

3. **User Sign-Up Issues:**  
   - Email verification during sign-up is not functioning optimally.  
   - We intended for users to register with verified email addresses, but email delivery can take a long time, and the database currently limits sending emails to two per hour.  


