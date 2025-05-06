"use client";

import { useRouter } from "next/navigation";
import Head from "next/head";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/auth");
  };

  return (
    <>
      <Head>
        <title>Get Started</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-white to-blue-50 p-4">
        <motion.div
          className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-10 max-w-lg w-full text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-5xl font-extrabold text-blue-700 mb-4">
            Welcome to Mortgage AI
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Ready to explore? Click the button below to dive in.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 text-white text-lg font-semibold bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
            onClick={handleGetStarted}
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}
