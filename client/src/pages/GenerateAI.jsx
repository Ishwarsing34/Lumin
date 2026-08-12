import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Sparkles, KeyRound, BookOpen, Loader2, AlertCircle, Copy, Check } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function GenerateAI() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [apiKey, setApiKey] = useState("");
    const [topic, setTopic] = useState("");
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copiedIndex, setCopiedIndex] = useState(null);

    const handleGenerate = async () => {
        if (!apiKey.trim()) {
            setError("Please enter your Gemini API key.");
            return;
        }
        if (!topic.trim()) {
            setError("Please enter a topic name.");
            return;
        }

        setError("");
        setLoading(true);
        setQuestions([]);

        try {
            const genAI = new GoogleGenerativeAI(apiKey.trim());
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `Generate exactly 5 subjective (descriptive/long-answer) questions on the topic: "${topic.trim()}".

Rules:
- Each question must require a detailed, written answer (not multiple choice).
- Questions should cover different aspects of the topic.
- Questions should be clear, well-formed, and progressively challenging.
- Return ONLY a valid JSON array of 5 strings, no extra text.

Example format:
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON array from the response
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error("Could not parse questions from the AI response.");
            }

            const parsed = JSON.parse(jsonMatch[0]);
            if (!Array.isArray(parsed) || parsed.length < 5) {
                throw new Error("AI returned fewer than 5 questions. Please try again.");
            }

            setQuestions(parsed.slice(0, 5));
        } catch (err) {
            console.error(err);
            if (err.message?.includes("API_KEY_INVALID") || err.message?.includes("API key")) {
                setError("Invalid API key. Please check your Gemini API key and try again.");
            } else if (err.message?.includes("parse")) {
                setError("Failed to parse AI response. Please try again.");
            } else {
                setError(err.message || "Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleCopyAll = () => {
        const allText = questions.map((q, i) => `${i + 1}. ${q}`).join("\n\n");
        navigator.clipboard.writeText(allText);
        setCopiedIndex("all");
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    // ─── Not Logged In ───
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white font-poppins">
                <Navbar />
                <div className="flex flex-col items-center justify-center px-6 py-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-gray-900 bg-opacity-90 p-10 rounded-2xl shadow-lg text-center max-w-md w-full border border-gray-800"
                    >
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-purple-500/20">
                                <AlertCircle size={40} className="text-purple-400" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                            Login Required
                        </h2>
                        <p className="text-gray-400 mb-8 text-sm">
                            You need to be logged in to use the AI question generator. Sign in to get started!
                        </p>
                        <motion.button
                            onClick={() => navigate("/auth")}
                            className="bg-yellow-400 text-black font-semibold rounded-lg px-8 py-3 text-lg hover:bg-yellow-300 transition"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Go to Login
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        );
    }

    // ─── Logged In ───
    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white font-poppins">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10"
                >
                    <div className="flex justify-center mb-4">
                        <motion.div
                            className="p-4 rounded-full bg-gradient-to-br from-purple-600/30 to-pink-500/30"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <Sparkles size={36} className="text-yellow-400" />
                        </motion.div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                        Generate with AI
                    </h1>
                    <p className="text-gray-400 mt-3 max-w-lg mx-auto text-sm sm:text-base">
                        Enter your Gemini API key and a topic — we'll generate 5 subjective questions for you instantly.
                    </p>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-gray-900 bg-opacity-90 p-8 rounded-2xl shadow-lg border border-gray-800"
                >
                    {/* API Key Input */}
                    <div className="mb-6">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                            <KeyRound size={16} className="text-purple-400" />
                            Gemini API Key
                        </label>
                        <input
                            type="password"
                            placeholder="Paste your Gemini API key here"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        />
                        <p className="text-xs text-gray-500 mt-1.5">
                            Your API key is used only in your browser and is never stored or sent to our server.
                        </p>
                    </div>

                    {/* Topic Input */}
                    <div className="mb-6">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                            <BookOpen size={16} className="text-yellow-400" />
                            Topic Name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Photosynthesis, World War II, Machine Learning"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !loading && handleGenerate()}
                            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        />
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm"
                            >
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Generate Button */}
                    <div className="flex justify-center">
                        <motion.button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                            whileHover={!loading ? { scale: 1.05 } : {}}
                            whileTap={!loading ? { scale: 0.95 } : {}}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    Generate Questions
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>

                {/* Results */}
                <AnimatePresence>
                    {questions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            transition={{ duration: 0.5 }}
                            className="mt-10"
                        >
                            {/* Results Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                                <h2 className="text-2xl font-bold text-white">
                                    Generated Questions
                                </h2>
                                <motion.button
                                    onClick={handleCopyAll}
                                    className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition text-sm"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {copiedIndex === "all" ? (
                                        <>
                                            <Check size={16} />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={16} />
                                            Copy All
                                        </>
                                    )}
                                </motion.button>
                            </div>

                            {/* Question Cards */}
                            <div className="space-y-4">
                                {questions.map((q, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -40 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                        className="p-5 rounded-xl bg-gray-800 shadow-md border border-gray-700 group hover:border-purple-500/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1">
                                                {/* Question Number */}
                                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-sm font-bold">
                                                    {index + 1}
                                                </span>
                                                {/* Question Text */}
                                                <p className="text-gray-200 text-base leading-relaxed pt-1">
                                                    {q}
                                                </p>
                                            </div>
                                            {/* Copy Single */}
                                            <button
                                                onClick={() => handleCopy(q, index)}
                                                className="flex-shrink-0 text-gray-500 hover:text-yellow-400 transition mt-1"
                                                title="Copy question"
                                            >
                                                {copiedIndex === index ? (
                                                    <Check size={16} className="text-green-400" />
                                                ) : (
                                                    <Copy size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Regenerate hint */}
                            <p className="text-center text-gray-500 text-sm mt-6">
                                Not satisfied? Change the topic or click Generate again for new questions.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
