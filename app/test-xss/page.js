"use client";

import { useState } from "react";
import {
  XSS_TEST_PATTERNS,
  sanitizeInput,
  sanitizeForDatabase,
} from "../lib/sanitize";

export default function XSSTestPage() {
  const [testInput, setTestInput] = useState("");
  const [testResults, setTestResults] = useState([]);

  const runTests = () => {
    const results = [];

    // Test all XSS patterns
    Object.entries(XSS_TEST_PATTERNS).forEach(([name, pattern]) => {
      const sanitized = sanitizeForDatabase(pattern);
      const isSafe =
        !sanitized.includes("<script") &&
        !sanitized.includes("javascript:") &&
        !sanitized.includes("onerror") &&
        !sanitized.includes("onload");

      results.push({
        name,
        original: pattern,
        sanitized,
        isSafe,
        length: pattern.length,
        sanitizedLength: sanitized.length,
      });
    });

    // Test custom input
    if (testInput.trim()) {
      const sanitized = sanitizeForDatabase(testInput);
      const isSafe =
        !sanitized.includes("<script") &&
        !sanitized.includes("javascript:") &&
        !sanitized.includes("onerror") &&
        !sanitized.includes("onload");

      results.push({
        name: "Custom Input",
        original: testInput,
        sanitized,
        isSafe,
        length: testInput.length,
        sanitizedLength: sanitized.length,
      });
    }

    setTestResults(results);
  };

  const testDisplay = (input) => {
    // This simulates how React displays the content
    // React automatically escapes HTML, but we'll show both
    return input;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000000] to-[#0a0a0f] p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white">
            🔒 XSS Security Test Page
          </h1>
          <p className="text-gray-400">
            Test input fields for Cross-Site Scripting (XSS) vulnerabilities
          </p>
        </div>

        {/* Test Input Section */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-2xl font-bold text-white">
            Test Custom Input
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Enter XSS payload to test:
              </label>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter malicious script here..."
                className="focus:border-gold focus:ring-gold/20 h-32 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:outline-none"
              />
            </div>
            <button
              onClick={runTests}
              className="bg-gold hover:bg-gold-dark rounded-lg px-6 py-3 font-semibold text-black transition-colors"
            >
              Run All Tests
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Test Results ({testResults.length} tests)
            </h2>
            <div className="space-y-4">
              {testResults.map((result, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border p-4 ${
                    result.isSafe
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-red-500/30 bg-red-500/5"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-white">{result.name}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        result.isSafe
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {result.isSafe ? "✅ SAFE" : "⚠️ UNSAFE"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Original:</span>
                      <code className="ml-2 rounded bg-black/30 px-2 py-1 break-all text-red-300">
                        {result.original}
                      </code>
                    </div>
                    <div>
                      <span className="text-gray-400">Sanitized:</span>
                      <code className="ml-2 rounded bg-black/30 px-2 py-1 break-all text-green-300">
                        {result.sanitized}
                      </code>
                    </div>
                    <div>
                      <span className="text-gray-400">Length:</span>
                      <span className="ml-2 text-gray-300">
                        {result.length} → {result.sanitizedLength}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display Test Section */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-2xl font-bold text-white">
            Display Test (How React Renders)
          </h2>
          <p className="mb-4 text-gray-400">
            React automatically escapes HTML. Below shows how your input would
            be displayed:
          </p>

          <div className="space-y-4">
            {testResults.length > 0 ? (
              testResults.map((result, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-white/10 bg-black/20 p-4"
                >
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">
                      {result.name}:
                    </span>
                  </div>
                  <div className="rounded border border-white/5 bg-white/5 p-3">
                    {/* This is how React displays it - automatically escaped */}
                    <div className="break-words whitespace-pre-wrap text-white">
                      {testDisplay(result.sanitized)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-400">
                Run tests first to see display results
              </div>
            )}
          </div>
        </div>

        {/* Security Information */}
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
          <h2 className="mb-4 text-2xl font-bold text-white">
            🔐 Security Information
          </h2>
          <div className="space-y-3 text-gray-300">
            <div>
              <strong className="text-white">React Auto-Escaping:</strong>
              <p className="mt-1">
                React automatically escapes HTML in JSX expressions like{" "}
                <code className="rounded bg-black/30 px-1">
                  {"{"}variable{"}"}
                </code>
                . This provides protection against XSS.
              </p>
            </div>
            <div>
              <strong className="text-white">Server-Side Sanitization:</strong>
              <p className="mt-1">
                All user input should be sanitized on the server before storing
                in the database. The sanitize functions remove dangerous HTML
                tags and patterns.
              </p>
            </div>
            <div>
              <strong className="text-white">
                Content Security Policy (CSP):
              </strong>
              <p className="mt-1">
                The application has CSP headers configured to prevent inline
                scripts and restrict resource loading.
              </p>
            </div>
            <div>
              <strong className="text-white">CSRF Protection:</strong>
              <p className="mt-1">
                All forms include CSRF tokens that are validated on the server.
                This prevents Cross-Site Request Forgery attacks where malicious
                sites attempt to submit forms on behalf of authenticated users.
              </p>
              <ul className="mt-1 ml-4 list-inside list-disc space-y-1 text-sm">
                <li>CSRF tokens are automatically generated and included in forms</li>
                <li>Tokens expire after 15 minutes for security</li>
                <li>API routes validate tokens before processing requests</li>
                <li>Tokens are stored securely and associated with user sessions</li>
              </ul>
            </div>
            <div>
              <strong className="text-white">Best Practices:</strong>
              <ul className="mt-1 ml-4 list-inside list-disc space-y-1">
                <li>Always sanitize user input on the server</li>
                <li>
                  Use React's built-in escaping (don't use
                  dangerouslySetInnerHTML)
                </li>
                <li>Validate and sanitize all form inputs</li>
                <li>Use parameterized queries for database operations</li>
                <li>Keep security headers up to date</li>
                <li>Include CSRF tokens in all state-changing requests</li>
                <li>Validate CSRF tokens on the server for all POST/PUT/DELETE requests</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Test Buttons */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-2xl font-bold text-white">
            Quick Test Patterns
          </h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {Object.entries(XSS_TEST_PATTERNS).map(([name, pattern]) => (
              <button
                key={name}
                onClick={() => {
                  setTestInput(pattern);
                  setTimeout(runTests, 100);
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                {name.replace(/([A-Z])/g, " $1").trim()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
