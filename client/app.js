import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export default function App() {
    const [count, setCount] = useState(0);
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-gray-100", children: _jsxs("div", { className: "w-full max-w-sm rounded-lg bg-white p-8 shadow", children: [_jsx("h1", { className: "mb-6 text-center font-bold text-3xl text-gray-800", children: "Nitro Start" }), _jsx("div", { className: "mb-6", children: _jsxs("button", { type: "button", className: "w-full rounded bg-blue-500 px-4 py-2 font-semibold text-white transition duration-300 ease-in-out hover:bg-blue-600", onClick: () => setCount((count) => count + 1), children: ["Count: ", count] }) }), _jsx("p", { className: "mb-4 text-center text-gray-600", children: "See an example API route below" }), _jsx("a", { href: "/api", className: "block text-center font-medium text-blue-500 hover:text-blue-600", children: "See API Routes" })] }) }));
}
