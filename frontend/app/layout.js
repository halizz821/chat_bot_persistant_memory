import "./globals.css";

export const metadata = {
  title: "Nexus | LangGraph Chatbot",
  description: "A stateful AI Agent with persistent memory built with LangGraph, developed by Hamed Alizadeh.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
          {/* Add basic modern typography */}
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
