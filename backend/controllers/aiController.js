const { CohereClient } = require('cohere-ai');
const Booking = require('../models/Booking'); 

let cohereClient = null;

try {
    if (process.env.COHERE_API_KEY) {
        cohereClient = new CohereClient({ token: process.env.COHERE_API_KEY });
    }
} catch (error) {
    console.error("Cohere client initialization failed:", error);
}

const handleChatInteractions = async (req, res) => {
    try {
        // Sanitize input to prevent empty payloads and save AI tokens
        const message = req.body.message?.trim();

        if (!message) {
            return res.status(400).json({ success: false, message: "Valid message payload is required" });
        }

        // Fallback response if the AI client configuration is missing
        if (!cohereClient) {
            const fallbackReply = `Hi there! I am currently experiencing connection delays. Regarding "${message}", our flights are fully operational. Please check the dashboard for available routes.`;
            return res.status(200).json({ success: true, reply: fallbackReply });
        }

        // Securely retrieve data using the authenticated user injected by the middleware
        const walletBalance = req.user ? req.user.walletBalance : 0;
        
        // Fetch bookings strictly isolated to the authenticated user
        const recentBookings = await Booking.find({ userRef: req.user._id })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Build dynamic context for personalized AI responses
        let contextData = `\n\n--- CURRENT USER DATA CONTEXT ---\nWallet Balance: INR ${walletBalance}\n`;
        
        if (recentBookings.length > 0) {
            contextData += "Recent Bookings:\n";
            recentBookings.forEach((b, i) => {
                // Normalize date string for better LLM comprehension
                const travelDate = new Date(b.flightDetails.travelDate).toLocaleDateString();
                
                // Inject the cancellation status so the AI is aware of it. Fallback to 'CONFIRMED' for older tickets.
                const ticketStatus = b.status || 'CONFIRMED';
                
                contextData += `${i + 1}. Ticket ID: ${b.ticketNumber}, Route: ${b.flightDetails.departure} to ${b.flightDetails.destination}, Date: ${travelDate}, Paid Amount: INR ${b.totalPaidFare}, Status: ${ticketStatus}\n`;
            });
        } else {
            contextData += "Recent Bookings: No bookings found.\n";
        }

        // Refined prompt to enforce human-like conversation and prevent AI-speak
        const systemPrompt = `You are the official Customer Support Agent for AI-FlightBooker. Your sole responsibility is to assist users with flight searches, wallet balance queries, ticket bookings, and cancellations. Do NOT answer questions outside the travel and aviation domain. Keep responses concise, professional, and helpful. 

CRITICAL RULES:
1. NEVER use phrases like "Based on the provided user data context", "According to my data", or "As an AI". Speak naturally as if you are a human agent looking at their account screen.
2. If a user asks about a cancelled ticket, check the Recent Bookings context. If a ticket's Status is CANCELLED, acknowledge it naturally and reassure them that the fare (Paid Amount) has been fully refunded to their wallet.
3. Always maintain a polite and reassuring tone.

${contextData}`;

        const chatResponse = await cohereClient.chat({
            model: 'command-a-03-2025',
            preamble: systemPrompt,
            message: message
        });

        // Ensure safe extraction of AI response to prevent undefined crashes
        const replyText = chatResponse?.text || "I am currently processing a high volume of requests. Please try again shortly.";

        return res.status(200).json({ 
            success: true, 
            reply: replyText 
        });

    } catch (error) {
        console.error("Cohere API Error:", error);
        const fallbackReply = `Hi! I'm operating in offline mode right now. You can continue booking available flights directly from the dashboard.`;
        return res.status(200).json({ success: true, reply: fallbackReply });
    }
};

module.exports = {
    handleChatInteractions
};