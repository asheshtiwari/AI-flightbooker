const { CohereClient } = require('cohere-ai');
const Booking = require('../models/Booking');
const User = require('../models/User');

let cohereClient = null;

// only init if key exists, otherwise stays null and fallback kicks in
try {
    if (process.env.COHERE_API_KEY) {
        cohereClient = new CohereClient({ token: process.env.COHERE_API_KEY });
    }
} catch (error) {
    console.error("Cohere init failed:", error);
}

const handleChatInteractions = async (req, res) => {
    try {
        const message = req.body.message?.trim();

        // dont let empty messages waste AI tokens
        if (!message) {
            return res.status(400).json({ 
                success: false, 
                message: "Message cannot be empty" 
            });
        }

        // user must be logged in to use chat
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized" 
            });
        }

        // cohere not configured, return offline message
        if (!cohereClient) {
            return res.status(200).json({ 
                success: true, 
                reply: `Hi! I'm currently offline. For "${message}", please check the dashboard directly.` 
            });
        }

        // fresh DB call so AI sees current balance, not the token-time snapshot
        const freshUser = await User.findById(req.user._id).lean();
        const walletBalance = freshUser ? freshUser.walletBalance : 0;

        // last 5 bookings is enough context for the AI
        const recentBookings = await Booking.find({ userRef: req.user._id })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // todays date injected so AI knows current date without real-time access
        const todayDate = new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        let contextData = `\n\n--- USER ACCOUNT DATA ---\nWallet Balance: INR ${walletBalance}\nToday's Date: ${todayDate}\n`;

        if (recentBookings.length > 0) {
            contextData += "Recent Bookings:\n";
            recentBookings.forEach((b, i) => {
                const travelDate = new Date(b.flightDetails.travelDate).toLocaleDateString();
                // older tickets might not have status field
                const ticketStatus = b.status || 'CONFIRMED';
                // keeping only what AI actually needs, no ticket ID clutter
                contextData += `${i + 1}. ${b.flightDetails.departure} to ${b.flightDetails.destination}, Date: ${travelDate}, Paid: INR ${b.totalPaidFare}, Status: ${ticketStatus}\n`;
            });
        } else {
            contextData += "Recent Bookings: None yet.\n";
        }

        const systemPrompt = `You are the customer support agent for AI-FlightBooker, built by Ashesh Tiwari. Only help with flights, bookings, wallet, and cancellations.

RULES:
1. Never say "Based on the data" or "As an AI" — talk like a human support agent who is looking at the user's account screen
2. If a ticket is CANCELLED, confirm the refund is back in their wallet
3. Be short, direct, and natural — no corporate language
4. If asked today's date — answer using the date in the context below, dont say you dont have access
5. If asked about available flights on a specific route or date — tell the user to use the Search Flights section on the dashboard, you can only see their booking history not live inventory
6. If asked who built this or who owns it — say "AI-FlightBooker was built by Ashesh Tiwari"
7. Never say you will check or look something up and then not give an answer — if you dont know, say so clearly in one line
8. Never use asterisks for bold or italic — plain text only

${contextData}`;

        const chatResponse = await cohereClient.chat({
            model: 'command-a-03-2025',
            preamble: systemPrompt,
            message: message
        });

        // safe extraction in case response structure changes
        const replyText = chatResponse?.text || "I'm handling high traffic right now. Please try again in a moment.";

        return res.status(200).json({ 
            success: true, 
            reply: replyText 
        });

    } catch (error) {
        console.error("Cohere error:", error);
        return res.status(200).json({ 
            success: true, 
            reply: "I'm in offline mode right now. You can still book flights from the dashboard." 
        });
    }
};

module.exports = { handleChatInteractions };